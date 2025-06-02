import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import adminApi from '../services/admin.api';
import { 
  AdminOrdersQueryParams, 
  AdminUsersQueryParams, 
  ChartPeriod,
  UpdateOrderStatusData, 
  UpdateUserStatusData,
  CreateUserData
} from '../services/types';
import { OrderStatus } from '../../orders/services/types';
import { toast } from 'react-toastify';
import { useState } from 'react';

// Admin dashboard statistics
const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      try {
        return await adminApi.getStats();
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        return {
          success: false,
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
    staleTime: 60 * 1000 // 1 minute
  });
};

// Order trend data for charts
const useOrderTrends = (period: ChartPeriod) => {
  return useQuery({
    queryKey: ['admin', 'order-trends', period],
    queryFn: async () => {
      try {
        return await adminApi.getOrderTrends(period);
      } catch (error) {
        console.error('Error fetching order trends:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

// Sales trend data for charts
const useSalesTrends = (period: ChartPeriod) => {
  return useQuery({
    queryKey: ['admin', 'sales-trends', period],
    queryFn: async () => {
      try {
        return await adminApi.getSalesTrends(period);
      } catch (error) {
        console.error('Error fetching sales trends:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

// Orders with pagination and filters
const useAdminOrders = (params: AdminOrdersQueryParams = {}) => {
  const [isMockData, setIsMockData] = useState(false);

  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: async () => {
      try {
        console.log('Fetching admin orders with params:', params);
        const result = await adminApi.getOrders(params);
        console.log('Admin orders response:', result);
        setIsMockData(false);
        return result;
      } catch (error) {
        console.error('Error fetching orders:', error);
        
        // If API fails, log error and rethrow it
        toast.error("Erreur lors de la récupération des commandes");
        throw error;
      }
    },
    staleTime: 30 * 1000 // 30 seconds
  });
};

// Update order status
const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (data: { orderId: number | null | undefined; status: OrderStatus }) => {
      const { orderId, status } = data;
      
      if (!orderId || orderId === undefined || orderId === null) {
        console.error('Invalid orderId in useUpdateOrderStatus:', orderId);
        throw new Error('ID de commande invalide');
      }
      
      const parsedId = parseInt(String(orderId));
      if (isNaN(parsedId) || parsedId <= 0) {
        console.error('Invalid orderId after parsing:', parsedId, 'from original:', orderId);
        throw new Error('ID de commande invalide');
      }
      
      console.log(`Updating order status in hook for orderId: ${parsedId}`);
      return await adminApi.updateOrderStatus(parsedId, { status });
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Statut de commande mis à jour avec succès');
    },
    onError: (error: AxiosError) => {
      console.error('Error updating order status:', error);
      toast.error('Erreur lors de la mise à jour du statut de la commande');
    }
  });
  
  return {
    ...mutation,
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending
  };
};

// Users with pagination and filters
const useAdminUsers = (params: AdminUsersQueryParams = {}) => {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      try {
        console.log('Fetching users with params:', params);
        return await adminApi.getUsers(params);
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    },
    staleTime: 30 * 1000 // 30 seconds
  });
};

// Create a new user (Admin only)
const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: CreateUserData) => adminApi.createUser(userData),
    onSuccess: () => {
      // Invalidate users queries to refetch
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    }
  });
};

// Get user details
const useAdminUserDetails = (userId: number | null | undefined) => {
  return useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: async () => {
      if (!userId) return null;
      try {
        return await adminApi.getUserDetails(userId);
      } catch (error) {
        console.error('Error fetching user details:', error);
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 30 * 1000 // 30 seconds
  });
};

// Update user status (active/inactive)
const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, data }: { userId: number, data: UpdateUserStatusData }) => 
      adminApi.updateUserStatus(userId, data),
    onSuccess: (_, variables) => {
      // Invalidate specific user query
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', variables.userId] });
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    }
  });
};

// Delete user
const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: number) => adminApi.deleteUser(userId),
    onSuccess: () => {
      // Invalidate users queries to refetch
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    }
  });
};

// Get order details
const useOrderDetails = (orderId: number | null | undefined) => {
  return useQuery({
    queryKey: ['admin', 'order', orderId],
    queryFn: async () => {
      try {
        if (!orderId || orderId === undefined || orderId === null) {
          console.error('Invalid or undefined orderId in useOrderDetails:', orderId);
          throw new Error('ID de commande invalide');
        }
        
        const parsedId = parseInt(String(orderId));
        if (isNaN(parsedId) || parsedId <= 0) {
          console.error('Invalid orderId after parsing:', parsedId, 'from original:', orderId);
          throw new Error('ID de commande invalide');
        }
        
        console.log(`Fetching order details in hook for orderId: ${parsedId}`);
        return await adminApi.getOrderDetails(parsedId);
      } catch (error) {
        console.error('Error fetching order details:', error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!orderId && !isNaN(Number(orderId)) && Number(orderId) > 0
  });
};

export {
  useAdminStats,
  useOrderTrends,
  useSalesTrends,
  useAdminOrders,
  useUpdateOrderStatus,
  useAdminUsers,
  useAdminUserDetails,
  useUpdateUserStatus,
  useDeleteUser,
  useCreateUser,
  useOrderDetails
}; 