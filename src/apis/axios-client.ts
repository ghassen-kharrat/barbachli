import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Use port 5001 explicitly
const API_BASE_URL = 'http://localhost:5001/api';

// Création d'un client Axios avec configuration par défaut
const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour les requêtes
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Récupérer le token d'authentification du localStorage
    const token = localStorage.getItem('auth_token');
    
    // Debug: log detailed request information
    console.log(`Request to ${config.url}:`, {
      method: config.method,
      headers: config.headers,
      hasData: !!config.data,
      dataKeys: config.data ? Object.keys(config.data) : [],
    });
    
    if (config.url?.includes('/carousel') && config.data) {
      console.log('Carousel request data preview:', {
        title: config.data.title,
        hasImage: !!config.data.image,
        imageType: typeof config.data.image,
        imageLength: typeof config.data.image === 'string' ? config.data.image.length : 'N/A'
      });
    }
    
    // Si le token existe, l'ajouter aux en-têtes
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Debug the response structure
    console.log('Axios response interceptor:', response.data);
    
    // Return the response data directly without modification
    return response.data;
  },
  (error: AxiosError) => {
    console.log('API Error:', error.response?.status, error.response?.data);
    
    // Gérer les erreurs d'authentification (401)
    if (error.response && error.response.status === 401) {
      // Effacer le token
      localStorage.removeItem('auth_token');
      
      // Ne rediriger vers la page de connexion que si on n'est pas déjà sur la page login
      // Cela évite les redirections infinies
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient; 