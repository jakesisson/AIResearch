import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://siyada:JppPfSY7nhwOL6R6@cluster0.zabls2k.mongodb.net/business_automation?retryWrites=true&w=majority';

async function checkAgents() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check AI agents
    const agentsCollection = db.collection('aiagents');
    const agentsCount = await agentsCollection.countDocuments();
    const agents = await agentsCollection.find({}).limit(5).toArray();
    
    console.log('\n📊 AI Agents Status:');
    console.log(`Total agents in database: ${agentsCount}`);
    
    if (agents.length > 0) {
      console.log('\nFirst 5 agents:');
      agents.forEach(agent => {
        console.log(`- ${agent.name} (${agent.role}) - Status: ${agent.status}`);
      });
    }
    
    // Check other collections
    const collections = await db.listCollections().toArray();
    console.log('\n📂 All Collections:');
    for (const coll of collections) {
      const count = await db.collection(coll.name).countDocuments();
      console.log(`- ${coll.name}: ${count} documents`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAgents();
