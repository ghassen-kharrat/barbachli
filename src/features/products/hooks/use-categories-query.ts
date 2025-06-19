import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import categoriesApi from '../services/categories.api';
import { useLanguage } from '../../../provider/LanguageProvider';

// Query keys for React Query
export const CATEGORIES_QUERY_KEYS = {
  all: ['categories'] as const,
  list: () => [...CATEGORIES_QUERY_KEYS.all, 'list'] as const,
  detail: (id: number) => [...CATEGORIES_QUERY_KEYS.all, 'detail', id] as const,
};

// Get all categories
export const useCategories = (hierarchical: boolean = true) => {
  const { language } = useLanguage();
  
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEYS.list(), hierarchical, language],
    queryFn: async () => {
      try {
        console.log('Fetching categories with language:', language);
        return await categoriesApi.getList(hierarchical);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Return a default empty response instead of throwing
        return {
          success: false,
          data: []
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // Retry failed requests up to 2 times
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    // Return last successful data if new query fails
    keepPreviousData: true,
    // Don't refetch on window focus to prevent unnecessary requests
    refetchOnWindowFocus: false,
  });
}; 