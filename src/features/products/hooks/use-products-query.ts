import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import productsApi from '../services/products.api';
import { ProductDataMutation, ProductFilters } from '../services/types';

// Query keys for React Query
export const PRODUCTS_QUERY_KEYS = {
  all: ['products'] as const,
  lists: () => [...PRODUCTS_QUERY_KEYS.all, 'list'] as const,
  list: (filters: ProductFilters) => [...PRODUCTS_QUERY_KEYS.lists(), filters] as const,
  details: () => [...PRODUCTS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...PRODUCTS_QUERY_KEYS.details(), id] as const,
};

// For backward compatibility with existing code
export const PRODUCT_QUERY_KEYS = PRODUCTS_QUERY_KEYS;

// Hook to get products with optional filters
export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEYS.list(filters),
    queryFn: async () => {
      return productsApi.getList(filters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Alias for backward compatibility
export const useProductsList = useProducts;

// Hook to get a single product by ID
export const useProductDetail = (productId: number) => {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEYS.detail(productId),
    queryFn: async () => {
      return productsApi.getDetail(productId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!productId, // Only fetch when productId is available
  });
};

// Hook to create a new product (admin only)
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData: Partial<ProductDataMutation>) => {
      return productsApi.create(productData as ProductDataMutation);
    },
    onSuccess: () => {
      // Invalidate product lists
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.lists() });
    },
    onError: (error: AxiosError) => {
      console.error('Error creating product:', error);
    }
  });
};

// Hook to update a product (admin only)
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      return productsApi.update(id, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific product and lists
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.lists() });
    },
    onError: (error: AxiosError) => {
      console.error('Error updating product:', error);
    }
  });
};

// Hook to delete a product (admin only)
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productId: number) => {
      return productsApi.delete(productId);
    },
    onSuccess: () => {
      // Invalidate all product queries
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.all });
    },
    onError: (error: AxiosError) => {
      console.error('Error deleting product:', error);
    }
  });
}; 