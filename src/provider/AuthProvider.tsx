import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthCheck } from '../features/auth/hooks/use-auth-query';
import { toast } from 'react-toastify';
import { UserResponseData } from '../features/auth/services/types';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
});

export const useAuth = () => {
  return useContext(AuthContext);
};

// Helper to get user data from localStorage
const getUserFromLocalStorage = (): User | null => {
  try {
    const userDataString = localStorage.getItem('user_data');
    if (!userDataString) return null;
    
    const userData = JSON.parse(userDataString);
    return userData;
  } catch (e) {
    console.error('Error parsing user data from localStorage:', e);
    return null;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Initialize user from localStorage first
  const [user, setUser] = useState<User | null>(getUserFromLocalStorage());
  const { data, isLoading, error } = useAuthCheck();
  
  // On component mount, check if we have token and user_data in localStorage
  useEffect(() => {
    // Check localStorage for auth data first
    const storedUser = getUserFromLocalStorage();
    const hasToken = !!localStorage.getItem('auth_token');
    
    if (storedUser && hasToken) {
      console.log('Found user in localStorage:', storedUser.email);
      setUser(storedUser);
    }
  }, []);
  
  useEffect(() => {
    // Update auth state when query completes
    if (data && (data as UserResponseData).data) {
      const apiUser = (data as UserResponseData).data;
      setUser(apiUser);
      
      // Also update localStorage
      try {
        localStorage.setItem('user_data', JSON.stringify(apiUser));
        console.log('Updated user in localStorage from API:', apiUser.email);
      } catch (e) {
        console.error('Error saving user data to localStorage:', e);
      }
    } else if (data === null) {
      setUser(null);
    }
    
    // Show error toast if auth check fails
    if (error) {
      // Don't show toast on initial load failure
      if (user) {
        toast.error('Problème de connexion. Veuillez vous reconnecter.');
      }
      console.error('Auth check error:', error);
    }
  }, [data, error, user]);
  
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 