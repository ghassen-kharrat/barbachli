import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getCarouselSlides, 
  getCarouselSlideById,
  createCarouselSlide,
  updateCarouselSlide,
  deleteCarouselSlide,
  reorderCarouselSlides
} from '../api/carousel-service';
import { CarouselSlideFormData } from '../types';

// Hook to fetch all carousel slides
export const useCarouselSlides = () => {
  return useQuery({
    queryKey: ['carouselSlides'],
    queryFn: getCarouselSlides,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook to fetch a single carousel slide by ID
export const useCarouselSlide = (id: number) => {
  return useQuery({
    queryKey: ['carouselSlide', id],
    queryFn: () => getCarouselSlideById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook to create a new carousel slide
export const useCreateCarouselSlide = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (slideData: CarouselSlideFormData) => createCarouselSlide(slideData),
    onSuccess: () => {
      // Invalidate the carousel slides query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['carouselSlides'] });
    },
  });
};

// Hook to update an existing carousel slide
export const useUpdateCarouselSlide = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, slideData }: { id: number; slideData: CarouselSlideFormData }) => 
      updateCarouselSlide(id, slideData),
    onSuccess: (_, variables) => {
      // Invalidate specific queries
      queryClient.invalidateQueries({ queryKey: ['carouselSlides'] });
      queryClient.invalidateQueries({ queryKey: ['carouselSlide', variables.id] });
    },
  });
};

// Hook to delete a carousel slide
export const useDeleteCarouselSlide = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => deleteCarouselSlide(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carouselSlides'] });
    },
  });
};

// Hook to reorder carousel slides
export const useReorderCarouselSlides = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (slideIds: number[]) => reorderCarouselSlides(slideIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carouselSlides'] });
    },
  });
}; 