// Script to update admin user password in Supabase
const axios = require('axios');

// Create a direct axios instance for the backend
const backendApi = axios.create({
  baseURL: 'https://barbachli-auth.onrender.com',
  timeout: 40000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Create Supabase API client (direct API)
const supabaseApi = axios.create({
  baseURL: 'https://ptgkvovawoqvkmkcr.supabase.co/auth/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Z2t2b2Zhd29xdnlrbWtjciIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzA3MDIzODIzLCJleHAiOjIwMjI1OTk4MjN9.UJM7RJcT1eCHhV8tV75a7n03RIQZIPiuFzxNFrY1Nbs',
  }
});

// User info from the screenshot
const adminUser = {
  id: 1, // From the table in the screenshot
  email: 'admin@example.com',
  oldPassword: '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxx', // Hidden password hash in screenshot
  newPassword: 'Password123!'
};

// Function to update user password in Supabase Auth
async function updatePasswordWithSupabaseAuth() {
  console.log('Attempting to update password for user:', adminUser.email);
  
  try {
    // First try using admin endpoint if available
    console.log('Attempting to use admin API to update password...');
    
    // Note: This might not work without admin key, but it's worth trying
    const response = await supabaseApi.put('/admin/users/' + adminUser.id, {
      password: adminUser.newPassword
    });
    
    console.log('✅ Password update successful!');
    console.log('Status:', response.status);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Admin API password update failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error message:', error.response.data?.message || 'Unknown error');
    } else {
      console.error('Error:', error.message);
    }
    
    // Try backend API if available
    try {
      console.log('\nTrying backend API to update password...');
      
      const backendResponse = await backendApi.post('/api/auth/reset-password', {
        email: adminUser.email,
        password: adminUser.newPassword,
        confirmPassword: adminUser.newPassword
      });
      
      console.log('✅ Backend password reset successful!');
      console.log('Status:', backendResponse.status);
      
      return { success: true };
    } catch (backendError) {
      console.error('❌ Backend password reset failed:');
      
      if (backendError.response) {
        console.error('Status:', backendError.response.status);
        console.error('Error message:', backendError.response.data?.message || 'Unknown error');
      } else {
        console.error('Error:', backendError.message);
      }
    }
    
    // Try alternative admin approach
    console.log('\nSuggested alternative approach:');
    console.log('1. Login to Supabase dashboard: https://supabase.com/dashboard/project/ptgkvovawoqvymkcr');
    console.log('2. Go to Authentication > Users');
    console.log('3. Find the admin user and use the "Reset password" option');
    console.log('4. Enter the new password: Password123!');
    
    return { success: false, error };
  }
}

// Execute the password update
updatePasswordWithSupabaseAuth().catch(console.error); 