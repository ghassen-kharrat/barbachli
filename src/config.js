// Configuration file for the application
const config = {
  // API URL - prioritize hardcoded backend URL for reliability
  apiUrl: 'https://barbachli-1.onrender.com/api',
  
  // Image base URL
  imageBaseUrl: 'https://barbachli-1.onrender.com/images',
  
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
  },
  
  // API timeouts
  timeouts: {
    default: 30000, // 30 seconds
    auth: 40000,    // 40 seconds for auth operations
  }
};

export default config; 