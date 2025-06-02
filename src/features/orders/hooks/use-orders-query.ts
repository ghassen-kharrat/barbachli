import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { CreateOrderData, OrderStatus } from '../services/types';
import ordersApi from '../services/orders.api';

// Query keys for React Query
export const ORDERS_QUERY_KEYS = {
  all: ['orders'] as const,
  lists: () => [...ORDERS_QUERY_KEYS.all, 'list'] as const,
  detail: (id: number) => [...ORDERS_QUERY_KEYS.all, 'detail', id] as const,
  admin: () => [...ORDERS_QUERY_KEYS.all, 'admin'] as const,
};

// Get all orders for current user
export const useOrders = () => {
  return useQuery({
    queryKey: ORDERS_QUERY_KEYS.lists(),
    queryFn: async () => {
      try {
        return await ordersApi.getUserOrders();
      } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

// Get details for a single order
export const useOrderDetails = (orderId: number) => {
  return useQuery({
    queryKey: ORDERS_QUERY_KEYS.detail(orderId),
    queryFn: async () => {
      try {
        return await ordersApi.getOrderDetails(orderId);
      } catch (error) {
        console.error('Error fetching order details:', error);
        throw error;
      }
    },
    staleTime: 60 * 1000, // 1 minute
    enabled: !!orderId,
  });
};

// Create a new order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData: CreateOrderData) => {
      return ordersApi.createOrder(orderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.lists() });
    },
    onError: (error: AxiosError) => {
      console.error('Error creating order:', error);
    },
  });
};

// Cancel an order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderId: number) => {
      return ordersApi.cancelOrder(orderId);
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.lists() });
    },
    onError: (error: AxiosError) => {
      console.error('Error cancelling order:', error);
    },
  });
};

// Get order detail for admin
export const useOrderDetail = (orderId: number) => {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEYS.admin(), 'order', orderId],
    queryFn: async () => {
      try {
        if (!orderId) {
          throw new Error('ID de commande invalide');
        }
        
        console.log(`Fetching order details for ID: ${orderId}`);
        const response = await ordersApi.getOrderDetails(orderId);
        console.log('Order details response:', response);
        
        // If the response doesn't have the expected structure, transform it
        if (response && response.data && !response.data.items) {
          // Handle different API response structures
          const transformedData = {
            ...response.data,
            // Add any missing fields with defaults
            items: response.data.items || [],
            customer: response.data.customer || {
              firstName: response.data.firstName || '',
              lastName: response.data.lastName || '',
              email: response.data.email || '',
              phone: response.data.phoneNumber || ''
            },
            shippingAddress: response.data.shippingAddress || {
              street: response.data.shippingAddress || '',
              city: response.data.shippingCity || '',
              zipCode: response.data.shippingZipCode || '',
              country: response.data.shippingCountry || 'Tunisie'
            }
          };
          
          return {
            ...response,
            data: transformedData
          };
        }
        
        return response;
      } catch (error) {
        console.error('Error fetching order details:', error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!orderId
  });
};

// Update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { id: number, status: OrderStatus }) => {
      const { id, status } = data;
      
      if (!id) {
        throw new Error('ID de commande invalide');
      }
      
      console.log('Updating order status:', { id, status });
      
      // Send the status in the correct format expected by the API
      return await ordersApi.updateOrderStatus(id, { status });
    },
    onSuccess: (_, variables) => {
      console.log('Status update successful:', variables);
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ 
        queryKey: [...ORDERS_QUERY_KEYS.admin(), 'order', variables.id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ORDERS_QUERY_KEYS.admin() 
      });
    },
    onError: (error: AxiosError) => {
      console.error('Error updating order status:', error);
    }
  });
};

// Get all orders (admin)
export const useAdminOrders = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEYS.admin(), 'list', page, limit],
    queryFn: async () => {
      try {
        return await ordersApi.getAllOrders(page, limit);
      } catch (error) {
        console.error('Error fetching admin orders:', error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}; 