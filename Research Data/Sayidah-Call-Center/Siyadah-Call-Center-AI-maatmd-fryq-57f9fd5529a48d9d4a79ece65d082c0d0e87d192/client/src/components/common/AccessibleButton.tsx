import React, { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AccessibleButtonProps extends ButtonProps {
  'aria-label': string;
  icon?: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  iconPosition?: 'left' | 'right';
  minTouchTarget?: boolean;
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ className, 'aria-label': ariaLabel, icon: Icon, iconPosition = 'left', minTouchTarget = true, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        aria-label={ariaLabel}
        className={cn(
          minTouchTarget && "min-w-11 min-h-11",
          "focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200",
          className
        )}
        {...props}
      >
        {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" aria-hidden="true" />}
        {children}
        {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" aria-hidden="true" />}
      </Button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;