// Auth check endpoint
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://iptgkvofawoqvykmkcrk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdGdrdm9mYXdvcXZ5a21rY3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NjkxMTMsImV4cCI6MjA2NDQ0NTExM30.oUsFpKGgeddXRU5lbaeaufBZ2wV7rnl1a0h2YEfC9b8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = async (req, res) => {
  console.log('Auth check endpoint called');
  
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
    console.log('Handling OPTIONS preflight request');
    res.status(200).end();
    return;
  }

  // If no authorization header is present, return 401
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log('No authorization header provided');
    return res.status(401).json({
      status: 'error',
      message: 'No authorization token provided'
    });
  }

  try {
    console.log('Validating session with Supabase...');
    
    // Extract token from authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Set the session directly in Supabase
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: ''  // We don't have refresh tokens in this implementation
    });
    
    if (sessionError) {
      console.error('Session validation error:', sessionError);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token',
        error: sessionError
      });
    }
    
    if (!sessionData.user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Get user profile data from Supabase
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', sessionData.user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }
    
    // Combine auth data with profile data
    const userData = {
      id: sessionData.user.id,
      email: sessionData.user.email,
      firstName: profileData?.first_name || sessionData.user.user_metadata?.first_name,
      lastName: profileData?.last_name || sessionData.user.user_metadata?.last_name,
      phone: profileData?.phone || sessionData.user.user_metadata?.phone,
      role: profileData?.role || 'user',
      token: token
    };
    
    console.log('Auth check successful');
    return res.status(200).json({
      status: 'success',
      data: userData
    });
  } catch (error) {
    console.error('Auth check error:', error.message);
    
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred during authentication check',
      error: error.message
    });
  }
}; 