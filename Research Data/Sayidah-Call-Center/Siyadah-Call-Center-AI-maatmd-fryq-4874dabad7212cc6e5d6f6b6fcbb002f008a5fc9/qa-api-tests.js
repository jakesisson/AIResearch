import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function runAPITests() {
  console.log('🧪 بدء اختبارات API الشاملة...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Login Endpoint
  console.log('📝 Test 1: تسجيل الدخول');
  try {
    const loginRes = await fetch(`${BASE_URL}/api/enterprise-saas/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@demo.siyadah.ai',
        password: 'demo123456'
      })
    });
    const loginData = await loginRes.json();
    
    if (loginRes.ok && loginData.success && loginData.data?.token) {
      console.log('✅ تسجيل الدخول نجح - Token received');
      results.passed++;
      results.tests.push({ name: 'Login', status: 'PASSED', token: loginData.data.token });
    } else {
      console.log('❌ فشل تسجيل الدخول');
      console.log('Response:', JSON.stringify(loginData, null, 2));
      results.failed++;
      results.tests.push({ name: 'Login', status: 'FAILED' });
    }
  } catch (error) {
    console.log('❌ خطأ في تسجيل الدخول:', error.message);
    results.failed++;
  }

  // Test 2: Get User (with token)
  console.log('\n📝 Test 2: جلب بيانات المستخدم مع Token');
  const token = results.tests[0]?.token;
  if (token) {
    try {
      const userRes = await fetch(`${BASE_URL}/api/auth/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (userRes.ok) {
        const userData = await userRes.json();
        console.log('✅ جلب بيانات المستخدم نجح:', userData.email);
        results.passed++;
      } else {
        console.log('❌ فشل جلب بيانات المستخدم:', userRes.status);
        results.failed++;
      }
    } catch (error) {
      console.log('❌ خطأ:', error.message);
      results.failed++;
    }
  }

  // Test 3: Get User (without token) - Should fail
  console.log('\n📝 Test 3: جلب بيانات المستخدم بدون Token (يجب أن يفشل)');
  try {
    const userRes = await fetch(`${BASE_URL}/api/auth/user`);
    
    if (userRes.status === 401) {
      console.log('✅ رفض الوصول بدون Token - صحيح');
      results.passed++;
    } else {
      console.log('❌ خطأ أمني - السماح بالوصول بدون Token!');
      results.failed++;
    }
  } catch (error) {
    console.log('❌ خطأ:', error.message);
    results.failed++;
  }

  // Test 4: AI Agents
  console.log('\n📝 Test 4: جلب الوكلاء الذكيين');
  try {
    const agentsRes = await fetch(`${BASE_URL}/api/ai-agents`);
    const agentsData = await agentsRes.json();
    
    if (agentsRes.ok && agentsData.agents?.length > 0) {
      console.log(`✅ تم جلب ${agentsData.agents.length} وكيل ذكي`);
      results.passed++;
    } else {
      console.log('❌ فشل جلب الوكلاء');
      results.failed++;
    }
  } catch (error) {
    console.log('❌ خطأ:', error.message);
    results.failed++;
  }

  // Test 5: Opportunities
  console.log('\n📝 Test 5: جلب الفرص التجارية');
  try {
    const oppRes = await fetch(`${BASE_URL}/api/opportunities`);
    const oppData = await oppRes.json();
    
    if (oppRes.ok && oppData.opportunities) {
      console.log(`✅ تم جلب ${oppData.opportunities.length} فرصة - القيمة الإجمالية: ${oppData.totalValue} SAR`);
      results.passed++;
    } else {
      console.log('❌ فشل جلب الفرص');
      results.failed++;
    }
  } catch (error) {
    console.log('❌ خطأ:', error.message);
    results.failed++;
  }

  // Test 6: RBAC Permissions
  console.log('\n📝 Test 6: اختبار صلاحيات RBAC');
  try {
    const rbacRes = await fetch(`${BASE_URL}/api/rbac/roles-matrix`);
    const rbacData = await rbacRes.json();
    
    if (rbacRes.ok && rbacData.success && rbacData.data?.roles) {
      console.log(`✅ نظام RBAC يعمل - ${rbacData.data.totalRoles} أدوار`);
      results.passed++;
    } else {
      console.log('❌ فشل اختبار RBAC');
      console.log('Response:', JSON.stringify(rbacData, null, 2));
      results.failed++;
    }
  } catch (error) {
    console.log('❌ خطأ:', error.message);
    results.failed++;
  }

  // Test 7: WhatsApp Webhook
  console.log('\n📝 Test 7: WhatsApp Webhook');
  try {
    const whatsappRes = await fetch(`${BASE_URL}/api/whatsapp/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{
          id: 'test123',
          from: '966500000000',
          timestamp: Date.now(),
          text: { body: 'اختبار رسالة' },
          type: 'text'
        }]
      })
    });
    
    if (whatsappRes.ok) {
      console.log('✅ WhatsApp webhook يعمل');
      results.passed++;
    } else {
      console.log('❌ فشل WhatsApp webhook');
      results.failed++;
    }
  } catch (error) {
    console.log('❌ خطأ:', error.message);
    results.failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 ملخص النتائج:');
  console.log(`✅ نجح: ${results.passed} اختبار`);
  console.log(`❌ فشل: ${results.failed} اختبار`);
  console.log(`📈 نسبة النجاح: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
  console.log('='.repeat(50));

  return results;
}

// Run tests
runAPITests();