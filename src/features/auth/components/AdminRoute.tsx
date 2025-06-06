import { Navigate, Outlet } from 'react-router-dom';
import { useAuthCheck } from '../hooks/use-auth-query';
import { UserResponseData } from '../services/types';

const AdminRoute = () => {
  const { data: authResponse, isLoading } = useAuthCheck();
  
  // If still checking authentication status, show loading
  if (isLoading) {
    return <div>Chargement...</div>;
  }
  
  // If not logged in or request was unsuccessful, redirect to login
  if (!authResponse || !(authResponse as UserResponseData).success || !(authResponse as UserResponseData).data) {
    return <Navigate to="/login" replace />;
  }
  
  // Get user data from the response
  const userData = (authResponse as UserResponseData).data;
  
  // Check if the user is an admin
  if (!userData.role || userData.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  // If user is an admin, allow access
  return <Outlet />;
};

export default AdminRoute; 