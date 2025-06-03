import { ResponseData } from "../../products/services/types";

// Enumeration of possible order statuses
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

// Item in order
export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    images: string[];
  };
}

// Order data model
export interface OrderData {
  id: number;
  userId: number;
  reference: string;
  status: OrderStatus;
  shippingAddress?: string | {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  shippingCity: string;
  shippingZipCode: string;
  phoneNumber: string;
  notes: string;
  items: OrderItem[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  shippingFee?: number;
  shippingCountry?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  transactionId?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

// Data for creating a new order
export interface CreateOrderData {
  items: {
    productId: number;
    quantity: number;
  }[];
  shippingAddress: string;
  shippingCity: string;
  shippingZipCode: string;
  phoneNumber: string;
  notes?: string;
}

// Data for updating order status
export interface UpdateOrderStatusData {
  status: OrderStatus;
}

// Types for API responses
export type OrderResponseData = ResponseData<OrderData>;
export type OrdersResponseData = ResponseData<OrderData[]>;

// Type for paginated orders list response
export interface PaginatedOrdersListData extends ResponseData<OrderData[]> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
} 