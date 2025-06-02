const { createClient } = require('@supabase/supabase-js');

async function testSupabase() {
  // Initialize Supabase client
  const supabaseUrl = 'https://iptgkvofawoqvykmkcrk.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdGdrdm9mYXdvcXZ5a21rY3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NjkxMTMsImV4cCI6MjA2NDQ0NTExM30.oUsFpKGgeddXRU5lbaeaufBZ2wV7rnl1a0h2YEfC9b8';
  
  console.log('Initializing Supabase client...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('\n1. Testing products table:');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(3);
    
    if (productsError) {
      console.error('❌ Products query failed:', productsError);
    } else {
      console.log(`✅ Found ${products.length} products`);
      if (products.length > 0) {
        console.log('Sample product:', products[0]);
      }
    }
    
    console.log('\n2. Testing users table:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .limit(3);
    
    if (usersError) {
      console.error('❌ Users query failed:', usersError);
    } else {
      console.log(`✅ Found ${users.length} users`);
      if (users.length > 0) {
        // Hide full email for privacy
        const sampleUser = {...users[0]};
        if (sampleUser.email) {
          sampleUser.email = sampleUser.email.replace(/(.{3}).*(@.*)/, '$1***$2');
        }
        console.log('Sample user:', sampleUser);
      }
    }
    
    console.log('\n3. Testing authentication:');
    const { data: session, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Auth check failed:', authError);
    } else {
      console.log('✅ Auth check successful');
      console.log('Session:', session ? 'Active' : 'None');
    }
    
    console.log('\nAll tests completed!');
    
  } catch (error) {
    console.error('Error during tests:', error);
  }
}

// Run the test
testSupabase().catch(err => {
  console.error('Unexpected error:', err);
}); 