// Configuration file for the application
const config = {
  // API URL - using barbachli-1 for general endpoints
  apiUrl: 'https://barbachli-1.onrender.com/api',
  
  // Auth API URL - using barbachli-auth for authentication
  authApiUrl: 'https://barbachli-auth.onrender.com/api',
  
  // Image base URL
  imageBaseUrl: 'https://barbachli-1.onrender.com/images',
  
  // Endpoints configuration
  endpoints: {
    auth: 'https://barbachli-auth.onrender.com/api',
    products: 'https://barbachli-1.onrender.com/api',
    categories: 'https://barbachli-1.onrender.com/api',
    cart: 'https://barbachli-1.onrender.com/api',
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

export default config; 