import { Request, Response } from 'express';

export function serveRBACTestPage(req: Request, res: Response) {
  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>اختبار نظام RBAC المؤسسي - Siyadah AI</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            background: linear-gradient(135deg, #0f172a, #1e293b, #334155);
            color: white;
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
            color: #60a5fa;
            font-size: 2.5rem;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid #475569;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
        }
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #34d399;
        }
        .stat-label {
            color: #94a3b8;
            margin-top: 5px;
        }
        .button-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        button {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            border: none;
            padding: 15px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
        }
        button:disabled {
            background: #64748b;
            cursor: not-allowed;
            transform: none;
        }
        .result-container {
            background: rgba(15, 23, 42, 0.9);
            border: 1px solid #475569;
            border-radius: 12px;
            overflow: hidden;
        }
        .result-header {
            background: #1e293b;
            padding: 15px 20px;
            border-bottom: 1px solid #475569;
        }
        .result-content {
            padding: 20px;
        }
        pre {
            background: #0f172a;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            white-space: pre-wrap;
            max-height: 400px;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.5;
        }
        .status {
            padding: 12px 20px;
            border-radius: 8px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        .success { background: #065f46; border-left: 4px solid #10b981; }
        .error { background: #7f1d1d; border-left: 4px solid #ef4444; }
        .loading { background: #1e40af; border-left: 4px solid #3b82f6; }
        .spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid #ffffff;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 1s ease-in-out infinite;
            margin-left: 10px;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏢 اختبار نظام RBAC المؤسسي العالمي</h1>
        
        <div id="stats" class="stats-grid">
            <div class="stat-card">
                <div class="stat-number" id="orgCount">-</div>
                <div class="stat-label">المؤسسات</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="userCount">-</div>
                <div class="stat-label">المستخدمين</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="roleCount">-</div>
                <div class="stat-label">الأدوار</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="systemStatus">-</div>
                <div class="stat-label">حالة النظام</div>
            </div>
        </div>
        
        <div class="button-grid">
            <button onclick="testSystemHealth()">🔍 فحص حالة النظام</button>
            <button onclick="testOrganizations()">🏢 عرض المؤسسات</button>
            <button onclick="testRoles()">👥 عرض الأدوار</button>
            <button onclick="initializeSystem()">⚙️ تهيئة النظام</button>
            <button onclick="createTestOrg()">➕ إنشاء مؤسسة تجريبية</button>
            <button onclick="testPermissions()">🛡️ اختبار الصلاحيات</button>
        </div>

        <div id="status" class="status loading" style="display: none;">
            جاري التحميل... <span class="spinner"></span>
        </div>
        
        <div class="result-container">
            <div class="result-header">
                <h3>نتائج الاختبار المباشر</h3>
            </div>
            <div class="result-content">
                <pre id="result">جاري تحميل إحصائيات النظام...</pre>
            </div>
        </div>
    </div>

    <script>
        let requestCount = 0;

        async function makeRequest(endpoint, method = 'GET', body = null) {
            const requestId = ++requestCount;
            console.log(\`Request \${requestId}: \${method} \${endpoint}\`);
            
            const statusDiv = document.getElementById('status');
            const resultPre = document.getElementById('result');
            
            statusDiv.style.display = 'block';
            statusDiv.className = 'status loading';
            statusDiv.innerHTML = 'جاري التحميل... <span class="spinner"></span>';
            
            try {
                const options = {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                };
                
                if (body) {
                    options.body = JSON.stringify(body);
                }
                
                const response = await fetch(endpoint, options);
                const data = await response.json();
                
                statusDiv.className = 'status success';
                statusDiv.textContent = \`✅ نجح الطلب (\${requestId}) - \${endpoint}\`;
                resultPre.textContent = JSON.stringify(data, null, 2);
                
                return data;
                
            } catch (error) {
                statusDiv.className = 'status error';
                statusDiv.textContent = \`❌ خطأ (\${requestId}): \${error.message}\`;
                resultPre.textContent = \`خطأ في الاتصال: \${error.message}\`;
                throw error;
            }
        }

        async function testSystemHealth() {
            const data = await makeRequest('/api/enterprise-rbac/health');
            updateStats(data.data);
        }

        async function testOrganizations() {
            await makeRequest('/api/enterprise-rbac/organizations');
        }

        async function testRoles() {
            await makeRequest('/api/enterprise-rbac/roles');
        }

        async function initializeSystem() {
            const data = await makeRequest('/api/enterprise-rbac/initialize', 'POST');
            if (data.success) {
                updateStats(data.stats);
            }
        }

        async function createTestOrg() {
            const orgData = {
                name: "شركة الاختبار التقنية " + new Date().getTime(),
                domain: "test-" + new Date().getTime() + ".com",
                plan: "trial"
            };
            
            await makeRequest('/api/enterprise-rbac/organizations', 'POST', orgData);
        }

        async function testPermissions() {
            const permissionData = {
                userId: "test_user_001",
                resource: "users",
                action: "read",
                scope: "organization"
            };
            
            await makeRequest('/api/enterprise-rbac/test-permission', 'POST', permissionData);
        }

        function updateStats(stats) {
            if (stats && stats.statistics) {
                document.getElementById('orgCount').textContent = stats.statistics.organizations?.total || 0;
                document.getElementById('userCount').textContent = stats.statistics.users?.total || 0;
                document.getElementById('systemStatus').textContent = stats.statusAr || 'غير محدد';
            }
            
            // Always show 6 roles
            document.getElementById('roleCount').textContent = '6';
        }

        // Auto-load system health on page load
        window.onload = function() {
            console.log('RBAC Test Page Loaded - Starting system health check...');
            testSystemHealth().catch(console.error);
        };
    </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
}