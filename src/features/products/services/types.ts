// Generic response type
export interface ResponseData<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Category data model
export interface CategoryData {
  id: number;
  name: string;
  slug: string;
  description?: string;
  productCount?: number;
  parentId?: number;
  createdAt: string;
}

// Product data model
export interface ProductData {
  id: number;
  name: string;
  description: string;
  price: number | string;
  discountPrice?: number | string | null;
  stock: number;
  images: string[];
  category: string;
  categoryId?: number;
  categoryName?: string;
  categorySlug?: string;
  rating?: number;
  reviews?: number;
  createdAt: string;
  updatedAt: string;
}

// Mutation data for creating/updating products
export interface ProductDataMutation {
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  images: string[];
  category: string;
  categoryId?: number;
}

// Filters for product queries
export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'createdAt' | 'name' | 'rating' | 'discountPrice' | 'stock';
  sortDirection?: 'asc' | 'desc';
  hasDiscount?: boolean;
}

// Product list response type
export interface ProductsListData {
  items: ProductData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Category list response
export interface CategoriesListData {
  success: boolean;
  data: CategoryData[];
} 

// Review types
export interface ReviewData {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  firstName?: string;
  lastName?: string;
}

export interface ReviewInput {
  rating: number;
  title: string;
  comment: string;
}

export interface ReviewsListData {
  success: boolean;
  data: ReviewData[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  stats: {
    averageRating: number;
    distribution: RatingDistribution[];
  }
}

export interface RatingDistribution {
  rating: number;
  count: string;
}

export interface AdminReviewData extends ReviewData {
  isApproved: boolean;
  productName: string;
  email?: string;
}

export interface AdminReviewsListData {
  success: boolean;
  data: AdminReviewData[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
} 