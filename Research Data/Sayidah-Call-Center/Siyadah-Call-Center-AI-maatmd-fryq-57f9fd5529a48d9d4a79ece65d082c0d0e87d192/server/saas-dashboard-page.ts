import { Request, Response } from 'express';

export function serveSaaSDashboardPage(req: Request, res: Response) {
  const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Siyadah AI - Enterprise Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f7fa;
            line-height: 1.6;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.8rem;
            font-weight: bold;
        }
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .logout-btn {
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .logout-btn:hover {
            background: rgba(255,255,255,0.3);
        }
        
        .container {
            max-width: 1200px;
            margin: 30px auto;
            padding: 0 20px;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            transition: transform 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-2px);
        }
        
        .card-title {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 15px;
            color: #333;
        }
        
        .stat-card {
            text-align: center;
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: #666;
            font-size: 0.9rem;
        }
        
        .progress-bar {
            background: #f0f0f0;
            border-radius: 10px;
            height: 8px;
            overflow: hidden;
            margin: 10px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 10px;
            transition: width 0.5s ease;
        }
        
        .usage-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .usage-label {
            font-weight: 500;
            color: #333;
        }
        
        .usage-value {
            color: #667eea;
            font-weight: 600;
        }
        
        .plan-badge {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
            margin-top: 15px;
        }
        
        .feature-item {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 8px;
            text-align: center;
            font-size: 0.9rem;
            color: #555;
        }
        
        .feature-item.active {
            background: #e8f2ff;
            color: #667eea;
            border: 1px solid #667eea;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        
        .spinner {
            display: inline-block;
            width: 30px;
            height: 30px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 15px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .error-message {
            background: #fee;
            border: 1px solid #fcc;
            color: #c33;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: center;
        }
        
        .subscription-status {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #4caf50;
        }
        
        .status-indicator.expired {
            background: #f44336;
        }
        
        .days-remaining {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 0.9rem;
            margin-top: 10px;
        }
        
        .quick-actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 30px;
        }
        
        .action-btn {
            background: white;
            border: 2px solid #667eea;
            color: #667eea;
            padding: 15px 20px;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
            font-weight: 600;
        }
        
        .action-btn:hover {
            background: #667eea;
            color: white;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-content">
            <div class="logo">سيادة AI - لوحة التحكم</div>
            <div class="user-info">
                <span id="userName">المستخدم</span>
                <span id="organizationName">المؤسسة</span>
                <button class="logout-btn" onclick="logout()">تسجيل الخروج</button>
            </div>
        </div>
    </div>

    <div class="container">
        <div id="loading" class="loading">
            <div class="spinner"></div>
            <div>جاري تحميل البيانات...</div>
        </div>

        <div id="error" class="error-message" style="display: none;"></div>

        <div id="dashboard" style="display: none;">
            <div class="dashboard-grid">
                <!-- Subscription Info -->
                <div class="card">
                    <div class="card-title">معلومات الاشتراك</div>
                    <div class="plan-badge" id="planBadge">المحترف</div>
                    <div class="subscription-status">
                        <div class="status-indicator" id="statusIndicator"></div>
                        <span id="subscriptionStatus">نشط</span>
                    </div>
                    <div class="days-remaining" id="daysRemaining">
                        16 يوم متبقي في الاشتراك
                    </div>
                </div>

                <!-- Usage Statistics -->
                <div class="card">
                    <div class="card-title">إحصائيات الاستخدام</div>
                    <div class="usage-item">
                        <span class="usage-label">المستخدمون</span>
                        <span class="usage-value" id="usersCount">15 / 50</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="usersProgress"></div>
                    </div>
                    
                    <div class="usage-item">
                        <span class="usage-label">استدعاءات API</span>
                        <span class="usage-value" id="apiCallsCount">8,543 / 100,000</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="apiProgress"></div>
                    </div>
                    
                    <div class="usage-item">
                        <span class="usage-label">التخزين (GB)</span>
                        <span class="usage-value" id="storageCount">2.3 / 100</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="storageProgress"></div>
                    </div>
                </div>

                <!-- Analytics -->
                <div class="card stat-card">
                    <div class="card-title">إحصائيات اليوم</div>
                    <div class="stat-number" id="todayApiCalls">854</div>
                    <div class="stat-label">استدعاءات API اليوم</div>
                </div>

                <div class="card stat-card">
                    <div class="card-title">الإيرادات الشهرية</div>
                    <div class="stat-number" id="monthlyRevenue">899</div>
                    <div class="stat-label">ريال سعودي</div>
                </div>
            </div>

            <!-- Features -->
            <div class="card">
                <div class="card-title">الميزات المتاحة</div>
                <div class="features-grid" id="featuresGrid">
                    <!-- Features will be populated by JavaScript -->
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions">
                <div class="action-btn" onclick="openChat()">فتح الدردشة الذكية</div>
                <div class="action-btn" onclick="viewReports()">عرض التقارير</div>
                <div class="action-btn" onclick="manageTeam()">إدارة الفريق</div>
                <div class="action-btn" onclick="upgradeSubscription()">ترقية الاشتراك</div>
            </div>
        </div>
    </div>

    <script>
        let currentUser = null;
        let currentOrganization = null;

        // Feature translations
        const featureNames = {
            'basic_chat': 'الدردشة الأساسية',
            'advanced_chat': 'الدردشة المتقدمة',
            'basic_reports': 'التقارير الأساسية',
            'advanced_reports': 'التقارير المتقدمة',
            'whatsapp_integration': 'تكامل واتساب',
            'voice_calls': 'المكالمات الصوتية',
            'ai_agents': 'الوكلاء الذكيون',
            'workflow_automation': 'أتمتة سير العمل',
            'all_features': 'جميع الميزات',
            'priority_support': 'الدعم المميز',
            'custom_integrations': 'التكاملات المخصصة',
            'dedicated_success_manager': 'مدير نجاح مخصص'
        };

        async function loadDashboard() {
            try {
                const token = localStorage.getItem('saas_token');
                if (!token) {
                    window.location.href = '/saas-login';
                    return;
                }

                // Load user info from localStorage
                currentUser = JSON.parse(localStorage.getItem('saas_user') || '{}');
                currentOrganization = JSON.parse(localStorage.getItem('saas_organization') || '{}');

                // Update header
                document.getElementById('userName').textContent = currentUser.firstName + ' ' + currentUser.lastName;
                document.getElementById('organizationName').textContent = currentOrganization.name;

                // Fetch analytics data
                const response = await fetch('/api/enterprise-saas/analytics', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });

                if (!response.ok) {
                    throw new Error('فشل في تحميل البيانات');
                }

                const result = await response.json();
                
                if (result.success) {
                    updateDashboard(result.data);
                } else {
                    throw new Error(result.message || 'خطأ في تحميل البيانات');
                }

            } catch (error) {
                console.error('Dashboard error:', error);
                showError('خطأ في تحميل لوحة التحكم: ' + error.message);
            }
        }

        function updateDashboard(data) {
            const { subscription, usage, features, stats } = data;

            // Update subscription info
            document.getElementById('planBadge').textContent = subscription.planName;
            document.getElementById('subscriptionStatus').textContent = 
                subscription.status === 'active' ? 'نشط' : 'منتهي';
            document.getElementById('statusIndicator').className = 
                'status-indicator' + (subscription.status === 'active' ? '' : ' expired');
            document.getElementById('daysRemaining').textContent = 
                subscription.daysRemaining + ' يوم متبقي في الاشتراك';

            // Update usage statistics
            const limits = subscription.limits;
            
            // Users
            const usersLimit = limits.users === -1 ? 'غير محدود' : limits.users;
            document.getElementById('usersCount').textContent = usage.users + ' / ' + usersLimit;
            document.getElementById('usersProgress').style.width = 
                (limits.users === -1 ? 0 : usage.usagePercentage.users) + '%';

            // API Calls
            const apiLimit = limits.apiCalls === -1 ? 'غير محدود' : limits.apiCalls.toLocaleString();
            document.getElementById('apiCallsCount').textContent = 
                usage.apiCalls.toLocaleString() + ' / ' + apiLimit;
            document.getElementById('apiProgress').style.width = 
                (limits.apiCalls === -1 ? 0 : usage.usagePercentage.apiCalls) + '%';

            // Storage
            const storageLimit = limits.storage === -1 ? 'غير محدود' : limits.storage;
            document.getElementById('storageCount').textContent = usage.storage + ' / ' + storageLimit;
            document.getElementById('storageProgress').style.width = 
                (limits.storage === -1 ? 0 : usage.usagePercentage.storage) + '%';

            // Statistics
            document.getElementById('todayApiCalls').textContent = stats.apiCallsToday.toLocaleString();
            document.getElementById('monthlyRevenue').textContent = stats.totalRevenue.toLocaleString();

            // Features
            const featuresGrid = document.getElementById('featuresGrid');
            featuresGrid.innerHTML = '';
            features.forEach(feature => {
                const featureDiv = document.createElement('div');
                featureDiv.className = 'feature-item active';
                featureDiv.textContent = featureNames[feature] || feature;
                featuresGrid.appendChild(featureDiv);
            });

            // Show dashboard
            document.getElementById('loading').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
        }

        function showError(message) {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error').textContent = message;
            document.getElementById('error').style.display = 'block';
        }

        function logout() {
            localStorage.removeItem('saas_token');
            localStorage.removeItem('saas_user');
            localStorage.removeItem('saas_organization');
            window.location.href = '/saas-login';
        }

        // Quick action functions
        function openChat() {
            window.location.href = '/dashboard';
        }

        function viewReports() {
            alert('صفحة التقارير قيد التطوير');
        }

        function manageTeam() {
            alert('صفحة إدارة الفريق قيد التطوير');
        }

        function upgradeSubscription() {
            alert('صفحة ترقية الاشتراك قيد التطوير');
        }

        // Load dashboard on page load
        document.addEventListener('DOMContentLoaded', loadDashboard);
    </script>
</body>
</html>
`;

  res.send(html);
}