import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthCheck } from '../features/auth/hooks/use-auth-query';
import { toast } from 'react-toastify';

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

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const { data, isLoading, error } = useAuthCheck();
  
  useEffect(() => {
    // Update auth state when query completes
    if (data && data.data) {
      setUser(data.data);
    } else {
      setUser(null);
    }
    
    // Show error toast if auth check fails
    if (error) {
      toast.error('Problème de connexion. Veuillez vous reconnecter.');
      console.error('Auth check error:', error);
    }
  }, [data, error]);
  
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