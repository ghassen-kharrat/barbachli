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
  register: async (data: RegisterData): Promise<AuthResponseData> => {
    try {
      console.log('Registering user with data:', { ...data, password: '******' });
      
      // First try the Vercel API proxy
      try {
        console.log('Trying Vercel API proxy...');
        const response = await axios.post('/api/auth/register', data, {
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
        
        // If Vercel proxy fails, try direct API
        const directResponse = await directApiClient.post('/auth/register', data);
        
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
      throw error;
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
    return directApiClient.put('/auth/profile', data, {
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