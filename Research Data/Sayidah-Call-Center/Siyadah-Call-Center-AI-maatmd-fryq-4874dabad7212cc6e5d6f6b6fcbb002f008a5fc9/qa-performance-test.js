import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function runPerformanceTests() {
  console.log('⚡ بدء اختبارات الأداء...\n');
  
  const results = {
    endpoints: [],
    avgResponseTime: 0
  };

  // Test multiple endpoints for response time
  const endpoints = [
    { url: '/api/ai-agents', method: 'GET', name: 'AI Agents' },
    { url: '/api/opportunities', method: 'GET', name: 'Opportunities' },
    { url: '/api/rbac/roles-matrix', method: 'GET', name: 'RBAC Matrix' },
    { url: '/api/real-time/metrics/current', method: 'GET', name: 'Real-time Metrics' }
  ];

  for (const endpoint of endpoints) {
    console.log(`📊 Testing: ${endpoint.name}`);
    const times = [];
    
    // Run each endpoint 5 times
    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      try {
        const response = await fetch(BASE_URL + endpoint.url, {
          method: endpoint.method
        });
        const elapsed = Date.now() - start;
        times.push(elapsed);
        
        if (!response.ok) {
          console.log(`   ⚠️ Status: ${response.status}`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        times.push(5000); // Penalty for error
      }
    }
    
    const avgTime = Math.round(times.reduce((a, b) => a + b) / times.length);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log(`   ⏱️ Avg: ${avgTime}ms | Min: ${minTime}ms | Max: ${maxTime}ms`);
    
    results.endpoints.push({
      name: endpoint.name,
      avgTime,
      minTime,
      maxTime,
      status: avgTime < 500 ? '✅ ممتاز' : avgTime < 1000 ? '⚠️ مقبول' : '❌ بطيء'
    });
  }

  // Calculate overall average
  results.avgResponseTime = Math.round(
    results.endpoints.reduce((sum, ep) => sum + ep.avgTime, 0) / results.endpoints.length
  );

  // Memory check
  console.log('\n💾 فحص استخدام الذاكرة...');
  try {
    const metricsRes = await fetch(`${BASE_URL}/api/real-time/metrics/current`);
    if (metricsRes.ok) {
      const metrics = await metricsRes.json();
      if (metrics.metrics?.system?.memoryUsage) {
        const memUsage = metrics.metrics.system.memoryUsage;
        console.log(`   📊 استخدام الذاكرة: ${memUsage}%`);
        results.memoryUsage = memUsage;
        results.memoryStatus = memUsage < 80 ? '✅ جيد' : memUsage < 90 ? '⚠️ مرتفع' : '❌ حرج';
      }
    }
  } catch (error) {
    console.log('   ⚠️ لا يمكن قراءة معلومات الذاكرة');
  }

  // Concurrent requests test
  console.log('\n🔄 اختبار الطلبات المتزامنة...');
  const concurrentStart = Date.now();
  const promises = [];
  
  for (let i = 0; i < 20; i++) {
    promises.push(fetch(`${BASE_URL}/api/ai-agents`));
  }
  
  try {
    const responses = await Promise.all(promises);
    const concurrentTime = Date.now() - concurrentStart;
    const successCount = responses.filter(r => r.ok).length;
    
    console.log(`   ✅ ${successCount}/20 طلب نجح في ${concurrentTime}ms`);
    results.concurrentTest = {
      success: successCount,
      total: 20,
      time: concurrentTime,
      status: successCount === 20 ? '✅ ممتاز' : '⚠️ بعض الأخطاء'
    };
  } catch (error) {
    console.log(`   ❌ فشل اختبار التزامن: ${error.message}`);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 ملخص اختبار الأداء:');
  console.log(`⏱️ متوسط وقت الاستجابة: ${results.avgResponseTime}ms`);
  
  if (results.memoryUsage) {
    console.log(`💾 استخدام الذاكرة: ${results.memoryUsage}% - ${results.memoryStatus}`);
  }
  
  if (results.concurrentTest) {
    console.log(`🔄 اختبار التزامن: ${results.concurrentTest.status}`);
  }
  
  const overallStatus = results.avgResponseTime < 500 && (!results.memoryUsage || results.memoryUsage < 90) 
    ? '✅ الأداء ممتاز' 
    : '⚠️ يحتاج تحسين';
  
  console.log(`\n📈 التقييم العام: ${overallStatus}`);
  console.log('='.repeat(50));

  return results;
}

// Run tests
runPerformanceTests();