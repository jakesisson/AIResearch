import { Request, Response } from 'express';

export function serveSaaSLoginPage(req: Request, res: Response) {
  const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Siyadah AI - Enterprise SaaS Login</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .login-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 40px;
            width: 100%;
            max-width: 450px;
            text-align: center;
        }
        
        .logo {
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 1.1rem;
        }
        
        .form-group {
            margin-bottom: 20px;
            text-align: right;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 600;
        }
        
        input {
            width: 100%;
            padding: 15px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: #f8f9fa;
        }
        
        input:focus {
            outline: none;
            border-color: #667eea;
            background: white;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .login-btn {
            width: 100%;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 15px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 20px;
        }
        
        .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .login-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .demo-accounts {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin-top: 30px;
            text-align: right;
        }
        
        .demo-title {
            font-weight: 600;
            color: #333;
            margin-bottom: 15px;
        }
        
        .demo-account {
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            border-right: 4px solid #667eea;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .demo-account:hover {
            transform: translateX(-3px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .demo-account strong {
            color: #667eea;
            display: block;
            margin-bottom: 5px;
        }
        
        .demo-account small {
            color: #666;
        }
        
        .error-message {
            background: #fee;
            color: #c33;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            display: none;
        }
        
        .success-message {
            background: #efe;
            color: #3c3;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            display: none;
        }
        
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #ffffff;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .plan-badge {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            margin-right: 8px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <h1 class="logo">سيادة AI</h1>
        <p class="subtitle">منصة الذكاء الاصطناعي للأعمال</p>
        
        <div id="errorMessage" class="error-message"></div>
        <div id="successMessage" class="success-message"></div>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="email">البريد الإلكتروني</label>
                <input type="email" id="email" name="email" required placeholder="admin@demo.siyadah.ai">
            </div>
            
            <div class="form-group">
                <label for="password">كلمة المرور</label>
                <input type="password" id="password" name="password" required placeholder="demo123456">
            </div>
            
            <button type="submit" class="login-btn" id="loginBtn">
                تسجيل الدخول
            </button>
        </form>
        
        <div class="demo-accounts">
            <div class="demo-title">حسابات تجريبية متاحة:</div>
            
            <div class="demo-account" onclick="fillDemo('admin@demo.siyadah.ai', 'demo123456')">
                <strong><span class="plan-badge">محترف</span>شركة سيادة التقنية</strong>
                <small>admin@demo.siyadah.ai • خطة محترف • 50 مستخدم</small>
            </div>
            
            <div class="demo-account" onclick="fillDemo('admin@startup.tech', 'demo123456')">
                <strong><span class="plan-badge">مبتدئ</span>شركة التقنية الناشئة</strong>
                <small>admin@startup.tech • خطة مبتدئ • 10 مستخدمين</small>
            </div>
            
            <div class="demo-account" onclick="fillDemo('admin@enterprise.corp', 'demo123456')">
                <strong><span class="plan-badge">مؤسسي</span>المؤسسة التجارية الكبرى</strong>
                <small>admin@enterprise.corp • خطة مؤسسية • غير محدود</small>
            </div>
        </div>
    </div>

    <script>
        const loginForm = document.getElementById('loginForm');
        const loginBtn = document.getElementById('loginBtn');
        const errorMessage = document.getElementById('errorMessage');
        const successMessage = document.getElementById('successMessage');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        function fillDemo(email, password) {
            emailInput.value = email;
            passwordInput.value = password;
            hideMessages();
        }
        
        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            successMessage.style.display = 'none';
        }
        
        function showSuccess(message) {
            successMessage.textContent = message;
            successMessage.style.display = 'block';
            errorMessage.style.display = 'none';
        }
        
        function hideMessages() {
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';
        }
        
        function setLoading(loading) {
            loginBtn.disabled = loading;
            if (loading) {
                loginBtn.innerHTML = '<span class="loading"></span> جاري تسجيل الدخول...';
            } else {
                loginBtn.innerHTML = 'تسجيل الدخول';
            }
        }
        
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideMessages();
            setLoading(true);
            
            const formData = new FormData(loginForm);
            const loginData = {
                email: formData.get('email'),
                password: formData.get('password')
            };
            
            try {
                const response = await fetch('/api/enterprise-saas/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loginData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showSuccess('تم تسجيل الدخول بنجاح! جاري التوجيه...');
                    
                    // Store authentication data
                    localStorage.setItem('saas_token', result.data.token);
                    localStorage.setItem('saas_user', JSON.stringify(result.data.user));
                    localStorage.setItem('saas_organization', JSON.stringify(result.data.organization));
                    
                    // Redirect to dashboard
                    setTimeout(() => {
                        window.location.href = '/saas-dashboard';
                    }, 1500);
                    
                } else {
                    showError(result.message || 'خطأ في تسجيل الدخول');
                }
                
            } catch (error) {
                console.error('Login error:', error);
                showError('خطأ في الاتصال بالخادم');
            } finally {
                setLoading(false);
            }
        });
        
        // Check if already logged in
        const token = localStorage.getItem('saas_token');
        if (token) {
            // Verify token and redirect if valid
            fetch('/api/enterprise-saas/analytics', {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            }).then(response => {
                if (response.ok) {
                    window.location.href = '/saas-dashboard';
                }
            });
        }
    </script>
</body>
</html>
`;

  res.send(html);
}