import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://siyada:JppPfSY7nhwOL6R6@cluster0.zabls2k.mongodb.net/business_automation?retryWrites=true&w=majority';

async function verifyCrewAI() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check AI agents collection
    const agentsCollection = db.collection('aiagents');
    const aiAgentsCount = await agentsCollection.countDocuments();
    console.log(`\n📊 AI Agents: ${aiAgentsCount} agents`);
    
    // Check customer agents collection
    const customerAgentsCollection = db.collection('customeragents');
    const customerAgentsCount = await customerAgentsCollection.countDocuments();
    console.log(`📊 Customer Service Agents: ${customerAgentsCount} agents`);
    
    if (customerAgentsCount > 0) {
      const agents = await customerAgentsCollection.find({}).toArray();
      console.log('\n✅ Deployed Customer Service Agents:');
      
      // Group agents by type
      const groups = {};
      agents.forEach(agent => {
        if (!groups[agent.groupAr]) groups[agent.groupAr] = [];
        groups[agent.groupAr].push(agent);
      });
      
      // Display grouped agents
      Object.entries(groups).forEach(([group, groupAgents]) => {
        console.log(`\n${group}:`);
        groupAgents.forEach(agent => {
          console.log(`  ${agent.icon} ${agent.nameAr} - ${agent.descriptionAr}`);
        });
      });
    }
    
    // Test API endpoints
    console.log('\n🧪 Testing CrewAI API endpoints...');
    
    // Test execute endpoint
    const testMessage = 'أريد المساعدة في حل مشكلة تقنية';
    console.log(`\n📤 Testing message: "${testMessage}"`);
    
    const response = await fetch('http://localhost:5000/api/crewai/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: testMessage,
        customer_id: 'test_customer_001',
        organization_id: 'global'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('\n✅ CrewAI Response:');
      console.log(`- Agent: ${result.agent_name} (${result.agent_id})`);
      console.log(`- Response: ${result.response}`);
      console.log(`- Confidence: ${result.confidence}`);
    } else {
      console.log(`❌ API Error: ${response.status} ${response.statusText}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyCrewAI();
