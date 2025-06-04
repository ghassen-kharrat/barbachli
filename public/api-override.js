// API URL Override Script - v2.0.0
(function() {
  // Force the API URL to be barbachli-auth.onrender.com regardless of configuration
  const CORRECT_API_URL = 'https://barbachli-auth.onrender.com/api';
  
  // Set the value in localStorage
  localStorage.setItem('api_url_override', CORRECT_API_URL);
  
  // Add an event listener to intercept XMLHttpRequest sends
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    let url = arguments[1];
    
    // Check if the URL contains barbachli-supabase.onrender.com and replace it
    if (typeof url === 'string' && url.includes('barbachli-supabase.onrender.com')) {
      url = url.replace('barbachli-supabase.onrender.com', 'barbachli-auth.onrender.com');
      console.warn('API URL CORRECTED:', url);
      arguments[1] = url;
    }
    
    return originalXHROpen.apply(this, arguments);
  };
  
  // Also intercept fetch requests
  const originalFetch = window.fetch;
  window.fetch = function() {
    let url = arguments[0];
    
    if (typeof url === 'string' && url.includes('barbachli-supabase.onrender.com')) {
      url = url.replace('barbachli-supabase.onrender.com', 'barbachli-auth.onrender.com');
      console.warn('Fetch URL CORRECTED:', url);
      arguments[0] = url;
    } else if (typeof url === 'object' && url.url && url.url.includes('barbachli-supabase.onrender.com')) {
      url.url = url.url.replace('barbachli-supabase.onrender.com', 'barbachli-auth.onrender.com');
      console.warn('Fetch Request URL CORRECTED:', url.url);
    }
    
    return originalFetch.apply(this, arguments);
  };
  
  console.log('API URL Override active - Using:', CORRECT_API_URL);
})(); 