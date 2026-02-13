#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
وكيل تشغيل الاختبارات التلقائي
يقوم بتشغيل جميع الاختبارات وإنشاء التقارير
"""

import os
import sys
import json
import time
import subprocess
import schedule
from datetime import datetime, timedelta
try:
    import smtplib
    from email.mime.text import MimeText
    from email.mime.multipart import MimeMultipart
    EMAIL_AVAILABLE = True
except ImportError:
    EMAIL_AVAILABLE = False
from pathlib import Path
import logging
import requests

class TestRunner:
    def __init__(self, config_file="test_config.json"):
        self.config_file = config_file
        self.config = self.load_config()
        self.setup_logging()
        
    def load_config(self):
        """تحميل إعدادات الاختبارات"""
        default_config = {
            "schedule": {
                "enabled": True,
                "interval_hours": 6,
                "daily_time": "09:00"
            },
            "notifications": {
                "email": {
                    "enabled": False,
                    "smtp_server": "smtp.gmail.com",
                    "smtp_port": 587,
                    "username": "",
                    "password": "",
                    "recipients": []
                },
                "slack": {
                    "enabled": False,
                    "webhook_url": "",
                    "channel": "#alerts"
                }
            },
            "test_suites": {
                "backend": {"enabled": True, "timeout": 300},
                "frontend": {"enabled": True, "timeout": 600},
                "integration": {"enabled": True, "timeout": 900}
            },
            "thresholds": {
                "min_success_rate": 80,
                "max_response_time": 5.0
            }
        }
        
        try:
            with open(self.config_file, 'r', encoding='utf-8') as f:
                config = json.load(f)
                # دمج مع الإعدادات الافتراضية
                for key, value in default_config.items():
                    if key not in config:
                        config[key] = value
                return config
        except FileNotFoundError:
            # إنشاء ملف الإعدادات الافتراضي
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(default_config, f, indent=2, ensure_ascii=False)
            return default_config
            
    def setup_logging(self):
        """إعداد نظام السجلات"""
        log_dir = Path("tests/logs")
        log_dir.mkdir(exist_ok=True)
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_dir / "test_runner.log", encoding='utf-8'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger(__name__)
        
    def run_test_suite(self, suite_name):
        """تشغيل مجموعة اختبارات محددة"""
        self.logger.info(f"تشغيل اختبارات {suite_name}...")
        
        test_dir = Path("tests") / suite_name
        if not test_dir.exists():
            self.logger.error(f"مجلد الاختبارات غير موجود: {test_dir}")
            return {"success": False, "error": "Test directory not found"}
            
        # تشغيل pytest مع إعدادات مخصصة
        cmd = [
            sys.executable, "-m", "pytest",
            str(test_dir),
            "-v",
            "--tb=short",
            "--json-report",
            f"--json-report-file=tests/reports/{suite_name}_report.json",
            "--html=tests/reports/{}_report.html".format(suite_name),
            "--self-contained-html"
        ]
        
        try:
            start_time = time.time()
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=self.config["test_suites"][suite_name]["timeout"],
                encoding='utf-8'
            )
            end_time = time.time()
            
            # تحليل النتائج
            return {
                "success": result.returncode == 0,
                "duration": end_time - start_time,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "return_code": result.returncode
            }
            
        except subprocess.TimeoutExpired:
            self.logger.error(f"انتهت مهلة اختبارات {suite_name}")
            return {"success": False, "error": "Timeout expired"}
        except Exception as e:
            self.logger.error(f"خطأ في تشغيل اختبارات {suite_name}: {e}")
            return {"success": False, "error": str(e)}
    
    def run_all_tests(self):
        """تشغيل جميع الاختبارات"""
        self.logger.info("بدء تشغيل جميع الاختبارات...")
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "suites": {},
            "overall": {
                "success": True,
                "total_duration": 0,
                "total_tests": 0,
                "passed_tests": 0,
                "failed_tests": 0
            }
        }
        
        start_time = time.time()
        
        for suite_name, suite_config in self.config["test_suites"].items():
            if not suite_config["enabled"]:
                self.logger.info(f"تخطي اختبارات {suite_name} (معطلة)")
                continue
                
            suite_result = self.run_test_suite(suite_name)
            results["suites"][suite_name] = suite_result
            
            if not suite_result["success"]:
                results["overall"]["success"] = False
                
            results["overall"]["total_duration"] += suite_result.get("duration", 0)
        
        end_time = time.time()
        results["overall"]["total_duration"] = end_time - start_time
        
        # حفظ التقرير الإجمالي
        report_file = Path("tests/reports/overall_report.json")
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        # إنشاء تقرير HTML
        self.generate_html_report(results)
        
        # إرسال الإشعارات
        self.send_notifications(results)
        
        self.logger.info("انتهاء تشغيل جميع الاختبارات")
        return results
    
    def generate_html_report(self, results):
        """إنشاء تقرير HTML مفصل"""
        html_content = f"""
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير الاختبارات - {results['timestamp'][:10]}</title>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; direction: rtl; }}
        .header {{ background: #2c3e50; color: white; padding: 20px; border-radius: 5px; }}
        .summary {{ background: #ecf0f1; padding: 15px; margin: 20px 0; border-radius: 5px; }}
        .suite {{ margin: 20px 0; border: 1px solid #bdc3c7; border-radius: 5px; }}
        .suite-header {{ background: #34495e; color: white; padding: 10px; }}
        .suite-content {{ padding: 15px; }}
        .success {{ color: #27ae60; }}
        .failure {{ color: #e74c3c; }}
        .warning {{ color: #f39c12; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>تقرير اختبارات APIs</h1>
        <p>تاريخ التشغيل: {results['timestamp']}</p>
        <p>النتيجة الإجمالية: <span class="{'success' if results['overall']['success'] else 'failure'}">
            {'نجح' if results['overall']['success'] else 'فشل'}
        </span></p>
    </div>
    
    <div class="summary">
        <h2>ملخص النتائج</h2>
        <p>مدة التشغيل الإجمالية: {results['overall']['total_duration']:.2f} ثانية</p>
        <p>عدد المجموعات: {len(results['suites'])}</p>
    </div>
    
    <div class="suites">
        <h2>تفاصيل المجموعات</h2>
"""
        
        for suite_name, suite_result in results["suites"].items():
            status_class = "success" if suite_result["success"] else "failure"
            status_text = "نجح" if suite_result["success"] else "فشل"
            
            html_content += f"""
        <div class="suite">
            <div class="suite-header">
                <h3>{suite_name} - <span class="{status_class}">{status_text}</span></h3>
            </div>
            <div class="suite-content">
                <p>المدة: {suite_result.get('duration', 0):.2f} ثانية</p>
                {'<p class="failure">خطأ: ' + suite_result.get('error', '') + '</p>' if 'error' in suite_result else ''}
            </div>
        </div>
"""
        
        html_content += """
    </div>
    
    <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 5px;">
        <p><small>تم إنشاء هذا التقرير تلقائياً بواسطة API Test Generator</small></p>
    </div>
</body>
</html>
"""
        
        report_file = Path("tests/reports/overall_report.html")
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        self.logger.info(f"تم إنشاء تقرير HTML: {report_file}")
    
    def send_notifications(self, results):
        """إرسال الإشعارات"""
        if not results["overall"]["success"]:
            message = f"فشل في اختبارات APIs - {results['timestamp'][:16]}"
            details = "\n".join([f"{suite}: {'نجح' if result['success'] else 'فشل'}" 
                                for suite, result in results["suites"].items()])
            
            # إرسال بريد إلكتروني
            if self.config["notifications"]["email"]["enabled"]:
                self.send_email_notification(message, details)
            
            # إرسال إشعار Slack
            if self.config["notifications"]["slack"]["enabled"]:
                self.send_slack_notification(message, details)
    
    def send_email_notification(self, subject, body):
        """إرسال إشعار بريد إلكتروني"""
        if not EMAIL_AVAILABLE:
            self.logger.warning("Email functionality not available")
            return
        try:
            email_config = self.config["notifications"]["email"]
            
            msg = MimeMultipart()
            msg['From'] = email_config["username"]
            msg['To'] = ", ".join(email_config["recipients"])
            msg['Subject'] = subject
            
            msg.attach(MimeText(body, 'plain', 'utf-8'))
            
            server = smtplib.SMTP(email_config["smtp_server"], email_config["smtp_port"])
            server.starttls()
            server.login(email_config["username"], email_config["password"])
            server.send_message(msg)
            server.quit()
            
            self.logger.info("تم إرسال إشعار البريد الإلكتروني")
        except Exception as e:
            self.logger.error(f"فشل في إرسال البريد الإلكتروني: {e}")
    
    def send_slack_notification(self, message, details):
        """إرسال إشعار Slack"""
        try:
            slack_config = self.config["notifications"]["slack"]
            
            payload = {
                "channel": slack_config["channel"],
                "text": message,
                "attachments": [{
                    "color": "danger",
                    "text": details,
                    "footer": "API Test Runner",
                    "ts": int(time.time())
                }]
            }
            
            response = requests.post(slack_config["webhook_url"], json=payload)
            response.raise_for_status()
            
            self.logger.info("تم إرسال إشعار Slack")
        except Exception as e:
            self.logger.error(f"فشل في إرسال إشعار Slack: {e}")
    
    def start_scheduler(self):
        """بدء جدولة الاختبارات"""
        if not self.config["schedule"]["enabled"]:
            self.logger.info("الجدولة معطلة")
            return
        
        # جدولة يومية
        schedule.every().day.at(self.config["schedule"]["daily_time"]).do(self.run_all_tests)
        
        # جدولة كل عدة ساعات
        schedule.every(self.config["schedule"]["interval_hours"]).hours.do(self.run_all_tests)
        
        self.logger.info("تم بدء جدولة الاختبارات")
        
        while True:
            schedule.run_pending()
            time.sleep(60)  # فحص كل دقيقة

def main():
    """الدالة الرئيسية"""
    import argparse
    
    parser = argparse.ArgumentParser(description='وكيل تشغيل اختبارات APIs')
    parser.add_argument('--run', action='store_true', help='تشغيل الاختبارات مرة واحدة')
    parser.add_argument('--schedule', action='store_true', help='بدء الجدولة')
    parser.add_argument('--suite', choices=['backend', 'frontend', 'integration'], 
                       help='تشغيل مجموعة اختبارات محددة')
    
    args = parser.parse_args()
    
    runner = TestRunner()
    
    if args.suite:
        result = runner.run_test_suite(args.suite)
        print(f"نتيجة اختبارات {args.suite}: {'نجح' if result['success'] else 'فشل'}")
    elif args.run:
        results = runner.run_all_tests()
        print(f"نتيجة جميع الاختبارات: {'نجح' if results['overall']['success'] else 'فشل'}")
    elif args.schedule:
        print("بدء جدولة الاختبارات...")
        runner.start_scheduler()
    else:
        print("استخدم --help لعرض الخيارات المتاحة")

if __name__ == "__main__":
    main()
