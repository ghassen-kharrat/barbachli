import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import UserLayout from '../../layouts/UserLayout';
import { 
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart
} from '../../features/cart/hooks/use-cart-query';
import { useAuthCheck } from '../../features/auth/hooks/use-auth-query';
import { FaIcons } from '../admin/components/Icons';
import { useLanguage } from '../../provider/LanguageProvider';

// Styles
const CartContainer = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 2rem;
  
  @media (max-width: 992px) {
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CartTitle = styled.h1`
  color: var(--primary-color);
  margin-bottom: 2rem;
  
  @media (max-width: 576px) {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
`;

const CartItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (max-width: 576px) {
    gap: 1rem;
  }
`;

const CartItem = styled.div`
  display: grid;
  grid-template-columns: 100px 3fr 1fr 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  
  @media (max-width: 992px) {
    grid-template-columns: 80px 2fr 1fr 1fr auto;
    gap: 0.75rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 80px 1fr auto;
    grid-template-rows: auto auto;
    gap: 0.5rem;
    padding: 0.75rem;
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 70px 1fr auto;
    padding: 0.75rem;
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: var(--border-radius);
  
  @media (max-width: 768px) {
    grid-row: span 2;
    height: 80px;
  }
  
  @media (max-width: 576px) {
    height: 70px;
  }
`;

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    grid-column: 2 / span 1;
  }
`;

const ProductName = styled(Link)`
  font-weight: bold;
  color: var(--text-color);
  text-decoration: none;
  
  &:hover {
    color: var(--secondary-color);
  }
  
  @media (max-width: 576px) {
    font-size: 0.95rem;
    
    /* Limit to 2 lines with ellipsis */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const ProductPrice = styled.div`
  font-weight: bold;
  color: var(--secondary-color);
  
  @media (max-width: 768px) {
    grid-column: 2;
    grid-row: 2;
    font-size: 0.95rem;
  }
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    grid-column: 2;
    grid-row: 2;
    justify-self: end;
    margin-right: 1rem;
  }
  
  @media (max-width: 576px) {
    gap: 0.25rem;
  }
`;

const QuantityButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border-color);
  background-color: var(--light-bg);
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: var(--hover-bg);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 576px) {
    width: 28px;
    height: 28px;
  }
`;

const QuantityInput = styled.span`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  
  @media (max-width: 576px) {
    width: 28px;
    height: 28px;
  }
`;

const TotalPrice = styled.div`
  font-weight: bold;
  color: var(--text-color);
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background-color: var(--light-bg);
  color: var(--secondary-color);
  border-radius: 50%;
  cursor: pointer;
  
  &:hover {
    background-color: var(--secondary-color);
    color: white;
  }
  
  @media (max-width: 768px) {
    grid-column: 3;
    grid-row: 1;
  }
  
  @media (max-width: 576px) {
    width: 32px;
    height: 32px;
  }
`;

const EmptyCart = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding:.5rem;
  text-align: center;
`;

const EmptyCartIcon = styled.div`
  font-size: 3rem;
  color: #ddd;
`;

const EmptyCartMessage = styled.p`
  font-size: 1.2rem;
  color: #777;
`;

const ShopNowButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #e94560;
  color: white;
  padding: 0.8rem 2rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  
  &:hover {
    background-color: #d3405c;
  }
`;

const OrderSummary = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--box-shadow);
  position: sticky;
  top: 100px;
  height: fit-content;
  
  @media (max-width: 768px) {
    position: static;
    margin-top: 1rem;
  }
  
  @media (max-width: 576px) {
    padding: 1.25rem;
  }
`;

const SummaryTitle = styled.h2`
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  
  @media (max-width: 576px) {
    font-size: 1.2rem;
    margin-bottom: 1.25rem;
  }
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: var(--text-color);
  
  &:last-of-type {
    margin-bottom: 0;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
    font-weight: bold;
    font-size: 1.1rem;
  }
`;

const CheckoutButton = styled.button`
  width: 100%;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-top: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--primary-color);
  }
  
  &:disabled {
    background-color: var(--border-color);
    cursor: not-allowed;
  }
  
  @media (max-width: 576px) {
    padding: 0.875rem;
  }
`;

const ClearCartButton = styled.button`
  width: 100%;
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 0.75rem;
  margin-top: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--light-bg);
    color: var(--danger-color);
  }
`;

const CartPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { data: authData } = useAuthCheck();
  const { data: cartData, isLoading } = useCart();
  const { mutate: updateCartItem } = useUpdateCartItem();
  const { mutate: removeCartItem } = useRemoveCartItem();
  const { mutate: clearCart } = useClearCart();
  
  const isAuthenticated = authData && !!authData.data;
  const cart = cartData?.data;
  const cartItems = cart?.items || [];
  const cartEmpty = cartItems.length === 0;
  
  // Calculate totals
  const subtotal = cart?.totalPrice || 0;
  // Remove tax calculation (no more 20% TVA)
  // const tax = subtotal * 0.2; // 20% TVA (adjust according to needs)
  
  // Update shipping fee logic - 7 DT for orders under 200,000 DT
  const shipping = subtotal > 250 ? 0 : 7; 
  
  // Update total calculation (no tax)
  const total = subtotal + shipping;
  
  // Handle quantity change
  const handleQuantityChange = (itemId: number, quantity: number, maxStock: number) => {
    if (quantity < 1 || quantity > maxStock) return;
    
    updateCartItem({ 
      itemId, 
      quantity 
    });
  };
  
  // Handle item removal
  const handleRemoveItem = (itemId: number) => {
    if (window.confirm(t('confirm_remove_item'))) {
      removeCartItem(itemId);
    }
  };
  
  // Handle cart clearing
  const handleClearCart = () => {
    if (window.confirm(t('confirm_clear_cart'))) {
      clearCart();
    }
  };
  
  // Redirect to login if not authenticated
  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };
  
  if (isLoading) {
    return (
      <UserLayout>
        <div>{t('loading')}</div>
      </UserLayout>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <UserLayout>
        <EmptyCart>
          <EmptyCartIcon>
            <FaIcons.FaShoppingBag />
          </EmptyCartIcon>
          <EmptyCartMessage>
            {t('login_to_view_cart')}
          </EmptyCartMessage>
          <ShopNowButton to="/login?redirect=cart">
            {t('login')}
          </ShopNowButton>
        </EmptyCart>
      </UserLayout>
    );
  }
  
  if (cartEmpty) {
    return (
      <UserLayout>
        <EmptyCart>
          <EmptyCartIcon>
            <FaIcons.FaShoppingBag />
          </EmptyCartIcon>
          <EmptyCartMessage>
            {t('empty_cart')}
          </EmptyCartMessage>
          <ShopNowButton to="/products">
            {t('start_shopping')}
          </ShopNowButton>
        </EmptyCart>
      </UserLayout>
    );
  }
  
  return (
    <UserLayout>
      <CartTitle>{t('your_cart')} ({cart?.totalItems || 0} {t('items')})</CartTitle>
      
      <CartContainer>
        <CartItems>
          {cartItems.map((item) => (
            <CartItem key={item.id}>
              <ProductImage 
                src={item.product.images[0] || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_img%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%3Bfont-size%3A12pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_img%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2230%22%20y%3D%2255%22%3E%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'} 
                alt={item.product.name} 
              />
              
              <ProductDetails>
                <ProductName to={`/products/${item.productId}`}>
                  {item.product.name}
                </ProductName>
                <div>{t('category')}: {item.product.category}</div>
              </ProductDetails>
              
              <ProductPrice>
                {item.product.discountPrice 
                  ? `${item.product.discountPrice} DT` 
                  : `${item.product.price} DT`}
              </ProductPrice>
              
              <QuantityControl>
                <QuantityButton 
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.product.stock)}
                  disabled={item.quantity <= 1}
                >
                  <FaIcons.FaMinus size={12} />
                </QuantityButton>
                
                <QuantityInput>{item.quantity}</QuantityInput>
                
                <QuantityButton 
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.product.stock)}
                  disabled={item.quantity >= item.product.stock}
                >
                  <FaIcons.FaPlus size={12} />
                </QuantityButton>
              </QuantityControl>
              
              <TotalPrice>
                {((item.product.discountPrice || item.product.price) * item.quantity).toFixed(3)} DT
              </TotalPrice>
              
              <DeleteButton onClick={() => handleRemoveItem(item.id)}>
                <FaIcons.FaTrash />
              </DeleteButton>
            </CartItem>
          ))}
        </CartItems>
        
        <OrderSummary>
          <SummaryTitle>{t('order_summary')}</SummaryTitle>
          
          <SummaryRow>
            <span>{t('subtotal')}</span>
            <span>{subtotal.toFixed(3)} DT</span>
          </SummaryRow>
          
          <SummaryRow>
            <span>{t('shipping')}</span>
            <span>
              {shipping === 0 ? t('free') : `${shipping.toFixed(3)} DT`}
            </span>
          </SummaryRow>
          
          <SummaryRow>
            <span>{t('total')}</span>
            <span>{total.toFixed(3)} DT</span>
          </SummaryRow>
          
          <CheckoutButton onClick={handleCheckout}>
            {t('checkout')} <span><FaIcons.FaArrowRight /></span>
          </CheckoutButton>
          
          <ClearCartButton onClick={handleClearCart}>
            {t('clear_cart')}
          </ClearCartButton>
        </OrderSummary>
      </CartContainer>
    </UserLayout>
  );
};

export default CartPage; 