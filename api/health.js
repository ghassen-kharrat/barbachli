// Health check endpoint
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request for preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Use environment variable for backend URL if available, otherwise use hardcoded URL
  const backendBaseUrl = process.env.BACKEND_URL || 'https://barbachli-1.onrender.com';
  const backendHealthUrl = `${backendBaseUrl}/api`;

  // Initialize result object
  const result = {
    status: 'ok',
    message: 'API health check',
    timestamp: new Date().toISOString(),
    components: {
      frontend: {
        status: 'online',
        url: req.headers.host || 'vercel'
      },
      backend: {
        status: 'checking...',
        url: backendHealthUrl
      },
      database: {
        status: 'checking...',
        url: process.env.SUPABASE_URL || 'https://iptgkvofawoqvykmkcrk.supabase.co'
      }
    }
  };

  try {
    // Check backend API health with timeout
    const backendResponse = await axios.get(backendHealthUrl, {
      timeout: 5000
    }).catch(error => {
      console.error('Backend health check error:', error.message);
      result.components.backend.status = 'offline';
      result.components.backend.error = error.message;
      return null;
    });
    
    if (backendResponse && backendResponse.status === 200) {
      result.components.backend.status = 'online';
      result.components.backend.version = backendResponse.data?.version || 'unknown';
    }

    // Check Supabase connection
    const supabaseUrl = process.env.SUPABASE_URL || 'https://iptgkvofawoqvykmkcrk.supabase.co';
    const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdGdrdm9mYXdvcXZ5a21rY3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NjkxMTMsImV4cCI6MjA2NDQ0NTExM30.oUsFpKGgeddXRU5lbaeaufBZ2wV7rnl1a0h2YEfC9b8';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('products').select('count').maybeSingle();
    
    if (error) {
      console.error('Supabase health check error:', error);
      result.components.database.status = 'error';
      result.components.database.error = error.message;
    } else {
      result.components.database.status = 'online';
    }
    
    // Determine overall status
    const allComponentsOnline = Object.values(result.components).every(c => c.status === 'online');
    result.status = allComponentsOnline ? 'ok' : 'degraded';
    result.message = allComponentsOnline 
      ? 'All systems operational'
      : 'Some components are experiencing issues';
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Health check error:', error.message);
    
    result.status = 'error';
    result.message = 'Health check encountered an error';
    result.error = error.message;
    
    res.status(500).json(result);
  }
}; 