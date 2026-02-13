import { useLocation, Link } from "wouter";
import { AppIcon } from "@/components/AppIcon";

const Sidebar = () => {
  const [location] = useLocation();

  const navigationItems = [
    { id: "dashboard", label: "لوحة التحكم", icon: "Home", path: "/" },
    { id: "ai-team", label: "الفريق الذكي", icon: "Users", path: "/ai-team" },
    { id: "data-upload", label: "رفع البيانات", icon: "Database", path: "/data/upload" },
    { id: "workflow", label: "سير العمل", icon: "Workflow", path: "/workflow" },
    { id: "sales", label: "خط المبيعات", icon: "TrendingUp", path: "/sales" },
    { id: "support", label: "خدمة العملاء", icon: "Headphones", path: "/customer-service" },
    { id: "email", label: "إدارة البريد", icon: "Mail", path: "/email" },
    { id: "ai-assistant", label: "المساعد الذكي", icon: "Bot", path: "/ai-assistant" },
    { id: "quick-actions", label: "الإجراءات السريعة", icon: "Zap", path: "/quick-actions" },
    { id: "notifications", label: "الإشعارات", icon: "Bell", path: "/notifications" },
    { id: "user-management", label: "إدارة المستخدمين", icon: "Users", path: "/user-management" },
    { id: "reports", label: "التقارير", icon: "FileBarChart", path: "/reports" },
    { id: "system-status", label: "حالة النظام", icon: "Activity", path: "/system-status" },
    { id: "settings", label: "الإعدادات", icon: "Settings", path: "/settings" }
  ];

  const aiTeamMembers = [
    {
      id: 1,
      name: "سارة المبيعات",
      status: "نشطة",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b96c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&h=48",
      borderColor: "border-accent/30",
      statusColor: "text-success"
    },
    {
      id: 2,
      name: "أحمد التطوير",
      status: "يعمل",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&h=48",
      borderColor: "border-primary/30",
      statusColor: "text-warning"
    },
    {
      id: 3,
      name: "فاطمة الدعم",
      status: "متاحة",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&h=48",
      borderColor: "border-secondary/30",
      statusColor: "text-secondary"
    }
  ];

  return (
    <aside className="fixed right-0 top-0 h-screen w-72 glass-dark border-l border-white/10 z-40 overflow-y-auto custom-scrollbar">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-accent to-primary rounded-xl">
            <AppIcon name="BrainCircuit" className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">منصة الأتمتة الذكية</h1>
            <p className="text-xs text-text-muted">إدارة الأعمال بالذكاء الاصطناعي</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2 h-full overflow-y-auto custom-scrollbar">
        {/* Navigation Items */}
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Link key={item.id} href={item.path}>
              <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer ${
                location === item.path 
                  ? "bg-accent/20 border border-accent/30 text-accent" 
                  : "hover:bg-white/5 text-text-secondary hover:text-text-primary"
              }`}>
                <AppIcon name={item.icon} className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* AI Team Section */}
        <div className="pt-6 border-t border-white/10 mt-6">
          <h3 className="text-sm font-semibold text-text-secondary mb-3 px-4">الفريق الذكي النشط</h3>
          <div className="space-y-2">
            {aiTeamMembers.map((member) => (
              <div key={member.id} className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-300">
                <img 
                  src={member.avatar} 
                  alt={member.name} 
                  className={`w-8 h-8 rounded-full border-2 ${member.borderColor}`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{member.name}</p>
                  <p className={`text-xs ${member.statusColor}`}>{member.status}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  member.statusColor === "text-success" ? "bg-success animate-pulse" :
                  member.statusColor === "text-warning" ? "bg-warning animate-pulse" :
                  "bg-text-muted"
                }`}></div>
              </div>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;