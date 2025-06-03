import axiosClient from '../../../apis/axios-client';
import { 
  CreateOrderData, 
  OrderResponseData, 
  PaginatedOrdersListData, 
  UpdateOrderStatusData 
} from './types';

// URL de base pour les endpoints des commandes
const baseUrl = '/orders';

// Paramètres de pagination par défaut
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

// Service API pour les commandes
const ordersApi = {
  // Récupérer la liste des commandes d'un utilisateur avec pagination
  getUserOrders: async (page = DEFAULT_PAGE, limit = DEFAULT_LIMIT): Promise<PaginatedOrdersListData> => {
    return axiosClient.get(`${baseUrl}?page=${page}&limit=${limit}`);
  },
  
  // Récupérer toutes les commandes (admin uniquement)
  getAllOrders: async (page = DEFAULT_PAGE, limit = DEFAULT_LIMIT): Promise<PaginatedOrdersListData> => {
    return axiosClient.get(`${baseUrl}/admin?page=${page}&limit=${limit}`);
  },
  
  // Récupérer les détails d'une commande par son ID
  getOrderDetails: async (id: number): Promise<OrderResponseData> => {
    return axiosClient.get(`${baseUrl}/${id}`);
  },
  
  // Créer une nouvelle commande à partir du panier actuel
  createOrder: async (data: CreateOrderData): Promise<OrderResponseData> => {
    return axiosClient.post(baseUrl, data);
  },
  
  // Annuler une commande (utilisateur ou admin)
  cancelOrder: async (id: number): Promise<OrderResponseData> => {
    return axiosClient.put(`${baseUrl}/${id}/cancel`);
  },
  
  // Mettre à jour le statut d'une commande (admin uniquement)
  updateOrderStatus: async (id: number, data: UpdateOrderStatusData): Promise<OrderResponseData> => {
    console.log(`Sending status update for order ${id}:`, data);
    try {
      const response = await axiosClient.put(`${baseUrl}/${id}/status`, data);
      console.log('Status update response:', response);
      return response as unknown as OrderResponseData;
    } catch (error) {
      console.error('API error updating status:', error);
      throw error;
    }
  }
};

export default ordersApi; 