import axios, { AxiosError } from 'axios';
import axiosClient from '../../../apis/axios-client';
import config from '../../../config';
import { CategoriesListData, CategoryData, ResponseData } from './types';

// Base URL for category endpoints
const baseUrl = '/categories';
const API_BASE_URL = config.apiUrl;

// API service for categories
const categoriesApi = {
  // Get all categories
  getList: async (hierarchical: boolean = true): Promise<CategoriesListData> => {
    console.log(`Fetching categories from: ${API_BASE_URL}${baseUrl}?hierarchical=${hierarchical}`);
    try {
      // Use direct Axios call to debug issues
      const response = await axios.get(`${API_BASE_URL}${baseUrl}?hierarchical=${hierarchical}`);
      console.log('Raw categories response:', response);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Categories fetch error:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },
  
  // Get a single category by ID
  getById: async (id: number): Promise<ResponseData<CategoryData>> => {
    return axiosClient.get(`${baseUrl}/${id}`);
  },
  
  // Create a new category - using raw axios without interceptors to debug
  create: async (data: Omit<CategoryData, 'id' | 'createdAt' | 'productCount'>): Promise<ResponseData<CategoryData>> => {
    try {
      console.log('Creating category with data:', data);
      // Use direct Axios call to debug issues
      const response = await axios.post(`${API_BASE_URL}${baseUrl}`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
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
    return axiosClient.put(`${baseUrl}/${id}`, data);
  },
  
  // Delete a category
  delete: async (id: number): Promise<ResponseData<void>> => {
    return axiosClient.delete(`${baseUrl}/${id}`);
  }
};

export default categoriesApi; 