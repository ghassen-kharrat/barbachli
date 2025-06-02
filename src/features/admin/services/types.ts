import { OrderData, OrderStatus } from '../../orders/services/types';
import { ResponseData } from '../../products/services/types';

// Chart period type
export type ChartPeriod = 'day' | 'week' | 'month' | 'year';

// Chart data point interface
export interface ChartDataPoint {
  date: string | Date;
  value: number;
}

// Admin stats data
export interface AdminStatsData {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  revenue: number;
  latestOrders: {
    id: number;
    reference: string;
    customer: {
      firstName: string;
      lastName: string;
    };
    totalPrice: number;
    createdAt: string;
  }[];
}

// Admin user data
export interface AdminUserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
}

// Parameters for orders query
export interface AdminOrdersQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus | 'all';
  search?: string;
}

// Parameters for users query
export interface AdminUsersQueryParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}

// Data for updating order status
export interface UpdateOrderStatusData {
  status: OrderStatus;
}

// Data for updating user status
export interface UpdateUserStatusData {
  isActive: boolean;
}

// Data for creating a new user
export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  isActive?: boolean;
}

// Response types
export type AdminStatsResponseData = ResponseData<AdminStatsData>;
export type PaginatedOrdersData = {
  success: boolean;
  data: OrderData[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedUsersData = {
  success: boolean;
  data: AdminUserData[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}; 