import axiosClient from '../../../apis/axios-client';
import { ResponseData } from '../../products/services/types';
import { AddToCartData, CartResponseData, UpdateCartItemData } from './types';

// URL de base pour les endpoints du panier
const baseUrl = '/cart';

// Service API pour le panier
const cartApi = {
  // Récupérer le panier de l'utilisateur connecté
  getCart: async (): Promise<CartResponseData> => {
    return axiosClient.get(baseUrl);
  },
  
  // Ajouter un produit au panier
  addItem: async (data: AddToCartData): Promise<CartResponseData> => {
    return axiosClient.post(`${baseUrl}/items`, data);
  },
  
  // Mettre à jour la quantité d'un élément du panier
  updateItem: async (itemId: number, data: UpdateCartItemData): Promise<CartResponseData> => {
    return axiosClient.put(`${baseUrl}/items/${itemId}`, data);
  },
  
  // Supprimer un élément du panier
  removeItem: async (itemId: number): Promise<CartResponseData> => {
    return axiosClient.delete(`${baseUrl}/items/${itemId}`);
  },
  
  // Vider complètement le panier
  clearCart: async (): Promise<ResponseData<null>> => {
    return axiosClient.delete(baseUrl);
  }
};

export default cartApi; 