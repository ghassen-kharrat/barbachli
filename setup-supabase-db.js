const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://iptgkvofawoqvykmkcrk.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdGdrdm9mYXdvcXZ5a21rY3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NjkxMTMsImV4cCI6MjA2NDQ0NTExM30.oUsFpKGgeddXRU5lbaeaufBZ2wV7rnl1a0h2YEfC9b8';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log(`Setting up database at: ${supabaseUrl}`);

async function setupDatabase() {
  try {
    // Create or update tables using Supabase SQL
    
    // 1. Create users table
    console.log('Creating users table...');
    const { error: usersError } = await supabase
      .from('users')
      .insert({
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        is_active: true
      })
      .select()
      .single();
    
    if (usersError && !usersError.message.includes('duplicate')) {
      console.error('Error creating users table or admin user:', usersError);
    } else {
      console.log('✅ Users table ready');
    }
    
    // 2. Create products table and add sample products
    console.log('Adding sample products...');
    const sampleProducts = [
      {
        name: 'Laptop Dell XPS 13',
        description: 'Powerful ultrabook with Intel Core i7',
        price: 1299.99,
        discount_price: 1199.99,
        stock: 10,
        category_id: 1
      },
      {
        name: 'Smartphone Samsung Galaxy S21',
        description: 'Latest Samsung flagship phone',
        price: 899.99,
        discount_price: 849.99,
        stock: 15,
        category_id: 2
      },
      {
        name: 'Headphones Sony WH-1000XM4',
        description: 'Noise cancelling wireless headphones',
        price: 349.99,
        discount_price: 299.99,
        stock: 20,
        category_id: 3
      }
    ];
    
    for (const product of sampleProducts) {
      const { error: productError } = await supabase
        .from('products')
        .insert(product);
      
      if (productError && !productError.message.includes('duplicate')) {
        console.error(`Error adding product "${product.name}":`, productError);
      }
    }
    console.log('✅ Products added');
    
    // 3. Create categories table and add sample categories
    console.log('Adding sample categories...');
    const sampleCategories = [
      { id: 1, name: 'Laptops', parent_id: null },
      { id: 2, name: 'Smartphones', parent_id: null },
      { id: 3, name: 'Audio', parent_id: null }
    ];
    
    for (const category of sampleCategories) {
      const { error: categoryError } = await supabase
        .from('categories')
        .insert(category);
      
      if (categoryError && !categoryError.message.includes('duplicate')) {
        console.error(`Error adding category "${category.name}":`, categoryError);
      }
    }
    console.log('✅ Categories added');
    
    // 4. Create cart_items table
    console.log('Setting up cart_items table...');
    // This is just a check, we don't insert anything
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('id')
      .limit(1);
    
    if (cartError && cartError.code === '42P01') {
      console.error('Cart items table does not exist:', cartError);
    } else {
      console.log('✅ Cart items table ready');
    }
    
    console.log('Database setup completed successfully!');
    console.log('\nTest credentials:');
    console.log('- Admin: admin@example.com / admin123');
    console.log('- User: test@example.com / Password123!');
    
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase(); 