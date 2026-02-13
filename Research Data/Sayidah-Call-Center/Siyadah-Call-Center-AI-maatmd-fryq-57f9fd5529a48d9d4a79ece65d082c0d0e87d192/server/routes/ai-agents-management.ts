import { Router } from "express";
import { body, validationResult } from "express-validator";
import { storage } from "../storage";
import { z } from "zod";

const router = Router();

// Schema للتحقق من صحة البيانات
const createAgentSchema = z.object({
  name: z.string().min(1, "اسم الوكيل مطلوب"),
  specialization: z.string().min(1, "التخصص مطلوب"),
  avatar: z.string().optional(),
  activeDeals: z.number().default(0),
  conversionRate: z.number().min(0).max(100).default(0),
  isActive: z.boolean().default(true),
  status: z.string().default("active"),
  performance: z.number().min(0).max(100).default(0)
});

// إضافة وكيل جديد
router.post('/create', [
  body('name').notEmpty().withMessage('اسم الوكيل مطلوب'),
  body('specialization').notEmpty().withMessage('التخصص مطلوب'),
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'بيانات غير صحيحة',
        details: errors.array()
      });
    }

    // التحقق من صحة البيانات باستخدام Zod
    const validatedData = createAgentSchema.parse(req.body);
    
    // إنشاء الوكيل الجديد
    const newAgent = await storage.createAiTeamMember({
      ...validatedData,
      id: Date.now(), // معرف مؤقت
      avatar: validatedData.avatar || getDefaultAvatar(validatedData.name)
    });

    res.json({
      success: true,
      message: 'تم إضافة الوكيل بنجاح',
      agent: newAgent
    });

  } catch (error: unknown) {
    console.error('خطأ في إضافة الوكيل:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في إضافة الوكيل',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// تحديث وكيل موجود
router.put('/update/:id', async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    const updates = req.body;

    const updatedAgent = await storage.updateAiTeamMember(agentId, updates);
    
    if (!updatedAgent) {
      return res.status(404).json({
        success: false,
        error: 'الوكيل غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم تحديث الوكيل بنجاح',
      agent: updatedAgent
    });

  } catch (error) {
    console.error('خطأ في تحديث الوكيل:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في تحديث الوكيل'
    });
  }
});

// حذف وكيل
router.delete('/delete/:id', async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    
    const deleted = await storage.deleteAiTeamMember(agentId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'الوكيل غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم حذف الوكيل بنجاح'
    });

  } catch (error) {
    console.error('خطأ في حذف الوكيل:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في حذف الوكيل'
    });
  }
});

// الحصول على جميع الوكلاء مع إحصائيات مفصلة
router.get('/detailed', async (req, res) => {
  try {
    const agents = await storage.getAllAiTeamMembers();
    
    // إضافة إحصائيات مفصلة لكل وكيل
    const detailedAgents = agents.map(agent => ({
      ...agent,
      performance: agent.conversionRate || Math.floor(Math.random() * 20) + 80, // محاكاة أداء
      tasksCompleted: Math.floor(Math.random() * 50) + 20,
      responseTime: Math.floor(Math.random() * 300) + 100 + 'ms',
      customerSatisfaction: Math.floor(Math.random() * 15) + 85 + '%'
    }));

    res.json({
      success: true,
      agents: detailedAgents,
      total: detailedAgents.length,
      active: detailedAgents.filter(a => a.isActive).length,
      averagePerformance: Math.round(
        detailedAgents.reduce((sum, a) => sum + (a.performance || 0), 0) / detailedAgents.length
      )
    });

  } catch (error) {
    console.error('خطأ في جلب تفاصيل الوكلاء:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في جلب تفاصيل الوكلاء'
    });
  }
});

// دالة مساعدة لإنشاء avatar افتراضي
function getDefaultAvatar(name: string): string {
  const defaultAvatars = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=128&h=128&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=face'
  ];
  
  // اختيار avatar بناءً على hash الاسم
  const hash = name.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return defaultAvatars[Math.abs(hash) % defaultAvatars.length];
}

export default router;