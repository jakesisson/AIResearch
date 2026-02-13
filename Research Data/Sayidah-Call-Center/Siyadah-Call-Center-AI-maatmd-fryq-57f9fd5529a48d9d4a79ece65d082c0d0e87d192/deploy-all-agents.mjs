import mongoose from 'mongoose';
import { SPECIALIZED_AI_AGENTS } from './server/deploy-advanced-agents.js';

const MONGODB_URI = 'mongodb+srv://siyada:JppPfSY7nhwOL6R6@cluster0.zabls2k.mongodb.net/business_automation?retryWrites=true&w=majority';

// Define the schema directly here
const AIAgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameAr: { type: String, required: true },
  role: { type: String, required: true },
  roleAr: { type: String, required: true },
  specialization: { type: String, required: true },
  specializationAr: { type: String, required: true },
  capabilities: [String],
  capabilitiesAr: [String],
  performance: { type: Number, default: 85 },
  status: { type: String, enum: ['active', 'training', 'offline'], default: 'active' },
  created: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  tasksCompleted: { type: Number, default: 0 },
  successRate: { type: Number, default: 85 },
  languages: [String],
  integrations: [String],
  aiModel: { type: String, default: 'gpt-4o' },
  organizationId: String,
  deployedAt: Date
});

const AIAgentModel = mongoose.model('AIAgent', AIAgentSchema);

async function deployAllAgents() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing agents first
    const deleteResult = await AIAgentModel.deleteMany({ organizationId: 'global' });
    console.log(`🧹 Cleared ${deleteResult.deletedCount} existing global agents`);
    
    // Deploy all specialized agents
    console.log(`\n🚀 Deploying ${SPECIALIZED_AI_AGENTS.length} specialized AI agents...`);
    
    const deployedAgents = [];
    for (const agentData of SPECIALIZED_AI_AGENTS) {
      const agent = new AIAgentModel({
        ...agentData,
        organizationId: 'global',
        deployedAt: new Date(),
        created: new Date(),
        lastActive: new Date()
      });
      
      const savedAgent = await agent.save();
      deployedAgents.push(savedAgent);
      console.log(`✅ Deployed: ${agent.name} (${agent.role})`);
    }
    
    console.log(`\n📊 Deployment Summary:`);
    console.log(`Total agents deployed: ${deployedAgents.length}`);
    console.log(`Organization: global`);
    console.log(`Average performance: ${(deployedAgents.reduce((sum, a) => sum + a.performance, 0) / deployedAgents.length).toFixed(1)}%`);
    
    // Show agent categories
    const categories = {};
    deployedAgents.forEach(agent => {
      if (!categories[agent.specialization]) {
        categories[agent.specialization] = 0;
      }
      categories[agent.specialization]++;
    });
    
    console.log('\n📂 Agent Categories:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`- ${cat}: ${count} agents`);
    });
    
    console.log('\n✅ All 20+ AI agents deployed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deployAllAgents();