import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export interface UseAppNavigationReturn {
  currentTabIndex: number;
  handleTabChange: (index: number) => void;
}

/**
 * Custom hook for managing app navigation and tab state
 */
export const useAppNavigation = (): UseAppNavigationReturn => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current tab index based on URL
  const getCurrentTabIndex = (): number => {
    if (location.pathname === '/cover-letter') return 1;
    return 0; // Default to resume tab for '/' and '/resume'
  };

  // Handle tab change and update URL
  const handleTabChange = (index: number): void => {
    if (index === 0) {
      navigate('/resume', { replace: true });
    } else if (index === 1) {
      navigate('/cover-letter', { replace: true });
    }
  };

  // Redirect root to /resume
  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/resume', { replace: true });
    }
  }, [location.pathname, navigate]);

  return {
    currentTabIndex: getCurrentTabIndex(),
    handleTabChange
  };
};
