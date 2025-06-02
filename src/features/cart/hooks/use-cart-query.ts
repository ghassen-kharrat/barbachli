import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import cartApi from '../services/cart.api';
import { AddToCartData, UpdateCartItemData } from '../services/types';

// Query keys for React Query
export const CART_QUERY_KEYS = {
  all: ['cart'] as const,
  detail: () => [...CART_QUERY_KEYS.all, 'detail'] as const,
};

// Hook to get cart data
export const useCart = () => {
  return useQuery({
    queryKey: CART_QUERY_KEYS.detail(),
    queryFn: () => cartApi.getCart(),
    staleTime: 30 * 1000, // 30 seconds
    // Only fetch cart data if user is logged in (has auth token)
    enabled: !!localStorage.getItem('auth_token')
  });
};

// Hook to add an item to cart
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AddToCartData) => cartApi.addItem(data),
    onSuccess: () => {
      // Invalidate cart query to refetch
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.detail() });
    },
    onError: (error: AxiosError) => {
      console.error('Error adding to cart:', error);
    }
  });
};

// Hook to update item quantity in cart
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { itemId: number; quantity: number }) => {
      return cartApi.updateItem(data.itemId, { quantity: data.quantity });
    },
    onSuccess: () => {
      // Invalidate cart query to refetch
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.detail() });
    },
    onError: (error: AxiosError) => {
      console.error('Error updating cart item:', error);
    }
  });
};

// Hook to remove an item from cart
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (itemId: number) => cartApi.removeItem(itemId),
    onSuccess: () => {
      // Invalidate cart query to refetch
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.detail() });
    },
    onError: (error: AxiosError) => {
      console.error('Error removing from cart:', error);
    }
  });
};

// Alias for backward compatibility
export const useRemoveCartItem = useRemoveFromCart;

// Hook to clear the cart
export const useClearCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      // Invalidate cart query to refetch
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.detail() });
    },
    onError: (error: AxiosError) => {
      console.error('Error clearing cart:', error);
    }
  });
}; 