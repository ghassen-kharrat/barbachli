import axiosClient from '../../../apis/axios-client';
import { 
  ProductData, 
  ProductDataMutation, 
  ProductFilters, 
  ProductsListData,
  ResponseData 
} from './types';

// Base URL for product endpoints
const baseUrl = '/products';

// Function to convert camelCase to snake_case for query parameters
function convertToSnakeCase(key: string): string {
  return key.replace(/([A-Z])/g, '_$1').toLowerCase();
}

// API service for products
const productsApi = {
  // Get product list with pagination and filters
  getList: async (filters: ProductFilters = {}): Promise<ProductsListData> => {
    const params = new URLSearchParams();
    
    // Add filters to query parameters with snake_case conversion
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        // Convert camelCase keys to snake_case (e.g., discountPrice -> discount_price)
        const snakeCaseKey = convertToSnakeCase(key);
        params.append(snakeCaseKey, value.toString());
      }
    });
    
    return axiosClient.get(`${baseUrl}?${params.toString()}`);
  },
  
  // Get product details by ID
  getDetail: async (id: number): Promise<ResponseData<ProductData>> => {
    return axiosClient.get(`${baseUrl}/${id}`);
  },
  
  // Create a new product (admin only)
  create: async (data: ProductDataMutation): Promise<ResponseData<ProductData>> => {
    return axiosClient.post(baseUrl, data);
  },
  
  // Update an existing product (admin only)
  update: async (id: number, data: Partial<ProductDataMutation>): Promise<ResponseData<ProductData>> => {
    return axiosClient.put(`${baseUrl}/${id}`, data);
  },
  
  // Delete a product (admin only)
  delete: async (id: number): Promise<ResponseData<null>> => {
    return axiosClient.delete(`${baseUrl}/${id}`);
  },
  
  // Get products by category
  getByCategory: async (category: string, filters: Omit<ProductFilters, 'category'> = {}): Promise<ProductsListData> => {
    const params = new URLSearchParams({ category });
    
    // Add filters to query parameters with snake_case conversion
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        // Convert camelCase keys to snake_case
        const snakeCaseKey = convertToSnakeCase(key);
        params.append(snakeCaseKey, value.toString());
      }
    });
    
    return axiosClient.get(`${baseUrl}?${params.toString()}`);
  },
  
  // Search products
  search: async (query: string, filters: Omit<ProductFilters, 'search'> = {}): Promise<ProductsListData> => {
    const params = new URLSearchParams({ search: query });
    
    // Add filters to query parameters with snake_case conversion
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        // Convert camelCase keys to snake_case
        const snakeCaseKey = convertToSnakeCase(key);
        params.append(snakeCaseKey, value.toString());
      }
    });
    
    return axiosClient.get(`${baseUrl}?${params.toString()}`);
  }
};

export default productsApi; 