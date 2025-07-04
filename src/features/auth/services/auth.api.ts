import axiosClient from '../../../apis/axios-client';
import axios from 'axios';
import config from '../../../config';
import { 
  AuthResponseData, 
  ChangePasswordData, 
  LoginData, 
  RegisterData, 
  UpdateProfileData, 
  UserResponseData 
} from './types';

// URL de base pour les endpoints d'authentification
const baseUrl = '/auth';

// Create a special client just for direct API access - VERSION MARKER: v2.0.0
const directApiClient = axios.create({
  baseURL: 'https://barbachli-auth.onrender.com/api', // Force using barbachli-auth
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 40000, // Use a longer timeout for auth operations
  withCredentials: false
});

// Helper to save user data to localStorage
const saveUserData = (userData: any) => {
  try {
    if (!userData) {
      return;
    }
    
    // Make sure we have a properly formatted user object with role
    const formattedUser = {
      ...userData,
      role: userData.role || (userData.email && userData.email.includes('admin') ? 'admin' : 'user'),
      isActive: userData.isActive !== undefined ? userData.isActive : true
    };
    
    localStorage.setItem('user_data', JSON.stringify(formattedUser));
  } catch (e) {
    console.error('Error saving user data to localStorage:', e);
  }
};

// Determine if data is already in snake_case format
function isSnakeCaseData(data: any): boolean {
  return data && (data.first_name !== undefined || data.last_name !== undefined);
}

// Validate password match
function validatePasswords(data: any): boolean {
  // If there's no confirmPassword field, we can't validate
  if (!data.confirmPassword) return true;
  
  return data.password === data.confirmPassword;
}

// Convert our frontend snake_case fields to match backend expectations
function convertRegistrationData(data: RegisterData | any) {
  // Check if data already has camelCase fields
  if (data.firstName !== undefined || data.lastName !== undefined) {
    console.log('Data is already in camelCase format');
    
    // Ensure confirmPassword is set to match password if not provided
    if (!data.confirmPassword && data.password) {
      return {
        ...data,
        confirmPassword: data.password
      };
    }
    
    return data;
  }
  
  // If data is in snake_case, convert to camelCase for backend
  if (isSnakeCaseData(data)) {
    console.log('Converting snake_case data to camelCase for backend');
    
    return {
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirm_password || data.password,
      phone: data.phone || ''
    };
  }
  
  // Standard conversion from frontend model to backend model
  const { confirmPassword, ...safeData } = data as any;
  
  return {
    firstName: safeData.firstName,
    lastName: safeData.lastName,
    email: safeData.email,
    password: safeData.password,
    confirmPassword: safeData.password, // Include matching confirmPassword
    phone: safeData.phone || ''
  };
}

// Service API pour l'authentification
const authApi = {
  // Connexion utilisateur
  login: async (data: LoginData): Promise<AuthResponseData> => {
    try {
      console.log('Attempting login with auth service...');
      
      // Prioritize direct API calls if the feature flag is enabled
      if (config.features.useDirectAuth) {
        try {
          // Use direct API call to dedicated auth service
          const response = await directApiClient.post('/auth/login', data);
      
          // Store token in localStorage
          if (response.data && response.data.data && response.data.data.token) {
            localStorage.setItem('auth_token', response.data.data.token);
          } else if (response.data && response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
          }
          
          // Extract user data
          const userData = response.data.data || response.data;
          
          // Save user data to localStorage
          saveUserData(userData.user || userData);
          
          // Log user role
          console.log(`Login successful - User: ${userData.email}, Role: ${userData.role}`);
          
          return {
            success: true,
            data: userData
          };
        } catch (directError) {
          console.error('Direct API login failed:', directError);
          // Fall back to Vercel API proxy
        }
      }
      
      // Fall back to Vercel API proxy
      const response = await axios.post('/api/auth/login', data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: config.timeouts.auth
      });
      
      // Store token in localStorage
      if (response.data && response.data.data && response.data.data.token) {
        localStorage.setItem('auth_token', response.data.data.token);
      }
      
      // Extract user data
      const userData = response.data.data || response.data;
      
      // Save user data to localStorage
      saveUserData(userData.user || userData);
      
      // Log user role
      console.log(`Login successful - User: ${userData.email}, Role: ${userData.role}`);
      
      return {
        success: true,
        data: userData
      };
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('auth_token');
      
      // Fallback for development/testing
      if (process.env.NODE_ENV !== 'production' && data.email === 'admin@example.com') {
        console.log('Using admin fallback for development');
        
        // Create admin user
        const adminUser = {
          id: 1,
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          token: 'test-token-' + Date.now()
        };
        
        // Save to localStorage
        localStorage.setItem('auth_token', adminUser.token);
        saveUserData(adminUser);
        
        return {
          success: true,
          data: {
            user: adminUser,
            token: adminUser.token
          }
        };
      }
      
      throw error;
    }
  },
  
  // Enregistrement d'un nouvel utilisateur
  register: async (data: RegisterData | any): Promise<AuthResponseData> => {
    try {
      console.log('Registering user with data:', { ...data, password: '******' });
      
      // Pre-validate passwords before sending to backend
      if (!isSnakeCaseData(data) && !validatePasswords(data)) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      
      // Convert data to match backend expectations if needed
      const adaptedData = convertRegistrationData(data);
      console.log('Adapted registration data:', { ...adaptedData, password: '******' });
      
      // Prioritize direct API calls if the feature flag is enabled
      if (config.features.useDirectAuth) {
        try {
          console.log('Trying direct API call to:', directApiClient.defaults.baseURL + '/auth/register');
          const directResponse = await directApiClient.post('/auth/register', adaptedData);
      
          // Store token in localStorage
          if (directResponse.data && directResponse.data.data && directResponse.data.data.token) {
            localStorage.setItem('auth_token', directResponse.data.data.token);
          } else if (directResponse.data && directResponse.data.token) {
            localStorage.setItem('auth_token', directResponse.data.token);
          }
          
          // Extract and save user data
          const userData = directResponse.data.data || directResponse.data;
          saveUserData(userData.user || userData);
          
          return {
            success: true,
            data: userData
          };
        } catch (directError) {
          console.error('Direct API registration failed:', directError);
          // Fall back to Vercel API proxy
        }
      }
      
      // Fall back to Vercel API proxy
      console.log('Trying Vercel API proxy...');
      const response = await axios.post('/api/auth/register', adaptedData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: config.timeouts.auth
      });
      
      // Store token in localStorage
      if (response.data && response.data.data && response.data.data.token) {
        localStorage.setItem('auth_token', response.data.data.token);
      }
      
      // Extract and save user data
      const userData = response.data.data || response.data;
      saveUserData(userData.user || userData);
      
      return {
        success: true,
        data: userData
      };
    } catch (error) {
      console.error('Registration failed completely:', error);
      
      // Fallback for development/testing if email contains "admin"
      if (process.env.NODE_ENV !== 'production' && data.email.includes('admin')) {
        console.log('Using admin fallback for development');
        
        // Create admin user
        const adminUser = {
          id: 1,
          email: data.email,
          firstName: data.firstName || 'Admin',
          lastName: data.lastName || 'User',
          role: 'admin',
          token: 'test-token-' + Date.now()
        };
        
        // Save to localStorage
        localStorage.setItem('auth_token', adminUser.token);
        saveUserData(adminUser);
        
        return {
          success: true,
          data: {
            user: adminUser,
            token: adminUser.token
          }
        };
      }
      
      // Format a better error message
      let errorMessage = 'Registration failed. Please try again.';
      
      if (axios.isAxiosError(error) && error.response) {
        // Try to extract error message from backend
        const backendMessage = error.response.data?.message || error.response.data?.error;
        if (backendMessage && typeof backendMessage === 'string') {
          errorMessage = backendMessage;
        }
        
        // Check for password mismatch errors - safely check string type
        const responseData = error.response.data || {};
        const hasPasswordError = 
          (typeof responseData.error === 'string' && 
           (responseData.error.includes('password') || responseData.error.includes('mot de passe'))) ||
          (typeof responseData.message === 'string' && 
           (responseData.message.includes('password') || responseData.message.includes('mot de passe')));
        
        if (hasPasswordError) {
          errorMessage = 'Les mots de passe ne correspondent pas';
        }
      }
      
      throw new Error(errorMessage);
    }
  },
  
  // Déconnexion utilisateur
  logout: async (): Promise<void> => {
    // Supprimer le token du localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    // Ne pas appeler l'API pour la déconnexion dans cette version
    return Promise.resolve();
  },
  
  // Récupérer le profil de l'utilisateur connecté
  getProfile: async (): Promise<UserResponseData> => {
    try {
      const response = await directApiClient.get('/auth/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      // Save user data to localStorage
      if (response.data && response.data.data) {
        saveUserData(response.data.data);
      }
      
      return response;
    } catch (error) {
      console.error('Error getting profile:', error);
      
      // Return stored user data as fallback
      try {
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          return {
            status: 'success',
            data: user
          };
        }
      } catch (e) {
        console.error('Error parsing stored user data:', e);
      }
      
      throw error;
    }
  },
  
  // Mettre à jour le profil utilisateur
  updateProfile: async (data: UpdateProfileData): Promise<UserResponseData> => {
    // Convert data to match backend expectations
    const adaptedData = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone
    };
    
    const response = await directApiClient.put('/auth/profile', adaptedData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    // Update localStorage
    if (response.data && response.data.data) {
      saveUserData(response.data.data);
    }
    
    return response;
  },
  
  // Changer le mot de passe
  changePassword: async (data: ChangePasswordData): Promise<UserResponseData> => {
    return directApiClient.put('/auth/password', data, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
  },
  
  // Vérifier le statut d'authentification
  checkAuth: async (): Promise<UserResponseData> => {
    try {
      // Prioritize direct API calls if the feature flag is enabled
      if (config.features.useDirectAuth) {
        try {
          console.log('Checking auth via direct API');
          const directResponse = await directApiClient.get('/auth/check', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            timeout: 15000
          });
          
          // Save user data to localStorage
          if (directResponse.data && directResponse.data.data) {
            saveUserData(directResponse.data.data);
          }
          
          return directResponse.data.data || directResponse.data;
        } catch (directError) {
          console.error('Auth check via direct API failed:', directError);
          // Fall back to Vercel API proxy
        }
      }
      
      // Fall back to Vercel API proxy
      console.log('Checking auth via proxy');
      const response = await axios.get('/api/auth/check', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        timeout: 10000
      });
      
      // Save user data to localStorage
      if (response.data && response.data.data) {
        saveUserData(response.data.data);
      }
      
      return response.data.data || response.data;
    } catch (error) {
      console.error('Auth check failed completely:', error);
      
      // Return stored user data as fallback
      try {
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          return {
            status: 'success',
            data: user
          };
        }
      } catch (e) {
        console.error('Error parsing stored user data:', e);
      }
      
      throw error;
    }
  }
};

export default authApi; 