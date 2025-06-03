// Types génériques pour les réponses API
import { ResponseData } from "../../products/services/types";

// Types pour l'utilisateur
export interface UserData {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

// Type pour la réponse d'authentification
export interface AuthResponse {
  user: UserData;
  token: string;
}

// Type pour la connexion utilisateur
export interface LoginData {
  email: string;
  password: string;
}

// Type pour l'enregistrement d'un nouvel utilisateur
export interface RegisterData {
  username?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
}

// Type pour la mise à jour du profil utilisateur
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
}

// Type pour la modification du mot de passe
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Types pour les réponses des API d'authentification
export type AuthResponseData = ResponseData<AuthResponse>;
export type UserResponseData = ResponseData<UserData>; 