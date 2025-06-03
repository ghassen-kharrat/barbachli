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

// Determine if we're in production environment (Vercel)
const isProduction = window.location.hostname.includes('vercel.app') || 
                    window.location.hostname.includes('barbachli.vercel.app');

// Service API pour l'authentification
const authApi = {
  // Connexion utilisateur
  login: async (data: LoginData): Promise<AuthResponseData> => {
    try {
      // Use direct API endpoint for login
      const response = await axios.post('/api/auth/login', data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      // Stocker le token dans le localStorage
      if (response.data && response.data.data && response.data.data.token) {
        localStorage.setItem('auth_token', response.data.data.token);
      } else if (response.data && response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      localStorage.removeItem('auth_token');
      throw error;
    }
  },
  
  // Enregistrement d'un nouvel utilisateur
  register: async (data: RegisterData): Promise<AuthResponseData> => {
    try {
      console.log('Sending registration request to API proxy');
      
      // Use the API proxy for registration
      const response = await axios.post('/api/auth/register', data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });
      
      console.log('Registration response:', response);
      
      // Stocker le token dans le localStorage
      if (response.data && response.data.data && response.data.data.token) {
        localStorage.setItem('auth_token', response.data.data.token);
      } else if (response.data && response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Registration error:', error);
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
    try {
      const response = await axios.get('/api/auth/profile', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },
  
  // Mettre à jour le profil utilisateur
  updateProfile: async (data: UpdateProfileData): Promise<UserResponseData> => {
    try {
      const response = await axios.put('/api/auth/profile', data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
  
  // Changer le mot de passe
  changePassword: async (data: ChangePasswordData): Promise<UserResponseData> => {
    try {
      const response = await axios.put('/api/auth/password', data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },
  
  // Vérifier le statut d'authentification
  checkAuth: async (): Promise<UserResponseData> => {
    try {
      const response = await axios.get('/api/auth/check', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Auth check error:', error);
      throw error;
    }
  }
};

export default authApi; 