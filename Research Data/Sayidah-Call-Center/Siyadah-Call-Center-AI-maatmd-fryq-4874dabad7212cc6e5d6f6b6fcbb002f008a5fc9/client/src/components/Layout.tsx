import React from 'react';
import Navigation from '@/components/Navigation';

interface LayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
}

export default function Layout({ children, showBackButton = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation showBackButton={showBackButton} />
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}