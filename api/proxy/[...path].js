// Generic API proxy endpoint to forward requests to the backend
const axios = require('axios');

// Set debug mode for detailed logging
const DEBUG = true;

module.exports = async (req, res) => {
  // Extract the path from the request
  const path = req.query.path || [];
  const fullPath = path.join('/');
  
  if (DEBUG) {
    console.log(`API Proxy called for path: ${fullPath}`);
    console.log('Request method:', req.method);
  }
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request for preflight
  if (req.method === 'OPTIONS') {
    if (DEBUG) console.log('Handling OPTIONS preflight request');
    res.status(200).end();
    return;
  }

  try {
    // Direct connection to backend
    const backendBaseUrl = 'https://barbachli-1.onrender.com';
    const url = `${backendBaseUrl}/api/${fullPath}`;
    
    if (DEBUG) {
      console.log(`Forwarding ${req.method} request to: ${url}`);
      // Log request body if present (excluding passwords)
      if (req.body) {
        try {
          const { password, ...safeData } = req.body;
          console.log('Request body:', { ...safeData, password: password ? '******' : undefined });
        } catch (e) {
          console.log('Request body:', req.body);
        }
      }
    }
    
    // Extract headers from the original request
    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'Accept': req.headers['accept'] || 'application/json',
    };
    
    // Forward authorization header if present
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }
    
    // Forward the request to the backend
    const response = await axios({
      method: req.method,
      url,
      data: ['GET', 'HEAD'].includes(req.method.toUpperCase()) ? undefined : req.body,
      headers,
      timeout: 30000 // 30 second timeout
    });
    
    // Return the response from the backend
    if (DEBUG) {
      console.log(`Backend response status: ${response.status}`);
    }
    
    // Send the successful response with the same status code
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`API Proxy error for ${fullPath}:`, error.message);
    
    // Detailed error logging
    if (DEBUG) {
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.error('No response received');
      }
    }
    
    // Return appropriate error response
    if (error.response) {
      // Forward the status and response from the backend
      res.status(error.response.status).json(error.response.data);
    } else {
      // For network errors or timeouts
      res.status(503).json({
        status: 'error',
        message: 'The API service is currently unavailable. Please try again later.',
        error: error.message
      });
    }
  }
}; 