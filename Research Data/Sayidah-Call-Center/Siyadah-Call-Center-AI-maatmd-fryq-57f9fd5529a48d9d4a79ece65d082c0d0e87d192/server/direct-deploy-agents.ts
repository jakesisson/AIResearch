import { MongoStorage } from './mongodb-storage';
import { allAdvancedAgents } from './advanced-agents-system';

export async function directDeployAgents() {
  const storage = new MongoStorage();
  await storage.initialize();
  
  console.log('🚀 بدء النشر المباشر للنظام العالمي للاتصالات الذكية');
  
  let deployed = 0;
  
  for (const agent of allAdvancedAgents) {
    try {
      await storage.createAiTeamMember({
        name: agent.name,
        specialization: `${agent.engine} - ${agent.specialization}`,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop&crop=face',
        activeDeals: Math.floor(Math.random() * 5) + 1,
        conversionRate: agent.performance,
        isActive: true,
        status: 'active',
        performance: agent.performance
      });
      deployed++;
      console.log(`✅ نُشر: ${agent.name}`);
    } catch (error) {
      console.log(`⚠️ تخطي: ${agent.name}`);
    }
  }
  
  console.log(`🎉 تم نشر ${deployed} وكيل من أصل ${allAdvancedAgents.length}`);
  return deployed;
}