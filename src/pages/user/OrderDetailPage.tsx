import { useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { styled } from 'styled-components';
import { FaIcons } from '../admin/components/Icons';
import UserLayout from '../../layouts/UserLayout';
import { useOrderDetails, useCancelOrder } from '../../features/orders/hooks/use-orders-query';
import { OrderStatus } from '../../features/orders/services/types';
import { useLanguage } from '../../provider/LanguageProvider';

// Styles
const PageContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color);
  text-decoration: none;
  margin-bottom: 2rem;
  
  &:hover {
    color: var(--secondary-color);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const OrderTitle = styled.h1`
  color: var(--text-color);
  margin: 0;
`;

const OrderReference = styled.span`
  display: block;
  color: var(--light-text);
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

const StatusBadge = styled.div<{ status: OrderStatus }>`
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  
  ${({ status }) => {
    switch (status) {
      case 'pending':
        return `
          background-color: rgba(255, 152, 0, 0.1);
          color: var(--warning-color);
          border: 1px solid rgba(255, 152, 0, 0.3);
        `;
      case 'processing':
        return `
          background-color: rgba(25, 118, 210, 0.1);
          color: #1976d2;
          border: 1px solid rgba(25, 118, 210, 0.3);
        `;
      case 'shipped':
        return `
          background-color: rgba(56, 142, 60, 0.1);
          color: var(--success-color);
          border: 1px solid rgba(56, 142, 60, 0.3);
        `;
      case 'delivered':
        return `
          background-color: rgba(56, 142, 60, 0.1);
          color: var(--success-color);
          border: 1px solid rgba(56, 142, 60, 0.3);
        `;
      case 'cancelled':
        return `
          background-color: rgba(211, 47, 47, 0.1);
          color: var(--error-color);
          border: 1px solid rgba(211, 47, 47, 0.3);
        `;
      case 'refunded':
        return `
          background-color: rgba(123, 31, 162, 0.1);
          color: #7b1fa2;
          border: 1px solid rgba(123, 31, 162, 0.3);
        `;
      default:
        return `
          background-color: var(--light-bg);
          color: var(--text-color);
          border: 1px solid var(--border-color);
        `;
    }
  }}
`;

const SuccessMessage = styled.div`
  background-color: rgba(56, 142, 60, 0.1);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--success-color);
`;

const OrderGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const OrderDetailsCard = styled.div`
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: var(--box-shadow);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const CardHeader = styled.div`
  background-color: var(--light-bg);
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
`;

const CardTitle = styled.h2`
  color: var(--text-color);
  margin: 0;
  font-size: 1.2rem;
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

const ShippingInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const InfoIcon = styled.div`
  min-width: 24px;
  color: var(--light-text);
`;

const InfoContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoLabel = styled.span`
  color: var(--light-text);
  font-size: 0.9rem;
`;

const InfoValue = styled.span`
  color: var(--text-color);
  font-weight: bold;
`;

const OrderTimeline = styled.div`
  margin-top: 1rem;
`;

const TimelinePoint = styled.div<{ $active: boolean; $last?: boolean }>`
  display: flex;
  gap: 1rem;
  position: relative;
  padding-bottom: ${({ $last }) => $last ? '0' : '2rem'};
  
  &::before {
    content: '';
    position: absolute;
    left: 12px;
    top: 24px;
    bottom: ${({ $last }) => $last ? '0' : '0'};
    width: 2px;
    background-color: ${({ $active }) => $active ? 'var(--secondary-color)' : 'var(--border-color)'};
    display: ${({ $last }) => $last ? 'none' : 'block'};
  }
`;

const TimelineIcon = styled.div<{ $active: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ $active }) => $active ? 'var(--secondary-color)' : 'var(--light-bg)'};
  color: ${({ $active }) => $active ? 'white' : 'var(--light-text)'};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${({ $active }) => $active ? 'var(--secondary-color)' : 'var(--border-color)'};
  position: relative;
  z-index: 1;
`;

const TimelineContent = styled.div`
  flex: 1;
`;

const TimelineTitle = styled.h3<{ $active: boolean }>`
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: ${({ $active }) => $active ? 'var(--text-color)' : 'var(--light-text)'};
`;

const TimelineDate = styled.div`
  font-size: 0.9rem;
  color: var(--light-text);
`;

const OrderItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OrderItem = styled.div`
  display: flex;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const ItemImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
`;

const ItemDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const ItemName = styled.div`
  font-weight: bold;
  color: var(--text-color);
`;

const ItemPrice = styled.div`
  color: var(--light-text);
`;

const ItemQuantity = styled.div`
  color: var(--light-text);
  font-size: 0.9rem;
`;

const ProductTotal = styled.div`
  font-weight: bold;
  color: var(--secondary-color);
  min-width: 80px;
  text-align: right;
`;

const OrderSummary = styled.div``;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
`;

const SummaryLabel = styled.span`
  color: var(--light-text);
`;

const SummaryValue = styled.span`
  font-weight: bold;
  color: var(--text-color);
`;

const SummaryTotal = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid var(--border-color);
  font-size: 1.2rem;
`;

const TotalLabel = styled.span`
  font-weight: bold;
  color: var(--text-color);
`;

const TotalValue = styled.span`
  font-weight: bold;
  color: var(--secondary-color);
`;

const PaymentInfo = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--light-bg);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1.5rem;
`;

const PaymentLabel = styled.span`
  font-weight: bold;
  color: var(--text-color);
  margin-right: 0.5rem;
`;

const PaymentMethod = styled.span`
  color: var(--light-text);
`;

const ActionButton = styled.button`
  background-color: transparent;
  color: var(--secondary-color);
  border: 1px solid var(--secondary-color);
  border-radius: 4px;
  padding: 0.8rem 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;
  width: 100%;
  margin-top: 1.5rem;
  
  &:hover {
    background-color: rgba(233, 69, 96, 0.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: var(--border-color);
    color: var(--light-text);
  }
`;

const CancelButton = styled.button`
  background-color: transparent;
  color: var(--error-color);
  border: 1px solid var(--error-color);
  border-radius: 4px;
  padding: 0.8rem 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: rgba(211, 47, 47, 0.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const formatDate = (dateString: string, language: string) => {
  return new Date(dateString).toLocaleDateString(
    language === 'ar' ? 'ar-TN' : 'fr-FR', 
    {
    year: 'numeric',
    month: 'long',
      day: 'numeric'
    }
  );
};

const getStatusInfo = (status: OrderStatus, t: (key: string) => string) => {
  switch (status) {
    case 'pending':
      return {
        text: t('status_pending'),
        icon: <FaIcons.FaRegClock />,
        step: 1
      };
    case 'processing':
      return {
        text: t('status_processing'),
        icon: <FaIcons.FaBoxOpen />,
        step: 2
      };
    case 'shipped':
      return {
        text: t('status_shipped'),
        icon: <FaIcons.FaTruck />,
        step: 3
      };
    case 'delivered':
      return {
        text: t('status_delivered'),
        icon: <FaIcons.FaCheckCircle />,
        step: 4
      };
    case 'cancelled':
      return {
        text: t('status_cancelled'),
        icon: <FaIcons.FaBan />,
        step: 0
      };
    default:
      return {
        text: status,
        icon: <FaIcons.FaQuestion />,
        step: 0
      };
  }
};

const getPaymentStatus = (orderStatus: OrderStatus, t: (key: string) => string) => {
  if (orderStatus === 'delivered') {
    return t('paid');
  } else if (orderStatus === 'cancelled') {
    return t('status_cancelled');
  } else if (['processing', 'shipped'].includes(orderStatus)) {
    return t('processing_label');
  } else {
    return t('pending_payment');
  }
};

// Calculate the actual order total with shipping fee
const calculateOrderTotal = (order: any) => {
  // Get base price from items subtotal
  const baseSubtotal = (order.items || []).reduce((total: number, item: any) => {
    const itemPrice = item.price !== undefined && item.price !== null
      ? (typeof item.price === 'number' ? item.price : Number(item.price))
      : 0;
    return total + (itemPrice * (item.quantity || 1));
  }, 0);
  
  // Calculate shipping fee based on the same logic as in checkout
  const shippingFee = baseSubtotal > 250 ? 0 : 7;
  
  // Total price is the sum of base price and shipping fee
  return parseFloat(baseSubtotal.toString()) + parseFloat(shippingFee.toString());
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = parseInt(id || '0');
  
  const { data: orderData, isLoading, error } = useOrderDetails(orderId);
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();
  const { t, language } = useLanguage();
  
  // Use a more flexible type to avoid TypeScript errors
  const order = orderData?.data as any;
  
  const handleCancelOrder = () => {
    if (!order || isCancelling) return;
    
    if (window.confirm(t('confirm_cancel_order'))) {
      cancelOrder(order.id, {
        onSuccess: () => {
          console.log('Order cancelled successfully');
        },
        onError: (error) => {
          console.error('Error cancelling order', error);
        }
      });
    }
  };
  
  if (isLoading) {
    return (
      <UserLayout>
        <PageContainer>
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </PageContainer>
      </UserLayout>
    );
  }
  
  if (error || !order) {
    return (
      <UserLayout>
        <PageContainer>
          <BackLink to="/orders" className={language === 'ar' ? 'rtl-reverse' : ''}>
            <FaIcons.FaArrowLeft /> {t('back_to_orders')}
          </BackLink>
          <OrderDetailsCard>
            <CardBody>
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <FaIcons.FaExclamationTriangle style={{ fontSize: '2.5rem', color: 'var(--warning-color)', marginBottom: '1rem' }} />
                <h2>{t('error_loading_order')}</h2>
                <p>{t('error_loading_order_message')}</p>
              </div>
            </CardBody>
          </OrderDetailsCard>
        </PageContainer>
      </UserLayout>
    );
  }
  
  const statusInfo = getStatusInfo(order.status, t);
  const paymentStatus = getPaymentStatus(order.status, t);
  
  // Get recently delivered message from location state
  const successMessage = location.state?.successMessage;
  
  return (
    <UserLayout>
      <PageContainer>
        <BackLink to="/orders" className={language === 'ar' ? 'rtl-reverse' : ''}>
          <FaIcons.FaArrowLeft /> {t('back_to_orders')}
        </BackLink>
        
        {successMessage && (
          <SuccessMessage>
            <FaIcons.FaCheckCircle size={24} />
            <div>
              <strong>{t('order_placed_successfully')}</strong>
              <p>{t('order_confirmation_message')}</p>
            </div>
          </SuccessMessage>
        )}
        
        <OrderHeader>
          <div>
            <OrderTitle>{t('order_details_title')}</OrderTitle>
            <OrderReference>
              {t('order_id')} {order.reference || `#${order.id}`} - {formatDate(order.createdAt, language)}
            </OrderReference>
          </div>
          <StatusBadge status={order.status}>
            {statusInfo.icon} {statusInfo.text}
          </StatusBadge>
        </OrderHeader>
        
        <OrderGrid>
          <div>
            <OrderDetailsCard>
              <CardHeader>
                <CardTitle>{t('ordered_products')}</CardTitle>
              </CardHeader>
              <CardBody>
                <OrderItems>
                  {(order.items || []).map((item: any, index: number) => (
                    <OrderItem key={index} className={language === 'ar' ? 'rtl-reverse' : ''}>
                      <ItemImage 
                        src={(item.product && item.product.images && item.product.images[0]) || '/placeholder-image.jpg'} 
                        alt={(item.product && item.product.name) || (item.productId?.toString() || t('product_name'))}
                      />
                      <div style={{ flex: 1 }}>
                        <ItemName>{(item.product && item.product.name) || (item.productId?.toString() || t('product_name'))}</ItemName>
                        <ItemPrice>{t('price')}: 
                          {item.price !== undefined && item.price !== null 
                            ? (typeof item.price === 'number' 
                                ? item.price.toFixed(3) 
                                : Number(item.price).toFixed(3)) 
                            : '0.000'} DT
                        </ItemPrice>
                        <ItemQuantity>{t('product_quantity')}: {item.quantity}</ItemQuantity>
                      </div>
                      <ProductTotal>
                        {item.price !== undefined && item.price !== null 
                          ? (typeof item.price === 'number' 
                              ? (item.price * item.quantity).toFixed(3) 
                              : (Number(item.price) * item.quantity).toFixed(3)) 
                          : '0.000'} DT
                      </ProductTotal>
                    </OrderItem>
                  ))}
                </OrderItems>
                
                <OrderSummary>
                  <SummaryItem>
                    <SummaryLabel>{t('order_subtotal')}</SummaryLabel>
                    <SummaryValue>
                      {(order.items || []).reduce((total: number, item: any) => {
                        const itemPrice = item.price !== undefined && item.price !== null
                          ? (typeof item.price === 'number' ? item.price : Number(item.price))
                          : 0;
                        return total + (itemPrice * (item.quantity || 1));
                      }, 0).toFixed(3)} DT
                    </SummaryValue>
                  </SummaryItem>
                  <SummaryItem>
                    <SummaryLabel>{t('shipping_fee')}</SummaryLabel>
                    <SummaryValue>
                      {(() => {
                        const subtotal = (order.items || []).reduce((total: number, item: any) => {
                          const itemPrice = item.price !== undefined && item.price !== null
                            ? (typeof item.price === 'number' ? item.price : Number(item.price))
                            : 0;
                          return total + (itemPrice * (item.quantity || 1));
                        }, 0);
                        return subtotal > 250 ? t('free') : '7.000 DT';
                      })()}
                    </SummaryValue>
                  </SummaryItem>
                  <SummaryTotal>
                    <TotalLabel>{t('order_total')}</TotalLabel>
                    <TotalValue>
                      {(calculateOrderTotal(order)).toFixed(3)} DT
                    </TotalValue>
                  </SummaryTotal>
                </OrderSummary>
              </CardBody>
            </OrderDetailsCard>
            
            {order.status === 'pending' && (
              <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                <CancelButton 
                  onClick={handleCancelOrder} 
                  disabled={isCancelling}
                  className={language === 'ar' ? 'rtl-reverse' : ''}
                >
                  <FaIcons.FaBan /> {t('cancel_order')}
                </CancelButton>
              </div>
            )}
          </div>
          
          <div>
            <OrderDetailsCard>
              <CardHeader>
                <CardTitle>{t('shipping_info')}</CardTitle>
              </CardHeader>
              <CardBody>
                <ShippingInfo>
                  <InfoRow className={language === 'ar' ? 'rtl-reverse' : ''}>
                    <InfoIcon>
                      <FaIcons.FaUser />
                    </InfoIcon>
                    <InfoContent>
                      <InfoLabel>{t('name')}</InfoLabel>
                      <InfoValue>{order.customer?.firstName || order.firstName || ''} {order.customer?.lastName || order.lastName || ''}</InfoValue>
                    </InfoContent>
                  </InfoRow>
                  <InfoRow className={language === 'ar' ? 'rtl-reverse' : ''}>
                    <InfoIcon>
                      <FaIcons.FaMapMarkerAlt />
                    </InfoIcon>
                    <InfoContent>
                      <InfoLabel>{t('address')}</InfoLabel>
                      <InfoValue>
                        {order.shippingAddress?.street || order.shippingAddress || t('not_provided')}
                        <br />
                        {order.shippingAddress?.zipCode || order.shippingZipCode || ''} {order.shippingAddress?.city || order.shippingCity || ''}
                        <br />
                        {order.shippingAddress?.country || order.shippingCountry || t('default_country')}
                      </InfoValue>
                    </InfoContent>
                  </InfoRow>
                  <InfoRow className={language === 'ar' ? 'rtl-reverse' : ''}>
                    <InfoIcon>
                      <FaIcons.FaPhone />
                    </InfoIcon>
                    <InfoContent>
                      <InfoLabel>{t('phone_label')}</InfoLabel>
                      <InfoValue>{order.customer?.phone || order.phoneNumber || t('not_provided')}</InfoValue>
                    </InfoContent>
                  </InfoRow>
                  <InfoRow className={language === 'ar' ? 'rtl-reverse' : ''}>
                    <InfoIcon>
                      <FaIcons.FaEnvelope />
                    </InfoIcon>
                    <InfoContent>
                      <InfoLabel>{t('email')}</InfoLabel>
                      <InfoValue>{order.customer?.email || order.email || t('not_provided')}</InfoValue>
                    </InfoContent>
                  </InfoRow>
                </ShippingInfo>
              </CardBody>
            </OrderDetailsCard>
            
            <OrderDetailsCard style={{ marginTop: '2rem' }}>
              <CardHeader>
                <CardTitle>{t('payment_info')}</CardTitle>
              </CardHeader>
              <CardBody>
                <ShippingInfo>
                  <InfoRow className={language === 'ar' ? 'rtl-reverse' : ''}>
                    <InfoIcon>
                      <FaIcons.FaCreditCard />
                    </InfoIcon>
                    <InfoContent>
                      <InfoLabel>{t('payment_method')}</InfoLabel>
                      <InfoValue>{order.paymentMethod || t('cash_on_delivery')}</InfoValue>
                    </InfoContent>
                  </InfoRow>
                  <InfoRow className={language === 'ar' ? 'rtl-reverse' : ''}>
                    <InfoIcon>
                      <FaIcons.FaMoneyBillWave />
                    </InfoIcon>
                    <InfoContent>
                      <InfoLabel>{t('payment_status')}</InfoLabel>
                      <InfoValue>{paymentStatus}</InfoValue>
                    </InfoContent>
                  </InfoRow>
                </ShippingInfo>
              </CardBody>
            </OrderDetailsCard>
            
            <OrderDetailsCard style={{ marginTop: '2rem' }}>
              <CardHeader>
                <CardTitle>{t('order_track')}</CardTitle>
              </CardHeader>
              <CardBody>
                <OrderTimeline className={language === 'ar' ? 'rtl' : ''}>
                  <TimelinePoint $active={true} $last={false}>
                    <TimelineIcon $active={true}>
                      <FaIcons.FaFileInvoice />
                    </TimelineIcon>
                    <TimelineContent>
                      <TimelineTitle $active={true}>{t('order_passed')}</TimelineTitle>
                      <TimelineDate>{formatDate(order.createdAt, language)}</TimelineDate>
                    </TimelineContent>
                  </TimelinePoint>
                  
                  <TimelinePoint $active={statusInfo.step >= 2} $last={false}>
                    <TimelineIcon $active={statusInfo.step >= 2}>
                      <FaIcons.FaBoxOpen />
                    </TimelineIcon>
                    <TimelineContent>
                      <TimelineTitle $active={statusInfo.step >= 2}>{t('processing_label')}</TimelineTitle>
                      <TimelineDate>
                        {statusInfo.step >= 2 && order.updatedAt ? formatDate(order.updatedAt, language) : ''}
                      </TimelineDate>
                    </TimelineContent>
                  </TimelinePoint>
                  
                  <TimelinePoint $active={statusInfo.step >= 3} $last={false}>
                    <TimelineIcon $active={statusInfo.step >= 3}>
                      <FaIcons.FaTruck />
                    </TimelineIcon>
                    <TimelineContent>
                      <TimelineTitle $active={statusInfo.step >= 3}>{t('status_shipped')}</TimelineTitle>
                      <TimelineDate>
                        {statusInfo.step >= 3 && order.shippedAt ? formatDate(order.shippedAt, language) : ''}
                      </TimelineDate>
                    </TimelineContent>
                  </TimelinePoint>
                  
                  <TimelinePoint $active={statusInfo.step >= 4} $last={true}>
                    <TimelineIcon $active={statusInfo.step >= 4}>
                      <FaIcons.FaCheckCircle />
                    </TimelineIcon>
                    <TimelineContent>
                      <TimelineTitle $active={statusInfo.step >= 4}>{t('status_delivered')}</TimelineTitle>
                      <TimelineDate>
                        {statusInfo.step >= 4 && order.deliveredAt ? formatDate(order.deliveredAt, language) : ''}
                      </TimelineDate>
                    </TimelineContent>
                  </TimelinePoint>
                </OrderTimeline>
              </CardBody>
            </OrderDetailsCard>
          </div>
        </OrderGrid>
      </PageContainer>
    </UserLayout>
  );
};

export default OrderDetailPage; 