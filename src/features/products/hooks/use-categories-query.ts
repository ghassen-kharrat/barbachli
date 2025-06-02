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
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}; 