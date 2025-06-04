// Mock API endpoint for /banner
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle the actual request
  if (req.method === 'GET') {
    return res.status(200).json({
  "status": "success",
  "message": "Mock data"
});
  }
  
  // For POST requests (like login/register)
  if (req.method === 'POST') {
    // For login endpoint
    if ('/banner' === '/auth/login') {
      // Check credentials in a very simple way
      const { email, password } = req.body;
      
      // Admin credentials
      if (email === 'admin@example.com' && password === 'Password123!') {
        return res.status(200).json({
          status: 'success',
          data: {
            success: true,
            data: {
              id: 1,
              firstName: 'Admin',
              lastName: 'User',
              email: 'admin@example.com',
              role: 'admin',
              token: 'mock-jwt-token-for-admin-user'
            }
          }
        });
      }
      
      // Test credentials
      if (email === 'test@example.com' && password === 'Password123!') {
        return res.status(200).json({
          status: 'success',
          data: {
            success: true,
            data: {
              id: 2,
              firstName: 'Test',
              lastName: 'User',
              email: 'test@example.com',
              role: 'user',
              token: 'mock-jwt-token-for-test-user'
            }
          }
        });
      }
      
      // Invalid credentials
      return res.status(401).json({
        status: 'error',
        message: 'Invalid login credentials'
      });
    }
    
    // Generic response for other POST endpoints
    return res.status(200).json({
      status: 'success',
      message: 'Operation completed successfully'
    });
  }
  
  // Default response for unsupported methods
  return res.status(405).json({
    status: 'error',
    message: 'Method not allowed'
  });
};