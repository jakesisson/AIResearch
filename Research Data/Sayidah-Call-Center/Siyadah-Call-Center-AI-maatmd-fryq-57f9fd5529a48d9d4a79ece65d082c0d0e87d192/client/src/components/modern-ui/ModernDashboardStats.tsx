import React from 'react';
import { BarChart3, Users, TrendingUp, DollarSign, Activity, Bot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  opportunities: {
    total: number;
    active: number;
    closed: number;
  };
  workflows: {
    total: number;
    active: number;
    success_rate: number;
  };
  tickets: {
    total: number;
    open: number;
    resolved: number;
  };
  team: {
    total: number;
    active: number;
    performance: number;
  };
}

interface ModernDashboardStatsProps {
  stats?: DashboardStats;
  isLoading: boolean;
}

export default function ModernDashboardStats({ stats, isLoading }: ModernDashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-slate-800/50 border-slate-700/50 animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-slate-700 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-700 rounded w-16 mb-2"></div>
              <div className="h-3 bg-slate-700 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const defaultStats = {
    opportunities: { total: 3, active: 2, closed: 1 },
    workflows: { total: 3, active: 3, success_rate: 91.7 },
    tickets: { total: 8, open: 2, resolved: 6 },
    team: { total: 3, active: 3, performance: 91.7 }
  };

  const data = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* الفرص التجارية */}
      <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/30 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-300 flex items-center text-lg">
            <TrendingUp className="w-5 h-5 ml-2" />
            الفرص التجارية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-2">{data.opportunities.total}</div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
              {data.opportunities.active} نشط
            </Badge>
            <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30 text-xs">
              {data.opportunities.closed} مكتمل
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* سير العمل */}
      <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/30 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-purple-300 flex items-center text-lg">
            <Activity className="w-5 h-5 ml-2" />
            سير العمل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-2">{data.workflows.total}</div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
              {data.workflows.success_rate}% نجاح
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* التذاكر */}
      <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-orange-500/30 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-orange-300 flex items-center text-lg">
            <Users className="w-5 h-5 ml-2" />
            تذاكر الدعم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-2">{data.tickets.total}</div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
              {data.tickets.open} مفتوح
            </Badge>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
              {data.tickets.resolved} محلول
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* فريق AI */}
      <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-500/30 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-green-300 flex items-center text-lg">
            <Bot className="w-5 h-5 ml-2" />
            فريق AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-2">{data.team.total}</div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
              {data.team.performance}% أداء
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}