// src/pages/workflow-automation-builder/components/PerformanceMonitoring.jsx
import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';

const PerformanceMonitoring = ({ workflow }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('success_rate');
  const [realTimeData, setRealTimeData] = useState([]);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);

  // Mock performance data
  const performanceData = {
    overview: {
      totalExecutions: 1247,
      successRate: 94.2,
      avgExecutionTime: 2.1,
      errorRate: 5.8,
      throughput: 52.3
    },
    trends: {
      '1h': { executions: 47, successRate: 96.2, avgTime: 1.9 },
      '24h': { executions: 1247, successRate: 94.2, avgTime: 2.1 },
      '7d': { executions: 8734, successRate: 93.8, avgTime: 2.3 },
      '30d': { executions: 37421, successRate: 92.6, avgTime: 2.4 }
    },
    bottlenecks: [
      {
        nodeId: 'node_123',
        nodeName: 'تحليل الاحتياجات',
        avgTime: 4.2,
        errorRate: 12.3,
        severity: 'high',
        recommendations: [
          'تحسين استعلامات قاعدة البيانات',
          'زيادة مهلة الانتظار',
          'إضافة آلية إعادة المحاولة'
        ]
      },
      {
        nodeId: 'node_456',
        nodeName: 'إرسال البريد الإلكتروني',
        avgTime: 2.8,
        errorRate: 8.1,
        severity: 'medium',
        recommendations: [
          'تحسين قالب البريد الإلكتروني',
          'فحص إعدادات SMTP'
        ]
      }
    ],
    alerts: [
      {
        id: 1,
        type: 'error_spike',
        title: 'ارتفاع في معدل الأخطاء',
        description: 'معدل الأخطاء تجاوز 10% في آخر ساعة',
        severity: 'high',
        timestamp: new Date(Date.now() - 300000),
        isResolved: false
      },
      {
        id: 2,
        type: 'performance_degradation',
        title: 'تراجع في الأداء',
        description: 'متوسط وقت التنفيذ زاد بنسبة 15%',
        severity: 'medium',
        timestamp: new Date(Date.now() - 900000),
        isResolved: true
      }
    ]
  };

  // Generate real-time data
  useEffect(() => {
    if (!isRealTimeEnabled) return;

    const interval = setInterval(() => {
      const newDataPoint = {
        timestamp: new Date(),
        executions: Math.floor(Math.random() * 10) + 5,
        successRate: 90 + Math.random() * 10,
        avgTime: 1.5 + Math.random() * 2,
        errors: Math.floor(Math.random() * 3)
      };
      
      setRealTimeData(prev => [...prev.slice(-29), newDataPoint]);
    }, 5000);

    return () => clearInterval(interval);
  }, [isRealTimeEnabled]);

  const timeRanges = [
    { value: '1h', label: 'آخر ساعة' },
    { value: '24h', label: 'آخر 24 ساعة' },
    { value: '7d', label: 'آخر 7 أيام' },
    { value: '30d', label: 'آخر 30 يوم' }
  ];

  const metrics = [
    { value: 'success_rate', label: 'معدل النجاح', icon: 'CheckCircle', color: 'success' },
    { value: 'execution_time', label: 'وقت التنفيذ', icon: 'Clock', color: 'warning' },
    { value: 'throughput', label: 'الإنتاجية', icon: 'TrendingUp', color: 'accent' },
    { value: 'error_rate', label: 'معدل الأخطاء', icon: 'AlertTriangle', color: 'error' }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-text-secondary';
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case 'high': return 'bg-error/20 border-error/30';
      case 'medium': return 'bg-warning/20 border-warning/30';
      case 'low': return 'bg-success/20 border-success/30';
      default: return 'bg-surface border-white/10';
    }
  };

  return (
    <div className="h-full p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
            مراقبة الأداء
          </h2>
          <p className="text-text-secondary">
            تتبع أداء سير العمل وتحليل الاختناقات
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Real-time Toggle */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRealTimeEnabled}
              onChange={(e) => setIsRealTimeEnabled(e.target.checked)}
              className="w-4 h-4 text-accent bg-surface border-white/20 rounded focus:ring-accent"
            />
            <span className="text-sm text-text-secondary">البيانات المباشرة</span>
          </label>

          {/* Time Range Selector */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="bg-surface border border-white/10 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: 'إجمالي التنفيذات',
            value: performanceData.overview.totalExecutions.toLocaleString('ar-SA'),
            icon: 'Play',
            color: 'accent',
            change: '+12.5%'
          },
          {
            title: 'معدل النجاح',
            value: `${performanceData.overview.successRate}%`,
            icon: 'CheckCircle',
            color: 'success',
            change: '+2.1%'
          },
          {
            title: 'متوسط وقت التنفيذ',
            value: `${performanceData.overview.avgExecutionTime}s`,
            icon: 'Clock',
            color: 'warning',
            change: '-5.3%'
          },
          {
            title: 'الإنتاجية (تنفيذ/ساعة)',
            value: performanceData.overview.throughput.toFixed(1),
            icon: 'TrendingUp',
            color: 'primary',
            change: '+8.7%'
          }
        ].map((card, index) => (
          <div key={index} className="glass-effect border border-white/10 rounded-lg p-6 group hover:border-accent/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${card.color}/20`}>
                <Icon name={card.icon} size={24} className={`text-${card.color}`} />
              </div>
              <div className={`text-sm font-medium ${
                card.change.startsWith('+') ? 'text-success' : 'text-error'
              }`}>
                {card.change}
              </div>
            </div>
            <h3 className="text-sm text-text-secondary mb-1">{card.title}</h3>
            <p className="text-2xl font-heading font-bold text-text-primary">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Chart */}
        <div className="glass-effect border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">
              اتجاهات الأداء
            </h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="bg-surface border border-white/10 rounded px-3 py-1 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              {metrics.map((metric) => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
            </select>
          </div>

          {/* Simple Chart Placeholder */}
          <div className="h-48 bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Icon name="BarChart3" size={48} className="text-accent mb-2 mx-auto" />
              <p className="text-text-secondary">
                مخطط {metrics.find(m => m.value === selectedMetric)?.label}
              </p>
            </div>
          </div>

          {/* Real-time Data */}
          {isRealTimeEnabled && realTimeData.length > 0 && (
            <div className="mt-4 p-3 bg-surface/50 rounded-lg">
              <h4 className="text-sm font-medium text-text-secondary mb-2">
                البيانات المباشرة (آخر 5 دقائق)
              </h4>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-text-secondary">التنفيذات:</span>
                  <span className="text-text-primary font-medium ml-1">
                    {realTimeData[realTimeData.length - 1]?.executions || 0}
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary">النجاح:</span>
                  <span className="text-success font-medium ml-1">
                    {realTimeData[realTimeData.length - 1]?.successRate?.toFixed(1) || 0}%
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary">الوقت:</span>
                  <span className="text-warning font-medium ml-1">
                    {realTimeData[realTimeData.length - 1]?.avgTime?.toFixed(1) || 0}s
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottlenecks Analysis */}
        <div className="glass-effect border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">
            تحليل الاختناقات
          </h3>

          <div className="space-y-4">
            {performanceData.bottlenecks.map((bottleneck, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getSeverityBg(bottleneck.severity)}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-text-primary">
                    {bottleneck.nodeName}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    bottleneck.severity === 'high' ? 'bg-error/20 text-error' :
                    bottleneck.severity === 'medium'? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                  }`}>
                    {bottleneck.severity === 'high' ? 'عالي' :
                     bottleneck.severity === 'medium' ? 'متوسط' : 'منخفض'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-xs">
                    <span className="text-text-secondary">متوسط الوقت:</span>
                    <span className="text-warning font-medium ml-1">
                      {bottleneck.avgTime}s
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="text-text-secondary">معدل الأخطاء:</span>
                    <span className="text-error font-medium ml-1">
                      {bottleneck.errorRate}%
                    </span>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-medium text-text-secondary mb-2">
                    التوصيات:
                  </h5>
                  <ul className="space-y-1">
                    {bottleneck.recommendations.map((rec, recIndex) => (
                      <li key={recIndex} className="text-xs text-text-primary flex items-center">
                        <Icon name="ArrowRight" size={12} className="text-accent ml-1" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts and Notifications */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary">
            التنبيهات والإشعارات
          </h3>
          <button className="text-accent hover:text-accent-light transition-colors duration-300">
            <Icon name="Settings" size={16} className="ml-1" />
            إدارة التنبيهات
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {performanceData.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                alert.isResolved 
                  ? 'bg-surface/50 border-white/10 opacity-60' 
                  : getSeverityBg(alert.severity)
              }`}
            >
              <div className="flex items-start space-x-3">
                <Icon 
                  name={alert.type === 'error_spike' ? 'AlertTriangle' : 'TrendingDown'} 
                  size={20} 
                  className={alert.isResolved ? 'text-text-secondary' : getSeverityColor(alert.severity)}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-medium ${
                      alert.isResolved ? 'text-text-secondary line-through' : 'text-text-primary'
                    }`}>
                      {alert.title}
                    </h4>
                    {alert.isResolved && (
                      <span className="text-xs bg-success/20 text-success px-2 py-1 rounded">
                        محلول
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${
                    alert.isResolved ? 'text-text-muted' : 'text-text-secondary'
                  }`}>
                    {alert.description}
                  </p>
                  <p className="text-xs text-text-muted mt-2">
                    {alert.timestamp.toLocaleString('ar-SA')}
                  </p>
                </div>
                {!alert.isResolved && (
                  <button className="p-1 rounded hover:bg-white/10 transition-colors duration-300">
                    <Icon name="X" size={16} className="text-text-secondary" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Suggestions */}
      <div className="mt-8 glass-effect border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          اقتراحات التحسين
        </h3>
        
        <div className="space-y-3">
          {[
            {
              title: 'تحسين استعلامات قاعدة البيانات',
              description: 'يمكن تقليل وقت التنفيذ بنسبة 25% عبر تحسين الاستعلامات',
              impact: 'عالي',
              effort: 'متوسط'
            },
            {
              title: 'إضافة آلية التخزين المؤقت',
              description: 'تقليل التحميل على الخوادم الخارجية',
              impact: 'متوسط',
              effort: 'منخفض'
            },
            {
              title: 'تنفيذ معالجة متوازية',
              description: 'معالجة عدة مهام في نفس الوقت لتحسين الإنتاجية',
              impact: 'عالي',
              effort: 'عالي'
            }
          ].map((suggestion, index) => (
            <div key={index} className="p-4 bg-surface/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-text-primary">
                  {suggestion.title}
                </h4>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    suggestion.impact === 'عالي' ? 'bg-success/20 text-success' :
                    suggestion.impact === 'متوسط'? 'bg-warning/20 text-warning' : 'bg-text-secondary/20 text-text-secondary'
                  }`}>
                    تأثير {suggestion.impact}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    suggestion.effort === 'منخفض' ? 'bg-success/20 text-success' :
                    suggestion.effort === 'متوسط'? 'bg-warning/20 text-warning' : 'bg-error/20 text-error'
                  }`}>
                    جهد {suggestion.effort}
                  </span>
                </div>
              </div>
              <p className="text-sm text-text-secondary mb-3">
                {suggestion.description}
              </p>
              <button className="text-accent hover:text-accent-light text-sm transition-colors duration-300">
                تطبيق الاقتراح
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitoring;