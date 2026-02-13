/**
 * Real AI Agents API - GPT-4o Powered Intelligence
 * APIs للوكلاء الذكيين الحقيقيين المدعومين بـ GPT-4o
 */

import type { Express } from 'express';
import { advancedAIAgentEngine } from './advanced-ai-agents';

export function setupRealAIAgentsAPI(app: Express) {
  
  // API للحصول على الوكلاء الذكيين الحقيقيين
  app.get('/api/real-ai-agents', async (req, res) => {
    try {
      console.log('🧠 Real AI Agents System - GPT-4o Powered Activated');
      
      const advancedAgents = advancedAIAgentEngine.getAllAgents();
      const systemStats = advancedAIAgentEngine.getSystemStats();
      
      console.log('✅ Real AI Intelligence deployed: 5 GPT-4o powered agents');
      
      res.json({
        success: true,
        agents: advancedAgents.map(agent => ({
          id: agent.id,
          name: agent.name,
          role: agent.role,
          specialization: agent.specialization,
          personality: agent.personality,
          capabilities: agent.capabilities,
          performance: agent.performance.successRate * 100,
          status: 'active',
          isRealAI: true,
          aiModel: 'gpt-4o',
          memoryCount: agent.memory.length,
          totalInteractions: agent.performance.totalInteractions,
          customerSatisfaction: agent.performance.customerSatisfaction,
          learningProgress: agent.performance.learningProgress * 100,
          responseTime: agent.performance.averageResponseTime,
          problemResolution: agent.performance.problemResolutionRate * 100,
          _id: agent.id,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`,
          createdAt: new Date().toISOString()
        })),
        systemStats: {
          ...systemStats,
          realAI: true,
          intelligenceLevel: 'Advanced GPT-4o',
          capabilities: ['natural_language_understanding', 'contextual_memory', 'learning_adaptation', 'specialized_expertise']
        },
        message: "الوكلاء الذكيين الحقيقيين - مدعومين بـ GPT-4o",
        totalAgents: advancedAgents.length,
        activeAgents: advancedAgents.length,
        averagePerformance: systemStats.averagePerformance * 100,
        systemType: 'Real AI Intelligence'
      });
    } catch (error) {
      console.error('Error fetching real AI agents:', error);
      res.status(500).json({
        success: false,
        message: "خطأ في جلب الوكلاء الذكيين الحقيقيين",
        error: error.message
      });
    }
  });

  // API للتفاعل مع الوكيل الذكي
  app.post('/api/real-ai-agents/chat', async (req, res) => {
    try {
      const { agentId, message, userId, context } = req.body;
      
      if (!agentId || !message) {
        return res.status(400).json({
          success: false,
          message: "معرف الوكيل والرسالة مطلوبان"
        });
      }

      console.log(`🧠 Real AI Processing: ${agentId} analyzing message`);
      
      const result = await advancedAIAgentEngine.interactWithAgent(
        agentId, 
        message, 
        userId || 'anonymous', 
        context
      );
      
      console.log(`✅ AI Response: ${result.confidence * 100}% confidence`);
      
      res.json({
        success: true,
        response: result.response,
        agent: {
          id: result.agent.id,
          name: result.agent.name,
          specialization: result.agent.specialization
        },
        confidence: result.confidence,
        suggestions: result.suggestions,
        metadata: {
          ...result.metadata,
          realAI: true,
          processingTime: result.metadata.processingTime
        },
        message: "تم التفاعل مع الذكاء الاصطناعي الحقيقي بنجاح"
      });
      
    } catch (error) {
      console.error('Error in real AI interaction:', error);
      res.status(500).json({
        success: false,
        message: "خطأ في التفاعل مع الذكاء الاصطناعي الحقيقي",
        error: error.message
      });
    }
  });

  // API لاختيار أفضل وكيل ذكي للمهمة
  app.post('/api/real-ai-agents/select', async (req, res) => {
    try {
      const { message, context } = req.body;
      
      if (!message) {
        return res.status(400).json({
          success: false,
          message: "الرسالة مطلوبة"
        });
      }

      console.log(`🎯 AI Selection: Analyzing for best specialist`);
      
      const bestAgent = await advancedAIAgentEngine.selectBestAgent(message, context);
      
      console.log(`✅ Selected: ${bestAgent.name} - ${bestAgent.specialization}`);
      
      res.json({
        success: true,
        selectedAgent: {
          id: bestAgent.id,
          name: bestAgent.name,
          role: bestAgent.role,
          specialization: bestAgent.specialization,
          capabilities: bestAgent.capabilities,
          performance: bestAgent.performance,
          isRealAI: true,
          aiModel: 'gpt-4o'
        },
        reasoning: `تم اختيار ${bestAgent.name} لأنه متخصص في ${bestAgent.specialization}`,
        message: "تم اختيار أفضل ذكاء اصطناعي متخصص للمهمة"
      });
      
    } catch (error) {
      console.error('Error in AI selection:', error);
      res.status(500).json({
        success: false,
        message: "خطأ في اختيار الذكاء الاصطناعي المناسب",
        error: error.message
      });
    }
  });

  // API لعرض ذاكرة وتعلم الوكيل
  app.get('/api/real-ai-agents/:agentId/memory', async (req, res) => {
    try {
      const { agentId } = req.params;
      const { userId } = req.query;
      
      const agent = advancedAIAgentEngine.getAgent(agentId);
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: "الوكيل غير موجود"
        });
      }

      // فلترة الذاكرة للمستخدم المحدد إذا تم تمريره
      let memory = agent.memory;
      if (userId) {
        memory = agent.memory.filter(m => m.userId === userId);
      }

      res.json({
        success: true,
        agent: {
          id: agent.id,
          name: agent.name,
          specialization: agent.specialization
        },
        memory: memory.slice(-10), // آخر 10 ذكريات
        learningModel: {
          totalInteractions: agent.performance.totalInteractions,
          learningProgress: agent.performance.learningProgress * 100,
          improvementAreas: agent.learningModel.improvementAreas,
          lastUpdate: agent.learningModel.lastTrainingUpdate
        },
        message: "تم جلب ذاكرة الوكيل الذكي بنجاح"
      });
      
    } catch (error) {
      console.error('Error fetching agent memory:', error);
      res.status(500).json({
        success: false,
        message: "خطأ في جلب ذاكرة الوكيل",
        error: error.message
      });
    }
  });

  // API لإحصائيات النظام المتقدمة
  app.get('/api/real-ai-agents/stats', async (req, res) => {
    try {
      const systemStats = advancedAIAgentEngine.getSystemStats();
      const agents = advancedAIAgentEngine.getAllAgents();
      
      // حساب إحصائيات متقدمة
      const totalMemory = agents.reduce((sum, agent) => sum + agent.memory.length, 0);
      const averageSatisfaction = agents.reduce((sum, agent) => sum + agent.performance.customerSatisfaction, 0) / agents.length;
      const totalInteractions = agents.reduce((sum, agent) => sum + agent.performance.totalInteractions, 0);
      
      res.json({
        success: true,
        systemStats: {
          ...systemStats,
          detailedMetrics: {
            totalMemoryEntries: totalMemory,
            averageCustomerSatisfaction: averageSatisfaction,
            totalInteractions: totalInteractions,
            realAICapabilities: true,
            modelVersion: 'gpt-4o',
            lastSystemUpdate: new Date().toISOString()
          }
        },
        agentBreakdown: agents.map(agent => ({
          name: agent.name,
          specialization: agent.specialization,
          performance: agent.performance.successRate * 100,
          interactions: agent.performance.totalInteractions,
          satisfaction: agent.performance.customerSatisfaction,
          memorySize: agent.memory.length
        })),
        message: "إحصائيات النظام الذكي المتقدم"
      });
      
    } catch (error) {
      console.error('Error fetching system stats:', error);
      res.status(500).json({
        success: false,
        message: "خطأ في جلب إحصائيات النظام",
        error: error.message
      });
    }
  });

  console.log('🧠 Real AI Agents APIs configured successfully');
}