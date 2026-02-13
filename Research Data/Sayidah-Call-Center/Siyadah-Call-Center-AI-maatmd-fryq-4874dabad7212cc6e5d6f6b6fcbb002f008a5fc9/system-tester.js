#!/usr/bin/env node

/**
 * أداة الاختبار الشامل لمنصة سيادة AI
 * تفحص جميع الأنظمة والواجهات قبل النشر
 */

import http from 'http';
import https from 'https';

class SystemTester {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
    this.authToken = null;
  }

  async request(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${path}`;
      const defaultOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
        }
      };

      const finalOptions = { ...defaultOptions, ...options };
      
      const req = http.request(url, finalOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const jsonData = data ? JSON.parse(data) : {};
            resolve({
              status: res.statusCode,
              data: jsonData,
              headers: res.headers
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              data: data,
              headers: res.headers
            });
          }
        });
      });

      req.on('error', reject);
      
      if (finalOptions.body) {
        req.write(finalOptions.body);
      }
      
      req.end();
    });
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('ar-SA');
    const symbols = {
      'info': 'ℹ️',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'test': '🧪'
    };
    
    console.log(`${symbols[type]} [${timestamp}] ${message}`);
  }

  async test(name, testFn) {
    this.log(`اجراء اختبار: ${name}`, 'test');
    
    try {
      const startTime = Date.now();
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      if (result.success) {
        this.results.passed++;
        this.log(`نجح: ${name} (${duration}ms)`, 'success');
      } else {
        if (result.warning) {
          this.results.warnings++;
          this.log(`تحذير: ${name} - ${result.message}`, 'warning');
        } else {
          this.results.failed++;
          this.log(`فشل: ${name} - ${result.message}`, 'error');
        }
      }
      
      this.results.tests.push({
        name,
        success: result.success,
        warning: result.warning || false,
        message: result.message || '',
        duration
      });
      
    } catch (error) {
      this.results.failed++;
      this.log(`خطأ في اختبار ${name}: ${error.message}`, 'error');
      this.results.tests.push({
        name,
        success: false,
        warning: false,
        message: error.message,
        duration: 0
      });
    }
  }

  // اختبار الاتصال الأساسي
  async testBasicConnection() {
    return this.test('الاتصال الأساسي', async () => {
      try {
        const response = await this.request('/api/system-status');
        if (response.status === 200) {
          return { success: true };
        } else {
          return { success: false, message: `HTTP ${response.status}` };
        }
      } catch (error) {
        return { success: false, message: 'لا يمكن الاتصال بالخادم' };
      }
    });
  }

  // اختبار قاعدة البيانات
  async testDatabase() {
    return this.test('اتصال قاعدة البيانات', async () => {
      const response = await this.request('/api/ai-agents');
      if (response.status === 200 && response.data.success) {
        const agentCount = response.data.agents?.length || 0;
        if (agentCount > 0) {
          return { success: true };
        } else {
          return { success: false, message: 'لا توجد وكلاء في قاعدة البيانات' };
        }
      } else {
        return { success: false, message: 'فشل في جلب بيانات الوكلاء' };
      }
    });
  }

  // اختبار المصادقة
  async testAuthentication() {
    return this.test('نظام المصادقة', async () => {
      const loginData = {
        email: 'admin@demo.siyadah.ai',
        password: 'demo123456'
      };

      const response = await this.request('/api/enterprise-saas/login', {
        method: 'POST',
        body: JSON.stringify(loginData)
      });

      if (response.status === 200 && response.data.success) {
        this.authToken = response.data.data.token;
        return { success: true };
      } else {
        return { success: false, message: 'فشل في تسجيل الدخول' };
      }
    });
  }

  // اختبار الوصول المحمي
  async testProtectedAccess() {
    return this.test('الوصول المحمي', async () => {
      if (!this.authToken) {
        return { success: false, message: 'لا يوجد رمز مصادقة' };
      }

      const response = await this.request('/api/auth/user');
      if (response.status === 200) {
        return { success: true };
      } else if (response.status === 401) {
        return { success: false, message: 'رمز المصادقة غير صحيح' };
      } else {
        return { success: false, message: `HTTP ${response.status}` };
      }
    });
  }

  // اختبار الوكلاء الذكية
  async testAIAgents() {
    return this.test('الوكلاء الذكية', async () => {
      const response = await this.request('/api/ai-agents');
      if (response.status === 200 && response.data.success) {
        const agents = response.data.agents || [];
        const activeAgents = agents.filter(agent => agent.status === 'active');
        
        if (activeAgents.length >= 20) {
          return { success: true };
        } else if (activeAgents.length > 0) {
          return { 
            success: true, 
            warning: true, 
            message: `${activeAgents.length} وكيل نشط فقط (المتوقع 21+)` 
          };
        } else {
          return { success: false, message: 'لا توجد وكلاء نشطة' };
        }
      } else {
        return { success: false, message: 'فشل في جلب بيانات الوكلاء' };
      }
    });
  }

  // اختبار الأداء
  async testPerformance() {
    return this.test('أداء النظام', async () => {
      const startTime = Date.now();
      const response = await this.request('/api/ai-agents');
      const responseTime = Date.now() - startTime;

      if (response.status === 200) {
        if (responseTime < 1000) {
          return { success: true };
        } else if (responseTime < 3000) {
          return { 
            success: true, 
            warning: true, 
            message: `زمن الاستجابة بطيء: ${responseTime}ms` 
          };
        } else {
          return { success: false, message: `زمن الاستجابة بطيء جداً: ${responseTime}ms` };
        }
      } else {
        return { success: false, message: 'فشل في اختبار الأداء' };
      }
    });
  }

  // اختبار APIs المتقدمة
  async testAdvancedAPIs() {
    const endpoints = [
      '/api/opportunities',
      '/api/workflows', 
      '/api/rbac/roles-matrix',
      '/api/saas/plans'
    ];

    for (const endpoint of endpoints) {
      await this.test(`API ${endpoint}`, async () => {
        const response = await this.request(endpoint);
        if (response.status === 200) {
          return { success: true };
        } else if (response.status === 401) {
          return { 
            success: true, 
            warning: true, 
            message: 'يتطلب مصادقة (متوقع)' 
          };
        } else {
          return { success: false, message: `HTTP ${response.status}` };
        }
      });
    }
  }

  // فحص مفاتيح API المفقودة
  async testMissingAPIKeys() {
    return this.test('مفاتيح API', async () => {
      const missingKeys = [];
      
      // فحص ElevenLabs
      if (!process.env.ELEVENLABS_API_KEY) {
        missingKeys.push('ELEVENLABS_API_KEY');
      }
      
      // فحص Twilio
      if (!process.env.TWILIO_AUTH_TOKEN) {
        missingKeys.push('TWILIO_AUTH_TOKEN');
      }
      
      // فحص Stripe
      if (!process.env.STRIPE_SECRET_KEY) {
        missingKeys.push('STRIPE_SECRET_KEY');
      }
      
      // فحص SendGrid
      if (!process.env.SENDGRID_API_KEY) {
        missingKeys.push('SENDGRID_API_KEY');
      }

      if (missingKeys.length > 0) {
        return { 
          success: true, 
          warning: true, 
          message: `مفاتيح مفقودة: ${missingKeys.join(', ')}` 
        };
      } else {
        return { success: true };
      }
    });
  }

  // تشغيل جميع الاختبارات
  async runAllTests() {
    console.log('🚀 بدء اختبار النظام الشامل لمنصة سيادة AI\n');

    // الاختبارات الأساسية
    await this.testBasicConnection();
    await this.testDatabase();
    await this.testAuthentication();
    await this.testProtectedAccess();
    
    // الاختبارات المتقدمة
    await this.testAIAgents();
    await this.testPerformance();
    await this.testAdvancedAPIs();
    await this.testMissingAPIKeys();

    this.printSummary();
  }

  // طباعة ملخص النتائج
  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 ملخص نتائج الاختبار');
    console.log('='.repeat(50));
    
    console.log(`✅ اختبارات ناجحة: ${this.results.passed}`);
    console.log(`❌ اختبارات فاشلة: ${this.results.failed}`);
    console.log(`⚠️  تحذيرات: ${this.results.warnings}`);
    
    const total = this.results.passed + this.results.failed + this.results.warnings;
    const successRate = ((this.results.passed + this.results.warnings) / total * 100).toFixed(1);
    
    console.log(`📈 معدل النجاح: ${successRate}%`);
    
    // تقييم الجاهزية
    if (this.results.failed === 0) {
      if (this.results.warnings === 0) {
        console.log('\n🎉 النظام جاهز للنشر بنسبة 100%!');
      } else {
        console.log('\n✅ النظام جاهز للنشر مع تحذيرات طفيفة');
      }
    } else {
      console.log('\n⚠️  النظام يحتاج إصلاحات قبل النشر');
    }
    
    // عرض التفاصيل
    console.log('\n📝 تفاصيل الاختبارات:');
    this.results.tests.forEach(test => {
      const status = test.success ? '✅' : '❌';
      const warning = test.warning ? '⚠️' : '';
      console.log(`${status}${warning} ${test.name} ${test.message ? `- ${test.message}` : ''}`);
    });
    
    console.log('\n' + '='.repeat(50));
  }
}

// تشغيل الاختبارات
async function main() {
  const tester = new SystemTester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ خطأ في تشغيل الاختبارات:', error.message);
    process.exit(1);
  }
}

// تشغيل إذا تم استدعاء الملف مباشرة
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default SystemTester;