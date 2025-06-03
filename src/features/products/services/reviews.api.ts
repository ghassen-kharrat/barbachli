import axiosClient from '../../../apis/axios-client';
import { ReviewData, ReviewInput, ReviewsListData, AdminReviewsListData } from './types';

// API service for product reviews
const reviewsApi = {
  // Get reviews for a product
  getProductReviews: async (productId: number, page = 1, limit = 10): Promise<ReviewsListData> => {
    try {
      console.log(`Fetching reviews for product ID: ${productId}`);
      const response = await axiosClient.get(`/products/${productId}/reviews`, {
        params: { page, limit }
      });
      console.log('Reviews API response:', response);
      
      // Ensure the response has the expected structure
      if (response) {
        // Make sure stats.averageRating is a number
        if (response.stats && response.stats.averageRating) {
          response.stats.averageRating = Number(response.stats.averageRating);
        }
        
        // Ensure distribution is properly formatted
        if (response.stats && response.stats.distribution) {
          // If distribution is not an array or is empty, create a default one
          if (!Array.isArray(response.stats.distribution) || response.stats.distribution.length === 0) {
            response.stats.distribution = [
              { rating: 5, count: "0" },
              { rating: 4, count: "0" },
              { rating: 3, count: "0" },
              { rating: 2, count: "0" },
              { rating: 1, count: "0" }
            ];
          } else {
            // Ensure each distribution item has the correct format
            response.stats.distribution = response.stats.distribution.map(item => {
              if (typeof item === 'object' && item !== null) {
                return {
                  rating: Number(item.rating || 0),
                  count: String(item.count || 0)
                };
              }
              return { rating: 0, count: "0" };
            });
          }
        }
        
        return response;
      } else {
        console.error('Unexpected API response structure:', response);
        // Return a properly structured response even if the API returns something unexpected
        return {
          success: true,
          data: [],
          page: page,
          limit: limit,
          total: 0,
          totalPages: 0,
          stats: {
            averageRating: 0,
            distribution: [
              { rating: 5, count: "0" },
              { rating: 4, count: "0" },
              { rating: 3, count: "0" },
              { rating: 2, count: "0" },
              { rating: 1, count: "0" }
            ]
          }
        };
      }
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
  },
  
  // Create a new review
  createReview: async (productId: number, reviewData: ReviewInput): Promise<ReviewData> => {
    try {
      const response = await axiosClient.post(`/products/${productId}/reviews`, reviewData);
      return response;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },
  
  // Update an existing review
  updateReview: async (reviewId: number, reviewData: ReviewInput): Promise<ReviewData> => {
    try {
      const response = await axiosClient.put(`/reviews/${reviewId}`, reviewData);
      return response;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },
  
  // Delete a review
  deleteReview: async (reviewId: number): Promise<void> => {
    try {
      await axiosClient.delete(`/reviews/${reviewId}`);
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },
  
  // Admin: Get all reviews
  getAdminReviews: async (params: { 
    page?: number; 
    limit?: number; 
    productId?: number; 
    approved?: boolean 
  } = {}): Promise<AdminReviewsListData> => {
    try {
      const response = await axiosClient.get('/admin/reviews', { params });
      return response;
    } catch (error) {
      console.error('Error fetching admin reviews:', error);
      throw error;
    }
  },
  
  // Admin: Approve or reject a review
  approveReview: async (reviewId: number, approved: boolean): Promise<void> => {
    try {
      await axiosClient.patch(`/admin/reviews/${reviewId}/approve`, { approved });
    } catch (error) {
      console.error('Error updating review approval:', error);
      throw error;
    }
  }
};

export default reviewsApi; 