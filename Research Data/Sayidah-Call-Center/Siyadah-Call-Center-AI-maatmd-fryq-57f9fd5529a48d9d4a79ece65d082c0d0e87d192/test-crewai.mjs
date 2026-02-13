import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://siyada:JppPfSY7nhwOL6R6@cluster0.zabls2k.mongodb.net/business_automation?retryWrites=true&w=majority';

async function testCrewAI() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check customer agents
    const agentsCollection = db.collection('customeragents');
    const agentsCount = await agentsCollection.countDocuments();
    const agents = await agentsCollection.find({}).toArray();
    
    console.log('\n📊 Customer Service Agents Status:');
    console.log(`Total agents in database: ${agentsCount}`);
    
    if (agents.length > 0) {
      console.log('\n✅ Deployed agents:');
      agents.forEach(agent => {
        console.log(`- ${agent.icon} ${agent.nameAr} (${agent.type}) - ${agent.groupAr}`);
      });
    } else {
      console.log('❌ No customer service agents found - deploying now...');
      
      // Deploy agents using the API
      const response = await fetch('http://localhost:5000/api/crewai/deploy-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: 'global' })
      });
      
      const result = await response.json();
      console.log('📤 Deployment result:', result);
    }
    
    // Test agent execution
    console.log('\n🧪 Testing agent execution...');
    const testResponse = await fetch('http://localhost:5000/api/crewai/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'عندي مشكلة في تسجيل الدخول',
        agentId: 'agent_support_responder'
      })
    });
    
    const testResult = await testResponse.json();
    console.log('🤖 Agent response:', testResult);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testCrewAI();
