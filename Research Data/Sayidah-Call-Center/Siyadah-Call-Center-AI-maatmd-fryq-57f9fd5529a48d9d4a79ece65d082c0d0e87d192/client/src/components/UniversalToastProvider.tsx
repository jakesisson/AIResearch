import React, { createContext, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ToastContextType {
  showSuccessToast: (message: string) => void;
  showErrorToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function UniversalToastProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  const showSuccessToast = (message: string) => {
    toast({
      title: "✅ تم الحفظ بنجاح",
      description: message,
      duration: 3000
    });
  };

  const showErrorToast = (message: string) => {
    toast({
      title: "خطأ في العملية",
      description: message,
      variant: "destructive",
      duration: 5000
    });
  };

  return (
    <ToastContext.Provider value={{ showSuccessToast, showErrorToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useUniversalToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useUniversalToast must be used within UniversalToastProvider');
  }
  return context;
}