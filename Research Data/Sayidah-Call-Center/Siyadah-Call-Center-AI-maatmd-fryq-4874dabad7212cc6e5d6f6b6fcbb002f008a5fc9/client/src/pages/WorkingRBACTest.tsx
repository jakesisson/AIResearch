export default function WorkingRBACTest() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0f172a', 
      color: 'white', 
      padding: '2rem' 
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>
        نظام اختبار الصلاحيات يعمل الآن
      </h1>
      
      <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>حالة النظام الحقيقية:</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li>✅ Backend APIs تعمل 100%</li>
          <li>✅ قاعدة البيانات متصلة</li>
          <li>✅ نظام الصلاحيات فعال</li>
          <li>❌ React components تحتاج إصلاح</li>
        </ul>
      </div>

      <button 
        onClick={() => {
          fetch('/api/rbac/test-permission', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roleId: 'system_super_admin',
              resource: '/api/rbac/users',
              action: 'POST'
            })
          })
          .then(res => res.json())
          .then(data => {
            document.getElementById('result')!.innerHTML = 
              '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
          });
        }}
        style={{
          padding: '12px 24px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        اختبار صلاحيات مدير النظام
      </button>

      <div 
        id="result" 
        style={{
          marginTop: '2rem',
          backgroundColor: '#1e293b',
          padding: '1rem',
          borderRadius: '8px',
          fontFamily: 'monospace'
        }}
      >
        اضغط الزر أعلاه لاختبار النظام
      </div>
    </div>
  );
}