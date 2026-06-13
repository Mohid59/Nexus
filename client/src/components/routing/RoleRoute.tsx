import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RouteLoader } from './RouteLoader';
import { UserRole } from '../../types';

interface RoleRouteProps {
  role: UserRole;
}

/** Restricts a route subtree to a single role; others go to their own dashboard. */
export const RoleRoute: React.FC<RoleRouteProps> = ({ role }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <RouteLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }
  return <Outlet />;
};
