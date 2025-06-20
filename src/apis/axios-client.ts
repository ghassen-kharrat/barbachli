import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import config from '../config';

// VERSION MARKER: v2.0.0
// Force using barbachli-auth API URL with multiple fallbacks
const getApiUrl = () => {
  // First check localStorage override
  const override = typeof localStorage !== 'undefined' ? localStorage.getItem('api_url_override') : null;
  if (override) {
    console.log('Using API URL from localStorage override:', override);
    return override;
  }
  
  // Then check environment variable
  if (process.env.REACT_APP_API_URL) {
    console.log('Using API URL from environment variable:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // Hardcoded fallback - ALWAYS use barbachli-auth
  const hardcodedUrl = 'https://barbachli-auth.onrender.com/api';
  console.log('Using hardcoded API URL:', hardcodedUrl);
  return hardcodedUrl;
};

const API_BASE_URL = getApiUrl();
const AUTH_API_URL = getApiUrl();

console.log('FINAL API CONFIGURATION:');
console.log('- API base URL:', API_BASE_URL);
console.log('- Auth API URL:', AUTH_API_URL);
console.log('- From config.js:', config.apiUrl);

// Ensure URL always uses the correct domain
const correctUrl = (url: string) => {
  if (url.includes('barbachli-supabase.onrender.com')) {
    console.warn('❌ Incorrect API URL detected, fixing:', url);
    return url.replace('barbachli-supabase.onrender.com', 'barbachli-auth.onrender.com');
  }
  return url;
};

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
    
    // Ensure URL always uses the correct domain
    if (axiosConfig.url) {
      axiosConfig.url = correctUrl(axiosConfig.url);
    }
    
    if (axiosConfig.baseURL) {
      axiosConfig.baseURL = correctUrl(axiosConfig.baseURL);
    }
    
    // Set appropriate base URL based on endpoint
    if (axiosConfig.url?.startsWith('/auth')) {
      axiosConfig.baseURL = AUTH_API_URL;
    } else if (axiosConfig.url?.startsWith('/products')) {
      axiosConfig.baseURL = API_BASE_URL;
    } else if (axiosConfig.url?.startsWith('/categories')) {
      axiosConfig.baseURL = API_BASE_URL;
    } else if (axiosConfig.url?.startsWith('/cart')) {
      axiosConfig.baseURL = API_BASE_URL;
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
    
    // Don't redirect on 401 errors anymore since we allow browsing without authentication
    if (error.response && error.response.status === 401) {
      // Just log the error
      console.log('Authentication error, but continuing as guest user');
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient; 