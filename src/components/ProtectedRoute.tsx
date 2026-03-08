import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
  skipRoleCheck?: boolean;
}

const ProtectedRoute = ({ children, allowedRoles, redirectTo = '/login', skipRoleCheck = false }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // No role yet → send to role selection (unless we're already there)
  if (!role && !skipRoleCheck) {
    return <Navigate to="/complete-profile" replace />;
  }

  // Check allowed roles
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect based on their actual role
    if (role === 'diver') {
      return <Navigate to="/app/discover" replace />;
    }
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
