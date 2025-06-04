// Simple test for the mock API implementation
const fs = require('fs');
const path = require('path');

// Path to the mock API files
const apiDir = path.join(__dirname, 'api');
const authDir = path.join(apiDir, 'auth');

console.log('=== CHECKING MOCK API FILES ===');

// Check if API directory exists
if (!fs.existsSync(apiDir)) {
  console.error('❌ API directory not found:', apiDir);
  process.exit(1);
}

// List files in the API directory
console.log('\nFiles in API directory:');
fs.readdirSync(apiDir).forEach(file => {
  console.log(`- ${file}`);
});

// Check if auth directory exists
if (fs.existsSync(authDir)) {
  console.log('\nFiles in auth directory:');
  fs.readdirSync(authDir).forEach(file => {
    console.log(`- ${file}`);
  });
}

// Read and print the content of auth-login.js
const loginFilePath = path.join(authDir, 'auth-login.js');
if (fs.existsSync(loginFilePath)) {
  console.log('\nContent of auth-login.js:');
  const content = fs.readFileSync(loginFilePath, 'utf8');
  console.log(content.substring(0, 500) + '...');
  
  try {
    // Try to require it
    console.log('\nTrying to require auth-login.js...');
    const loginModule = require(loginFilePath);
    console.log('✅ Successfully required the module.');
    
    // Create a simple test
    console.log('\nTesting the login module...');
    
    // Mock request and response
    const req = {
      method: 'POST',
      body: {
        email: 'admin@example.com',
        password: 'Password123!'
      }
    };
    
    const res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.data = data;
        return this;
      },
      setHeader: function() { return this; },
      end: function() { return this; },
      statusCode: 200,
      data: null
    };
    
    // Call the module
    loginModule(req, res);
    
    // Check the results
    console.log('Status code:', res.statusCode);
    console.log('Response data:', JSON.stringify(res.data, null, 2));
    
    if (res.statusCode === 200 && res.data && res.data.status === 'success') {
      console.log('✅ Login test passed!');
    } else {
      console.log('❌ Login test failed.');
    }
  } catch (error) {
    console.error('❌ Error requiring the module:', error.message);
  }
} else {
  console.error('❌ auth-login.js not found:', loginFilePath);
}

// Next steps
console.log('\n=== NEXT STEPS ===');
console.log('1. Deploy these mock API endpoints to Vercel');
console.log('2. Update your auth.api.ts file to use the deployed endpoints');
console.log('3. Use the admin credentials: admin@example.com / Password123!');
console.log('4. Check for any environment variables needed in your Vercel deployment');
console.log('5. Verify the connection works in your frontend application'); 