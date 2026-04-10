import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import type { AppRole } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
  redirectTo?: string;
  skipRoleCheck?: boolean;
}

const ProtectedRoute = ({ children, allowedRoles, redirectTo = '/login', skipRoleCheck = false }: ProtectedRouteProps) => {
  const { user, role, activeView, loading, diveCenterId } = useAuth();
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

  // Force users in dive_center view without a dive center to register one
  if ((activeView === 'dive_center' || role === 'dive_center') && !diveCenterId && location.pathname !== '/register-center') {
    return <Navigate to="/register-center" replace />;
  }

  // Super admin can access everything — route based on activeView
  if (role === 'super_admin') {
    if (allowedRoles) {
      // Check if the active view matches the allowed roles
      const viewMatchesRoles =
        (activeView === 'diver' && allowedRoles.includes('diver')) ||
        (activeView === 'dive_center' && allowedRoles.includes('dive_center')) ||
        (activeView === 'super_admin' && allowedRoles.includes('super_admin'));
      
      if (!viewMatchesRoles) {
        // Redirect based on active view
        if (activeView === 'diver') return <Navigate to="/app/discover" replace />;
        if (activeView === 'dive_center') return <Navigate to="/admin" replace />;
        return <Navigate to="/super-admin" replace />;
      }
    }
    return <>{children}</>;
  }

  // Check allowed roles for non-super-admin users
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    // Redirect based on their actual role
    if (role === 'diver') {
      return <Navigate to="/app/discover" replace />;
    }
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
