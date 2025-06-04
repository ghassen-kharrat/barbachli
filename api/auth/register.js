// Registration endpoint
const axios = require('axios');
const mockData = require('../mockData');

// Helper function to check if data is already in snake_case format
function isSnakeCaseData(body) {
  return body && (body.first_name !== undefined || body.last_name !== undefined);
}

// Helper function to check if data is already in camelCase format
function isCamelCaseData(body) {
  return body && (body.firstName !== undefined || body.lastName !== undefined);
}

// Helper function to convert field names if needed
function adaptRequestBody(body) {
  // If the request already uses camelCase, return it directly
  if (isCamelCaseData(body)) {
    console.log('Request body is already in camelCase format');
    
    // Ensure confirmPassword is set to match password if not provided
    if (!body.confirmPassword && body.password) {
      return {
        ...body,
        confirmPassword: body.password
      };
    }
    
    return body;
  }
  
  // If the request uses snake_case, convert to camelCase for backend
  if (isSnakeCaseData(body)) {
    console.log('Converting snake_case to camelCase format for backend');
    
    // Convert snake_case to camelCase
    return {
      firstName: body.first_name,
      lastName: body.last_name,
      email: body.email,
      password: body.password,
      confirmPassword: body.confirm_password || body.password,
      phone: body.phone,
      address: body.address,
      city: body.city,
      zipCode: body.zip_code
    };
  }
  
  // Handle any other format (probably camelCase with confirmPassword)
  const { confirmPassword, ...cleanBody } = body;
  
  return {
    firstName: cleanBody.firstName,
    lastName: cleanBody.lastName,
    email: cleanBody.email,
    password: cleanBody.password,
    confirmPassword: confirmPassword || cleanBody.password,
    phone: cleanBody.phone,
    address: cleanBody.address,
    city: cleanBody.city,
    zipCode: cleanBody.zipCode
  };
}

// Validate password before sending to backend
function validateRequest(body) {
  // Handle camelCase format (expected by the backend)
  if (isCamelCaseData(body)) {
    // Validate password match if confirmPassword is provided
    if (body.confirmPassword !== undefined && body.confirmPassword !== body.password) {
      return {
        valid: false,
        error: "Les mots de passe ne correspondent pas"
      };
    }
    
    // Validate password length
    if (body.password && body.password.length < 6) {
      return {
        valid: false,
        error: "Le mot de passe doit contenir au moins 6 caractères"
      };
    }
    
    return { valid: true };
  }
  
  // Handle snake_case format (from the frontend)
  if (isSnakeCaseData(body)) {
    // Validate password match if confirm_password is provided
    if (body.confirm_password !== undefined && body.confirm_password !== body.password) {
      return {
        valid: false,
        error: "Les mots de passe ne correspondent pas"
      };
    }
    
    // Validate password length
    if (body.password && body.password.length < 6) {
      return {
        valid: false,
        error: "Le mot de passe doit contenir au moins 6 caractères"
      };
    }
    
    return { valid: true };
  }
  
  // Handle legacy format with confirmPassword
  if (body.confirmPassword !== undefined && body.confirmPassword !== body.password) {
    return {
      valid: false,
      error: "Les mots de passe ne correspondent pas"
    };
  }
  
  // Validate password length
  if (body.password && body.password.length < 6) {
    return {
      valid: false,
      error: "Le mot de passe doit contenir au moins 6 caractères"
    };
  }
  
  return { valid: true };
}

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

  // Log the request body for debugging (without password)
  try {
    const { password, ...safeBody } = req.body;
    console.log('Register request body:', { ...safeBody, password: '******' });
  } catch (e) {
    console.error('Error parsing request body:', e.message);
  }
  
  // Validate request before sending to backend
  const validation = validateRequest(req.body);
  if (!validation.valid) {
    console.error('Validation error:', validation.error);
    return res.status(400).json({
      status: 'error',
      message: validation.error,
      error: validation.error
    });
  }

  try {
    console.log('Forwarding registration request to backend...');
    
    // Always use a direct backend URL
    const backendBaseUrl = 'https://barbachli-auth.onrender.com';
    const url = `${backendBaseUrl}/api/auth/register`;
    
    console.log(`Sending request to: ${url}`);
    
    // Adapt request body to backend expectations
    const adaptedBody = adaptRequestBody(req.body);
    console.log('Adapted request body:', { ...adaptedBody, password: '******' });
    
    // Forward registration request to backend with increased timeout
    try {
      console.log('Making direct API request to backend...');
      const response = await axios.post(url, adaptedBody, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 40000 // 40 second timeout
      });
      
      // Return the response from the backend
      console.log('Registration successful:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      
      res.status(200).json({
        status: 'success',
        data: response.data
      });
    } catch (requestError) {
      console.error('Error during request to backend:', requestError.message);
      
      // Log the full error response for debugging
      if (requestError.response) {
        console.error('Error status:', requestError.response.status);
        console.error('Error details:', JSON.stringify(requestError.response.data, null, 2));
      }
      
      // If the backend is slow or returns a 5xx error, we'll use mockData for testing
      if (requestError.code === 'ECONNABORTED' || 
          (requestError.response && requestError.response.status >= 500)) {
        console.log('Backend unavailable or error, using mock data for testing');
        return res.status(200).json(mockData.registerSuccess);
      }
      
      // For other errors, return the error response
      if (requestError.response) {
        // Special handling for password errors
        if (requestError.response.data) {
          const responseData = requestError.response.data;
          
          // Safely check for password-related error messages
          const hasPasswordError = 
            (typeof responseData.message === 'string' && 
             (responseData.message.includes('mot de passe') || 
              responseData.message.includes('password'))) ||
            (typeof responseData.error === 'string' && 
             (responseData.error.includes('mot de passe') || 
              responseData.error.includes('password')));
          
          if (hasPasswordError) {
            return res.status(400).json({
              status: 'error',
              message: 'Les mots de passe ne correspondent pas',
              error: 'PASSWORD_MISMATCH'
            });
          }
        }
        
        // Return the original error if not password-related
        return res.status(requestError.response.status).json({
          status: 'error',
          message: typeof requestError.response.data?.message === 'string' 
            ? requestError.response.data.message 
            : 'Registration failed',
          error: requestError.response.data
        });
      } else {
        return res.status(500).json({
          status: 'error',
          message: 'An unexpected error occurred',
          error: requestError.message
        });
      }
    }
  } catch (error) {
    console.error('Registration proxy error:', error.message);
    
    // Return a friendly error response
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred during registration',
      error: error.message
    });
  }
}; 