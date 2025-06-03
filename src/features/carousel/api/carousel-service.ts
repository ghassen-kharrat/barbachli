import axios from 'axios';
import { CarouselSlide, CarouselSlideFormData } from '../types';
import axiosClient from '../../../apis/axios-client';

// Mock data for when the API is unavailable
const mockCarouselSlides: CarouselSlide[] = [
  {
    id: 1,
    title: 'Nouvelle Collection',
    subtitle: 'Découvrez nos dernières nouveautés',
    image: 'https://iptgkvofawoqvykmkcrk.supabase.co/storage/v1/object/public/product-images/banner1.jpg',
    link: '/products',
    order: 1,
    active: true
  },
  {
    id: 2,
    title: 'Offres Spéciales',
    subtitle: 'Jusqu\'à -50% sur une sélection d\'articles',
    image: 'https://iptgkvofawoqvykmkcrk.supabase.co/storage/v1/object/public/product-images/banner2.jpg',
    link: '/products?hasDiscount=true',
    order: 2,
    active: true
  }
];

export const getCarouselSlides = async (): Promise<CarouselSlide[]> => {
  try {
    // First try the standard endpoint
    try {
      console.log('Fetching carousel from standard endpoint...');
      const response = await axiosClient.get('/carousel');
      return response as unknown as CarouselSlide[];
    } catch (standardError) {
      console.error('Standard carousel endpoint failed, trying backup endpoint...', standardError);
      
      // Try the backup endpoint
      try {
        const backupResponse = await axiosClient.get('/banner');
        return backupResponse as unknown as CarouselSlide[];
      } catch (backupError) {
        console.error('Backup carousel endpoint also failed, using mock data', backupError);
        
        // If all else fails, return mock data
        return mockCarouselSlides;
      }
    }
  } catch (error) {
    console.error('Error fetching carousel slides:', error);
    return mockCarouselSlides;
  }
};

export const getCarouselSlideById = async (id: number): Promise<CarouselSlide> => {
  try {
    try {
      const response = await axiosClient.get(`/carousel/${id}`);
      return response as unknown as CarouselSlide;
    } catch (standardError) {
      // Try backup endpoint
      const backupResponse = await axiosClient.get(`/banner/${id}`);
      return backupResponse as unknown as CarouselSlide;
    }
  } catch (error) {
    console.error(`Error fetching carousel slide with id ${id}:`, error);
    return mockCarouselSlides.find(slide => slide.id === id) || mockCarouselSlides[0];
  }
};

export const createCarouselSlide = async (slideData: CarouselSlideFormData): Promise<CarouselSlide> => {
  try {
    console.log('API sending carousel data:', {
      ...slideData,
      image: slideData.image ? 'File content not shown' : 'No image'
    });
    
    try {
      const response = await axiosClient.post('/carousel', slideData);
      return response as unknown as CarouselSlide;
    } catch (standardError) {
      // Try backup endpoint
      const backupResponse = await axiosClient.post('/banner', slideData);
      return backupResponse as unknown as CarouselSlide;
    }
  } catch (error) {
    console.error('Error creating carousel slide:', error);
    throw new Error('Failed to create carousel slide');
  }
};

export const updateCarouselSlide = async (id: number, slideData: CarouselSlideFormData): Promise<CarouselSlide> => {
  try {
    console.log('API updating carousel data:', {
      id,
      ...slideData,
      image: slideData.image ? 'File content not shown' : 'No image'
    });
    
    try {
      const response = await axiosClient.put(`/carousel/${id}`, slideData);
      return response as unknown as CarouselSlide;
    } catch (standardError) {
      // Try backup endpoint
      const backupResponse = await axiosClient.put(`/banner/${id}`, slideData);
      return backupResponse as unknown as CarouselSlide;
    }
  } catch (error) {
    console.error(`Error updating carousel slide with id ${id}:`, error);
    throw new Error('Failed to update carousel slide');
  }
};

export const deleteCarouselSlide = async (id: number): Promise<void> => {
  try {
    try {
      await axiosClient.delete(`/carousel/${id}`);
    } catch (standardError) {
      // Try backup endpoint
      await axiosClient.delete(`/banner/${id}`);
    }
  } catch (error) {
    console.error(`Error deleting carousel slide with id ${id}:`, error);
    throw new Error('Failed to delete carousel slide');
  }
};

export const reorderCarouselSlides = async (slideIds: number[]): Promise<void> => {
  try {
    try {
      await axiosClient.post(`/carousel/reorder`, { slideIds });
    } catch (standardError) {
      // Try backup endpoint
      await axiosClient.post(`/banner/reorder`, { slideIds });
    }
  } catch (error) {
    console.error('Error reordering carousel slides:', error);
    throw new Error('Failed to reorder carousel slides');
  }
}; 