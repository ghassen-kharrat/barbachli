import { ResponseData } from "../../products/services/types";

// Cart item data model
export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    discountPrice?: number | null;
    images: string[];
    stock: number;
    category: string;
  };
}

// Cart data model
export interface CartData {
  id: number;
  userId: number;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// Data for adding item to cart
export interface AddToCartData {
  productId: number;
  quantity: number;
}

// Data for updating cart item
export interface UpdateCartItemData {
  quantity: number;
}

// Type for cart response
export type CartResponseData = ResponseData<CartData>; 