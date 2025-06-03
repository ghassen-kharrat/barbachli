// Login endpoint
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://iptgkvofawoqvykmkcrk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdGdrdm9mYXdvcXZ5a21rY3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NjkxMTMsImV4cCI6MjA2NDQ0NTExM30.oUsFpKGgeddXRU5lbaeaufBZ2wV7rnl1a0h2YEfC9b8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = async (req, res) => {
  console.log('Login endpoint called');
  console.log('Request method:', req.method);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
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

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Debug raw request
  console.log('Raw request body:', req.body);

  // Ensure we have a request body
  if (!req.body) {
    console.error('Login request body is undefined');
    return res.status(400).json({
      status: 'error',
      message: 'Request body is missing'
    });
  }

  // Extract login credentials
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Email and password are required'
    });
  }

  try {
    console.log('Authenticating with Supabase...');
    
    // Sign in with email and password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError) {
      console.error('Supabase auth error:', authError);
      return res.status(401).json({
        status: 'error',
        message: authError.message || 'Invalid email or password',
        error: authError
      });
    }
    
    if (!authData.user || !authData.session) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication failed'
      });
    }
    
    console.log('Authentication successful');
    
    // Get user profile data from Supabase
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }
    
    // Combine auth data with profile data
    const userData = {
      id: authData.user.id,
      email: authData.user.email,
      firstName: profileData?.first_name || authData.user.user_metadata?.first_name,
      lastName: profileData?.last_name || authData.user.user_metadata?.last_name,
      phone: profileData?.phone || authData.user.user_metadata?.phone,
      role: profileData?.role || 'user',
      token: authData.session.access_token
    };
    
    // Return success response
    return res.status(200).json({
      status: 'success',
      data: userData
    });
  } catch (error) {
    console.error('Login error:', error.message);
    
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred during login',
      error: error.message
    });
  }
}; 