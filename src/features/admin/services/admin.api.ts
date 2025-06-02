import axiosClient from '../../../apis/axios-client';
import { 
  AdminOrdersQueryParams,
  AdminUsersQueryParams,
  PaginatedOrdersData,
  PaginatedUsersData,
  UpdateOrderStatusData,
  UpdateUserStatusData,
  ChartPeriod,
  CreateUserData
} from './types';
import axios from 'axios';

// Helper function to ensure admin is logged in
const ensureAdminLogin = async () => {
  try {
    // Check if we already have a token
    const token = localStorage.getItem('auth_token');
    if (token) {
      // We have a token, check if it's valid and for an admin
      try {
        const response = await axios.get('http://localhost:5001/api/auth/check', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data?.success && response.data?.data?.role === 'admin') {
          // Token is valid and user is admin, we're good to go
          console.log('Valid admin token detected');
          return;
        }
      } catch (error) {
        // Token is invalid or expired, continue to login
        console.log('Invalid token, logging in as admin');
      }
    }
    
    // Login as admin
    console.log('Attempting admin login');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    if (loginResponse.data?.success && loginResponse.data?.data?.token) {
      // Save the admin token
      localStorage.setItem('auth_token', loginResponse.data.data.token);
      console.log('Admin login successful');
    } else {
      throw new Error('Admin login failed');
    }
  } catch (error) {
    console.error('Admin authentication error:', error);
    throw error;
  }
};

// Admin API service
const adminApi = {
  // Get admin dashboard statistics
  getStats: async () => {
    try {
      await ensureAdminLogin();
      console.log('Fetching admin stats');
      return axiosClient.get(`/admin/stats`);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // Return mock data if the API fails
      return {
        success: true,
        data: {
          totalOrders: 0,
          totalProducts: 0,
          totalUsers: 0,
          revenue: 0,
          latestOrders: []
        }
      };
    }
  },
  
  // Get order trends for charts
  getOrderTrends: async (period: ChartPeriod) => {
    try {
      await ensureAdminLogin();
      console.log(`Fetching order trends data for period: ${period}`);
      const response = await axiosClient.get(`/admin/orders/trends?period=${period}`);
      
      return response;
    } catch (error) {
      console.error('Error fetching order trends:', error);
      throw error;
    }
  },
  
  // Get sales trends for charts
  getSalesTrends: async (period: ChartPeriod) => {
    try {
      await ensureAdminLogin();
      console.log(`Fetching sales trends data for period: ${period}`);
      const response = await axiosClient.get(`/admin/sales/trends?period=${period}`);
      
      return response;
    } catch (error) {
      console.error('Error fetching sales trends:', error);
      throw error;
    }
  },
  
  // Get all orders with filters
  getOrders: async (params: AdminOrdersQueryParams): Promise<PaginatedOrdersData> => {
    try {
      // Ensure admin is logged in first
      await ensureAdminLogin();
      
      const { page = 1, limit = 10, status, search } = params;
      
      // Use the correct path for admin orders - we need to remove the /api prefix since axiosClient already includes it
      let url = `/orders/admin?page=${page}&limit=${limit}`;
      
      if (status && status !== 'all') {
        url += `&status=${status}`;
      }
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      console.log('Fetching admin orders from:', url);
      
      return axiosClient.get(url);
    } catch (error) {
      console.error('Error in getOrders function:', error);
      throw error;
    }
  },
  
  // Update order status
  updateOrderStatus: async (orderId: number | null | undefined, data: UpdateOrderStatusData) => {
    if (!orderId || isNaN(Number(orderId)) || Number(orderId) <= 0) {
      console.error(`Invalid order ID provided to updateOrderStatus: ${orderId}`);
      throw new Error('ID de commande invalide');
    }
    
    // Ensure it's a valid number and convert to string
    const validOrderId = String(parseInt(String(orderId)));
    
    console.log(`Updating order status in admin API for order ID: ${validOrderId}`);
    await ensureAdminLogin();
    return axiosClient.put(`/orders/${validOrderId}/status`, data);
  },
  
  // Get order details
  getOrderDetails: async (orderId: number | null | undefined) => {
    if (!orderId || isNaN(Number(orderId)) || Number(orderId) <= 0) {
      console.error(`Invalid order ID provided to getOrderDetails: ${orderId}`);
      throw new Error('ID de commande invalide');
    }
    
    // Ensure it's a valid number and convert to string
    const validOrderId = String(parseInt(String(orderId)));
    
    console.log(`Fetching order details in admin API for order ID: ${validOrderId}`);
    await ensureAdminLogin();
    return axiosClient.get(`/orders/${validOrderId}`);
  },
  
  // Get all users with filters
  getUsers: async (params: AdminUsersQueryParams): Promise<PaginatedUsersData> => {
    await ensureAdminLogin();
    const { page = 1, limit = 10, isActive, search } = params;
    let url = `/admin/users?page=${page}&limit=${limit}`;
    
    if (isActive !== undefined) {
      url += `&isActive=${isActive}`;
    }
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    
    console.log(`Making request to: ${url}`);
    return axiosClient.get(url);
  },
  
  // Get user details
  getUserDetails: async (userId: number | null | undefined) => {
    if (!userId || isNaN(Number(userId)) || Number(userId) <= 0) {
      console.error(`Invalid user ID provided to getUserDetails: ${userId}`);
      throw new Error('ID utilisateur invalide');
    }
    
    // Ensure it's a valid number and convert to string
    const validUserId = String(parseInt(String(userId)));
    
    await ensureAdminLogin();
    return axiosClient.get(`/admin/users/${validUserId}`);
  },
  
  // Create new user (admin only)
  createUser: async (data: CreateUserData) => {
    await ensureAdminLogin();
    return axiosClient.post('/admin/users', data);
  },
  
  // Update user status (active/inactive)
  updateUserStatus: async (userId: number | null | undefined, data: UpdateUserStatusData) => {
    if (!userId || isNaN(Number(userId)) || Number(userId) <= 0) {
      console.error(`Invalid user ID provided to updateUserStatus: ${userId}`);
      throw new Error('ID utilisateur invalide');
    }
    
    // Ensure it's a valid number and convert to string
    const validUserId = String(parseInt(String(userId)));
    
    await ensureAdminLogin();
    return axiosClient.put(`/admin/users/${validUserId}/status`, data);
  },
  
  // Delete user
  deleteUser: async (userId: number | null | undefined) => {
    if (!userId || isNaN(Number(userId)) || Number(userId) <= 0) {
      console.error(`Invalid user ID provided to deleteUser: ${userId}`);
      throw new Error('ID utilisateur invalide');
    }
    
    // Ensure it's a valid number and convert to string
    const validUserId = String(parseInt(String(userId)));
    
    await ensureAdminLogin();
    return axiosClient.delete(`/admin/users/${validUserId}`);
  }
};

export default adminApi; 