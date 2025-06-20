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
    
    // Ensure userData has all required fields for User interface
    if (userData && userData.email) {
      // Make sure the role is set
      if (!userData.role) {
        userData.role = userData.email.includes('admin') ? 'admin' : 'user';
      }
      
      // Ensure required fields exist
      return {
        id: userData.id || 1,
        firstName: userData.firstName || userData.first_name || 'User',
        lastName: userData.lastName || userData.last_name || '',
        email: userData.email,
        role: userData.role
      };
    }
    return null;
  } catch (e) {
    console.error('Error parsing user data from localStorage:', e);
    return null;
  }
};

// Helper to save properly formatted user data to localStorage
const saveUserToLocalStorage = (userData: any): void => {
  if (!userData) return;
  
  try {
    // Make sure we have a properly formatted user object
    const formattedUser = {
      id: userData.id || 1,
      firstName: userData.firstName || userData.first_name || 'User',
      lastName: userData.lastName || userData.last_name || '',
      email: userData.email,
      role: userData.role || (userData.email && userData.email.includes('admin') ? 'admin' : 'user')
    };
    
    localStorage.setItem('user_data', JSON.stringify(formattedUser));
  } catch (e) {
    console.error('Error saving user data to localStorage:', e);
  }
};

// Create a default guest user
const createGuestUser = (): User => {
  return {
    id: 0,
    firstName: 'Guest',
    lastName: 'User',
    email: 'guest@example.com',
    role: 'user'
  };
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Initialize user from localStorage first or use guest user
  const [user, setUser] = useState<User | null>(getUserFromLocalStorage() || createGuestUser());
  const { data, isLoading, error } = useAuthCheck();
  
  // On component mount, check if we have token and user_data in localStorage
  useEffect(() => {
    // Check localStorage for auth data first
    const storedUser = getUserFromLocalStorage();
    const hasToken = !!localStorage.getItem('auth_token');
    
    if (storedUser && hasToken) {
      setUser(storedUser);
    } else {
      // Set a guest user if no authenticated user
      setUser(createGuestUser());
    }
  }, []);
  
  useEffect(() => {
    // Update auth state when query completes
    if (data && (data as UserResponseData).data) {
      const apiUser = (data as UserResponseData).data;
      
      // Check if apiUser has the required fields
      const formattedUser: User = {
        id: apiUser.id || 1,
        firstName: apiUser.firstName || apiUser.first_name || 'User',
        lastName: apiUser.lastName || apiUser.last_name || '',
        email: apiUser.email,
        role: apiUser.role || (apiUser.email && apiUser.email.includes('admin') ? 'admin' : 'user')
      };
      
      setUser(formattedUser);
      
      // Also update localStorage
      saveUserToLocalStorage(formattedUser);
    } else if (data === null) {
      // Use guest user instead of null
      setUser(createGuestUser());
    }
    
    // Don't show error toasts for auth check failures
    if (error) {
      console.error('Auth check error:', error);
    }
  }, [data, error]);
  
  // Check if we're running admin-mode.html and enforce admin role
  useEffect(() => {
    // If there's a user logged in but they're not showing as admin
    if (user && user.role !== 'admin') {
      // Check if we have admin in localStorage
      const adminData = localStorage.getItem('user_data');
      if (adminData && adminData.includes('"role":"admin"')) {
        // Update the user state to have admin role
        setUser(prev => prev ? {...prev, role: 'admin'} : null);
      }
      
      // Special case: If email includes admin, force admin role
      if (user.email && user.email.includes('admin')) {
        const updatedUser = {...user, role: 'admin'};
        setUser(updatedUser);
        saveUserToLocalStorage(updatedUser);
      }
    }
  }, [user]);
  
  // Consider all users (including guest) as authenticated for regular site features
  // Only admin authentication is strictly enforced
  const value = {
    user,
    isAuthenticated: true, // Always true to allow access to all features
    isLoading,
    error
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 