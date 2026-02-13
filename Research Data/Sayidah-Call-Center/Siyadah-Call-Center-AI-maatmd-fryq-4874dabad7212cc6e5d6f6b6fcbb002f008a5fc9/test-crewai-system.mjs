import fetch from 'node-fetch';

async function testCrewAI() {
  console.log('🧪 Testing CrewAI Customer Service System...\n');
  
  const baseUrl = 'http://localhost:5000/api/crewai';
  
  // Test 1: Get agents
  console.log('📊 Test 1: Getting customer service agents...');
  try {
    const agentsResponse = await fetch(`${baseUrl}/agents?organizationId=global`);
    const agents = await agentsResponse.json();
    
    if (agents.success) {
      console.log(`✅ Found ${agents.agents.length} agents`);
      agents.agents.forEach(agent => {
        console.log(`   ${agent.icon} ${agent.nameAr} - ${agent.groupAr}`);
      });
    } else {
      console.log('❌ Failed to get agents:', agents.error);
    }
  } catch (error) {
    console.log('❌ Error getting agents:', error.message);
  }
  
  // Test 2: Execute workflow with different messages
  console.log('\n🤖 Test 2: Testing agent execution...');
  
  const testMessages = [
    {
      message: 'أريد المساعدة في حل مشكلة تقنية',
      expectedAgent: 'support'
    },
    {
      message: 'أريد معرفة أسعار منتجاتكم',
      expectedAgent: 'sales'
    },
    {
      message: 'عندي شكوى من الخدمة',
      expectedAgent: 'support'
    }
  ];
  
  for (const test of testMessages) {
    console.log(`\n📤 Testing: "${test.message}"`);
    
    try {
      const response = await fetch(`${baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: test.message,
          customer_id: 'test_customer_001',
          organization_id: 'global',
          conversation_history: []
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const agent = result.result.primaryResponse;
        console.log(`✅ Agent: ${agent.agentName}`);
        console.log(`   Response: ${agent.response}`);
        console.log(`   Confidence: ${(agent.confidence * 100).toFixed(0)}%`);
        console.log(`   Next Action: ${agent.nextAction || 'None'}`);
      } else {
        console.log(`❌ Error: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
  }
  
  // Test 3: Test with conversation history
  console.log('\n💬 Test 3: Testing with conversation history...');
  
  try {
    const response = await fetch(`${baseUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'نعم أريد الشراء',
        customer_id: 'test_customer_002',
        organization_id: 'global',
        conversation_history: [
          {
            role: 'user',
            content: 'ما هي منتجاتكم؟',
            timestamp: new Date(Date.now() - 60000).toISOString()
          },
          {
            role: 'assistant',
            content: 'لدينا مجموعة متنوعة من منتجات الذكاء الاصطناعي للأعمال. هل تريد معرفة المزيد؟',
            timestamp: new Date(Date.now() - 30000).toISOString()
          }
        ]
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      const agent = result.result.primaryResponse;
      console.log(`✅ Context-aware response from ${agent.agentName}`);
      console.log(`   Response: ${agent.response}`);
    } else {
      console.log(`❌ Error: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
  }
  
  console.log('\n✅ CrewAI testing complete!');
}

testCrewAI();