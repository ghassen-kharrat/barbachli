import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import authApi from '../services/auth.api';
import { ChangePasswordData, LoginData, RegisterData, UpdateProfileData } from '../services/types';
import { useEffect } from 'react';

// Clés de requête pour React Query
export const AUTH_QUERY_KEYS = {
  all: ['auth'] as const,
  profile: () => [...AUTH_QUERY_KEYS.all, 'profile'] as const,
  check: () => [...AUTH_QUERY_KEYS.all, 'check'] as const,
};

// Hook pour vérifier l'authentification
export const useAuthCheck = () => {
  const query = useQuery({
    queryKey: AUTH_QUERY_KEYS.check(),
    queryFn: () => authApi.checkAuth(),
    retry: false,
    // Ajouter du staleTime pour éviter les requêtes trop fréquentes
    staleTime: 60 * 1000, // 1 minute
    // Désactiver le refetch automatique en arrière-plan pour éviter des boucles infinies
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    // Si l'utilisateur est sur la page de login ou register, on ne veut pas afficher d'erreur
    // même si le fetch échoue
    meta: {
      suppressErrorMessages: true
    }
  });
  
  // Handle errors separately using useEffect
  useEffect(() => {
    if (query.error) {
      localStorage.removeItem('auth_token');
    }
  }, [query.error]);
  
  return query;
};

// Hook pour récupérer le profil utilisateur
export const useUserProfile = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.profile(),
    queryFn: () => authApi.getProfile(),
    // Ajouter du staleTime pour éviter les requêtes trop fréquentes
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
    // On ne veut pas faire de requête si l'utilisateur n'est pas connecté
    enabled: !!localStorage.getItem('auth_token')
  });
};

// Hook pour la connexion
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: () => {
      // Recharger les données utilisateur après connexion
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.profile() });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.check() });
    },
  });
};

// Hook pour l'inscription
export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: () => {
      // Recharger les données utilisateur après inscription
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.profile() });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.check() });
    },
  });
};

// Hook pour la déconnexion
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Réinitialiser les requêtes d'authentification
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.all });
      // Réinitialiser d'autres données potentiellement privées
      queryClient.clear();
    },
  });
};

// Hook pour la mise à jour du profil
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateProfileData) => authApi.updateProfile(data),
    onSuccess: () => {
      // Recharger le profil après la mise à jour
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.profile() });
    },
  });
};

// Hook pour le changement de mot de passe
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordData) => authApi.changePassword(data),
  });
};

// Alias pour la rétrocompatibilité
export const useUpdatePassword = useChangePassword; 