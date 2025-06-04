import axiosClient from '../../../apis/axios-client';
import { ResponseData } from '../../products/services/types';
import { AddToCartData, CartResponseData, UpdateCartItemData } from './types';

// URL de base pour les endpoints du panier
const baseUrl = '/cart';

// Fallback empty cart data
const createEmptyCart = () => ({
  status: 'success',
  data: {
    id: 0,
    userId: null,
    items: [],
    totalItems: 0,
    totalAmount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
});

// Try to load cart from localStorage as fallback
const getLocalCart = () => {
  try {
    const localCart = localStorage.getItem('cart_data');
    if (localCart) {
      return JSON.parse(localCart);
    }
  } catch (e) {
    console.error('Error loading local cart:', e);
  }
  return createEmptyCart();
};

// Save cart to localStorage as fallback
const saveLocalCart = (cart) => {
  try {
    localStorage.setItem('cart_data', JSON.stringify(cart));
  } catch (e) {
    console.error('Error saving local cart:', e);
  }
};

// Service API pour le panier - VERSION MARKER: v2.0.0
const cartApi = {
  // Récupérer le panier de l'utilisateur connecté
  getCart: async (): Promise<CartResponseData> => {
    try {
      return await axiosClient.get(baseUrl);
    } catch (error) {
      console.log('Using local cart fallback due to API error:', error.message);
      return getLocalCart();
    }
  },
  
  // Ajouter un produit au panier
  addItem: async (data: AddToCartData): Promise<CartResponseData> => {
    try {
      return await axiosClient.post(`${baseUrl}/items`, data);
    } catch (error) {
      console.log('Using local cart fallback for add item:', error.message);
      // Create local version of add item
      const cart = getLocalCart();
      const existingItem = cart.data.items.find(item => 
        item.productId === data.productId && 
        item.variantId === data.variantId
      );
      
      if (existingItem) {
        existingItem.quantity += data.quantity;
      } else {
        const newItem = {
          id: Date.now(),
          productId: data.productId,
          variantId: data.variantId || null,
          productName: data.productName || 'Product',
          price: data.price || 0,
          quantity: data.quantity,
          imageUrl: data.imageUrl || ''
        };
        cart.data.items.push(newItem);
      }
      
      // Update totals
      cart.data.totalItems = cart.data.items.reduce((sum, item) => sum + item.quantity, 0);
      cart.data.totalAmount = cart.data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      cart.data.updatedAt = new Date().toISOString();
      
      saveLocalCart(cart);
      return cart;
    }
  },
  
  // Mettre à jour la quantité d'un élément du panier
  updateItem: async (itemId: number, data: UpdateCartItemData): Promise<CartResponseData> => {
    try {
      return await axiosClient.put(`${baseUrl}/items/${itemId}`, data);
    } catch (error) {
      console.log('Using local cart fallback for update item:', error.message);
      const cart = getLocalCart();
      const item = cart.data.items.find(item => item.id === itemId);
      
      if (item) {
        item.quantity = data.quantity;
        
        // Update totals
        cart.data.totalItems = cart.data.items.reduce((sum, item) => sum + item.quantity, 0);
        cart.data.totalAmount = cart.data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cart.data.updatedAt = new Date().toISOString();
      }
      
      saveLocalCart(cart);
      return cart;
    }
  },
  
  // Supprimer un élément du panier
  removeItem: async (itemId: number): Promise<CartResponseData> => {
    try {
      return await axiosClient.delete(`${baseUrl}/items/${itemId}`);
    } catch (error) {
      console.log('Using local cart fallback for remove item:', error.message);
      const cart = getLocalCart();
      cart.data.items = cart.data.items.filter(item => item.id !== itemId);
      
      // Update totals
      cart.data.totalItems = cart.data.items.reduce((sum, item) => sum + item.quantity, 0);
      cart.data.totalAmount = cart.data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      cart.data.updatedAt = new Date().toISOString();
      
      saveLocalCart(cart);
      return cart;
    }
  },
  
  // Vider complètement le panier
  clearCart: async (): Promise<ResponseData<null>> => {
    try {
      return await axiosClient.delete(baseUrl);
    } catch (error) {
      console.log('Using local cart fallback for clear cart:', error.message);
      const emptyCart = createEmptyCart();
      saveLocalCart(emptyCart);
      return {
        status: 'success',
        data: null
      };
    }
  }
};

export default cartApi; 