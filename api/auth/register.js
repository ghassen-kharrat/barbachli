// Registration endpoint
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://iptgkvofawoqvykmkcrk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdGdrdm9mYXdvcXZ5a21rY3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NjkxMTMsImV4cCI6MjA2NDQ0NTExM30.oUsFpKGgeddXRU5lbaeaufBZ2wV7rnl1a0h2YEfC9b8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = async (req, res) => {
  console.log('Register endpoint called');
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
    console.error('Request body is undefined');
    
    // Return an error response
    return res.status(400).json({
      status: 'error',
      message: 'Request body is missing'
    });
  }

  // Extract registration data
  const { email, password, firstName, lastName, phone } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Email and password are required'
    });
  }

  try {
    console.log('Registering user with Supabase...');
    
    // Register the user with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone
        }
      }
    });
    
    if (authError) {
      console.error('Supabase auth error:', authError);
      return res.status(400).json({
        status: 'error',
        message: authError.message || 'Registration failed',
        error: authError
      });
    }
    
    console.log('User registered successfully with Supabase');
    
    // Add user to the profiles table
    if (authData.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            user_id: authData.user.id,
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            email: email
          }
        ]);
      
      if (profileError) {
        console.error('Error creating profile:', profileError);
      } else {
        console.log('User profile created successfully');
      }
    }
    
    // Return success response with auth data
    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          firstName: firstName,
          lastName: lastName,
          phone: phone
        },
        token: authData.session.access_token
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred during registration',
      error: error.message
    });
  }
}; 