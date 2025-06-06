import { Navigate, Outlet } from 'react-router-dom';
import { useAuthCheck } from '../hooks/use-auth-query';
import { UserResponseData } from '../services/types';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  redirectPath?: string;
}

const PrivateRoute = ({ 
  allowedRoles = ['user', 'admin'], 
  redirectPath = '/login' 
}: ProtectedRouteProps) => {
  const { data: authData, isLoading } = useAuthCheck();
  
  // If still checking authentication status, show loading
  if (isLoading) {
    return <div>Chargement...</div>;
  }
  
  // If not logged in, redirect to login
  if (!authData || !(authData as UserResponseData).success) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // If user doesn't have the required role, redirect
  if (allowedRoles.length > 0 && !allowedRoles.includes((authData as UserResponseData).data.role)) {
    // Redirect admin to admin dashboard, users to home page
    const redirectTo = (authData as UserResponseData).data.role === 'admin' ? '/admin' : '/';
    return <Navigate to={redirectTo} replace />;
  }
  
  // If authenticated and authorized, render the child routes
  return <Outlet />;
};

export default PrivateRoute; 