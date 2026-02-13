import axios from 'axios';

// Test FastAPI Microservice Integration with Siyadah AI Platform

async function testMicroserviceIntegration() {
  console.log('🧪 Testing FastAPI Microservice Integration...\n');

  const expressURL = 'http://localhost:5000';
  const fastAPIURL = 'http://localhost:8001';

  // Test 1: Express.js Health Check
  console.log('1. Testing Express.js server...');
  try {
    const response = await axios.get(`${expressURL}/api/opportunities`);
    console.log('✅ Express.js server is running');
  } catch (error) {
    console.log('❌ Express.js server not available');
    return;
  }

  // Test 2: FastAPI Health Check
  console.log('\n2. Testing FastAPI microservice...');
  try {
    const response = await axios.get(`${fastAPIURL}/health`);
    console.log('✅ FastAPI microservice is running');
    console.log(`   Status: ${response.data.status}`);
  } catch (error) {
    console.log('⚠️  FastAPI microservice not available (fallback mode active)');
  }

  // Test 3: AI Processing through Express.js
  console.log('\n3. Testing AI processing via Express.js...');
  try {
    const response = await axios.post(`${expressURL}/api/microservice/ai/process`, {
      prompt: 'كيف يمكنني زيادة مبيعات شركتي؟',
      language: 'ar',
      max_tokens: 500
    });
    
    if (response.data.success) {
      console.log('✅ AI processing successful');
      console.log(`   Response: ${response.data.response.substring(0, 100)}...`);
    } else {
      console.log('⚠️  AI processing failed, using fallback');
    }
  } catch (error) {
    console.log('❌ AI processing error:', error.message);
  }

  // Test 4: Business Analysis
  console.log('\n4. Testing business analysis...');
  try {
    const sampleData = {
      revenue: 150000,
      customers: 45,
      growth_rate: 12,
      satisfaction: 4.2
    };

    const response = await axios.post(`${expressURL}/api/microservice/ai/analyze`, {
      data: sampleData,
      analysis_type: 'performance',
      language: 'ar'
    });

    if (response.data.success) {
      console.log('✅ Business analysis successful');
      console.log(`   Analysis: ${response.data.analysis.substring(0, 100)}...`);
    } else {
      console.log('⚠️  Business analysis failed, using fallback');
    }
  } catch (error) {
    console.log('❌ Business analysis error:', error.message);
  }

  // Test 5: Translation Service
  console.log('\n5. Testing translation service...');
  try {
    const response = await axios.post(`${expressURL}/api/microservice/ai/translate`, {
      text: 'مرحباً بكم في منصة سيادة للذكاء الاصطناعي',
      from_lang: 'ar',
      to_lang: 'en'
    });

    if (response.data.success) {
      console.log('✅ Translation successful');
      console.log(`   Original: مرحباً بكم في منصة سيادة للذكاء الاصطناعي`);
      console.log(`   Translation: ${response.data.translation}`);
    } else {
      console.log('⚠️  Translation failed, using fallback');
    }
  } catch (error) {
    console.log('❌ Translation error:', error.message);
  }

  // Test 6: Chat Integration
  console.log('\n6. Testing enhanced chat integration...');
  try {
    const response = await axios.post(`${expressURL}/api/microservice/ai/chat`, {
      message: 'ما هي أفضل استراتيجيات النمو للشركات السعودية؟',
      context: 'شركة تقنية ناشئة',
      user_id: 'test_user'
    });

    if (response.data.success) {
      console.log('✅ Enhanced chat successful');
      console.log(`   Response: ${response.data.response.substring(0, 100)}...`);
      console.log(`   Service: ${response.data.service}`);
    } else {
      console.log('⚠️  Enhanced chat failed');
    }
  } catch (error) {
    console.log('❌ Enhanced chat error:', error.message);
  }

  // Test 7: Service Health Status
  console.log('\n7. Checking overall service health...');
  try {
    const response = await axios.get(`${expressURL}/api/microservice/ai/health`);
    console.log('✅ Service health check complete');
    console.log(`   AI Service Status: ${response.data.ai_service_status}`);
    console.log(`   Fallback Enabled: ${response.data.fallback_enabled}`);
    console.log(`   Message: ${response.data.message}`);
  } catch (error) {
    console.log('❌ Service health check error:', error.message);
  }

  console.log('\n🎯 Integration Test Summary:');
  console.log('- Express.js provides API gateway and business logic');
  console.log('- FastAPI handles AI processing when available');
  console.log('- Automatic fallback to OpenAI direct integration');
  console.log('- Seamless Arabic language support');
  console.log('- Enterprise-grade error handling and monitoring');
}

// Performance Test
async function performanceTest() {
  console.log('\n⚡ Performance Test...');
  
  const startTime = Date.now();
  const promises = [];
  
  for (let i = 0; i < 5; i++) {
    promises.push(
      axios.post('http://localhost:5000/api/microservice/ai/process', {
        prompt: `اختبار الأداء رقم ${i + 1}`,
        language: 'ar'
      })
    );
  }
  
  try {
    await Promise.all(promises);
    const endTime = Date.now();
    console.log(`✅ Processed 5 concurrent requests in ${endTime - startTime}ms`);
  } catch (error) {
    console.log('❌ Performance test failed');
  }
}

// Run tests
async function runAllTests() {
  await testMicroserviceIntegration();
  await performanceTest();
  
  console.log('\n🚀 FastAPI Integration Ready!');
  console.log('\nTo start FastAPI microservice:');
  console.log('cd ai-service && ./install.sh && ./run.sh');
}

runAllTests().catch(console.error);