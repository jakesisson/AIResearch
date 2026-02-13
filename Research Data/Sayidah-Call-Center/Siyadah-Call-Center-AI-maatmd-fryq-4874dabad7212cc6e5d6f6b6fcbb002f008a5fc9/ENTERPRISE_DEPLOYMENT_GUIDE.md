# دليل النشر المؤسسي - منصة سيادة AI

## نظرة عامة

هذا الدليل يوضح كيفية نشر منصة سيادة AI في بيئة مؤسسية بمستوى احترافي عالمي A+.

## 🚀 متطلبات ما قبل النشر

### البنية التحتية المطلوبة:
- **Kubernetes Cluster**: v1.24+ مع 3+ عقد
- **MongoDB Atlas**: M30+ أو equivalent 
- **Redis Cluster**: للتخزين المؤقت
- **Load Balancer**: مع SSL termination
- **CDN**: لتوزيع المحتوى الثابت
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack أو EFK

### شهادات الأمان:
- SSL/TLS certificates (Let's Encrypt أو CA)
- API keys للخدمات الخارجية
- Database credentials
- Container registry access

## 📦 النشر باستخدام Docker

### 1. بناء الحاوية
```bash
# إنشاء production build
npm run build

# بناء Docker image
docker build -t siyadah-ai:latest .

# تشغيل اختبارات الأمان
docker run --rm -v "$(pwd)":/app clair-scanner:latest siyadah-ai:latest

# رفع إلى Container Registry
docker tag siyadah-ai:latest registry.company.com/siyadah-ai:latest
docker push registry.company.com/siyadah-ai:latest
```

### 2. Docker Compose للبيئة المحلية
```bash
# تشغيل النظام كاملاً
docker-compose up -d

# فحص الحالة
docker-compose ps
docker-compose logs -f siyadah-ai

# توقيف النظام
docker-compose down
```

## ☸️ النشر على Kubernetes

### 1. إعداد Namespace
```bash
kubectl apply -f k8s/namespace.yaml
```

### 2. إنشاء Secrets
```bash
# إنشاء database secret
kubectl create secret generic siyadah-secrets \
  --from-literal=mongodb-uri="mongodb+srv://..." \
  --from-literal=jwt-secret="your-jwt-secret" \
  --from-literal=twilio-sid="your-twilio-sid" \
  --from-literal=twilio-token="your-twilio-token" \
  -n siyadah-ai

# إنشاء TLS secret
kubectl create secret tls siyadah-ai-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key \
  -n siyadah-ai
```

### 3. نشر التطبيق
```bash
# نشر جميع المكونات
kubectl apply -f k8s/

# فحص الحالة
kubectl get pods -n siyadah-ai
kubectl get services -n siyadah-ai
kubectl get ingress -n siyadah-ai

# فحص اللوجز
kubectl logs -f deployment/siyadah-ai-deployment -n siyadah-ai
```

### 4. تكوين Auto-scaling
```bash
# Horizontal Pod Autoscaler
kubectl autoscale deployment siyadah-ai-deployment \
  --cpu-percent=70 \
  --min=3 \
  --max=10 \
  -n siyadah-ai

# Vertical Pod Autoscaler (اختياري)
kubectl apply -f k8s/vpa.yaml
```

## 🔧 التكوين المتقدم

### 1. إعداد Ingress Controller
```yaml
# ingress-nginx configuration
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: siyadah-ai-ingress
  annotations:
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
```

### 2. تكوين MongoDB Atlas
```javascript
// إعدادات الاتصال المُحسنة
const mongoConfig = {
  uri: process.env.MONGODB_URI,
  options: {
    maxPoolSize: 50,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    w: 'majority'
  }
};
```

### 3. تكوين Redis للتخزين المؤقت
```yaml
# Redis cluster configuration
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis-cluster
spec:
  serviceName: redis-cluster
  replicas: 6
  template:
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        command:
        - redis-server
        - /etc/redis/redis.conf
        ports:
        - containerPort: 6379
        volumeMounts:
        - name: data
          mountPath: /data
        - name: config
          mountPath: /etc/redis
```

## 📊 المراقبة والتشخيص

### 1. Prometheus Metrics
```yaml
# ServiceMonitor for Prometheus
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: siyadah-ai-metrics
spec:
  selector:
    matchLabels:
      app: siyadah-ai
  endpoints:
  - port: metrics
    path: /api/metrics
    interval: 30s
```

### 2. Grafana Dashboard
```json
{
  "dashboard": {
    "title": "Siyadah AI Monitoring",
    "panels": [
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "avg(http_request_duration_seconds)",
            "legendFormat": "Average Response Time"
          }
        ]
      },
      {
        "title": "Request Rate", 
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "Requests per second"
          }
        ]
      }
    ]
  }
}
```

### 3. ELK Stack للوجز
```yaml
# Filebeat configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: filebeat-config
data:
  filebeat.yml: |
    filebeat.inputs:
    - type: container
      paths:
        - /var/log/containers/*siyadah-ai*.log
    output.elasticsearch:
      hosts: ["elasticsearch:9200"]
    setup.kibana:
      host: "kibana:5601"
```

## 🔒 الأمان في الإنتاج

### 1. Network Policies
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: siyadah-ai-network-policy
spec:
  podSelector:
    matchLabels:
      app: siyadah-ai
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: nginx-ingress
    ports:
    - protocol: TCP
      port: 5000
```

### 2. Pod Security Standards
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: siyadah-ai
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1001
    fsGroup: 1001
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: siyadah-ai
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
```

### 3. RBAC Configuration
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: siyadah-ai-role
rules:
- apiGroups: [""]
  resources: ["pods", "configmaps", "secrets"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: siyadah-ai-rolebinding
subjects:
- kind: ServiceAccount
  name: siyadah-ai-service-account
roleRef:
  kind: Role
  name: siyadah-ai-role
  apiGroup: rbac.authorization.k8s.io
```

## 🔄 CI/CD Pipeline

### 1. GitHub Actions Workflow
```yaml
name: Production Deployment

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'v1.24.0'
    
    - name: Deploy to Kubernetes
      run: |
        echo "${{ secrets.KUBECONFIG }}" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
        kubectl set image deployment/siyadah-ai-deployment \
          siyadah-ai=registry.company.com/siyadah-ai:${{ github.ref_name }} \
          -n siyadah-ai
        kubectl rollout status deployment/siyadah-ai-deployment -n siyadah-ai
```

### 2. Blue-Green Deployment
```bash
#!/bin/bash
# Blue-Green deployment script

NEW_VERSION=$1
NAMESPACE="siyadah-ai"

# Deploy green version
kubectl set image deployment/siyadah-ai-green \
  siyadah-ai=registry.company.com/siyadah-ai:$NEW_VERSION \
  -n $NAMESPACE

# Wait for rollout
kubectl rollout status deployment/siyadah-ai-green -n $NAMESPACE

# Run health checks
kubectl run health-check --image=curlimages/curl --rm -it --restart=Never \
  -- curl -f http://siyadah-ai-green-service:5000/api/health

# Switch traffic
kubectl patch service siyadah-ai-service \
  -p '{"spec":{"selector":{"version":"green"}}}' \
  -n $NAMESPACE

# Cleanup old version
kubectl delete deployment siyadah-ai-blue -n $NAMESPACE
```

## 📈 تحسين الأداء

### 1. Database Optimization
```javascript
// إنشاء فهارس محسنة
db.opportunities.createIndex({ "stage": 1, "createdAt": -1 });
db.ai_agents.createIndex({ "status": 1, "performance": -1 });
db.users.createIndex({ "email": 1 }, { unique: true });
db.activities.createIndex({ "createdAt": -1 }, { expireAfterSeconds: 2592000 });

// Aggregation pipeline optimization
const pipeline = [
  { $match: { status: "active" } },
  { $project: { name: 1, performance: 1 } },
  { $sort: { performance: -1 } },
  { $limit: 100 }
];
```

### 2. Caching Strategy
```javascript
// Redis caching configuration
const cacheConfig = {
  stdTTL: 600, // 10 minutes default
  checkperiod: 120, // cleanup interval
  useClones: false,
  deleteOnExpire: true
};

// Cache key patterns
const cacheKeys = {
  user: (id) => `user:${id}`,
  agents: () => `agents:list`,
  opportunities: (filter) => `opportunities:${JSON.stringify(filter)}`
};
```

### 3. Load Balancing
```yaml
# HAProxy configuration
global
  daemon
  maxconn 4096

defaults
  mode http
  timeout connect 5000ms
  timeout client 50000ms
  timeout server 50000ms

frontend siyadah_frontend
  bind *:80
  bind *:443 ssl crt /etc/ssl/certs/siyadah.pem
  redirect scheme https unless { ssl_fc }
  default_backend siyadah_backend

backend siyadah_backend
  balance roundrobin
  option httpchk GET /api/health
  server app1 10.0.1.10:5000 check
  server app2 10.0.1.11:5000 check
  server app3 10.0.1.12:5000 check
```

## 🚨 إدارة الحوادث

### 1. Alerting Rules
```yaml
# Prometheus alerting rules
groups:
- name: siyadah-ai-alerts
  rules:
  - alert: HighResponseTime
    expr: avg(http_request_duration_seconds) > 1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected"
      
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
```

### 2. Runbook للحوادث
```markdown
## حادث: ارتفاع زمن الاستجابة

### التشخيص السريع:
1. فحص CPU وMemory usage
2. فحص اتصال قاعدة البيانات
3. فحص Redis connectivity
4. مراجعة recent deployments

### الإجراءات العلاجية:
1. تشغيل auto-scaling إضافي
2. إعادة تشغيل البودز المتأثرة
3. تنظيف الكاش
4. Failover إلى datacenter بديل

### المتابعة:
1. مراقبة التحسن لمدة 30 دقيقة
2. تحليل الجذر السببي
3. تحديث الوثائق
```

## 🔐 النسخ الاحتياطي والاسترجاع

### 1. استراتيجية النسخ الاحتياطي
```bash
#!/bin/bash
# نسخ احتياطية تلقائية

# MongoDB backup
mongodump --uri="$MONGODB_URI" --out="/backups/$(date +%Y%m%d_%H%M%S)"

# Kubernetes resources backup
kubectl get all -n siyadah-ai -o yaml > "/backups/k8s-resources-$(date +%Y%m%d).yaml"

# Upload to cloud storage
aws s3 sync /backups/ s3://siyadah-backups/
```

### 2. خطة الاسترجاع من الكوارث
```yaml
# Disaster Recovery Plan
Recovery Time Objective (RTO): 4 hours
Recovery Point Objective (RPO): 1 hour

Backup Locations:
- Primary: AWS S3 (us-east-1)
- Secondary: Azure Blob (eastus)
- Tertiary: On-premises NAS

Failover Procedure:
1. Activate secondary datacenter
2. Restore latest backup
3. Update DNS records
4. Validate all services
5. Notify stakeholders
```

## ✅ قائمة مراجعة النشر

### قبل النشر:
- [ ] اختبار جميع APIs
- [ ] مراجعة Security scan
- [ ] تحقق من Performance benchmarks
- [ ] مراجعة Database migrations
- [ ] اختبار Load balancing
- [ ] تحقق من SSL certificates
- [ ] مراجعة Backup procedures

### أثناء النشر:
- [ ] مراقبة System metrics
- [ ] فحص Application logs
- [ ] تحقق من Database connectivity
- [ ] اختبار Critical user journeys
- [ ] مراقبة Error rates
- [ ] تحقق من External integrations

### بعد النشر:
- [ ] مراقبة لمدة 24 ساعة
- [ ] تحليل Performance trends
- [ ] مراجعة User feedback
- [ ] تحديث Documentation
- [ ] إنشاء Post-deployment report

## 📞 جهات الاتصال للدعم

### فريق DevOps:
- Primary: devops@company.com
- Secondary: +966-xxx-xxxx

### فريق الأمان:
- Security: security@company.com
- Emergency: +966-xxx-xxxx

### إدارة قاعدة البيانات:
- DBA Team: dba@company.com
- MongoDB Atlas Support: support.mongodb.com

---

**ملاحظة**: هذا الدليل يفترض بيئة مؤسسية متقدمة. تأكد من تخصيص الإعدادات حسب بيئتك المحددة.