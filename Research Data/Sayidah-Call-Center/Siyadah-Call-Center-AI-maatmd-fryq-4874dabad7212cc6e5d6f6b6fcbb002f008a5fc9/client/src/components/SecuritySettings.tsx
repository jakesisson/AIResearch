import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Key, 
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  Lock,
  Unlock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface SecuritySettingsProps {
  className?: string;
}

export default function SecuritySettings({ className }: SecuritySettingsProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(60); // minutes
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const queryClient = useQueryClient();

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Mock security settings
  const securityStatus = {
    passwordStrength: 'قوية',
    lastPasswordChange: '2024-12-01',
    twoFactorEnabled: false,
    activeSession: 3,
    lastLogin: '2024-12-22 10:30',
    suspiciousActivity: 0
  };

  // Mock recent login activity
  const recentActivity = [
    {
      id: 1,
      device: 'Windows - Chrome',
      location: 'الرياض، السعودية',
      ip: '192.168.1.100',
      time: '2024-12-22 10:30',
      status: 'نشط',
      current: true
    },
    {
      id: 2,
      device: 'iPhone - Safari',
      location: 'جدة، السعودية',
      ip: '192.168.1.101',
      time: '2024-12-21 15:45',
      status: 'منتهي',
      current: false
    },
    {
      id: 3,
      device: 'Android - Chrome',
      location: 'الدمام، السعودية',
      ip: '192.168.1.102',
      time: '2024-12-20 09:15',
      status: 'منتهي',
      current: false
    }
  ];

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwordForm) => {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('فشل في تغيير كلمة المرور');
      return response.json();
    },
    onSuccess: () => {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/security-status'] });
    }
  });

  // Two-factor authentication mutation
  const toggleTwoFactorMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const response = await fetch('/api/auth/two-factor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      if (!response.ok) throw new Error('فشل في تغيير إعدادات المصادقة الثنائية');
      return response.json();
    },
    onSuccess: (data) => {
      setTwoFactorEnabled(data.enabled);
      if (data.backupCodes) {
        setBackupCodes(data.backupCodes);
        setShowBackupCodes(true);
      }
    }
  });

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return;
    }
    changePasswordMutation.mutate(passwordForm);
  };

  const handleTwoFactorToggle = () => {
    toggleTwoFactorMutation.mutate(!twoFactorEnabled);
  };

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setBackupCodes(codes);
    setShowBackupCodes(true);
  };

  const downloadBackupCodes = () => {
    const content = `رموز النسخ الاحتياطي للمصادقة الثنائية\n\n${backupCodes.join('\n')}\n\nاحتفظ بهذه الرموز في مكان آمن`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength < 2) return { level: 'ضعيفة', color: 'text-red-600', bg: 'bg-red-100' };
    if (strength < 4) return { level: 'متوسطة', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'قوية', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            نظرة عامة على الأمان
          </CardTitle>
          <CardDescription>
            حالة الأمان الحالية لحسابك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-medium">قوة كلمة المرور</p>
                <p className="text-xs text-muted-foreground">آخر تغيير: {securityStatus.lastPasswordChange}</p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                {securityStatus.passwordStrength}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-medium">المصادقة الثنائية</p>
                <p className="text-xs text-muted-foreground">حماية إضافية للحساب</p>
              </div>
              <Badge className={cn(
                securityStatus.twoFactorEnabled 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              )}>
                {securityStatus.twoFactorEnabled ? 'مفعلة' : 'معطلة'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-medium">الجلسات النشطة</p>
                <p className="text-xs text-muted-foreground">آخر دخول: {securityStatus.lastLogin}</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {securityStatus.activeSession}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            تغيير كلمة المرور
          </CardTitle>
          <CardDescription>
            قم بتحديث كلمة مرورك للحفاظ على أمان الحساب
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 h-auto"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 h-auto"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {passwordForm.newPassword && (
              <div className="flex items-center gap-2">
                <Badge className={cn("text-xs", passwordStrength.color, passwordStrength.bg)}>
                  {passwordStrength.level}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  يجب أن تحتوي على 8 أحرف على الأقل مع أرقام ورموز
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 h-auto"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
              <p className="text-xs text-red-600">كلمات المرور غير متطابقة</p>
            )}
          </div>

          <Button 
            onClick={handlePasswordChange}
            disabled={
              !passwordForm.currentPassword || 
              !passwordForm.newPassword || 
              passwordForm.newPassword !== passwordForm.confirmPassword ||
              changePasswordMutation.isPending
            }
            className="flex items-center gap-2"
          >
            {changePasswordMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Key className="w-4 h-4" />
            )}
            تغيير كلمة المرور
          </Button>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            المصادقة الثنائية
          </CardTitle>
          <CardDescription>
            أضف طبقة حماية إضافية لحسابك باستخدام تطبيق المصادقة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                twoFactorEnabled ? "bg-green-100" : "bg-red-100"
              )}>
                {twoFactorEnabled ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {twoFactorEnabled ? 'المصادقة الثنائية مفعلة' : 'المصادقة الثنائية معطلة'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {twoFactorEnabled 
                    ? 'حسابك محمي بالمصادقة الثنائية' 
                    : 'فعل المصادقة الثنائية لحماية أفضل'
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={handleTwoFactorToggle}
              disabled={toggleTwoFactorMutation.isPending}
            />
          </div>

          {twoFactorEnabled && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">رموز النسخ الاحتياطي</h4>
                <p className="text-sm text-blue-800 mb-3">
                  احتفظ بهذه الرموز في مكان آمن لاستخدامها عند فقدان جهازك
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateBackupCodes}
                    className="text-blue-600 border-blue-300"
                  >
                    <RefreshCw className="w-4 h-4 ml-2" />
                    إنشاء رموز جديدة
                  </Button>
                  {backupCodes.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadBackupCodes}
                      className="text-blue-600 border-blue-300"
                    >
                      <Download className="w-4 h-4 ml-2" />
                      تنزيل الرموز
                    </Button>
                  )}
                </div>
              </div>

              {showBackupCodes && backupCodes.length > 0 && (
                <div className="p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium mb-2">رموز النسخ الاحتياطي:</h4>
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="p-2 bg-background border rounded text-center">
                        {code}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    احفظ هذه الرموز في مكان آمن. كل رمز يمكن استخدامه مرة واحدة فقط.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            إدارة الجلسات
          </CardTitle>
          <CardDescription>
            عرض وإدارة جلسات تسجيل الدخول النشطة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Session Timeout */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">انتهاء صلاحية الجلسة التلقائي</p>
              <p className="text-sm text-muted-foreground">
                تسجيل خروج تلقائي بعد {sessionTimeout} دقيقة من عدم النشاط
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(Number(e.target.value))}
                className="w-20 text-center"
                min="5"
                max="480"
              />
              <span className="text-sm text-muted-foreground">دقيقة</span>
            </div>
          </div>

          {/* Login Alerts */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">تنبيهات تسجيل الدخول</p>
              <p className="text-sm text-muted-foreground">
                إرسال تنبيه عند تسجيل دخول من جهاز جديد
              </p>
            </div>
            <Switch
              checked={loginAlerts}
              onCheckedChange={setLoginAlerts}
            />
          </div>

          {/* Active Sessions */}
          <div>
            <h4 className="font-medium mb-3">الجلسات النشطة</h4>
            <div className="space-y-3">
              {recentActivity.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      session.current ? "bg-green-500" : "bg-slate-400"
                    )} />
                    <div>
                      <p className="font-medium text-sm">{session.device}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.location} • {session.ip}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(
                      "text-xs",
                      session.current 
                        ? "bg-green-100 text-green-800" 
                        : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200"
                    )}>
                      {session.status}
                    </Badge>
                    {!session.current && (
                      <Button variant="outline" size="sm">
                        <Unlock className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full mt-3">
              إنهاء جميع الجلسات الأخرى
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}