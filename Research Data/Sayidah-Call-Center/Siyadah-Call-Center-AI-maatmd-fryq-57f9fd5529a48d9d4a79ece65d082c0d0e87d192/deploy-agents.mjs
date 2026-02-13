import { connectToMongoDB } from './server/mongodb.js';
import { deployAdvancedAgents, initializeAllOrganizationAgents } from './server/deploy-advanced-agents.js';

async function main() {
  try {
    console.log('🚀 Starting AI Agents Deployment...');
    
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Deploy global agents
    const result = await deployAdvancedAgents('global');
    console.log('📊 Deployment Result:', result);
    
    // Initialize for all organizations
    await initializeAllOrganizationAgents();
    
    console.log('✅ AI Agents deployment complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

main();