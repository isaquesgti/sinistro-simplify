
import React from 'react';
import { Navigate } from 'react-router-dom';

type UserRole = 'client' | 'insurer' | 'admin' | null;

// Mock authentication for now
const useAuth = () => {
  // This would be replaced with actual authentication logic later
  const role = localStorage.getItem('userRole') as UserRole;
  
  return {
    role,
    isAuthenticated: !!role,
    login: (role: UserRole) => {
      localStorage.setItem('userRole', role);
      window.location.reload();
    },
    logout: () => {
      localStorage.removeItem('userRole');
      window.location.reload();
    }
  };
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: UserRole;
  redirectTo: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRole,
  redirectTo 
}) => {
  const auth = useAuth();
  
  if (!auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (auth.role !== allowedRole) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};

export { useAuth };
export type { UserRole };
