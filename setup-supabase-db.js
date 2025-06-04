const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://iptgkvofawoqvykmkcrk.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdGdrdm9mYXdvcXZ5a21rY3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NjkxMTMsImV4cCI6MjA2NDQ0NTExM30.oUsFpKGgeddXRU5lbaeaufBZ2wV7rnl1a0h2YEfC9b8';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log(`Setting up database at: ${supabaseUrl}`);

// Generate slug from name
function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function setupDatabase() {
  try {
    // 1. Create categories table and add sample categories first
    console.log('Adding sample categories...');
    const sampleCategories = [
      { name: 'Laptops', slug: 'laptops', description: 'Portable computers', parent_id: null, display_order: 1, is_active: true },
      { name: 'Smartphones', slug: 'smartphones', description: 'Mobile phones', parent_id: null, display_order: 2, is_active: true },
      { name: 'Audio', slug: 'audio', description: 'Sound equipment', parent_id: null, display_order: 3, is_active: true }
    ];
    
    // Insert categories and store their actual IDs
    const categoryIds = {};
    
    for (const category of sampleCategories) {
      const { data: insertedCategory, error: categoryError } = await supabase
        .from('categories')
        .upsert(category, { onConflict: 'slug' })
        .select('id, name')
        .single();
      
      if (categoryError) {
        console.error(`Error adding category "${category.name}":`, categoryError);
      } else {
        console.log(`✅ Category "${category.name}" added or updated with ID: ${insertedCategory.id}`);
        categoryIds[category.name] = insertedCategory.id;
      }
    }
    console.log('✅ Categories setup complete');
    
    // 2. Create products table and add sample products
    console.log('Adding sample products...');
    const sampleProducts = [
      {
        name: 'Laptop Dell XPS 13',
        description: 'Powerful ultrabook with Intel Core i7',
        price: 1299.99,
        discount_price: 1199.99,
        stock: 10,
        category_id: categoryIds['Laptops']
      },
      {
        name: 'Smartphone Samsung Galaxy S21',
        description: 'Latest Samsung flagship phone',
        price: 899.99,
        discount_price: 849.99,
        stock: 15,
        category_id: categoryIds['Smartphones']
      },
      {
        name: 'Headphones Sony WH-1000XM4',
        description: 'Noise cancelling wireless headphones',
        price: 349.99,
        discount_price: 299.99,
        stock: 20,
        category_id: categoryIds['Audio']
      }
    ];
    
    // Store product IDs for images
    const productIds = {};
    
    for (const product of sampleProducts) {
      // Skip products with missing category IDs
      if (!product.category_id) {
        console.warn(`Skipping product "${product.name}" due to missing category ID`);
        continue;
      }
      
      const { data: insertedProduct, error: productError } = await supabase
        .from('products')
        .upsert(product, { onConflict: 'name' })
        .select('id, name')
        .single();
      
      if (productError) {
        console.error(`Error adding product "${product.name}":`, productError);
      } else {
        console.log(`✅ Product "${product.name}" added or updated with ID: ${insertedProduct.id}`);
        productIds[product.name] = insertedProduct.id;
      }
    }
    console.log('✅ Products setup complete');
    
    // 3. Add product images
    console.log('Adding product images...');
    const productImageData = [
      {
        product_name: 'Laptop Dell XPS 13',
        image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3',
        is_primary: true
      },
      {
        product_name: 'Smartphone Samsung Galaxy S21',
        image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3',
        is_primary: true
      },
      {
        product_name: 'Headphones Sony WH-1000XM4',
        image_url: 'https://images.unsplash.com/photo-1599669454699-248893623440?ixlib=rb-4.0.3',
        is_primary: true
      }
    ];
    
    for (const imageData of productImageData) {
      const productId = productIds[imageData.product_name];
      
      // Skip images with missing product IDs
      if (!productId) {
        console.warn(`Skipping image for "${imageData.product_name}" due to missing product ID`);
        continue;
      }
      
      const image = {
        product_id: productId,
        image_url: imageData.image_url,
        is_primary: imageData.is_primary
      };
      
      const { error: imageError } = await supabase
        .from('product_images')
        .upsert(image);
      
      if (imageError) {
        console.error(`Error adding product image for "${imageData.product_name}":`, imageError);
      } else {
        console.log(`✅ Product image added for "${imageData.product_name}"`);
      }
    }
    console.log('✅ Product images setup complete');
    
    // 4. Create admin user
    console.log('Creating admin user...');
    
    // First register with Supabase Auth
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';
    
    // Suppress errors for already registered users
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: {
            first_name: 'Admin',
            last_name: 'User'
          }
        }
      });
      
      if (authError && !authError.message.includes('already registered')) {
        console.error('Error creating admin auth:', authError);
      } else {
        console.log('✅ Admin auth created or already exists');
      }
    } catch (err) {
      console.warn('Auth signup error (might be rate limited):', err.message);
    }
    
    // Then create user record directly in database
    const adminUserData = {
      email: adminEmail,
      password: bcrypt.hashSync(adminPassword, 10),
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      is_active: true
    };
    
    const { error: usersError } = await supabase
      .from('users')
      .upsert(adminUserData, { onConflict: 'email' });
    
    if (usersError) {
      console.error('Error creating admin user:', usersError);
    } else {
      console.log('✅ Admin user created or updated');
    }
    
    // 5. Create test user
    console.log('Creating test user...');
    const testEmail = 'test@example.com';
    const testPassword = 'Password123!';
    
    // Suppress errors for already registered users
    try {
      const { data: testAuthData, error: testAuthError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User'
          }
        }
      });
      
      if (testAuthError && !testAuthError.message.includes('already registered') && !testAuthError.message.includes('rate limit')) {
        console.error('Error creating test auth:', testAuthError);
      } else {
        console.log('✅ Test auth created or already exists');
      }
    } catch (err) {
      console.warn('Auth signup error (might be rate limited):', err.message);
    }
    
    // Then create user record directly in database
    const testUserData = {
      email: testEmail,
      password: bcrypt.hashSync(testPassword, 10),
      first_name: 'Test',
      last_name: 'User',
      role: 'user',
      is_active: true
    };
    
    const { error: testUserError } = await supabase
      .from('users')
      .upsert(testUserData, { onConflict: 'email' });
    
    if (testUserError) {
      console.error('Error creating test user:', testUserError);
    } else {
      console.log('✅ Test user created or updated');
    }
    
    console.log('\nDatabase setup completed successfully!');
    console.log('\nTest credentials:');
    console.log('- Admin: admin@example.com / admin123');
    console.log('- User: test@example.com / Password123!');
    
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase(); 