// Configuration file for the application
const config = {
  // API URL - use relative URL in production, full URL in development
  apiUrl: process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'https://barbachli-api.onrender.com/api',
  
  // Other configuration options
  imageBaseUrl: process.env.NODE_ENV === 'production'
    ? '/images'
    : 'https://barbachli-api.onrender.com/images',
  
  // Feature flags
  features: {
    enableLogging: true,
    enableCache: true,
  }
};

export default config; 