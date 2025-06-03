import axios from 'axios';
import { CarouselSlide, CarouselSlideFormData } from '../types';
import axiosClient from '../../../apis/axios-client';

export const getCarouselSlides = async (): Promise<CarouselSlide[]> => {
  try {
    const response = await axiosClient.get('/carousel');
    if (response && Array.isArray(response)) {
      return response;
    }
    throw new Error('Failed to fetch carousel slides');
  } catch (error) {
    console.error('Error fetching carousel slides:', error);
    throw error;
  }
};

export const getCarouselSlideById = async (id: number): Promise<CarouselSlide> => {
  try {
    const response = await axiosClient.get(`/carousel/${id}`);
    if (response) {
      return response;
    }
    throw new Error('Failed to fetch carousel slide');
  } catch (error) {
    console.error(`Error fetching carousel slide with id ${id}:`, error);
    throw error;
  }
};

export const createCarouselSlide = async (slideData: CarouselSlideFormData): Promise<CarouselSlide> => {
  try {
    console.log('API sending carousel data:', {
      title: slideData.title, 
      hasImage: !!slideData.image,
      imageType: typeof slideData.image
    });
    
    // Direct JSON request, no FormData
    const response = await axiosClient.post('/carousel', slideData);
    
    if (response) {
      return response;
    }
    throw new Error('Failed to create carousel slide');
  } catch (error) {
    console.error('Error creating carousel slide:', error);
    throw error;
  }
};

export const updateCarouselSlide = async (id: number, slideData: CarouselSlideFormData): Promise<CarouselSlide> => {
  try {
    console.log('API updating carousel data:', {
      id,
      title: slideData.title, 
      hasImage: !!slideData.image,
      imageType: typeof slideData.image
    });
    
    // Direct JSON request, no FormData
    const response = await axiosClient.put(`/carousel/${id}`, slideData);
    
    if (response) {
      return response;
    }
    throw new Error('Failed to update carousel slide');
  } catch (error) {
    console.error(`Error updating carousel slide with id ${id}:`, error);
    throw error;
  }
};

export const deleteCarouselSlide = async (id: number): Promise<void> => {
  try {
    await axiosClient.delete(`/carousel/${id}`);
  } catch (error) {
    console.error(`Error deleting carousel slide with id ${id}:`, error);
    throw error;
  }
};

export const reorderCarouselSlides = async (slideIds: number[]): Promise<void> => {
  try {
    await axiosClient.post(`/carousel/reorder`, { slideIds });
  } catch (error) {
    console.error('Error reordering carousel slides:', error);
    throw error;
  }
}; 