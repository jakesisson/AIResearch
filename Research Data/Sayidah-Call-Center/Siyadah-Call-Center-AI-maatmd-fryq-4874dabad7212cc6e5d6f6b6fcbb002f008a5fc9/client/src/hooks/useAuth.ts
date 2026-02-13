import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface User {
  id: string;
  email: string;
  roleId: string;
  roleName?: string;
  roleNameAr?: string;
  roleLevel?: number;
  organizationId: string;
  permissions?: string[];
}

export function useAuth() {
  const token = localStorage.getItem('auth_token');
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      if (!token) return null;
      
      try {
        const response = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Authentication failed');
        }
        
        return await response.json();
      } catch (error) {
        // If token is invalid, remove it
        localStorage.removeItem('auth_token');
        return null;
      }
    },
    retry: false,
    enabled: !!token,
  });

  return {
    user: user as User | null,
    isLoading: isLoading && !!token,
    isAuthenticated: !!user && !!token,
    error
  };
}