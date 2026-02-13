import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  loading?: 'lazy' | 'eager';
}

export default function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  fallback = null,
  loading = 'lazy' 
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={cn("relative", className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-slate-700/50 animate-pulse rounded" />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={cn("transition-opacity", isLoading ? "opacity-0" : "opacity-100")}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
}