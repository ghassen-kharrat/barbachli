// Admin Helper Script for Barbachli E-commerce - v2.0.0
(function() {
  // Store original console log
  const originalLog = console.log;
  
  // Create helper object
  window.BarbachliHelper = {
    // Helper information
    version: 'v2.0.0',
    apiUrl: 'https://barbachli-auth.onrender.com/api',
    
    // Log function
    log: function(...args) {
      originalLog('%c[Barbachli Helper]', 'color: #3498db; font-weight: bold;', ...args);
    },
    
    // Create a test token for admin access
    createAdminToken: function() {
      // Create a simple fake JWT format token (for testing purposes only)
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        sub: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      }));
      const signature = btoa('test-signature');
      
      return `${header}.${payload}.${signature}`;
    },
    
    // Set admin user in localStorage
    setupAdminUser: function() {
      const adminUser = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        phone: '123-456-7890',
        address: '123 Admin St',
        city: 'Adminville',
        zipCode: '12345',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem('user_data', JSON.stringify(adminUser));
      this.log('Admin user set up:', adminUser);
      return adminUser;
    },
    
    // Get current user
    getCurrentUser: function() {
      try {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
      } catch (e) {
        this.log('Error getting user data:', e);
        return null;
      }
    },
    
    // Make current user an admin
    makeAdmin: function() {
      let user = this.getCurrentUser();
      
      if (!user) {
        this.log('No user found, creating admin user');
        user = this.setupAdminUser();
      } else {
        user.role = 'admin';
        localStorage.setItem('user_data', JSON.stringify(user));
        this.log('User upgraded to admin:', user);
      }
      
      // Ensure token exists
      if (!localStorage.getItem('auth_token')) {
        const token = this.createAdminToken();
        localStorage.setItem('auth_token', token);
        this.log('Admin token created');
      }
      
      return user;
    },
    
    // Fix cart issues
    fixCart: function() {
      const emptyCart = {
        status: 'success',
        data: {
          id: 0,
          userId: 1,
          items: [],
          totalItems: 0,
          totalAmount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
      
      localStorage.setItem('cart_data', JSON.stringify(emptyCart));
      this.log('Cart reset to empty state');
      return emptyCart;
    },
    
    // Fix all issues at once
    fixAll: function() {
      this.log('Starting complete fix...');
      
      // Set API URL
      localStorage.setItem('api_url_override', this.apiUrl);
      this.log('API URL set to:', this.apiUrl);
      
      // Create admin user
      const user = this.makeAdmin();
      
      // Fix cart
      const cart = this.fixCart();
      
      this.log('All fixes applied. Please refresh the page.');
      return { user, cart };
    },
    
    // Show help information
    help: function() {
      this.log('Barbachli Helper Commands:');
      this.log('- BarbachliHelper.makeAdmin() - Make current user an admin');
      this.log('- BarbachliHelper.fixCart() - Reset cart to empty state');
      this.log('- BarbachliHelper.fixAll() - Apply all fixes at once');
      this.log('- BarbachliHelper.help() - Show this help information');
    }
  };
  
  // Log welcome message
  BarbachliHelper.log('Helper loaded. Type BarbachliHelper.help() for commands');
})(); 