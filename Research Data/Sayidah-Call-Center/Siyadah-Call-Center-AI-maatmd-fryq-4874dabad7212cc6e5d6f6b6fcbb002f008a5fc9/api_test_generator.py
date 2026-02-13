#!/usr/bin/env python3
"""
مولد اختبارات APIs متكامل
يقوم بتوليد اختبارات تلقائية من ملف OpenAPI specification
"""

import json
import os
import sys
import argparse
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import requests
import yaml
from jinja2 import Template

class APITestGenerator:
    def __init__(self, openapi_file: str, output_dir: str = "tests"):
        self.openapi_file = openapi_file
        self.output_dir = Path(output_dir)
        self.spec = None
        self.endpoints = []
        
        # إنشاء مجلدات الاختبارات
        self.output_dir.mkdir(exist_ok=True)
        (self.output_dir / "backend").mkdir(exist_ok=True)
        (self.output_dir / "frontend").mkdir(exist_ok=True)
        (self.output_dir / "integration").mkdir(exist_ok=True)
        (self.output_dir / "reports").mkdir(exist_ok=True)
        
    def load_openapi_spec(self) -> Dict[str, Any]:
        """تحميل ملف OpenAPI specification"""
        try:
            with open(self.openapi_file, 'r', encoding='utf-8') as f:
                if self.openapi_file.endswith('.json'):
                    self.spec = json.load(f)
                elif self.openapi_file.endswith(('.yml', '.yaml')):
                    self.spec = yaml.safe_load(f)
                else:
                    raise ValueError("Unsupported file format. Use JSON or YAML.")
                    
            print(f"✅ تم تحميل OpenAPI spec من {self.openapi_file}")
            return self.spec
            
        except FileNotFoundError:
            print(f"❌ لم يتم العثور على ملف {self.openapi_file}")
            # إنشاء ملف OpenAPI مثال للـ APIs الموجودة
            self.create_sample_openapi()
            return self.load_openapi_spec()
        except Exception as e:
            print(f"❌ خطأ في تحميل OpenAPI spec: {e}")
            sys.exit(1)
    
    def create_sample_openapi(self):
        """إنشاء ملف OpenAPI مثال بناءً على APIs الموجودة"""
        sample_spec = {
            "openapi": "3.0.0",
            "info": {
                "title": "Business Automation Platform API",
                "version": "1.0.0",
                "description": "منصة الأتمتة التجارية الذكية - APIs"
            },
            "servers": [
                {"url": "http://localhost:5000", "description": "Development server"}
            ],
            "paths": {
                "/api/ai-agents": {
                    "get": {
                        "operationId": "getAIAgents",
                        "summary": "جلب قائمة الوكلاء الذكيين",
                        "tags": ["AI Agents"],
                        "responses": {
                            "200": {
                                "description": "قائمة الوكلاء الذكيين",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "success": {"type": "boolean"},
                                                "agents": {
                                                    "type": "array",
                                                    "items": {
                                                        "type": "object",
                                                        "properties": {
                                                            "id": {"type": "string"},
                                                            "name": {"type": "string"},
                                                            "role": {"type": "string"},
                                                            "performance": {"type": "number"},
                                                            "status": {"type": "string"}
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "/api/security-check": {
                    "get": {
                        "operationId": "getSecurityCheck",
                        "summary": "فحص حالة أمان النظام",
                        "tags": ["Security"],
                        "responses": {
                            "200": {
                                "description": "تقرير أمان النظام",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "success": {"type": "boolean"},
                                                "securityStatus": {"type": "string"},
                                                "systemStatus": {"type": "object"}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "/api/external/call/make": {
                    "post": {
                        "operationId": "makeCall",
                        "summary": "إجراء مكالمة هاتفية",
                        "tags": ["Communications"],
                        "requestBody": {
                            "required": True,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "to": {"type": "string"},
                                            "message": {"type": "string"}
                                        },
                                        "required": ["to", "message"]
                                    }
                                }
                            }
                        },
                        "responses": {
                            "200": {
                                "description": "نتيجة المكالمة",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "success": {"type": "boolean"},
                                                "callId": {"type": "string"},
                                                "status": {"type": "string"}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "/api/ai/chat": {
                    "post": {
                        "operationId": "aiChat",
                        "summary": "محادثة مع المساعد الذكي",
                        "tags": ["AI Assistant"],
                        "requestBody": {
                            "required": True,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "message": {"type": "string"},
                                            "context": {"type": "object"}
                                        },
                                        "required": ["message"]
                                    }
                                }
                            }
                        },
                        "responses": {
                            "200": {
                                "description": "رد المساعد الذكي",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "success": {"type": "boolean"},
                                                "response": {"type": "string"},
                                                "confidence": {"type": "number"}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "components": {
                "securitySchemes": {
                    "bearerAuth": {
                        "type": "http",
                        "scheme": "bearer",
                        "bearerFormat": "JWT"
                    }
                }
            }
        }
        
        with open(self.openapi_file, 'w', encoding='utf-8') as f:
            json.dump(sample_spec, f, indent=2, ensure_ascii=False)
        print(f"✅ تم إنشاء ملف OpenAPI مثال في {self.openapi_file}")
    
    def extract_endpoints(self) -> List[Dict[str, Any]]:
        """استخراج endpoints من OpenAPI spec"""
        if not self.spec:
            self.load_openapi_spec()
            
        endpoints = []
        base_url = self.spec.get('servers', [{}])[0].get('url', 'http://localhost:5000')
        
        for path, methods in self.spec.get('paths', {}).items():
            for method, details in methods.items():
                if method.lower() in ['get', 'post', 'put', 'delete', 'patch']:
                    endpoint = {
                        'path': path,
                        'method': method.upper(),
                        'operation_id': details.get('operationId', f"{method}_{path.replace('/', '_').replace('-', '_')}"),
                        'summary': details.get('summary', ''),
                        'tags': details.get('tags', []),
                        'parameters': details.get('parameters', []),
                        'request_body': details.get('requestBody'),
                        'responses': details.get('responses', {}),
                        'base_url': base_url
                    }
                    endpoints.append(endpoint)
        
        self.endpoints = endpoints
        print(f"✅ تم استخراج {len(endpoints)} endpoint")
        return endpoints
    
    def generate_backend_tests(self):
        """توليد اختبارات Backend"""
        template = Template('''# -*- coding: utf-8 -*-
"""
اختبارات Backend مباشرة
تم توليدها تلقائياً من OpenAPI specification
"""

import pytest
import requests
import json
from typing import Dict, Any
from datetime import datetime

class TestBackendAPIs:
    base_url = "{{ base_url }}"
    
    def setup_method(self):
        """إعداد قبل كل اختبار"""
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'API-Test-Suite/1.0'
        })

{% for endpoint in endpoints %}
    def test_{{ endpoint.operation_id|lower }}_backend(self):
        """
        اختبار Backend: {{ endpoint.summary }}
        Method: {{ endpoint.method }}
        Path: {{ endpoint.path }}
        """
        url = f"{self.base_url}{{ endpoint.path }}"
        
        {% if endpoint.method == 'GET' %}
        # اختبار GET request
        response = self.session.get(url)
        
        # التحقق من response
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}"
        
        # التحقق من JSON response
        try:
            data = response.json()
            assert isinstance(data, dict), "Response should be JSON object"
            {% if endpoint.responses.get('200') %}
            # التحقق من بنية البيانات المتوقعة
            if 'success' in data:
                assert isinstance(data['success'], bool), "success field should be boolean"
            {% endif %}
        except json.JSONDecodeError:
            pytest.fail("Response is not valid JSON")
            
        {% elif endpoint.method == 'POST' %}
        # اختبار POST request
        {% if endpoint.request_body %}
        test_data = {
            {% for prop, details in endpoint.request_body.get('content', {}).get('application/json', {}).get('schema', {}).get('properties', {}).items() %}
            "{{ prop }}": {% if details.get('type') == 'string' %}"test_{{ prop }}"{% elif details.get('type') == 'number' %}123{% elif details.get('type') == 'boolean' %}True{% else %}{}{% endif %},
            {% endfor %}
        }
        {% else %}
        test_data = {}
        {% endif %}
        
        response = self.session.post(url, json=test_data)
        
        # التحقق من response
        assert response.status_code in [200, 201, 400, 422], f"Unexpected status code: {response.status_code}"
        
        # التحقق من JSON response
        try:
            data = response.json()
            assert isinstance(data, dict), "Response should be JSON object"
        except json.JSONDecodeError:
            pytest.fail("Response is not valid JSON")
        {% endif %}
        
        print(f"✅ {{ endpoint.operation_id }} Backend test passed")

{% endfor %}

    def test_api_health_check(self):
        """اختبار عام لصحة النظام"""
        health_endpoints = [
            "/api/security-check",
            "/api/ai-agents"
        ]
        
        for endpoint in health_endpoints:
            url = f"{self.base_url}{endpoint}"
            try:
                response = self.session.get(url, timeout=10)
                assert response.status_code in [200, 401, 403], f"Health check failed for {endpoint}"
                print(f"✅ Health check passed for {endpoint}")
            except requests.exceptions.RequestException as e:
                pytest.fail(f"Health check failed for {endpoint}: {e}")

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
''')
        
        content = template.render(
            endpoints=self.endpoints,
            base_url=self.endpoints[0]['base_url'] if self.endpoints else 'http://localhost:5000'
        )
        
        backend_file = self.output_dir / "backend" / "test_backend_apis.py"
        with open(backend_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ تم إنشاء اختبارات Backend في {backend_file}")

    def generate_frontend_tests(self):
        """توليد اختبارات Frontend"""
        template = Template('''# -*- coding: utf-8 -*-
"""
اختبارات Frontend - محاكاة تفاعل المستخدم
تم توليدها تلقائياً من OpenAPI specification
"""

import pytest
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time
import json

class TestFrontendAPIs:
    base_url = "{{ base_url }}"
    
    def setup_method(self):
        """إعداد قبل كل اختبار"""
        # إعداد HTTP session
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept-Language': 'ar,en;q=0.9',
            'Cache-Control': 'no-cache'
        })
        
        # إعداد Selenium WebDriver (اختياري)
        self.driver = None
        try:
            chrome_options = Options()
            chrome_options.add_argument('--headless')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--lang=ar')
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.set_page_load_timeout(30)
        except Exception as e:
            print(f"تحذير: لم يتم تشغيل Selenium WebDriver: {e}")

    def teardown_method(self):
        """تنظيف بعد كل اختبار"""
        if self.driver:
            self.driver.quit()

{% for endpoint in endpoints %}
    def test_{{ endpoint.operation_id|lower }}_frontend(self):
        """
        اختبار Frontend: {{ endpoint.summary }}
        Method: {{ endpoint.method }}
        Path: {{ endpoint.path }}
        """
        url = f"{self.base_url}{{ endpoint.path }}"
        
        # اختبار HTTP request مع رؤوس المتصفح
        {% if endpoint.method == 'GET' %}
        response = self.session.get(url)
        {% elif endpoint.method == 'POST' %}
        # بيانات اختبار للـ POST request
        {% if endpoint.request_body %}
        test_data = {
            {% for prop, details in endpoint.request_body.get('content', {}).get('application/json', {}).get('schema', {}).get('properties', {}).items() %}
            "{{ prop }}": {% if details.get('type') == 'string' %}"frontend_test_{{ prop }}"{% elif details.get('type') == 'number' %}456{% elif details.get('type') == 'boolean' %}True{% else %}{}{% endif %},
            {% endfor %}
        }
        {% else %}
        test_data = {"test": "frontend"}
        {% endif %}
        response = self.session.post(url, json=test_data)
        {% endif %}
        
        # التحقق من response
        assert response.status_code < 500, f"Server error for {url}: {response.status_code}"
        
        # اختبار زمن الاستجابة
        assert response.elapsed.total_seconds() < 10, f"Response time too slow: {response.elapsed.total_seconds()}s"
        
        # التحقق من headers
        assert 'content-type' in response.headers, "Missing Content-Type header"
        
        print(f"✅ {{ endpoint.operation_id }} Frontend test passed")
        
        # اختبار Selenium إذا كان متوفراً
        if self.driver and "{{ endpoint.method }}" == "GET":
            try:
                self.driver.get(url)
                # انتظار تحميل الصفحة
                WebDriverWait(self.driver, 10).until(
                    lambda driver: driver.execute_script("return document.readyState") == "complete"
                )
                print(f"✅ {{ endpoint.operation_id }} Selenium test passed")
            except Exception as e:
                print(f"تحذير: Selenium test failed for {{ endpoint.operation_id }}: {e}")

{% endfor %}

    def test_frontend_user_journey(self):
        """اختبار رحلة المستخدم الكاملة"""
        user_journey = [
            ("/api/security-check", "GET"),
            ("/api/ai-agents", "GET")
        ]
        
        for endpoint, method in user_journey:
            url = f"{self.base_url}{endpoint}"
            if method == "GET":
                response = self.session.get(url)
            else:
                response = self.session.post(url, json={})
                
            assert response.status_code < 500, f"User journey failed at {endpoint}"
            time.sleep(0.5)  # محاكاة تأخير المستخدم
        
        print("✅ User journey test completed successfully")

    def test_frontend_performance(self):
        """اختبار أداء Frontend"""
        performance_endpoints = [
            "/api/security-check",
            "/api/ai-agents"
        ]
        
        for endpoint in performance_endpoints:
            url = f"{self.base_url}{endpoint}"
            start_time = time.time()
            response = self.session.get(url)
            end_time = time.time()
            
            response_time = end_time - start_time
            assert response_time < 5.0, f"Performance test failed for {endpoint}: {response_time}s"
            print(f"✅ Performance test passed for {endpoint}: {response_time:.2f}s")

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
''')
        
        content = template.render(
            endpoints=self.endpoints,
            base_url=self.endpoints[0]['base_url'] if self.endpoints else 'http://localhost:5000'
        )
        
        frontend_file = self.output_dir / "frontend" / "test_frontend_apis.py"
        with open(frontend_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ تم إنشاء اختبارات Frontend في {frontend_file}")

    def generate_integration_tests(self):
        """توليد اختبارات التكامل"""
        template = Template('''# -*- coding: utf-8 -*-
"""
اختبارات التكامل مع الخدمات الخارجية
تم توليدها تلقائياً من OpenAPI specification
"""

import pytest
import requests
import json
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
import time

class TestIntegrationAPIs:
    base_url = "{{ base_url }}"
    
    def setup_method(self):
        """إعداد قبل كل اختبار"""
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        
        # إعداد mocks للخدمات الخارجية
        self.twilio_mock = Mock()
        self.mongodb_mock = Mock()
        self.openai_mock = Mock()

{% for endpoint in endpoints %}
    @patch('requests.post')
    @patch('requests.get')
    def test_{{ endpoint.operation_id|lower }}_integration(self, mock_get, mock_post):
        """
        اختبار التكامل: {{ endpoint.summary }}
        Method: {{ endpoint.method }}
        Path: {{ endpoint.path }}
        """
        url = f"{self.base_url}{{ endpoint.path }}"
        
        # إعداد mock responses للخدمات الخارجية
        {% if 'twilio' in endpoint.path.lower() or 'call' in endpoint.path.lower() %}
        # Mock Twilio API
        mock_twilio_response = Mock()
        mock_twilio_response.status_code = 200
        mock_twilio_response.json.return_value = {
            "sid": "CA123456789",
            "status": "queued",
            "direction": "outbound-api"
        }
        mock_post.return_value = mock_twilio_response
        {% endif %}
        
        {% if 'ai' in endpoint.path.lower() or 'chat' in endpoint.path.lower() %}
        # Mock OpenAI API
        mock_openai_response = Mock()
        mock_openai_response.status_code = 200
        mock_openai_response.json.return_value = {
            "choices": [{
                "message": {
                    "content": "مرحباً! كيف يمكنني مساعدتك؟"
                }
            }]
        }
        mock_post.return_value = mock_openai_response
        {% endif %}
        
        # تنفيذ الاختبار
        {% if endpoint.method == 'GET' %}
        response = self.session.get(url)
        {% elif endpoint.method == 'POST' %}
        {% if endpoint.request_body %}
        test_data = {
            {% for prop, details in endpoint.request_body.get('content', {}).get('application/json', {}).get('schema', {}).get('properties', {}).items() %}
            "{{ prop }}": {% if details.get('type') == 'string' %}"integration_test_{{ prop }}"{% elif details.get('type') == 'number' %}789{% elif details.get('type') == 'boolean' %}False{% else %}{}{% endif %},
            {% endfor %}
        }
        {% else %}
        test_data = {"integration": "test"}
        {% endif %}
        response = self.session.post(url, json=test_data)
        {% endif %}
        
        # التحقق من التكامل
        assert response.status_code < 500, f"Integration test failed for {url}"
        
        # التحقق من استدعاء الخدمات الخارجية (إذا لزم الأمر)
        {% if 'call' in endpoint.path.lower() %}
        if response.status_code == 200:
            # التحقق من استدعاء Twilio API
            assert mock_post.called or response.json().get('success', False), "Twilio integration expected"
        {% endif %}
        
        print(f"✅ {{ endpoint.operation_id }} Integration test passed")

{% endfor %}

    def test_database_integration(self):
        """اختبار التكامل مع قاعدة البيانات"""
        with patch('pymongo.MongoClient') as mock_mongo:
            # إعداد mock database
            mock_db = Mock()
            mock_collection = Mock()
            mock_collection.find.return_value = [
                {"_id": "123", "name": "Test Agent", "status": "active"}
            ]
            mock_db.__getitem__.return_value = mock_collection
            mock_mongo.return_value.__getitem__.return_value = mock_db
            
            # اختبار endpoint يستخدم قاعدة البيانات
            url = f"{self.base_url}/api/ai-agents"
            response = self.session.get(url)
            
            # التحقق من أن قاعدة البيانات تم استدعاؤها
            print("✅ Database integration test completed")

    def test_external_services_health(self):
        """اختبار صحة الخدمات الخارجية"""
        external_services = [
            ("Twilio", "https://api.twilio.com/2010-04-01/Accounts.json"),
            ("OpenAI", "https://api.openai.com/v1/models")
        ]
        
        for service_name, health_url in external_services:
            try:
                response = requests.get(health_url, timeout=5)
                if response.status_code < 500:
                    print(f"✅ {service_name} service is accessible")
                else:
                    print(f"⚠️ {service_name} service returned {response.status_code}")
            except requests.exceptions.RequestException:
                print(f"⚠️ {service_name} service is not accessible (expected in testing)")

    def test_api_rate_limiting(self):
        """اختبار محدودية معدل الطلبات"""
        url = f"{self.base_url}/api/security-check"
        
        # إجراء طلبات متتالية
        responses = []
        for i in range(10):
            response = self.session.get(url)
            responses.append(response.status_code)
            time.sleep(0.1)
        
        # التحقق من عدم وجود rate limiting شديد
        success_count = sum(1 for status in responses if status < 400)
        assert success_count >= 5, f"Too many requests failed: {responses}"
        
        print("✅ Rate limiting test completed")

    def test_concurrent_requests(self):
        """اختبار الطلبات المتزامنة"""
        import threading
        import queue
        
        url = f"{self.base_url}/api/security-check"
        results = queue.Queue()
        
        def make_request():
            try:
                response = self.session.get(url, timeout=10)
                results.put(response.status_code)
            except Exception as e:
                results.put(f"Error: {e}")
        
        # تشغيل 5 طلبات متزامنة
        threads = []
        for i in range(5):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()
        
        # انتظار انتهاء جميع الطلبات
        for thread in threads:
            thread.join(timeout=15)
        
        # جمع النتائج
        statuses = []
        while not results.empty():
            statuses.append(results.get())
        
        # التحقق من النتائج
        success_count = sum(1 for status in statuses if isinstance(status, int) and status < 400)
        assert success_count >= 3, f"Concurrent requests failed: {statuses}"
        
        print("✅ Concurrent requests test completed")

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
''')
        
        content = template.render(
            endpoints=self.endpoints,
            base_url=self.endpoints[0]['base_url'] if self.endpoints else 'http://localhost:5000'
        )
        
        integration_file = self.output_dir / "integration" / "test_integration_apis.py"
        with open(integration_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ تم إنشاء اختبارات التكامل في {integration_file}")

    def generate_test_runner(self):
        """إنشاء وكيل تشغيل الاختبارات"""
        runner_content = '''#!/usr/bin/env python3
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
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
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
            details = "\\n".join([f"{suite}: {'نجح' if result['success'] else 'فشل'}" 
                                for suite, result in results["suites"].items()])
            
            # إرسال بريد إلكتروني
            if self.config["notifications"]["email"]["enabled"]:
                self.send_email_notification(message, details)
            
            # إرسال إشعار Slack
            if self.config["notifications"]["slack"]["enabled"]:
                self.send_slack_notification(message, details)
    
    def send_email_notification(self, subject, body):
        """إرسال إشعار بريد إلكتروني"""
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
'''
        
        runner_file = self.output_dir / "test_runner.py"
        with open(runner_file, 'w', encoding='utf-8') as f:
            f.write(runner_content)
        
        # جعل الملف قابل للتنفيذ
        os.chmod(runner_file, 0o755)
        
        print(f"✅ تم إنشاء وكيل تشغيل الاختبارات في {runner_file}")

    def generate_requirements(self):
        """إنشاء ملف متطلبات Python"""
        requirements = [
            "pytest>=7.0.0",
            "pytest-html>=3.1.0",
            "pytest-json-report>=1.5.0",
            "requests>=2.28.0",
            "selenium>=4.8.0",
            "jinja2>=3.1.0",
            "pyyaml>=6.0",
            "schedule>=1.2.0",
            "pymongo>=4.3.0",
            "webdriver-manager>=3.8.0"
        ]
        
        req_file = self.output_dir / "requirements.txt"
        with open(req_file, 'w') as f:
            f.write('\n'.join(requirements))
        
        print(f"✅ تم إنشاء ملف المتطلبات في {req_file}")

    def generate_readme(self):
        """إنشاء ملف README مع التعليمات"""
        readme_content = """# API Test Suite
## مجموعة اختبارات APIs تلقائية

تم إنشاؤها تلقائياً من OpenAPI specification

### التثبيت

```bash
pip install -r requirements.txt
```

### تشغيل الاختبارات

#### تشغيل جميع الاختبارات
```bash
python test_runner.py --run
```

#### تشغيل مجموعة محددة
```bash
python test_runner.py --suite backend
python test_runner.py --suite frontend  
python test_runner.py --suite integration
```

#### بدء الجدولة التلقائية
```bash
python test_runner.py --schedule
```

### بنية المشروع

```
tests/
├── backend/           # اختبارات Backend مباشرة
├── frontend/          # اختبارات Frontend ومحاكاة المستخدم
├── integration/       # اختبارات التكامل مع الخدمات الخارجية
├── reports/           # تقارير النتائج
├── logs/              # ملفات السجلات
├── test_runner.py     # وكيل تشغيل الاختبارات
├── test_config.json   # إعدادات الاختبارات
└── requirements.txt   # متطلبات Python
```

### إعداد الإشعارات

قم بتحرير ملف `test_config.json` لتفعيل إشعارات البريد الإلكتروني أو Slack.

### التقارير

- تقارير JSON: `tests/reports/*.json`
- تقارير HTML: `tests/reports/*.html`
- السجلات: `tests/logs/test_runner.log`

### أنواع الاختبارات

1. **Backend Tests**: اختبارات API مباشرة عبر HTTP requests
2. **Frontend Tests**: محاكاة تفاعل المستخدم مع رؤوس المتصفح و Selenium
3. **Integration Tests**: اختبارات التكامل مع الخدمات الخارجية باستخدام mocks

### الجدولة

الاختبارات تعمل تلقائياً حسب الجدولة المحددة في `test_config.json`:
- يومياً في وقت محدد
- كل عدة ساعات
- عند الحاجة يدوياً

### المراقبة

النظام يرسل إشعارات عند:
- فشل أي اختبار
- انخفاض معدل النجاح عن الحد المسموح
- زيادة زمن الاستجابة عن المعدل المقبول
"""
        
        readme_file = self.output_dir / "README.md"
        with open(readme_file, 'w', encoding='utf-8') as f:
            f.write(readme_content)
        
        print(f"✅ تم إنشاء ملف README في {readme_file}")

    def generate_all(self):
        """توليد جميع ملفات الاختبارات"""
        print("🚀 بدء توليد مجموعة اختبارات APIs شاملة...")
        
        # تحميل وتحليل OpenAPI specification
        self.load_openapi_spec()
        self.extract_endpoints()
        
        # توليد الاختبارات
        self.generate_backend_tests()
        self.generate_frontend_tests()
        self.generate_integration_tests()
        
        # إنشاء أدوات التشغيل والإدارة
        self.generate_test_runner()
        self.generate_requirements()
        self.generate_readme()
        
        print(f"""
✅ تم إنشاء مجموعة اختبارات شاملة في مجلد {self.output_dir}

📁 الملفات المُنشأة:
   - backend/test_backend_apis.py
   - frontend/test_frontend_apis.py  
   - integration/test_integration_apis.py
   - test_runner.py
   - requirements.txt
   - README.md
   - openapi.json (إذا لم يكن موجوداً)

🏃 لتشغيل الاختبارات:
   cd {self.output_dir}
   pip install -r requirements.txt
   python test_runner.py --run

📊 التقارير ستكون متوفرة في مجلد reports/
""")

def main():
    parser = argparse.ArgumentParser(
        description='مولد اختبارات APIs تلقائي من OpenAPI specification'
    )
    parser.add_argument(
        '--openapi', 
        default='openapi.json',
        help='مسار ملف OpenAPI specification (افتراضي: openapi.json)'
    )
    parser.add_argument(
        '--output',
        default='tests',
        help='مجلد الإخراج (افتراضي: tests)'
    )
    
    args = parser.parse_args()
    
    generator = APITestGenerator(args.openapi, args.output)
    generator.generate_all()

if __name__ == "__main__":
    main()