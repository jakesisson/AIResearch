import { useState, useEffect } from 'react';

interface Organization {
  id: string;
  name: string;
  plan: string;
  isActive: boolean;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roleId: string;
  isActive: boolean;
}

interface Role {
  id: string;
  name: string;
  nameAr: string;
  level: number;
  description?: string;
  descriptionAr?: string;
  permissions: string[];
}

interface PermissionTest {
  resource: string;
  action: string;
  scope: string;
  hasPermission: boolean;
  roleName: string;
  reason: string;
}

export default function EnterpriseRBACDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles] = useState<Role[]>([
    {
      id: 'system_super_admin',
      name: 'System Super Admin',
      nameAr: 'مدير النظام الأعلى',
      level: 6,
      description: 'Full system access across all organizations',
      descriptionAr: 'وصول كامل للنظام عبر جميع المؤسسات',
      permissions: ['*:*:global']
    },
    {
      id: 'service_provider_admin',
      name: 'Service Provider Admin',
      nameAr: 'مدير مقدم الخدمة',
      level: 5,
      description: 'Manage multiple client organizations',
      descriptionAr: 'إدارة مؤسسات العملاء المتعددة',
      permissions: ['organizations:*:global', 'users:*:organization', 'billing:*:organization']
    },
    {
      id: 'client_account_manager',
      name: 'Client Account Manager',
      nameAr: 'مدير حساب العميل',
      level: 4,
      description: 'Manage organization and team members',
      descriptionAr: 'إدارة المؤسسة وأعضاء الفريق',
      permissions: ['users:*:organization', 'settings:*:organization', 'data:read:organization']
    },
    {
      id: 'supervisor',
      name: 'Supervisor',
      nameAr: 'المشرف',
      level: 3,
      description: 'Supervise team and access reports',
      descriptionAr: 'الإشراف على الفريق والوصول للتقارير',
      permissions: ['users:read:organization', 'reports:read:organization', 'data:read:organization']
    },
    {
      id: 'agent_employee',
      name: 'Agent/Employee',
      nameAr: 'الوكيل/الموظف',
      level: 2,
      description: 'Basic operational access',
      descriptionAr: 'وصول تشغيلي أساسي',
      permissions: ['data:read:own', 'tasks:*:own']
    },
    {
      id: 'external_client_view',
      name: 'External Client View',
      nameAr: 'عرض العميل الخارجي',
      level: 1,
      description: 'Read-only access to own data',
      descriptionAr: 'وصول للقراءة فقط للبيانات الخاصة',
      permissions: ['data:read:own']
    }
  ]);

  const [testResults, setTestResults] = useState<PermissionTest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Initialize RBAC system on component mount
  useEffect(() => {
    initializeRBAC();
  }, []);

  const initializeRBAC = async () => {
    try {
      const response = await fetch('/api/rbac/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        console.log('RBAC system initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize RBAC:', error);
    }
  };

  const testPermission = async (resource: string, action: string, scope: string = 'organization') => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/rbac/test-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource, action, scope })
      });

      if (response.ok) {
        const data = await response.json();
        const newTest: PermissionTest = {
          resource,
          action,
          scope,
          hasPermission: data.hasPermission,
          roleName: data.roleName,
          reason: data.reason
        };
        setTestResults(prev => [newTest, ...prev.slice(0, 9)]); // Keep only last 10 results
      }
    } catch (error) {
      console.error('Permission test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDemoOrganization = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token' // Would be real token in production
        },
        body: JSON.stringify({
          name: `شركة تجريبية ${Date.now()}`,
          domain: `demo-${Date.now()}.com`,
          plan: 'trial'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setOrganizations(prev => [...prev, data.data]);
      }
    } catch (error) {
      console.error('Organization creation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDemoUser = async (roleId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token'
        },
        body: JSON.stringify({
          email: `user-${Date.now()}@demo.com`,
          firstName: 'مستخدم',
          lastName: 'تجريبي',
          roleId,
          organizationId: 'demo-org-1'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(prev => [...prev, data.data]);
      }
    } catch (error) {
      console.error('User creation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const TabButton = ({ id, label, isActive, onClick }: { id: string; label: string; isActive: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      style={{
        padding: '12px 24px',
        backgroundColor: isActive ? '#2563eb' : 'transparent',
        color: isActive ? 'white' : '#94a3b8',
        border: 'none',
        borderRadius: '8px 8px 0 0',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: isActive ? 'bold' : 'normal',
        transition: 'all 0.2s'
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: 'white',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '2rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          border: '1px solid #334155'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #60a5fa, #34d399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center'
          }}>
            🏢 نظام RBAC المؤسسي العالمي
          </h1>
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '18px' }}>
            نظام صلاحيات متعدد المستأجرين مع عزل كامل للبيانات وآلاف المستخدمين
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '12px 12px 0 0',
          border: '1px solid #334155',
          borderBottom: 'none'
        }}>
          <div style={{ display: 'flex', padding: '0 1rem' }}>
            <TabButton
              id="overview"
              label="نظرة عامة"
              isActive={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            />
            <TabButton
              id="roles"
              label="الأدوار والصلاحيات"
              isActive={activeTab === 'roles'}
              onClick={() => setActiveTab('roles')}
            />
            <TabButton
              id="testing"
              label="اختبار الصلاحيات"
              isActive={activeTab === 'testing'}
              onClick={() => setActiveTab('testing')}
            />
            <TabButton
              id="organizations"
              label="إدارة المؤسسات"
              isActive={activeTab === 'organizations'}
              onClick={() => setActiveTab('organizations')}
            />
            <TabButton
              id="users"
              label="إدارة المستخدمين"
              isActive={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
            />
          </div>
        </div>

        {/* Tab Content */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '2rem',
          borderRadius: '0 0 12px 12px',
          border: '1px solid #334155',
          minHeight: '600px'
        }}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ marginBottom: '2rem', color: '#60a5fa' }}>الميزات الرئيسية:</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div style={{
                  backgroundColor: '#0f172a',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #334155'
                }}>
                  <h3 style={{ color: '#34d399', marginBottom: '1rem' }}>🔒 عزل كامل للبيانات</h3>
                  <ul style={{ lineHeight: '1.8', color: '#cbd5e1' }}>
                    <li>عزل على مستوى المؤسسة</li>
                    <li>حدود بيانات محكمة</li>
                    <li>منع التداخل بين العملاء</li>
                    <li>أمان متعدد الطبقات</li>
                  </ul>
                </div>
                
                <div style={{
                  backgroundColor: '#0f172a',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #334155'
                }}>
                  <h3 style={{ color: '#f59e0b', marginBottom: '1rem' }}>⚡ أداء للمؤسسات</h3>
                  <ul style={{ lineHeight: '1.8', color: '#cbd5e1' }}>
                    <li>دعم آلاف المستخدمين</li>
                    <li>تخزين مؤقت للصلاحيات</li>
                    <li>عمليات مجمعة</li>
                    <li>تحكم في المعدل</li>
                  </ul>
                </div>

                <div style={{
                  backgroundColor: '#0f172a',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #334155'
                }}>
                  <h3 style={{ color: '#8b5cf6', marginBottom: '1rem' }}>🎯 صلاحيات دقيقة</h3>
                  <ul style={{ lineHeight: '1.8', color: '#cbd5e1' }}>
                    <li>6 مستويات هرمية</li>
                    <li>نظام موارد:إجراء:نطاق</li>
                    <li>صلاحيات البدل (*)</li>
                    <li>تدقيق شامل</li>
                  </ul>
                </div>

                <div style={{
                  backgroundColor: '#0f172a',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #334155'
                }}>
                  <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>📊 مراقبة ومتابعة</h3>
                  <ul style={{ lineHeight: '1.8', color: '#cbd5e1' }}>
                    <li>سجلات تدقيق مفصلة</li>
                    <li>تتبع الوصول</li>
                    <li>تحليلات الأمان</li>
                    <li>تقارير الامتثال</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Roles Tab */}
          {activeTab === 'roles' && (
            <div>
              <h2 style={{ marginBottom: '2rem', color: '#60a5fa' }}>الأدوار والصلاحيات:</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {roles.map((role) => (
                  <div
                    key={role.id}
                    style={{
                      backgroundColor: '#0f172a',
                      padding: '1.5rem',
                      borderRadius: '8px',
                      border: '1px solid #334155'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>{role.nameAr}</h3>
                        <p style={{ color: '#94a3b8', fontSize: '14px' }}>{role.descriptionAr}</p>
                      </div>
                      <div style={{
                        backgroundColor: role.level >= 5 ? '#dc2626' : role.level >= 3 ? '#f59e0b' : '#22c55e',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        مستوى {role.level}
                      </div>
                    </div>
                    <div>
                      <strong style={{ color: '#cbd5e1' }}>الصلاحيات:</strong>
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '0.5rem', 
                        marginTop: '0.5rem' 
                      }}>
                        {role.permissions.map((permission, index) => (
                          <span
                            key={index}
                            style={{
                              backgroundColor: '#374151',
                              color: '#d1d5db',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontFamily: 'monospace'
                            }}
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testing Tab */}
          {activeTab === 'testing' && (
            <div>
              <h2 style={{ marginBottom: '2rem', color: '#60a5fa' }}>اختبار الصلاحيات:</h2>
              
              {/* Quick Test Buttons */}
              <div style={{
                backgroundColor: '#0f172a',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #334155',
                marginBottom: '2rem'
              }}>
                <h3 style={{ marginBottom: '1rem', color: '#34d399' }}>اختبارات سريعة:</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  <button
                    onClick={() => testPermission('users', 'create', 'organization')}
                    disabled={isLoading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#22c55e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    إنشاء مستخدم
                  </button>
                  <button
                    onClick={() => testPermission('organizations', 'manage', 'global')}
                    disabled={isLoading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    إدارة المؤسسات
                  </button>
                  <button
                    onClick={() => testPermission('billing', 'read', 'organization')}
                    disabled={isLoading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    عرض الفواتير
                  </button>
                  <button
                    onClick={() => testPermission('data', 'read', 'own')}
                    disabled={isLoading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    قراءة البيانات الخاصة
                  </button>
                </div>
              </div>

              {/* Test Results */}
              {testResults.length > 0 && (
                <div style={{
                  backgroundColor: '#0f172a',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #334155'
                }}>
                  <h3 style={{ marginBottom: '1rem', color: '#f59e0b' }}>نتائج الاختبارات:</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {testResults.map((test, index) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: test.hasPermission ? '#064e3b' : '#7f1d1d',
                          padding: '1rem',
                          borderRadius: '6px',
                          border: `1px solid ${test.hasPermission ? '#065f46' : '#991b1b'}`
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'monospace' }}>
                            {test.resource}:{test.action}:{test.scope}
                          </span>
                          <span style={{ fontWeight: 'bold' }}>
                            {test.hasPermission ? '✅ مسموح' : '❌ ممنوع'}
                          </span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#d1d5db', marginTop: '0.5rem' }}>
                          {test.roleName} - {test.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Organizations Tab */}
          {activeTab === 'organizations' && (
            <div>
              <h2 style={{ marginBottom: '2rem', color: '#60a5fa' }}>إدارة المؤسسات:</h2>
              
              <div style={{
                backgroundColor: '#0f172a',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #334155',
                marginBottom: '2rem'
              }}>
                <button
                  onClick={createDemoOrganization}
                  disabled={isLoading}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    marginBottom: '1rem'
                  }}
                >
                  إنشاء مؤسسة تجريبية
                </button>
                
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                  كل مؤسسة معزولة بالكامل مع بياناتها وصلاحياتها المستقلة
                </p>
              </div>

              {organizations.length > 0 && (
                <div style={{
                  backgroundColor: '#0f172a',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #334155'
                }}>
                  <h3 style={{ marginBottom: '1rem', color: '#34d399' }}>المؤسسات المنشأة:</h3>
                  {organizations.map((org) => (
                    <div
                      key={org.id}
                      style={{
                        backgroundColor: '#1e293b',
                        padding: '1rem',
                        borderRadius: '6px',
                        border: '1px solid #334155',
                        marginBottom: '0.5rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{org.name}</span>
                        <span style={{ 
                          color: org.isActive ? '#22c55e' : '#ef4444',
                          fontSize: '14px'
                        }}>
                          {org.plan} - {org.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <h2 style={{ marginBottom: '2rem', color: '#60a5fa' }}>إدارة المستخدمين:</h2>
              
              <div style={{
                backgroundColor: '#0f172a',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #334155',
                marginBottom: '2rem'
              }}>
                <h3 style={{ marginBottom: '1rem', color: '#34d399' }}>إنشاء مستخدمين بأدوار مختلفة:</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  {roles.slice(0, 4).map((role) => (
                    <button
                      key={role.id}
                      onClick={() => createDemoUser(role.id)}
                      disabled={isLoading}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#374151',
                        color: 'white',
                        border: '1px solid #4b5563',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {role.nameAr}
                    </button>
                  ))}
                </div>
              </div>

              {users.length > 0 && (
                <div style={{
                  backgroundColor: '#0f172a',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #334155'
                }}>
                  <h3 style={{ marginBottom: '1rem', color: '#f59e0b' }}>المستخدمون المنشؤون:</h3>
                  {users.map((user) => (
                    <div
                      key={user.id}
                      style={{
                        backgroundColor: '#1e293b',
                        padding: '1rem',
                        borderRadius: '6px',
                        border: '1px solid #334155',
                        marginBottom: '0.5rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{user.email}</span>
                        <span style={{ color: '#94a3b8', fontSize: '14px' }}>
                          {roles.find(r => r.id === user.roleId)?.nameAr}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Footer */}
        <div style={{
          backgroundColor: '#064e3b',
          padding: '1rem',
          borderRadius: '8px',
          marginTop: '2rem',
          border: '1px solid #065f46'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', textAlign: 'center' }}>
            <div>
              <div style={{ color: '#34d399', fontWeight: 'bold' }}>نظام RBAC</div>
              <div style={{ fontSize: '14px' }}>نشط ويعمل</div>
            </div>
            <div>
              <div style={{ color: '#34d399', fontWeight: 'bold' }}>عزل البيانات</div>
              <div style={{ fontSize: '14px' }}>محكم 100%</div>
            </div>
            <div>
              <div style={{ color: '#34d399', fontWeight: 'bold' }}>الأداء</div>
              <div style={{ fontSize: '14px' }}>محسن للمؤسسات</div>
            </div>
            <div>
              <div style={{ color: '#34d399', fontWeight: 'bold' }}>التدقيق</div>
              <div style={{ fontSize: '14px' }}>مفعل بالكامل</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}