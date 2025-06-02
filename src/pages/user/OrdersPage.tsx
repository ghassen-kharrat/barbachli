import { Link } from 'react-router-dom';
import { styled } from 'styled-components';
import UserLayout from '../../layouts/UserLayout';
import { useOrders } from '../../features/orders/hooks/use-orders-query';
import { OrderStatus } from '../../features/orders/services/types';
import { FaIcons } from '../admin/components/Icons';
import { useLanguage } from '../../provider/LanguageProvider';

// Styles
const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  color: var(--text-color);
  margin-bottom: 2rem;
`;

const OrdersGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const OrderCard = styled.div`
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: var(--box-shadow);
  overflow: hidden;
`;

const OrderHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const OrderId = styled.div`
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--text-color);
`;

const OrderDate = styled.div`
  color: var(--light-text);
  font-size: 0.9rem;
`;

const StatusBadge = styled.div<{ $status: OrderStatus }>`
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  
  ${({ $status }) => {
    switch ($status) {
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

const OrderBody = styled.div`
  padding: 1.5rem;
`;

const OrderItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OrderItem = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
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

const OrderFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const OrderTotal = styled.div`
  font-weight: bold;
  font-size: 1.2rem;
  color: var(--secondary-color);
`;

const ViewButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background-color: var(--accent-color);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: var(--primary-color);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: var(--box-shadow);
`;

const EmptyStateText = styled.p`
  color: var(--light-text);
  margin-bottom: 1.5rem;
`;

const ShopButton = styled(Link)`
  display: inline-flex;
  padding: 0.8rem 2rem;
  background-color: var(--secondary-color);
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: var(--primary-color);
  }
`;

// Format date based on the current language
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

// Get status information with translations
const getStatusInfo = (status: OrderStatus, t: (key: string) => string) => {
  switch (status) {
    case 'pending':
      return {
        text: t('status_pending'),        
        icon: <FaIcons.FaRegClock />       
      };
    case 'processing':
      return {
        text: t('status_processing'),
        icon: <FaIcons.FaBoxOpen />        
      };
    case 'shipped':
      return {
        text: t('status_shipped'),
        icon: <FaIcons.FaTruck />        
      };
    case 'delivered':
      return {
        text: t('status_delivered'),
        icon: <FaIcons.FaCheckCircle />        
      };
    case 'cancelled':
      return {
        text: t('status_cancelled'),
        icon: <FaIcons.FaBan />        
      };
    default:
      return {
        text: status,
        icon: <FaIcons.FaQuestion />
      };
  }
};

// Function to calculate the actual order total with shipping fee
const calculateOrderTotal = (order: any) => {
  // Base price from items total
  const basePrice = order.totalPrice || 0;
  
  // Calculate shipping fee based on the same logic as in checkout
  const shippingFee = basePrice > 250 ? 0 : 7;
  
  // Total price is the sum of base price and shipping fee
  return parseFloat(basePrice) + parseFloat(shippingFee);
};

const OrdersPage = () => {
  const { data: ordersData, isLoading, error } = useOrders();
  const { t, language } = useLanguage();
  
  return (
    <UserLayout>
      <PageContainer>
        <PageTitle>{t('my_orders_title')}</PageTitle>
        
        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="error-message">
            {t('error_loading_orders')}
          </div>
        ) : ordersData?.data && ordersData.data.length > 0 ? (
          <OrdersGrid>
            {ordersData.data.map(order => (
              <OrderCard key={order.id}>
                <OrderHeader>
                  <OrderInfo>
                    <OrderId className={language === 'ar' ? 'rtl-reverse' : ''}>
                      <FaIcons.FaShoppingBag style={{ marginRight: language === 'ar' ? '0' : '8px', marginLeft: language === 'ar' ? '8px' : '0' }} />
                      {t('order_id')} {order.reference || `#${order.id}`}
                    </OrderId>
                    <OrderDate>
                      {formatDate(order.createdAt, language)}
                    </OrderDate>
                  </OrderInfo>
                  <StatusBadge $status={order.status}>
                    {getStatusInfo(order.status, t).icon} {getStatusInfo(order.status, t).text}
                  </StatusBadge>
                </OrderHeader>
                
                <OrderBody>
                  <OrderItems>
                    {(order.items || []).slice(0, 3).map((item, itemIndex) => (
                      <OrderItem key={itemIndex} className={language === 'ar' ? 'rtl-reverse' : ''}>
                        <ItemImage 
                          src={(item.product && item.product.images && item.product.images[0]) || '/placeholder-image.jpg'} 
                          alt={(item.product && item.product.name) || item.name || t('product_name')}
                        />
                        <ItemDetails>
                          <ItemName>{(item.product && item.product.name) || item.name || t('product_name')}</ItemName>
                          <ItemPrice>
                            {item.price !== undefined && item.price !== null 
                              ? (typeof item.price === 'number' 
                                  ? item.price.toFixed(3) 
                                  : Number(item.price).toFixed(3)) 
                              : '0.000'} DT
                          </ItemPrice>
                          <ItemQuantity className={language === 'ar' ? 'rtl-reverse' : ''}>
                            {t('product_quantity')}: {item.quantity}
                          </ItemQuantity>
                        </ItemDetails>
                      </OrderItem>
                    ))}
                    
                    {(order.items || []).length > 3 && (
                      <div style={{ color: 'var(--light-text)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                        {t('and_more_items', { count: (order.items || []).length - 3 })}
                      </div>
                    )}
                  </OrderItems>
                </OrderBody>
                
                <OrderFooter>
                  <OrderTotal>
                    {t('order_total')}: {
                      (calculateOrderTotal(order)).toFixed(3)
                    } DT
                  </OrderTotal>
                  <ViewButton 
                    to={`/orders/${order.id}`}
                    className={language === 'ar' ? 'rtl-reverse' : ''}
                  >
                    <FaIcons.FaEye /> {t('view_details')}
                  </ViewButton>
                </OrderFooter>
              </OrderCard>
            ))}
          </OrdersGrid>
        ) : (
          <EmptyState>
            <FaIcons.FaShoppingBag style={{ fontSize: '3rem', color: 'var(--light-text)', marginBottom: '1rem' }} />
            <h2>{t('no_orders_yet')}</h2>
            <EmptyStateText>{t('start_shopping_to_see_orders')}</EmptyStateText>
            <ShopButton to="/products" className={language === 'ar' ? 'rtl-reverse' : ''}>
              <FaIcons.FaShoppingCart style={{ marginRight: language === 'ar' ? '0' : '8px', marginLeft: language === 'ar' ? '8px' : '0' }} /> {t('explore_products')}
            </ShopButton>
          </EmptyState>
        )}
      </PageContainer>
    </UserLayout>
  );
};

export default OrdersPage; 