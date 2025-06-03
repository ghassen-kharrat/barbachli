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

// Service API pour l'authentification
const authApi = {
  // Connexion utilisateur
  login: async (data: LoginData): Promise<AuthResponseData> => {
    try {
      // Use direct API proxy endpoint for authentication
      const response = await axios.post('/api/proxy/auth/login', data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      // Store token in localStorage
      const responseData = response.data?.data || response.data;
      if (responseData && responseData.token) {
        localStorage.setItem('auth_token', responseData.token);
      }
      
      return {
        success: true,
        data: responseData
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
      console.log('Registering user:', { ...data, password: '******' });
      
      // Use our dedicated registration endpoint
      const response = await axios.post('/api/auth/register', data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000 // 15 second timeout
      });
      
      console.log('Registration response:', response.status);
      
      // Parse response data
      let responseData = response.data;
      if (response.data?.data) {
        responseData = response.data.data;
      }
      
      // Store token in localStorage if available
      if (responseData && responseData.token) {
        localStorage.setItem('auth_token', responseData.token);
        console.log('Token stored in localStorage');
      } else {
        console.warn('No token found in registration response');
      }
      
      return {
        success: true,
        data: responseData
      };
    } catch (error: any) {
      console.error('Registration error:', error.message);
      
      // Log detailed error information
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
      
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
    return axiosClient.get(`${baseUrl}/profile`);
  },
  
  // Mettre à jour le profil utilisateur
  updateProfile: async (data: UpdateProfileData): Promise<UserResponseData> => {
    return axiosClient.put(`${baseUrl}/profile`, data);
  },
  
  // Changer le mot de passe
  changePassword: async (data: ChangePasswordData): Promise<UserResponseData> => {
    return axiosClient.put(`${baseUrl}/password`, data);
  },
  
  // Vérifier le statut d'authentification
  checkAuth: async (): Promise<UserResponseData> => {
    try {
      // Use our API proxy endpoint to check authentication
      const response = await axios.get('/api/auth/check', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        timeout: 5000 // 5 second timeout
      });
      
      const responseData = response.data?.data || response.data;
      return responseData;
    } catch (error) {
      console.error('Auth check error:', error);
      throw error;
    }
  }
};

export default authApi; 