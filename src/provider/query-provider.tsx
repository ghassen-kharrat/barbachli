import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { AxiosError } from 'axios';

// Configuration du client React Query
const defaultQueryClientOptions = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount: number, error: unknown) => {
        // Ne pas réessayer pour les erreurs 401 Unauthorized
        if (error instanceof AxiosError && error.response?.status === 401) {
          return false;
        }
        // Pour les autres erreurs, réessayer au max 1 fois
        return failureCount < 1;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: false, // Ne pas réessayer les mutations par défaut
    },
  },
};

interface QueryProviderProps {
  children: ReactNode;
}

const QueryProvider = ({ children }: QueryProviderProps) => {
  // Création d'une instance QueryClient par composant pour éviter les problèmes de SSR
  const [queryClient] = useState(() => new QueryClient(defaultQueryClientOptions));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default QueryProvider; 