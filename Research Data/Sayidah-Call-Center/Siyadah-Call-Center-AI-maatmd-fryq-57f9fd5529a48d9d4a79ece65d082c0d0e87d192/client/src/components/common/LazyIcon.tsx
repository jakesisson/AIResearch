import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyIconProps {
  iconName: string;
  className?: string;
  'aria-hidden'?: boolean;
  'aria-label'?: string;
}

// Icon loading cache
const iconCache = new Map();

function getIcon(iconName: string) {
  if (!iconCache.has(iconName)) {
    iconCache.set(iconName, lazy(() => 
      import('lucide-react').then(module => ({ 
        default: module[iconName] || module.HelpCircle 
      }))
    ));
  }
  return iconCache.get(iconName);
}

export default function LazyIcon({ iconName, className = "", ...props }: LazyIconProps) {
  const IconComponent = getIcon(iconName);
  
  return (
    <Suspense 
      fallback={
        <Loader2 
          className={`w-4 h-4 animate-spin ${className}`} 
          aria-hidden="true"
        />
      }
    >
      <IconComponent className={className} {...props} />
    </Suspense>
  );
}