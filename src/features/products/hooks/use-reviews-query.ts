import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import reviewsApi from '../services/reviews.api';
import { ReviewInput } from '../services/types';

// Query keys for React Query
export const REVIEWS_QUERY_KEYS = {
  all: ['reviews'] as const,
  lists: () => [...REVIEWS_QUERY_KEYS.all, 'list'] as const,
  list: (filters: any) => [...REVIEWS_QUERY_KEYS.lists(), filters] as const,
  productReviews: (productId: number) => [...REVIEWS_QUERY_KEYS.all, 'product', productId] as const,
  adminReviews: () => [...REVIEWS_QUERY_KEYS.all, 'admin'] as const,
};

// Hook to get reviews for a product
export const useProductReviews = (productId: number, page = 1, limit = 10) => {
  return useQuery({
    queryKey: [...REVIEWS_QUERY_KEYS.productReviews(productId), { page, limit }],
    queryFn: async () => {
      try {
        const response = await reviewsApi.getProductReviews(productId, page, limit);
        console.log('Reviews query response:', response);
        
        // Ensure the response has the expected structure
        if (!response || !response.data || !Array.isArray(response.data)) {
          console.error('Invalid response structure:', response);
          return {
            success: true,
            data: [],
            page: page,
            limit: limit,
            total: 0,
            totalPages: 1,
            stats: {
              averageRating: 0,
              distribution: []
            }
          };
        }
        
        return response;
      } catch (error) {
        console.error('Error in useProductReviews:', error);
        throw error;
      }
    },
    enabled: !!productId,
  });
};

// Hook to create a new review
export const useCreateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, reviewData }: { productId: number; reviewData: ReviewInput }) => {
      return reviewsApi.createReview(productId, reviewData);
    },
    onSuccess: (_, variables) => {
      // Invalidate product reviews to refetch
      queryClient.invalidateQueries({ 
        queryKey: REVIEWS_QUERY_KEYS.productReviews(variables.productId) 
      });
    },
  });
};

// Hook to update a review
export const useUpdateReview = (productId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reviewId, reviewData }: { reviewId: number; reviewData: ReviewInput }) => {
      return reviewsApi.updateReview(reviewId, reviewData);
    },
    onSuccess: () => {
      // Invalidate product reviews to refetch
      queryClient.invalidateQueries({ 
        queryKey: REVIEWS_QUERY_KEYS.productReviews(productId) 
      });
    },
  });
};

// Hook to delete a review
export const useDeleteReview = (productId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reviewId: number) => {
      return reviewsApi.deleteReview(reviewId);
    },
    onSuccess: () => {
      // Invalidate product reviews to refetch
      queryClient.invalidateQueries({ 
        queryKey: REVIEWS_QUERY_KEYS.productReviews(productId) 
      });
    },
  });
};

// Admin: Hook to get all reviews
export const useAdminReviews = (params: { 
  page?: number; 
  limit?: number; 
  productId?: number; 
  approved?: boolean 
} = {}) => {
  return useQuery({
    queryKey: [...REVIEWS_QUERY_KEYS.adminReviews(), params],
    queryFn: () => reviewsApi.getAdminReviews(params),
  });
};

// Admin: Hook to approve or reject a review
export const useApproveReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reviewId, approved }: { reviewId: number; approved: boolean }) => {
      return reviewsApi.approveReview(reviewId, approved);
    },
    onSuccess: () => {
      // Invalidate admin reviews to refetch
      queryClient.invalidateQueries({ 
        queryKey: REVIEWS_QUERY_KEYS.adminReviews() 
      });
    },
  });
}; 