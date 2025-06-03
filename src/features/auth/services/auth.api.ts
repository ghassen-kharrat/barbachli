import axiosClient from '../../../apis/axios-client';
import axios from 'axios';
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

// Create a special client just for direct API access
const directApiClient = axios.create({
  baseURL: 'https://barbachli-1.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 second timeout
  withCredentials: false
});

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
  // If data is already in snake_case format, use it directly
  if (isSnakeCaseData(data)) {
    console.log('Data is already in snake_case format');
    return data;
  }
  
  // Ensure we don't send confirmPassword to the backend
  const { confirmPassword, ...safeData } = data as any;
  
  return {
    first_name: safeData.firstName,
    last_name: safeData.lastName,
    email: safeData.email,
    password: safeData.password,
    phone: safeData.phone || ''
  };
}

// Service API pour l'authentification
const authApi = {
  // Connexion utilisateur
  login: async (data: LoginData): Promise<AuthResponseData> => {
    try {
      // Use Vercel API proxy
      const response = await axios.post('/api/auth/login', data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      });
      
      // Stocker le token dans le localStorage
      if (response.data && response.data.data && response.data.data.token) {
        localStorage.setItem('auth_token', response.data.data.token);
      }
      
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('auth_token');
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
      
      // First try the Vercel API proxy
      try {
        console.log('Trying Vercel API proxy...');
        const response = await axios.post('/api/auth/register', adaptedData, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000
        });
        
        // Stocker le token dans le localStorage
        if (response.data && response.data.data && response.data.data.token) {
          localStorage.setItem('auth_token', response.data.data.token);
        }
        
        return {
          success: true,
          data: response.data.data || response.data
        };
      } catch (proxyError) {
        console.error('Vercel proxy registration failed, trying direct API:', proxyError);
        
        // Check if this is a password mismatch error
        if (axios.isAxiosError(proxyError) && proxyError.response?.data) {
          const errorData = proxyError.response.data;
          if (errorData.message?.includes('mot de passe') || 
              errorData.error?.includes('mot de passe') ||
              errorData.message?.includes('password') || 
              errorData.error?.includes('password')) {
            throw new Error('Les mots de passe ne correspondent pas');
          }
        }
        
        // If Vercel proxy fails, try direct API
        console.log('Trying direct API call to:', directApiClient.defaults.baseURL + '/auth/register');
        const directResponse = await directApiClient.post('/auth/register', adaptedData);
        
        // Stocker le token dans le localStorage
        if (directResponse.data && directResponse.data.token) {
          localStorage.setItem('auth_token', directResponse.data.token);
        }
        
        return {
          success: true,
          data: directResponse.data
        };
      }
    } catch (error) {
      console.error('Registration failed completely:', error);
      
      // Format a better error message
      let errorMessage = 'Registration failed. Please try again.';
      
      if (axios.isAxiosError(error) && error.response) {
        // Try to extract error message from backend
        const backendMessage = error.response.data?.message || error.response.data?.error;
        if (backendMessage) {
          errorMessage = `${backendMessage}`;
        }
        
        // Check for password mismatch errors
        if ((error.response.data?.error && 
             (error.response.data.error.includes('password') || 
              error.response.data.error.includes('mot de passe'))) ||
            (error.response.data?.message && 
             (error.response.data.message.includes('password') || 
              error.response.data.message.includes('mot de passe')))) {
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
    
    // Ne pas appeler l'API pour la déconnexion dans cette version
    return Promise.resolve();
  },
  
  // Récupérer le profil de l'utilisateur connecté
  getProfile: async (): Promise<UserResponseData> => {
    return directApiClient.get('/auth/profile', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
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
    
    return directApiClient.put('/auth/profile', adaptedData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
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
      // First try the Vercel API proxy
      try {
        const response = await axios.get('/api/auth/check', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          timeout: 10000
        });
        return response.data.data || response.data;
      } catch (proxyError) {
        console.error('Auth check via proxy failed, trying direct API:', proxyError);
        
        // If proxy fails, try direct API
        const directResponse = await directApiClient.get('/auth/check', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        return directResponse.data;
      }
    } catch (error) {
      console.error('Auth check failed completely:', error);
      throw error;
    }
  }
};

export default authApi; 