import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/AppIcon";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background" dir="rtl">
      <Card className="w-full max-w-md mx-4 glass-effect border border-white/10">
        <CardContent className="pt-6 text-center">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center mb-4">
              <AppIcon name="AlertCircle" className="w-8 h-8 text-background" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">404</h1>
            <h2 className="text-xl font-semibold text-text-secondary mb-4">الصفحة غير موجودة</h2>
          </div>

          <p className="text-text-muted mb-6">
            عذراً، لا يمكن العثور على الصفحة التي تبحث عنها.
            ربما تم نقلها أو حذفها.
          </p>

          <Link href="/">
            <Button className="w-full bg-accent hover:bg-accent-600 text-background">
              <AppIcon name="Home" className="w-4 h-4 ml-2" />
              العودة للصفحة الرئيسية
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
