// src/pages/settings-configuration/components/SecuritySettings.jsx
import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const SecuritySettings = ({ onSettingsChange, onSaveComplete }) => {
  const [security, setSecurity] = useState({
    twoFactorEnabled: true,
    sessionTimeout: 60,
    passwordPolicy: 'strong',
    loginAlerts: true,
    deviceTracking: true,
    apiAccess: false,
    dataEncryption: true,
    auditLogs: true
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [sessions, setSessions] = useState([
    {
      id: 1,
      device: 'MacBook Pro',
      browser: 'Chrome 120.0',
      location: 'الرياض، السعودية',
      ipAddress: '192.168.1.100',
      lastActive: '2024-01-15T10:30:00Z',
      isCurrent: true
    },
    {
      id: 2,
      device: 'iPhone 15',
      browser: 'Safari Mobile',
      location: 'الرياض، السعودية',
      ipAddress: '192.168.1.101',
      lastActive: '2024-01-15T09:15:00Z',
      isCurrent: false
    },
    {
      id: 3,
      device: 'Windows PC',
      browser: 'Edge 120.0',
      location: 'جدة، السعودية',
      ipAddress: '192.168.2.50',
      lastActive: '2024-01-14T16:45:00Z',
      isCurrent: false
    }
  ]);
  
  const [showQRCode, setShowQRCode] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleSecurityToggle = (setting) => {
    setSecurity(prev => ({ ...prev, [setting]: !prev[setting] }));
    onSettingsChange?.();
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    
    if (field === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    onSettingsChange?.();
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 25) return 'text-error';
    if (strength < 50) return 'text-warning';
    if (strength < 75) return 'text-warning';
    return 'text-success';
  };

  const getPasswordStrengthText = (strength) => {
    if (strength < 25) return 'ضعيف';
    if (strength < 50) return 'متوسط';
    if (strength < 75) return 'جيد';
    return 'قوي';
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('كلمة المرور الجديدة غير متطابقة');
      return;
    }
    
    if (passwordStrength < 75) {
      alert('كلمة المرور ضعيفة، يرجى اختيار كلمة مرور أقوى');
      return;
    }
    
    // Change password logic
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    onSaveComplete?.();
  };

  const handleRevokeSession = (sessionId) => {
    if (confirm('هل أنت متأكد من إنهاء هذه الجلسة؟')) {
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      onSettingsChange?.();
    }
  };

  const handleRevokeAllSessions = () => {
    if (confirm('سيتم إنهاء جميع الجلسات الأخرى. هل تريد المتابعة؟')) {
      setSessions(prev => prev.filter(session => session.isCurrent));
      onSettingsChange?.();
    }
  };

  return (
    <div className="space-y-8">
      {/* Password Management */}
      <div className="space-y-6">
        <h3 className="text-lg font-heading font-semibold text-text-primary">إدارة كلمة المرور</h3>
        
        <div className="glass-effect border border-white/10 rounded-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">كلمة المرور الحالية</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg glass-effect border border-white/20 text-text-primary bg-transparent focus:border-accent focus:ring-2 focus:ring-accent/20"
                  placeholder="أدخل كلمة المرور الحالية"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg glass-effect border border-white/20 text-text-primary bg-transparent focus:border-accent focus:ring-2 focus:ring-accent/20"
                  placeholder="أدخل كلمة المرور الجديدة"
                />
                {passwordForm.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-text-secondary">قوة كلمة المرور</span>
                      <span className={`text-xs font-medium ${getPasswordStrengthColor(passwordStrength)}`}>
                        {getPasswordStrengthText(passwordStrength)}
                      </span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength < 25 ? 'bg-error' :
                          passwordStrength < 50 ? 'bg-warning' :
                          passwordStrength < 75 ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg glass-effect border border-white/20 text-text-primary bg-transparent focus:border-accent focus:ring-2 focus:ring-accent/20"
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                />
              </div>
              
              <button
                onClick={handleChangePassword}
                disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                className="w-full bg-accent hover:bg-accent-600 disabled:bg-surface disabled:text-text-muted text-background font-medium py-3 rounded-lg transition-all duration-300"
              >
                تغيير كلمة المرور
              </button>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-text-primary">متطلبات كلمة المرور</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Icon 
                    name={passwordForm.newPassword.length >= 8 ? "CheckCircle" : "Circle"} 
                    size={16} 
                    className={passwordForm.newPassword.length >= 8 ? "text-success" : "text-text-muted"} 
                  />
                  <span className="text-sm text-text-secondary">8 أحرف على الأقل</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon 
                    name={/[A-Z]/.test(passwordForm.newPassword) ? "CheckCircle" : "Circle"} 
                    size={16} 
                    className={/[A-Z]/.test(passwordForm.newPassword) ? "text-success" : "text-text-muted"} 
                  />
                  <span className="text-sm text-text-secondary">حرف كبير واحد على الأقل</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon 
                    name={/[0-9]/.test(passwordForm.newPassword) ? "CheckCircle" : "Circle"} 
                    size={16} 
                    className={/[0-9]/.test(passwordForm.newPassword) ? "text-success" : "text-text-muted"} 
                  />
                  <span className="text-sm text-text-secondary">رقم واحد على الأقل</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon 
                    name={/[^A-Za-z0-9]/.test(passwordForm.newPassword) ? "CheckCircle" : "Circle"} 
                    size={16} 
                    className={/[^A-Za-z0-9]/.test(passwordForm.newPassword) ? "text-success" : "text-text-muted"} 
                  />
                  <span className="text-sm text-text-secondary">رمز خاص واحد على الأقل</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="space-y-6">
        <h3 className="text-lg font-heading font-semibold text-text-primary">المصادقة الثنائية</h3>
        
        <div className="glass-effect border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-medium text-text-primary mb-2">تفعيل المصادقة الثنائية</h4>
              <p className="text-text-secondary text-sm">إضافة طبقة حماية إضافية لحسابك</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={security.twoFactorEnabled}
                onChange={() => handleSecurityToggle('twoFactorEnabled')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
          
          {security.twoFactorEnabled && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-text-primary">تطبيق المصادقة</h5>
                  <button
                    onClick={() => setShowQRCode(!showQRCode)}
                    className="text-accent hover:text-accent-300 text-sm font-medium transition-colors duration-300"
                  >
                    {showQRCode ? 'إخفاء' : 'إعداد'}
                  </button>
                </div>
                
                {showQRCode && (
                  <div className="text-center p-4 bg-surface/50 rounded-lg">
                    <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <Icon name="QrCode" size={64} className="text-background" />
                    </div>
                    <p className="text-text-secondary text-sm mb-2">امسح الكود بتطبيق المصادقة</p>
                    <p className="text-text-muted text-xs">Google Authenticator أو Authy</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-text-secondary">رموز الاسترداد</p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {['ABC123', 'DEF456', 'GHI789', 'JKL012'].map((code, index) => (
                      <div key={index} className="bg-surface/50 p-2 rounded text-center text-text-primary">
                        {code}
                      </div>
                    ))}
                  </div>
                  <p className="text-text-muted text-xs">احفظ هذه الرموز في مكان آمن</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h5 className="font-medium text-text-primary">الأجهزة الموثوقة</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-surface/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon name="Smartphone" size={16} className="text-accent" />
                      <span className="text-sm text-text-primary">iPhone الخاص بي</span>
                    </div>
                    <button className="text-error hover:text-error-light text-sm transition-colors duration-300">
                      إزالة
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon name="Monitor" size={16} className="text-accent" />
                      <span className="text-sm text-text-primary">MacBook Pro</span>
                    </div>
                    <button className="text-error hover:text-error-light text-sm transition-colors duration-300">
                      إزالة
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Settings */}
      <div className="space-y-6">
        <h3 className="text-lg font-heading font-semibold text-text-primary">إعدادات الأمان</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            {
              key: 'loginAlerts',
              title: 'تنبيهات تسجيل الدخول',
              description: 'إرسال تنبيه عند تسجيل دخول من جهاز جديد',
              icon: 'AlertTriangle'
            },
            {
              key: 'deviceTracking',
              title: 'تتبع الأجهزة',
              description: 'مراقبة الأجهزة المستخدمة للوصول للحساب',
              icon: 'Monitor'
            },
            {
              key: 'apiAccess',
              title: 'الوصول عبر API',
              description: 'السماح للتطبيقات الخارجية بالوصول للبيانات',
              icon: 'Code'
            },
            {
              key: 'dataEncryption',
              title: 'تشفير البيانات',
              description: 'تشفير البيانات الحساسة (مطلوب)',
              icon: 'Lock'
            },
            {
              key: 'auditLogs',
              title: 'سجلات المراجعة',
              description: 'الاحتفاظ بسجل مفصل للأنشطة',
              icon: 'FileText'
            }
          ].map((setting) => (
            <div key={setting.key} className="glass-effect border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon name={setting.icon} size={20} className="text-accent" />
                  <div>
                    <h4 className="font-medium text-text-primary">{setting.title}</h4>
                    <p className="text-text-secondary text-sm">{setting.description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={security[setting.key]}
                    onChange={() => handleSecurityToggle(setting.key)}
                    disabled={setting.key === 'dataEncryption'}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    setting.key === 'dataEncryption' ?'bg-accent cursor-not-allowed' :'bg-surface peer-checked:bg-accent peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20'
                  }`}></div>
                </label>
              </div>
            </div>
          ))}
        </div>
        
        {/* Session Timeout */}
        <div className="glass-effect border border-white/10 rounded-lg p-6">
          <h4 className="font-medium text-text-primary mb-4">انتهاء صلاحية الجلسة</h4>
          <div className="flex items-center space-x-4">
            <span className="text-text-secondary">انتهاء الجلسة تلقائياً بعد</span>
            <select
              value={security.sessionTimeout}
              onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
              className="px-4 py-2 rounded-lg glass-effect border border-white/20 text-text-primary bg-transparent focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              <option value={15} className="bg-surface">15 دقيقة</option>
              <option value={30} className="bg-surface">30 دقيقة</option>
              <option value={60} className="bg-surface">60 دقيقة</option>
              <option value={120} className="bg-surface">ساعتين</option>
              <option value={480} className="bg-surface">8 ساعات</option>
            </select>
            <span className="text-text-secondary">من عدم النشاط</span>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading font-semibold text-text-primary">الجلسات النشطة</h3>
          <button
            onClick={handleRevokeAllSessions}
            className="text-error hover:text-error-light font-medium transition-colors duration-300 flex items-center space-x-2"
          >
            <Icon name="LogOut" size={16} />
            <span>إنهاء جميع الجلسات الأخرى</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="glass-effect border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Icon 
                    name={session.device.includes('iPhone') ? 'Smartphone' : 
                          session.device.includes('Mac') ? 'Monitor' : 'Computer'} 
                    size={20} 
                    className="text-accent" 
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-text-primary">{session.device}</h4>
                      {session.isCurrent && (
                        <span className="bg-success/20 text-success text-xs px-2 py-1 rounded-full">
                          الجلسة الحالية
                        </span>
                      )}
                    </div>
                    <p className="text-text-secondary text-sm">{session.browser} • {session.location}</p>
                    <p className="text-text-muted text-xs">
                      آخر نشاط: {new Date(session.lastActive).toLocaleString('ar-SA')} • IP: {session.ipAddress}
                    </p>
                  </div>
                </div>
                
                {!session.isCurrent && (
                  <button
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-error hover:text-error-light transition-colors duration-300 p-2 rounded-lg glass-hover"
                    title="إنهاء الجلسة"
                  >
                    <Icon name="X" size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Information */}
      <div className="glass-effect border border-accent/20 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Icon name="Shield" size={20} className="text-accent mt-1" />
          <div>
            <h4 className="font-medium text-text-primary mb-2">الامتثال لحماية البيانات السعودية</h4>
            <p className="text-text-secondary text-sm mb-3">
              نحن ملتزمون بأنظمة حماية البيانات في المملكة العربية السعودية ونطبق أعلى معايير الأمان.
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={16} className="text-success" />
                <span className="text-text-secondary">تشفير AES-256</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={16} className="text-success" />
                <span className="text-text-secondary">امتثال PDPL</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={16} className="text-success" />
                <span className="text-text-secondary">بيانات محلية</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;