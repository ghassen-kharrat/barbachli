// Admin helper functions - VERSION MARKER: v2.0.0

/**
 * Check if current user is logged in
 * @returns {boolean} True if user is logged in
 */
export const isLoggedIn = () => {
  return !!localStorage.getItem('auth_token');
};

/**
 * Get the current user data from localStorage
 * @returns {Object|null} User data or null if not logged in
 */
export const getCurrentUser = () => {
  try {
    const userJson = localStorage.getItem('user_data');
    if (userJson) {
      return JSON.parse(userJson);
    }
  } catch (e) {
    console.error('Error parsing user data:', e);
  }
  return null;
};

/**
 * Save the current user data to localStorage
 * @param {Object} userData User data to save
 */
export const saveCurrentUser = (userData) => {
  try {
    if (userData) {
      localStorage.setItem('user_data', JSON.stringify(userData));
    }
  } catch (e) {
    console.error('Error saving user data:', e);
  }
};

/**
 * Check if current user is an admin
 * @returns {boolean} True if user is an admin
 */
export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'admin';
};

/**
 * Force set the current user as an admin (for development/testing)
 * @param {Object} userData Base user data (optional)
 */
export const forceAdminRole = (userData = null) => {
  const user = userData || getCurrentUser() || {
    id: 1,
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User'
  };
  
  // Set admin role
  user.role = 'admin';
  
  // Save to localStorage
  saveCurrentUser(user);
  
  console.log('Admin role forced for user:', user.email);
  return user;
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
};

/**
 * Create a token for testing purposes
 * @returns {string} A fake JWT token
 */
export const createTestToken = () => {
  // Create a simple fake JWT format token (NOT FOR PRODUCTION)
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
};

/**
 * Set up admin access for testing
 * This should only be used in development
 */
export const setupAdminAccess = () => {
  // Create admin user
  const adminUser = forceAdminRole();
  
  // Create test token
  const token = createTestToken();
  localStorage.setItem('auth_token', token);
  
  console.log('Admin access set up:', adminUser);
  return adminUser;
}; 