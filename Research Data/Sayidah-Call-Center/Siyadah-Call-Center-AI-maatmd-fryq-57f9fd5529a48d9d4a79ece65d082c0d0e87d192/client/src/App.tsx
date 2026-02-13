import './index.css';
import * as React from 'react';
import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';
import Layout from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Import Pages
import EnterpriseLanding from '@/pages/landing';
import LoginPage from '@/pages/auth/login';
import RegisterPage from '@/pages/auth/register';
import SystemTesting from '@/pages/auth/system-testing';
import EnhancedDashboard from '@/pages/EnhancedDashboard';
import IntelligentChatInterface from '@/pages/IntelligentChatInterface';
import EnhancedSettings from '@/pages/EnhancedSettings';
import EnhancedRBACManagement from '@/pages/EnhancedRBACManagement';
import FinancialManagement from '@/pages/FinancialManagement';
import AiTeamManagement from '@/pages/ai-team-management';
import SalesPipeline from '@/pages/sales-pipeline';
import WorkflowAutomation from '@/pages/workflow-automation';
import CustomerService from '@/pages/customer-service';
import EmailManagement from '@/pages/email-management';
import Reports from '@/pages/reports';
import Settings from '@/pages/settings';
import CleanSettings from '@/pages/CleanSettings';
import DataUploadPage from '@/pages/data/upload';
// import SettingsTest from '@/pages/SettingsTest';
import SystemStatus from '@/pages/system-status';
import QuickActions from '@/pages/quick-actions';
import Notifications from '@/pages/notifications';
import UserManagement from '@/pages/user-management';
import EnterpriseDashboard from '@/pages/enterprise-dashboard';
import VoiceAnalytics from '@/pages/voice-analytics';
import VoiceSetup from '@/pages/voice-setup';
import ElevenLabsSetup from '@/pages/elevenlabs-setup';
import EnhancedVoiceInterface from '@/pages/enhanced-voice-interface';
import SecuritySettings from '@/components/SecuritySettings';
import MultiAgentChat from '@/pages/multi-agent-chat';
import CustomWhatsAppTest from '@/pages/custom-whatsapp-test';
import WhatsAppTest from '@/pages/WhatsAppTest';
import VoipIntegration from '@/pages/voip-integration';
import SelfLearningPage from '@/pages/SelfLearningPage';
import AdvancedSelfLearningPage from '@/pages/AdvancedSelfLearningPage';
import EnterpriseAIDashboard from '@/pages/EnterpriseAIDashboard';
import CrewAIDashboardPage from '@/pages/crewai-dashboard';
import LangGraphTest from '@/pages/langgraph-test';

// Professional Global Structure
import { MainDashboard } from '@/pages/dashboard';
import EnterpriseRBACDashboard from '@/pages/EnterpriseRBACDashboard';
import UserTestingSystemComponent from '@/components/UserTestingSystem';
import SimpleRBACTest from '@/pages/SimpleRBACTest';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="business-automation-theme">
          <Switch>
            <Route path="/">
              <EnterpriseLanding />
            </Route>
            <Route path="/auth/login">
              <LoginPage />
            </Route>
            <Route path="/auth/register">
              <RegisterPage />
            </Route>
            <Route path="/dashboard">
              <ProtectedRoute>
                <EnhancedDashboard />
              </ProtectedRoute>
            </Route>
            <Route path="/chat">
              <ProtectedRoute>
                <IntelligentChatInterface />
              </ProtectedRoute>
            </Route>
            <Route path="/rbac-management">
              <ProtectedRoute requiredResource="/api/rbac/users" requiredAction="GET">
                <EnterpriseRBACDashboard />
              </ProtectedRoute>
            </Route>
            <Route path="/ai-team-management">
              <ProtectedRoute requiredResource="/api/ai-agents" requiredAction="GET">
                <AiTeamManagement />
              </ProtectedRoute>
            </Route>
            <Route path="/sales-pipeline">
              <ProtectedRoute requiredResource="/api/opportunities" requiredAction="GET">
                <SalesPipeline />
              </ProtectedRoute>
            </Route>
            <Route path="/workflow-automation">
              <ProtectedRoute requiredResource="/api/workflows" requiredAction="GET">
                <WorkflowAutomation />
              </ProtectedRoute>
            </Route>
            <Route path="/customer-service">
              <ProtectedRoute requiredResource="/api/support" requiredAction="GET">
                <CustomerService />
              </ProtectedRoute>
            </Route>
            <Route path="/email-management">
              <ProtectedRoute requiredResource="/api/email" requiredAction="GET">
                <EmailManagement />
              </ProtectedRoute>
            </Route>
            <Route path="/data/upload">
              <ProtectedRoute requiredResource="/api/data" requiredAction="POST">
                <DataUploadPage />
              </ProtectedRoute>
            </Route>
            <Route path="/reports">
              <ProtectedRoute requiredLevel={4} requiredPermission={{ resource: "reports", action: "read" }}>
                <Reports />
              </ProtectedRoute>
            </Route>
            <Route path="/settings">
              <ProtectedRoute requiredLevel={3} requiredPermission={{ resource: "settings", action: "manage" }}>
                <EnhancedSettings />
              </ProtectedRoute>
            </Route>
            <Route path="/settings-test">
              <div className="p-8 bg-slate-900 text-white">
                <h1>Settings Test Page</h1>
                <p>Direct API test available at /test-api.js</p>
              </div>
            </Route>
            <Route path="/system-status">
              <ProtectedRoute requiredLevel={2} requiredPermission={{ resource: "system", action: "manage" }}>
                <SystemStatus />
              </ProtectedRoute>
            </Route>
            <Route path="/quick-actions">
              <QuickActions />
            </Route>
            <Route path="/enterprise-dashboard">
              <ProtectedRoute requiredLevel={2} requiredPermission={{ resource: "analytics", action: "read" }}>
                <EnterpriseDashboard />
              </ProtectedRoute>
            </Route>
            <Route path="/notifications">
              <Notifications />
            </Route>
            <Route path="/user-management">
              <ProtectedRoute requiredLevel={1} requiredPermission={{ resource: "users", action: "manage" }}>
                <UserManagement />
              </ProtectedRoute>
            </Route>
            <Route path="/multi-agent-chat">
              <MultiAgentChat />
            </Route>
            <Route path="/self-learning">
              <SelfLearningPage />
            </Route>
            <Route path="/advanced-self-learning">
              <AdvancedSelfLearningPage />
            </Route>
            <Route path="/custom-whatsapp-test">
              <CustomWhatsAppTest />
            </Route>
            <Route path="/whatsapp-test">
              <WhatsAppTest />
            </Route>
            <Route path="/voice-analytics">
              <VoiceAnalytics />
            </Route>
            <Route path="/voice-setup">
              <VoiceSetup />
            </Route>
            <Route path="/elevenlabs-setup">
              <ElevenLabsSetup />
            </Route>
            <Route path="/enhanced-voice-interface">
              <EnhancedVoiceInterface />
            </Route>
            <Route path="/security-settings">
              <SecuritySettings />
            </Route>
            <Route path="/financial-management">
              <FinancialManagement />
            </Route>
            <Route path="/voip-integration">
              <VoipIntegration />
            </Route>
            <Route path="/enterprise-ai">
              <EnterpriseAIDashboard />
            </Route>
            <Route path="/rbac-testing">
              <UserTestingSystemComponent />
            </Route>
            <Route path="/langgraph-test">
              <ProtectedRoute requiredResource="/api/langgraph" requiredAction="GET">
                <LangGraphTest />
              </ProtectedRoute>
            </Route>
            <Route>
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                    <p className="text-slate-400 mb-4">الصفحة غير موجودة</p>
                    <a href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
                      العودة للصفحة الرئيسية
                    </a>
                  </div>
                </div>
              </div>
            </Route>
          </Switch>
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}