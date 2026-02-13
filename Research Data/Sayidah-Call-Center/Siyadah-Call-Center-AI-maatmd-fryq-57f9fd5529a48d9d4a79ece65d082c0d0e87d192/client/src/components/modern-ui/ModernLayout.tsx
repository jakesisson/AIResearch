import React, { useState } from 'react';
import ModernSidebar from '../ModernSidebar';
import ModernHeader from './ModernHeader';

interface ModernLayoutProps {
  children: React.ReactNode;
}

function ModernLayout({ children }: ModernLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
      <ModernSidebar collapsed={sidebarCollapsed} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'mr-16' : 'mr-72'}`}>
        <ModernHeader />
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default ModernLayout;
export { ModernLayout };