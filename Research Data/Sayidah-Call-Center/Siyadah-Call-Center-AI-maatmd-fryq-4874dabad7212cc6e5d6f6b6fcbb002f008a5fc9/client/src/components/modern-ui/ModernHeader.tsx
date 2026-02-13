import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  ChevronDown,
  Moon,
  Sun,
  Globe,
  LogOut,
  UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export default function ModernHeader() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [isDark, setIsDark] = useState(true);

  return (
    <header className="min-h-16 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 flex items-center justify-between px-6 relative z-50">
      {/* Search Section */}
      <div className="flex-1 max-w-2xl">
        <div className={`relative transition-all duration-200 ${searchFocused ? 'scale-105' : ''}`}>
          <Search 
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300"
            aria-label="أيقونة البحث"
          />
          <input
            type="text"
            placeholder="اكتب رسالتك أو أمرك هنا..."
            aria-label="حقل البحث والأوامر"
            className="w-full min-h-12 bg-slate-800/50 border border-slate-600/50 rounded-xl pr-12 pl-4 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400/50 focus:bg-slate-800/70 transition-all duration-200"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            اضغط Shift+Enter للإرسال
          </div>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4 space-x-reverse mr-6">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDark(!isDark)}
          aria-label={isDark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
          className="min-w-11 min-h-11 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white border border-slate-600/30 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
        >
          {isDark ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
        </Button>

        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="sm"
          aria-label="تغيير اللغة"
          className="min-w-11 min-h-11 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white border border-slate-600/30 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
        >
          <Globe className="w-5 h-5" aria-hidden="true" />
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            aria-label="الإشعارات - 3 إشعارات جديدة"
            className="min-w-11 min-h-11 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white border border-slate-600/30 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
          >
            <Bell className="w-5 h-5" aria-hidden="true" />
          </Button>
          <Badge 
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center border-2 border-slate-900"
            aria-label="3 إشعارات جديدة"
          >
            3
          </Badge>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 space-x-reverse h-10 px-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-white">المساعد الذكي</div>
                <div className="text-xs text-slate-400">متصل ومتاح للمساعدة</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56 bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 text-white"
          >
            <DropdownMenuItem className="focus:bg-slate-700/50">
              <UserCircle className="w-4 h-4 ml-2" />
              الملف الشخصي
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-slate-700/50">
              <Settings className="w-4 h-4 ml-2" />
              إعدادات الحساب
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-600/50" />
            <DropdownMenuItem className="focus:bg-slate-700/50 text-red-400">
              <LogOut className="w-4 h-4 ml-2" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}