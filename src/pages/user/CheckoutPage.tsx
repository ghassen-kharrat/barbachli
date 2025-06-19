import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import UserLayout from '../../layouts/UserLayout';
import { useCart } from '../../features/cart/hooks/use-cart-query';
import { useCreateOrder } from '../../features/orders/hooks/use-orders-query';
import { useUserProfile } from '../../features/auth/hooks/use-auth-query';
import { CreateOrderData } from '../../features/orders/services/types';
import { FaIcons } from '../admin/components/Icons';
import { useLanguage } from '../../provider/LanguageProvider';

// Styles
const StyledCheckoutPage = styled.div`
  &.rtl {
    direction: rtl;
    text-align: right;
  }

  &.rtl .rtl-flex {
    flex-direction: row-reverse;
  }
`;

const CheckoutContainer = styled.div`
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 2rem;
  
  @media (max-width: 992px) {
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PageTitle = styled.h1`
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  
  @media (max-width: 576px) {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const FormSection = styled.div`
  margin-bottom: 2rem;
  
  @media (max-width: 576px) {
    margin-bottom: 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  
  @media (max-width: 576px) {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: bold;
  color: var(--text-color);
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }
  
  @media (max-width: 576px) {
    padding: 0.75rem;
  }
`;

const Textarea = styled.textarea`
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }
  
  @media (max-width: 576px) {
    padding: 0.75rem;
    min-height: 80px;
  }
`;

const ErrorText = styled.div`
  color: var(--error-color);
  font-size: 0.8rem;
`;

const PaymentMethod = styled.div`
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  margin-bottom: 1rem;
  background-color: var(--light-bg);
  
  &:hover {
    border-color: var(--accent-color);
  }
  
  @media (max-width: 576px) {
    padding: 1rem;
    gap: 0.75rem;
  }
`;

const PaymentIcon = styled.div`
  font-size: 1.5rem;
  color: var(--accent-color);
  
  @media (max-width: 576px) {
    font-size: 1.25rem;
  }
`;

const PaymentDetails = styled.div`
  flex-grow: 1;
`;

const PaymentTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.3rem;
  
  @media (max-width: 576px) {
    font-size: 1rem;
    margin-bottom: 0.2rem;
  }
`;

const PaymentDescription = styled.p`
  color: var(--light-text);
  font-size: 0.9rem;
  
  @media (max-width: 576px) {
    font-size: 0.85rem;
  }
`;

const PaymentCheck = styled.div<{ $selected: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${({ $selected }) => $selected ? '#e94560' : '#ddd'};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${({ $selected }) => $selected ? '#e94560' : 'transparent'};
  }
`;

const OrderSummary = styled.div`
  padding: 1.5rem;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  position: sticky;
  top: 100px;
  
  @media (max-width: 768px) {
    position: static;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 576px) {
    padding: 1.25rem;
  }
`;

const SummaryTitle = styled.h2`
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  
  @media (max-width: 576px) {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
`;

const OrderItems = styled.div`
  margin-bottom: 1.5rem;
  
  @media (max-width: 576px) {
    margin-bottom: 1rem;
  }
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--border-color);
  
  @media (max-width: 576px) {
    padding: 0.6rem 0;
  }
`;

const ItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 576px) {
    gap: 0.35rem;
  }
`;

const ItemQuantity = styled.span`
  background-color: #f1f1f1;
  color: #333;
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  font-size: 0.9rem;
`;

const ItemName = styled.span`
  font-weight: 500;
  
  @media (max-width: 576px) {
    font-size: 0.9rem;
    
    /* Limit to 1 line with ellipsis */
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const ItemPrice = styled.span`
  font-weight: 600;
  
  @media (max-width: 576px) {
    font-size: 0.9rem;
  }
`;

// Add missing styled components
const ItemsList = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ItemImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
`;

const ItemDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const TotalSection = styled.div`
  margin-top: 1.5rem;
  border-top: 1px solid #ddd;
  padding-top: 1rem;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  font-size: 0.95rem;
`;

const TotalRowFinal = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
`;

const TotalLabelFinal = styled.span`
  font-weight: bold;
  font-size: 1.2rem;
  color: #1a1a2e;
`;

const TotalValueFinal = styled.span`
  font-weight: bold;
  font-size: 1.2rem;
  color: #e94560;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
`;

const SummaryLabel = styled.span`
  color: #555;
`;

const SummaryValue = styled.span`
  font-weight: bold;
`;

const SummaryTotal = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid #ddd;
  font-size: 1.2rem;
`;

const TotalLabel = styled.span`
  font-weight: bold;
  color: #1a1a2e;
`;

const TotalValue = styled.span`
  font-weight: bold;
  color: #e94560;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  
  &:last-of-type {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
    font-weight: 600;
    font-size: 1.1rem;
  }
  
  @media (max-width: 576px) {
    &:last-of-type {
      font-size: 1rem;
    }
  }
`;

const PlaceOrderButton = styled.button`
  width: 100%;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-top: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
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

// Add type definitions for the CartItem and Cart
interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    discountPrice?: number;
    images?: string[];
  };
}

interface Cart {
  id: number;
  items: CartItem[];
  totalPrice: number;
}

interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
}

// Schéma de validation Yup
const getValidationSchema = (t: (key: string) => string) => Yup.object({
  shippingAddress: Yup.string().required(t('delivery_address') + ' ' + t('required')),
  shippingCity: Yup.string().required(t('city') + ' ' + t('required')),
  shippingZipCode: Yup.string().required(t('postal_code') + ' ' + t('required')),
  phoneNumber: Yup.string().required(t('phone_number') + ' ' + t('required')),
  notes: Yup.string()
});

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { data: cartData, isLoading: isCartLoading } = useCart();
  const { data: userData, isLoading: isUserLoading } = useUserProfile();
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();
  const { t, language } = useLanguage();
  
  // Use proper type casting to avoid TypeScript errors
  const cart = cartData?.data as Cart | undefined;
  const user = userData?.data as User | undefined;
  const cartItems = cart?.items || [];
  
  // Calculer les totaux
  const subtotal = cart?.totalPrice || 0;
  // Remove tax calculation
  // const tax = subtotal * 0.2; // 20% de TVA
  // Update shipping fee logic - 7 DT for orders under 200,000 DT
  const shipping = subtotal > 250 ? 0 : 7; 
  // Update total calculation (no tax)
  const total = subtotal + shipping;
  
  // État pour la méthode de paiement (seulement paiement à la livraison dans ce cas)
  const [paymentMethod] = useState('cash_on_delivery');
  
  // Formik pour gérer le formulaire avec valeurs initiales provenant du profil utilisateur
  const formik = useFormik({
    initialValues: {
      shippingAddress: user?.address || '',
      shippingCity: user?.city || '',
      shippingZipCode: user?.zipCode || '',
      phoneNumber: user?.phone || '',
      notes: ''
    },
    validationSchema: getValidationSchema(t),
    enableReinitialize: true,
    onSubmit: (values) => {
      const orderData: CreateOrderData = {
        shippingAddress: values.shippingAddress,
        shippingCity: values.shippingCity,
        shippingZipCode: values.shippingZipCode,
        phoneNumber: values.phoneNumber,
        notes: values.notes || undefined,
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      };
      
      createOrder(orderData, {
        onSuccess: (data) => {
          const orderId = data.data.id;
          navigate(`/orders/${orderId}?success=true`);
        }
      });
    }
  });
  
  // Afficher un message de chargement
  if (isCartLoading || isUserLoading) {
    return (
      <UserLayout>
        <div>{t('loading')}</div>
      </UserLayout>
    );
  }
  
  // Vérifier si le panier est vide
  if (!cart || cartItems.length === 0) {
    navigate('/cart');
    return null;
  }
  
  return (
    <UserLayout>
      <StyledCheckoutPage className={language === 'ar' ? 'rtl' : ''}>
        <PageTitle>{t('finalize_your_order')}</PageTitle>
        
        <CheckoutContainer>
          <Form onSubmit={formik.handleSubmit}>
            <FormSection>
              <SectionTitle>{t('delivery_information')}</SectionTitle>
              
              <FormGroup>
                <Label htmlFor="shippingAddress">{t('delivery_address')}</Label>
                <Input
                  id="shippingAddress"
                  name="shippingAddress"
                  type="text"
                  placeholder={t('complete_address')}
                  value={formik.values.shippingAddress}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.shippingAddress && formik.errors.shippingAddress && (
                  <ErrorText>{String(formik.errors.shippingAddress)}</ErrorText>
                )}
              </FormGroup>
              
              <FormRow>
                <FormGroup>
                  <Label htmlFor="shippingCity">{t('city')}</Label>
                  <Input
                    id="shippingCity"
                    name="shippingCity"
                    type="text"
                    placeholder={t('city')}
                    value={formik.values.shippingCity}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.shippingCity && formik.errors.shippingCity && (
                    <ErrorText>{String(formik.errors.shippingCity)}</ErrorText>
                  )}
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="shippingZipCode">{t('postal_code')}</Label>
                  <Input
                    id="shippingZipCode"
                    name="shippingZipCode"
                    type="text"
                    placeholder={t('postal_code')}
                    value={formik.values.shippingZipCode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.shippingZipCode && formik.errors.shippingZipCode && (
                    <ErrorText>{String(formik.errors.shippingZipCode)}</ErrorText>
                  )}
                </FormGroup>
              </FormRow>
              
              <FormGroup>
                <Label htmlFor="phoneNumber">{t('phone_number')}</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder={t('phone_for_delivery')}
                  value={formik.values.phoneNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                  <ErrorText>{String(formik.errors.phoneNumber)}</ErrorText>
                )}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="notes">{t('special_notes')}</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder={t('delivery_instructions')}
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </FormGroup>
            </FormSection>
            
            <FormSection>
              <SectionTitle>{t('payment_mode')}</SectionTitle>
              
              <PaymentMethod>
                <PaymentIcon>
                  <FaIcons.FaMoneyBillWave />
                </PaymentIcon>
                
                <PaymentDetails>
                  <PaymentTitle>{t('cash_on_delivery_title')}</PaymentTitle>
                  <PaymentDescription>
                    {t('cash_on_delivery_desc')}
                  </PaymentDescription>
                </PaymentDetails>
                
                <PaymentCheck $selected={true}>
                  <FaIcons.FaCheck size={12} />
                </PaymentCheck>
              </PaymentMethod>
            </FormSection>
            
            <PlaceOrderButton 
              type="submit"
              disabled={!formik.isValid || isCreatingOrder}
            >
              {isCreatingOrder ? t('processing_in_progress') : t('confirm_order')}
            </PlaceOrderButton>
          </Form>
          
          <OrderSummary>
            <SummaryTitle>{t('order_summary')}</SummaryTitle>
            
            <OrderItems>
              {cartItems.map((item: CartItem) => (
                <OrderItem key={item.id} className={language === 'ar' ? 'rtl-flex' : ''}>
                  <ItemInfo>
                    <ItemQuantity>{item.quantity}x</ItemQuantity>
                    <ItemName>{item.product.name}</ItemName>
                  </ItemInfo>
                  <ItemPrice>
                    {((item.product.discountPrice || item.product.price) * item.quantity).toFixed(3)} DT
                  </ItemPrice>
                </OrderItem>
              ))}
            </OrderItems>
            
            <SummaryItem>
              <SummaryLabel>{t('subtotal')}</SummaryLabel>
              <SummaryValue>{subtotal.toFixed(3)} DT</SummaryValue>
            </SummaryItem>
            
            <SummaryItem>
              <SummaryLabel>{t('shipping')}</SummaryLabel>
              <SummaryValue>
                {shipping === 0 ? t('free') : `${shipping.toFixed(3)} DT`}
              </SummaryValue>
            </SummaryItem>
            
            <SummaryTotal>
              <TotalLabel>{t('total')}</TotalLabel>
              <TotalValue>{total.toFixed(3)} DT</TotalValue>
            </SummaryTotal>
          </OrderSummary>
        </CheckoutContainer>
      </StyledCheckoutPage>
    </UserLayout>
  );
};

export default CheckoutPage; 