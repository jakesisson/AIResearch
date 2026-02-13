// src/pages/customer-service-hub/components/QualitySupervision.jsx
import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const QualitySupervision = () => {
  const [activeTab, setActiveTab] = useState('monitoring'); // monitoring, coaching, analytics
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Mock data for supervision
  const agents = [
    {
      id: 1,
      name: 'سارة الدعم',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
      status: 'online',
      activeConversations: 3,
      qualityScore: 94,
      responseTime: 1.8,
      customerSatisfaction: 4.7,
      escalationRate: 8,
      coachingNeeded: false
    },
    {
      id: 2,
      name: 'أحمد المالية',
      avatar: 'https://images.pixabay.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
      status: 'busy',
      activeConversations: 2,
      qualityScore: 87,
      responseTime: 2.5,
      customerSatisfaction: 4.3,
      escalationRate: 12,
      coachingNeeded: true
    },
    {
      id: 3,
      name: 'ليلى الخدمة',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
      status: 'away',
      activeConversations: 1,
      qualityScore: 91,
      responseTime: 2.1,
      customerSatisfaction: 4.5,
      escalationRate: 6,
      coachingNeeded: false
    }
  ];

  const liveConversations = [
    {
      id: 1,
      agent: 'سارة الدعم',
      customer: 'أحمد محمد',
      channel: 'WhatsApp',
      duration: '00:08:23',
      sentiment: 'neutral',
      priority: 'medium',
      qualityFlags: [],
      lastMessage: 'شكراً لك، سأحاول هذا الحل وأعلمك بالنتيجة',
      aiSuggestion: 'اقترح متابعة الحل خلال 24 ساعة'
    },
    {
      id: 2,
      agent: 'أحمد المالية',
      customer: 'فاطمة سالم',
      channel: 'Email',
      duration: '00:15:45',
      sentiment: 'frustrated',
      priority: 'high',
      qualityFlags: ['long_response_time', 'tone_concern'],
      lastMessage: 'هذا غير مقبول، أريد حل فوري للمشكلة',
      aiSuggestion: 'يحتاج تدخل المشرف - تصعيد مطلوب'
    },
    {
      id: 3,
      agent: 'ليلى الخدمة',
      customer: 'محمد الهاشمي',
      channel: 'Chat',
      duration: '00:03:12',
      sentiment: 'satisfied',
      priority: 'low',
      qualityFlags: [],
      lastMessage: 'ممتاز، شكراً لك على الخدمة السريعة',
      aiSuggestion: 'محادثة ناجحة - لا حاجة لتدخل'
    }
  ];

  const coachingRecommendations = [
    {
      id: 1,
      agent: 'أحمد المالية',
      area: 'وقت الاستجابة',
      priority: 'high',
      description: 'تحسين سرعة الرد على استفسارات العملاء',
      suggestedActions: [
        'استخدام الردود السريعة المعدة مسبقاً',
        'تحسين مهارات الكتابة السريعة',
        'التدريب على إدارة الوقت'
      ],
      deadline: '2024-02-01'
    },
    {
      id: 2,
      agent: 'أحمد المالية',
      area: 'نبرة التواصل',
      priority: 'medium',
      description: 'تطوير مهارات التواصل العاطفي مع العملاء',
      suggestedActions: [
        'التدريب على إدارة المحادثات الصعبة',
        'استخدام عبارات تهدئة أكثر',
        'التركيز على حل المشكلة أولاً'
      ],
      deadline: '2024-02-15'
    }
  ];

  const qualityMetrics = {
    overall: {
      score: 91,
      trend: 2.3,
      conversationsReviewed: 127,
      issuesIdentified: 8
    },
    categories: [
      { name: 'الاحترافية', score: 94, target: 90 },
      { name: 'سرعة الاستجابة', score: 88, target: 85 },
      { name: 'حل المشكلة', score: 92, target: 90 },
      { name: 'رضا العميل', score: 89, target: 85 },
      { name: 'اتباع الإجراءات', score: 95, target: 95 }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-success';
      case 'busy': return 'bg-warning';
      case 'away': return 'bg-error';
      default: return 'bg-surface';
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'satisfied': return 'text-success';
      case 'neutral': return 'text-text-secondary';
      case 'frustrated': return 'text-warning';
      case 'angry': return 'text-error';
      default: return 'text-text-secondary';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'satisfied': return 'Smile';
      case 'neutral': return 'Meh';
      case 'frustrated': return 'Frown';
      case 'angry': return 'Angry';
      default: return 'HelpCircle';
    }
  };

  const renderMonitoringTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Agents Overview */}
      <div className="lg:col-span-1 space-y-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">المندوبين النشطين</h3>
        
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => setSelectedAgent(agent)}
            className={`glass-effect border p-4 rounded-lg cursor-pointer transition-all duration-300 ${
              selectedAgent?.id === agent.id
                ? 'border-accent/50 bg-accent/5' :'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="relative">
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(agent.status)} rounded-full border-2 border-background`} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-text-primary">{agent.name}</h4>
                <p className="text-text-secondary text-sm">{agent.activeConversations} محادثة نشطة</p>
              </div>
              {agent.coachingNeeded && (
                <Icon name="AlertCircle" size={16} className="text-warning" />
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-center">
                <p className="text-text-secondary">جودة</p>
                <p className={`font-semibold ${
                  agent.qualityScore >= 90 ? 'text-success' : 
                  agent.qualityScore >= 80 ? 'text-warning' : 'text-error'
                }`}>{agent.qualityScore}%</p>
              </div>
              <div className="text-center">
                <p className="text-text-secondary">استجابة</p>
                <p className="font-semibold text-text-primary">{agent.responseTime}د</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Live Conversations */}
      <div className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-text-primary mb-4">المحادثات المباشرة</h3>
        
        <div className="space-y-4">
          {liveConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`glass-effect border p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                selectedConversation?.id === conv.id
                  ? 'border-accent/50 bg-accent/5' :'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Icon 
                      name={getSentimentIcon(conv.sentiment)} 
                      size={16} 
                      className={getSentimentColor(conv.sentiment)} 
                    />
                    <span className="font-medium text-text-primary">{conv.customer}</span>
                  </div>
                  <span className="text-text-secondary">•</span>
                  <span className="text-text-secondary text-sm">{conv.agent}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    conv.priority === 'high' ? 'bg-error/20 text-error' :
                    conv.priority === 'medium'? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                  }`}>
                    {conv.priority === 'high' ? 'عالية' : conv.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                  </span>
                  <span className="text-text-muted text-sm">{conv.duration}</span>
                </div>
              </div>
              
              <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                {conv.lastMessage}
              </p>
              
              {conv.qualityFlags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {conv.qualityFlags.map((flag, index) => (
                    <span key={index} className="bg-error/10 text-error px-2 py-1 rounded text-xs">
                      {flag === 'long_response_time' ? 'تأخير في الرد' :
                       flag === 'tone_concern' ? 'مشكلة في النبرة' : flag}
                    </span>
                  ))}
                </div>
              )}
              
              {conv.aiSuggestion && (
                <div className="bg-accent/10 border border-accent/20 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Icon name="Sparkles" size={14} className="text-accent" />
                    <span className="text-accent text-sm font-medium">اقتراح الذكاء الاصطناعي:</span>
                  </div>
                  <p className="text-text-primary text-sm">{conv.aiSuggestion}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCoachingTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-text-primary">توصيات التدريب والتطوير</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {coachingRecommendations.map((rec) => (
          <div key={rec.id} className="glass-effect border border-white/10 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Icon name="User" size={16} className="text-accent" />
                <span className="font-medium text-text-primary">{rec.agent}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                rec.priority === 'high' ? 'bg-error/20 text-error' :
                rec.priority === 'medium'? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
              }`}>
                {rec.priority === 'high' ? 'عالي' : rec.priority === 'medium' ? 'متوسط' : 'منخفض'}
              </span>
            </div>
            
            <h4 className="font-semibold text-text-primary mb-2">{rec.area}</h4>
            <p className="text-text-secondary text-sm mb-4">{rec.description}</p>
            
            <div className="space-y-2 mb-4">
              <p className="font-medium text-text-primary text-sm">الإجراءات المقترحة:</p>
              <ul className="space-y-1">
                {rec.suggestedActions.map((action, index) => (
                  <li key={index} className="flex items-center space-x-2 text-text-secondary text-sm">
                    <Icon name="Check" size={12} className="text-accent" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-text-muted text-sm">الموعد المستهدف: {rec.deadline}</span>
              <button className="bg-accent hover:bg-accent-600 text-background px-4 py-2 rounded-lg transition-colors duration-300 text-sm">
                بدء التدريب
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Coaching Progress */}
      <div className="glass-effect border border-white/10 p-6 rounded-lg">
        <h4 className="font-semibold text-text-primary mb-4">تقدم التدريب</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent mb-1">12</div>
            <div className="text-text-secondary text-sm">جلسات تدريب مكتملة</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">5</div>
            <div className="text-text-secondary text-sm">جلسات قيد التنفيذ</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success mb-1">87%</div>
            <div className="text-text-secondary text-sm">متوسط التحسن</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-text-primary">تحليلات الجودة</h3>
      
      {/* Overall Quality Score */}
      <div className="glass-effect border border-white/10 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-semibold text-text-primary">درجة الجودة الإجمالية</h4>
          <div className="flex items-center space-x-2">
            <span className={`text-2xl font-bold ${
              qualityMetrics.overall.score >= 90 ? 'text-success' :
              qualityMetrics.overall.score >= 80 ? 'text-warning' : 'text-error'
            }`}>
              {qualityMetrics.overall.score}%
            </span>
            <div className={`flex items-center space-x-1 text-sm ${
              qualityMetrics.overall.trend > 0 ? 'text-success' : 'text-error'
            }`}>
              <Icon name={qualityMetrics.overall.trend > 0 ? 'TrendingUp' : 'TrendingDown'} size={16} />
              <span>{Math.abs(qualityMetrics.overall.trend)}%</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-text-primary">{qualityMetrics.overall.conversationsReviewed}</div>
            <div className="text-text-secondary text-sm">محادثة تم مراجعتها</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-text-primary">{qualityMetrics.overall.issuesIdentified}</div>
            <div className="text-text-secondary text-sm">مشكلة تم تحديدها</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-success">95%</div>
            <div className="text-text-secondary text-sm">الالتزام بالمعايير</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-accent">4.2</div>
            <div className="text-text-secondary text-sm">متوسط رضا العملاء</div>
          </div>
        </div>
      </div>
      
      {/* Quality Categories */}
      <div className="glass-effect border border-white/10 p-6 rounded-lg">
        <h4 className="font-semibold text-text-primary mb-4">تحليل فئات الجودة</h4>
        
        <div className="space-y-4">
          {qualityMetrics.categories.map((category, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-text-primary">{category.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-text-secondary text-sm">الهدف: {category.target}%</span>
                  <span className={`font-semibold ${
                    category.score >= category.target ? 'text-success' : 'text-warning'
                  }`}>
                    {category.score}%
                  </span>
                </div>
              </div>
              
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    category.score >= category.target ? 'bg-success' : 'bg-warning'
                  }`}
                  style={{ width: `${category.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Issues Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-effect border border-white/10 p-6 rounded-lg">
          <h4 className="font-semibold text-text-primary mb-4">أكثر المشاكل شيوعاً</h4>
          
          <div className="space-y-3">
            {[
              { issue: 'تأخير في الاستجابة', count: 15, trend: -8 },
              { issue: 'نبرة غير مناسبة', count: 8, trend: 12 },
              { issue: 'عدم اتباع الإجراءات', count: 5, trend: -3 },
              { issue: 'معلومات غير دقيقة', count: 3, trend: -25 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-text-primary">{item.issue}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-text-secondary">{item.count}</span>
                  <div className={`flex items-center space-x-1 text-xs ${
                    item.trend < 0 ? 'text-success' : 'text-error'
                  }`}>
                    <Icon name={item.trend < 0 ? 'TrendingDown' : 'TrendingUp'} size={12} />
                    <span>{Math.abs(item.trend)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="glass-effect border border-white/10 p-6 rounded-lg">
          <h4 className="font-semibold text-text-primary mb-4">أعلى المندوبين أداءً</h4>
          
          <div className="space-y-3">
            {agents
              .sort((a, b) => b.qualityScore - a.qualityScore)
              .map((agent, index) => (
                <div key={agent.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-warning text-background' :
                      index === 1 ? 'bg-text-secondary text-background' :
                      index === 2 ? 'bg-warning/50 text-background': 'bg-surface text-text-primary'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-text-primary">{agent.name}</span>
                  </div>
                  <span className="font-semibold text-accent">{agent.qualityScore}%</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold text-text-primary">
          إشراف الجودة
        </h2>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-surface/50 rounded-lg p-1">
          {[
            { id: 'monitoring', label: 'المراقبة المباشرة', icon: 'Eye' },
            { id: 'coaching', label: 'التدريب', icon: 'Users' },
            { id: 'analytics', label: 'التحليلات', icon: 'BarChart3' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-accent/20 text-accent' :'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'monitoring' && renderMonitoringTab()}
      {activeTab === 'coaching' && renderCoachingTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}
    </div>
  );
};

export default QualitySupervision;