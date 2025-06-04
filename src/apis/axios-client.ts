import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import config from '../config';

// Determine the best API URL based on environment and connection health
const API_BASE_URL = config.apiUrl || 'https://barbachli-1.onrender.com/api';
const AUTH_API_URL = config.authApiUrl || 'https://barbachli-auth.onrender.com/api';

console.log('Using API base URL:', API_BASE_URL);
console.log('Using Auth API base URL:', AUTH_API_URL);

// Create Axios client with default configuration
const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Set consistent CORS handling
  withCredentials: false,
  // Add longer timeout to prevent hanging requests
  timeout: 30000,
});

// Request interceptor
axiosClient.interceptors.request.use(
  (axiosConfig: InternalAxiosRequestConfig) => {
    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token');
    
    // Set appropriate base URL based on endpoint
    if (axiosConfig.url?.startsWith('/auth')) {
      axiosConfig.baseURL = AUTH_API_URL;
    } else if (axiosConfig.url?.startsWith('/products')) {
      axiosConfig.baseURL = config.endpoints?.products || API_BASE_URL;
    } else if (axiosConfig.url?.startsWith('/categories')) {
      axiosConfig.baseURL = config.endpoints?.categories || API_BASE_URL;
    } else if (axiosConfig.url?.startsWith('/cart')) {
      axiosConfig.baseURL = config.endpoints?.cart || API_BASE_URL;
    }
    
    // Debug: log request information
    console.log(`Request to ${axiosConfig.baseURL}${axiosConfig.url}:`, {
      method: axiosConfig.method,
      hasToken: !!token,
      hasData: !!axiosConfig.data,
    });
    
    // Add token to headers if it exists
    if (token && axiosConfig.headers) {
      axiosConfig.headers.Authorization = `Bearer ${token}`;
    }
    
    return axiosConfig;
  },
  (error: AxiosError) => {
    console.error('Request error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`Response from ${response.config.url}: status ${response.status}`);
    // Return the response data directly
    return response.data;
  },
  (error: AxiosError) => {
    console.error('API Error:', error.message);
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - consider using a different API endpoint');
    }
    
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