// Script to test Supabase connection and verify admin user
const { createClient } = require('@supabase/supabase-js');

// Add fetch polyfill for Node.js environment
global.fetch = require('node-fetch');

// Supabase configuration
const SUPABASE_URL = 'https://ptgkvovawoqvymkcr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Z2t2b2Zhd29xdnlrbWtjciIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzA3MDIzODIzLCJleHAiOjIwMjI1OTk4MjN9.UJM7RJcT1eCHhV8tV75a7n03RIQZIPiuFzxNFrY1Nbs';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Test credentials
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'Password123!';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'Password123!';

// Test Supabase connection
async function testSupabaseConnection() {
  console.log('=== TESTING SUPABASE CONNECTION ===');
  
  try {
    // Basic connection test
    const { data, error } = await supabase.from('products').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection error:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection exception:', error.message);
    return false;
  }
}

// Test admin login
async function testAdminLogin() {
  console.log('\n=== TESTING ADMIN LOGIN ===');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    if (error) {
      console.error('❌ Admin login error:', error.message);
      return false;
    }
    
    console.log('✅ Admin login successful');
    console.log('User ID:', data.user.id);
    console.log('User Email:', data.user.email);
    console.log('Session Token:', data.session.access_token.substring(0, 10) + '...');
    
    return data.session.access_token;
  } catch (error) {
    console.error('❌ Admin login exception:', error.message);
    return false;
  }
}

// Get user profile from users table
async function getUserProfile(email) {
  console.log(`\n=== GETTING USER PROFILE FOR ${email} ===`);
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('❌ User profile error:', error.message);
      return null;
    }
    
    if (!data) {
      console.error('❌ User profile not found');
      return null;
    }
    
    console.log('✅ User profile found');
    console.log('Profile:', data);
    
    return data;
  } catch (error) {
    console.error('❌ User profile exception:', error.message);
    return null;
  }
}

// Create test user if needed
async function ensureTestUser() {
  console.log('\n=== ENSURING TEST USER EXISTS ===');
  
  try {
    // Check if test user exists
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (!error) {
      console.log('✅ Test user already exists');
      return true;
    }
    
    // Create test user
    console.log('Creating test user...');
    
    const { data: newUser, error: createError } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User'
        }
      }
    });
    
    if (createError) {
      console.error('❌ Test user creation error:', createError.message);
      return false;
    }
    
    console.log('✅ Test user created');
    console.log('User ID:', newUser.user.id);
    
    // Create user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          email: TEST_EMAIL,
          first_name: 'Test',
          last_name: 'User',
          role: 'user',
          is_active: true
        }
      ])
      .select()
      .single();
    
    if (userError) {
      console.error('❌ Test user profile creation error:', userError.message);
    } else {
      console.log('✅ Test user profile created');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Test user creation exception:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  // Test connection
  const connected = await testSupabaseConnection();
  if (!connected) {
    console.error('\n❌ Supabase connection failed. Please check your credentials and network.');
    return;
  }
  
  // Test admin login
  const adminToken = await testAdminLogin();
  if (!adminToken) {
    console.log('\nCreating admin user...');
    
    // Create admin user
    const { data, error } = await supabase.auth.signUp({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      options: {
        data: {
          first_name: 'Admin',
          last_name: 'User'
        }
      }
    });
    
    if (error) {
      console.error('❌ Admin user creation error:', error.message);
    } else {
      console.log('✅ Admin user created');
      
      // Create admin profile in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          {
            email: ADMIN_EMAIL,
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin',
            is_active: true
          }
        ])
        .select()
        .single();
      
      if (userError) {
        console.error('❌ Admin profile creation error:', userError.message);
      } else {
        console.log('✅ Admin profile created');
      }
    }
  } else {
    // Get admin profile
    await getUserProfile(ADMIN_EMAIL);
    
    // Ensure test user exists
    await ensureTestUser();
  }
  
  console.log('\n=== TEST SUMMARY ===');
  console.log('1. Supabase connection: ' + (connected ? '✅ WORKING' : '❌ FAILED'));
  console.log('2. Admin user authentication: ' + (adminToken ? '✅ WORKING' : '❌ FAILED'));
  
  if (connected && adminToken) {
    console.log('\n✅ All systems are operational!');
    console.log('\nNext steps:');
    console.log('1. Start the backend server: node server.js');
    console.log('2. Try logging in to the frontend with:');
    console.log('   - Admin: admin@example.com / Password123!');
    console.log('   - Test user: test@example.com / Password123!');
  } else {
    console.log('\n❌ Some tests failed. Please check the errors above and fix the issues.');
  }
}

// Run the tests
runTests().catch(console.error); 