import axios, { AxiosError } from 'axios';
import axiosClient from '../../../apis/axios-client';
import config from '../../../config';
import { CategoriesListData, CategoryData, ResponseData } from './types';

// Base URL for category endpoints
const baseUrl = '/categories';
// Force using barbachli-auth - VERSION MARKER: v1.0.1
const API_BASE_URL = 'https://barbachli-auth.onrender.com/api';

// Helper function to implement retry logic
const fetchWithRetry = async (url: string, options = {}, maxRetries = 3, delay = 1000) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await axios(url, options);
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      // Increase delay for next retry (exponential backoff)
      delay *= 2;
    }
  }
  throw lastError;
};

// API service for categories
const categoriesApi = {
  // Get all categories
  getList: async (hierarchical: boolean = true): Promise<CategoriesListData> => {
    console.log(`Fetching categories from: ${API_BASE_URL}${baseUrl}?hierarchical=${hierarchical}`);
    try {
      // Use fetchWithRetry instead of direct axios call
      const response = await fetchWithRetry(`${API_BASE_URL}${baseUrl}?hierarchical=${hierarchical}`, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('Raw categories response:', response);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Categories fetch error:', axiosError.response?.data || axiosError.message);
      
      // Return empty data structure instead of throwing to prevent UI errors
      return {
        success: false,
        data: []
      };
    }
  },
  
  // Get a single category by ID
  getById: async (id: number): Promise<ResponseData<CategoryData>> => {
    try {
      return await axiosClient.get(`${baseUrl}/${id}`);
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new category - using raw axios without interceptors to debug
  create: async (data: Omit<CategoryData, 'id' | 'createdAt' | 'productCount'>): Promise<ResponseData<CategoryData>> => {
    try {
      console.log('Creating category with data:', data);
      // Use fetchWithRetry for better reliability
      const response = await fetchWithRetry(`${API_BASE_URL}${baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        data
      });
      
      console.log('Raw category creation response:', response);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Category creation error:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },
  
  // Update a category
  update: async (id: number, data: Omit<CategoryData, 'id' | 'createdAt' | 'productCount'>): Promise<ResponseData<CategoryData>> => {
    try {
      return await axiosClient.put(`${baseUrl}/${id}`, data);
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a category
  delete: async (id: number): Promise<ResponseData<void>> => {
    try {
      return await axiosClient.delete(`${baseUrl}/${id}`);
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  }
};

export default categoriesApi; 