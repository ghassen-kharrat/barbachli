import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import config from '../config';

// Use config for API URL with fallback to localhost
const API_BASE_URL = config.apiUrl || 'http://localhost:5001/api';

// Create Axios client with default configuration
const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Set consistent CORS handling
  withCredentials: false,
  // Add timeout to prevent hanging requests
  timeout: 15000,
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token');
    
    // Debug: log request information
    console.log(`Request to ${config.baseURL}${config.url}:`, {
      method: config.method,
      hasData: !!config.data,
    });
    
    // Add token to headers if it exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return the response data directly
    return response.data;
  },
  (error: AxiosError) => {
    console.error('API Error:', error.message);
    
    // Handle network errors
    if (error.message.includes('Network Error') || 
        error.code === 'ECONNABORTED' || 
        error.code === 'ECONNREFUSED' ||
        error.code === 'ENOTFOUND' ||
        !error.response) {
      
      console.error('Network error detected');
      
      // Return generic error
      return Promise.reject({
        response: {
          status: 503,
          data: {
            error: 'Service Unavailable',
            message: 'The API server is currently unreachable. Please try again later.'
          }
        }
      });
    }
    
    // Handle authentication errors (401)
    if (error.response && error.response.status === 401) {
      // Clear token
      localStorage.removeItem('auth_token');
      
      // Only redirect if not already on login page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient; 