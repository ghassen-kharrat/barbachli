// Configuration file for the application - VERSION MARKER: v2.0.0

// Check if we have an API URL override in localStorage
const API_URL_OVERRIDE = typeof localStorage !== 'undefined' ? localStorage.getItem('api_url_override') : null;

// If API_URL_OVERRIDE exists, use it; otherwise, use the environment variable or default
const apiUrl = API_URL_OVERRIDE || process.env.REACT_APP_API_URL || 'https://barbachli-auth.onrender.com/api';
const authApiUrl = API_URL_OVERRIDE || process.env.REACT_APP_AUTH_API_URL || 'https://barbachli-auth.onrender.com/api';

const config = {
  // API URL - using barbachli-auth for all endpoints
  apiUrl,
  
  // Auth API URL - using barbachli-auth for authentication
  authApiUrl,
  
  // Image base URL
  imageBaseUrl: 'https://barbachli-auth.onrender.com/images',
  
  // Endpoints configuration (all using barbachli-auth)
  endpoints: {
    auth: apiUrl,
    products: apiUrl,
    categories: apiUrl,
    cart: apiUrl,
  },
  
  // Supabase configuration - these will be used by the frontend for direct Supabase client operations if needed
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL || 'https://iptgkvofawoqvykmkcrk.supabase.co',
    anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdGdrdm9mYXdvcXZ5a21rY3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NjkxMTMsImV4cCI6MjA2NDQ0NTExM30.oUsFpKGgeddXRU5lbaeaufBZ2wV7rnl1a0h2YEfC9b8',
  },
  
  // Feature flags
  features: {
    enableLogging: true,
    enableCache: true,
    useDirectSupabase: false, // Set to true if you want to use Supabase client directly in the frontend
    useDirectAuth: true, // Set to true to use direct auth API calls (bypassing Vercel functions)
  },
  
  // API timeouts
  timeouts: {
    default: 30000, // 30 seconds
    auth: 40000,    // 40 seconds for auth operations
  }
};

// Log config for debugging - VERSION MARKER: v2.0.0
console.log('CONFIG LOADED:', {
  apiUrl: config.apiUrl,
  authApiUrl: config.authApiUrl,
  env: process.env.NODE_ENV,
  reactAppApiUrl: process.env.REACT_APP_API_URL,
  apiUrlOverride: API_URL_OVERRIDE
});

export default config; 