import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import { FaIcons } from './components/Icons';
import AdminLayout from '../../layouts/AdminLayout';
import { useOrderDetail, useUpdateOrderStatus } from '../../features/orders/hooks/use-orders-query';
import { OrderStatus } from '../../features/orders/services/types';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import InvoicePrint from './components/InvoicePrint';
import '../../../src/styles/invoice-print.css';
import { useLanguage } from '../../provider/LanguageProvider';

// Styles
const PageContainer = styled.div`
  padding: 0;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: none;
  border: none;
  color: var(--accent-color);
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--border-radius);
  
  &:hover {
    background-color: rgba(15, 52, 96, 0.05);
  }
`;

const OrderCard = styled.div`
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background-color: var(--primary-color);
  color: white;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const OrderTitle = styled.h2`
  margin: 0;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const OrderMeta = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }
`;

const OrderMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const OrderContent = styled.div`
  padding: 1.5rem;
`;

const SectionTitle = styled.h3`
  color: var(--primary-color);
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  
  ${({ $status }) => {
    switch ($status) {
      case 'pending':
        return `
          background-color: #fff8e1;
          color: #f9a825;
        `;
      case 'processing':
        return `
          background-color: #e3f2fd;
          color: #1976d2;
        `;
      case 'shipped':
        return `
          background-color: #e0f2f1;
          color: #00897b;
        `;
      case 'delivered':
        return `
          background-color: #e8f5e9;
          color: #43a047;
        `;
      case 'cancelled':
        return `
          background-color: #ffebee;
          color: #e53935;
        `;
      default:
        return `
          background-color: #f5f5f5;
          color: #757575;
        `;
    }
  }}
`;

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'pending':
      return <FaIcons.FaRegClock />;
    case 'processing':
      return <FaIcons.FaSync />;
    case 'shipped':
      return <FaIcons.FaTruck />;
    case 'delivered':
      return <FaIcons.FaCheckCircle />;
    case 'cancelled':
      return <FaIcons.FaBan />;
    default:
      return <FaIcons.FaQuestion />;
  }
};

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const InfoCard = styled.div`
  background-color: var(--light-bg);
  padding: 1.5rem;
  border-radius: var(--border-radius);
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 0.3rem;
  }
`;

const InfoLabel = styled.span`
  color: var(--light-text);
  font-weight: 500;
`;

const InfoValue = styled.span`
  font-weight: 500;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const TableHead = styled.thead`
  background-color: var(--light-bg);
`;

const TableRow = styled.tr`
  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--primary-color);
`;

const TableCell = styled.td`
  padding: 1rem;
  vertical-align: middle;
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ProductImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius);
  object-fit: cover;
`;

const ProductName = styled.div`
  font-weight: 500;
`;

const ProductSku = styled.div`
  font-size: 0.8rem;
  color: var(--light-text);
`;

const TotalRow = styled.tr`
  border-top: 2px solid var(--border-color);
  font-weight: 600;
  
  td {
    padding-top: 1rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background-color: var(--accent-color);
  color: white;
  border: none;
  
  &:hover {
    background-color: var(--primary-color);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: white;
  color: var(--accent-color);
  border: 1px solid var(--accent-color);
  
  &:hover {
    background-color: var(--light-bg);
  }
`;

const OrderActions = styled.div`
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ActionButton = styled(Button)<{ $variant?: string }>`
  ${({ $variant = 'default' }) => {
    switch ($variant) {
      case 'process':
        return `
          background-color: #1976d2;
          color: white;
          border: none;
          
          &:hover {
            background-color: #1565c0;
          }
        `;
      case 'ship':
        return `
          background-color: #00897b;
          color: white;
          border: none;
          
          &:hover {
            background-color: #00796b;
          }
        `;
      case 'deliver':
        return `
          background-color: #43a047;
          color: white;
          border: none;
          
          &:hover {
            background-color: #388e3c;
          }
        `;
      case 'cancel':
        return `
          background-color: #e53935;
          color: white;
          border: none;
          
          &:hover {
            background-color: #d32f2f;
          }
        `;
      default:
        return `
          background-color: white;
          color: var(--accent-color);
          border: 1px solid var(--accent-color);
          
          &:hover {
            background-color: var(--light-bg);
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorContainer = styled.div`
  padding: 2rem;
  text-align: center;
  background-color: #ffebee;
  border-radius: var(--border-radius);
  color: #e53935;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
`;

// Add company info constant
const COMPANY_INFO = {
  name: 'E-Shop Tunisie',
  address: '123 Avenue Habib Bourguiba, Tunis 1000',
  phone: '+216 71 123 456',
  email: 'contact@eshop.tn',
  website: 'www.eshop.tn',
  taxId: '1234567/A/M/000',
};

// Add a function to determine payment status based on order status
const getPaymentStatusFromOrderStatus = (status: string) => {
  if (status === 'delivered') {
    return 'paid';
  } else if (status === 'cancelled') {
    return 'cancelled';
  } else {
    return 'pending';
  }
};

// Add a function to get payment status text
const getPaymentStatusText = (status: string, orderStatus: string) => {
  // If explicit payment status exists, use it
  if (status === 'paid') {
    return 'Payé';
  }
  
  // Otherwise derive from order status
  switch (orderStatus) {
    case 'delivered':
      return 'Payé';
    case 'cancelled':
      return 'Annulé';
    default:
      return 'En attente';
  }
};

// Add a function to get payment status icon and color
const getPaymentStatusDisplay = (paymentStatus: string, orderStatus: string) => {
  // If explicit payment status exists, use it
  if (paymentStatus === 'paid') {
    return {
      icon: <FaIcons.FaCheckCircle />,
      color: '#43a047',
      text: 'Payé'
    };
  }
  
  // Otherwise derive from order status
  switch (orderStatus) {
    case 'delivered':
      return {
        icon: <FaIcons.FaCheckCircle />,
        color: '#43a047',
        text: 'Payé'
      };
    case 'cancelled':
      return {
        icon: <FaIcons.FaBan />,
        color: '#e53935',
        text: 'Annulé'
      };
    case 'processing':
    case 'shipped':
      return {
        icon: <FaIcons.FaSync />,
        color: '#1976d2',
        text: 'En cours'
      };
    default:
      return {
        icon: <FaIcons.FaRegClock />,
        color: '#f9a825',
        text: 'En attente'
      };
  }
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const orderId = parseInt(id);
  const navigate = useNavigate();
  
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const printRef = useRef(null);
  
  const {
    data: orderData,
    isLoading,
    error,
    refetch
  } = useOrderDetail(orderId);
  
  const updateOrderStatus = useUpdateOrderStatus();
  const { t, language } = useLanguage();
  
  const order = orderData?.data;
  
  useEffect(() => {
    if (order) {
      console.log('Order data:', order);
    }
  }, [order]);
  
  // Handle printing
  const handlePrint = () => {
    setShowPrintView(true);
    setTimeout(() => {
      window.print();
      setShowPrintView(false);
    }, 300);
  };
  
  const handleBack = () => {
    navigate('/admin/orders');
  };
  
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      console.log(`Attempting to update order ${orderId} status to: ${newStatus}`);
      
      const result = await updateOrderStatus.mutateAsync({
        id: orderId,
        status: newStatus as OrderStatus
      });
      
      console.log('Update status response:', result);
      toast.success(`Statut de la commande mis à jour : ${getStatusText(newStatus)}`);
      refetch();
    } catch (error) {
      console.error('Error updating order status:', error);
      
      // Show more detailed error message
      if (error instanceof AxiosError && error.response) {
        toast.error(`Erreur: ${error.response.data?.message || 'Erreur lors de la mise à jour du statut'}`);
      } else {
        toast.error('Erreur lors de la mise à jour du statut de la commande');
      }
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get appropriate status text in French
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return t('status_pending');
      case 'processing':
        return t('status_processing');
      case 'shipped':
        return t('status_shipped');
      case 'delivered':
        return t('status_delivered');
      case 'cancelled':
        return t('status_cancelled');
      default:
        return status;
    }
  };
  
  // Calculate the total price of the order
  const calculateTotal = (items: any[]) => {
    const basePrice = items.reduce((total, item) => {
      const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price || '0');
      return total + (itemPrice * item.quantity);
    }, 0);
    
    // Total price is the sum of base price and shipping fee
    return parseFloat(basePrice.toString()) + parseFloat((order?.shippingFee || 0).toString());
  };
  
  if (isLoading) {
    return (
      <AdminLayout title={t('order_details_title')}>
        <LoadingContainer>
          <Spinner />
        </LoadingContainer>
      </AdminLayout>
    );
  }
  
  if (error || !order) {
    return (
      <AdminLayout title={t('order_details_title')}>
        <PageContainer>
          <BackButton onClick={handleBack}>
            <FaIcons.FaArrowLeft /> {t('back_to_orders')}
          </BackButton>
          
          <ErrorContainer>
            <ErrorIcon>
              <FaIcons.FaExclamationTriangle />
            </ErrorIcon>
            <h2>{t('error_loading_order')}</h2>
            <p>{t('error_loading_order_message')}</p>
            <SecondaryButton onClick={handleBack}>
              {t('back_to_orders')}
            </SecondaryButton>
          </ErrorContainer>
        </PageContainer>
      </AdminLayout>
    );
  }
  
  // Use reference for order number if available
  const orderNumber = order.reference || (order as any).orderNumber || `#${order.id}`;
  
  return (
    <AdminLayout title={`${t('order_details_title')} ${orderNumber}`}>
      <PageContainer>
        <BackButton onClick={handleBack} className={language === 'ar' ? 'rtl-reverse' : ''}>
          <FaIcons.FaArrowLeft /> {t('back_to_orders')}
        </BackButton>
        
        <OrderCard>
          <OrderHeader>
            <OrderTitle className={language === 'ar' ? 'rtl-reverse' : ''}>
              <FaIcons.FaShoppingBag /> {t('order_id')} {orderNumber}
            </OrderTitle>
            
            <OrderMeta>
              <OrderMetaItem className={language === 'ar' ? 'rtl-reverse' : ''}>
                <FaIcons.FaCalendarDay />
                {formatDate(order.createdAt)}
              </OrderMetaItem>
              
              <OrderMetaItem className={language === 'ar' ? 'rtl-reverse' : ''}>
                <StatusBadge $status={order.status}>
                  <StatusIcon status={order.status} />
                  {getStatusText(order.status)}
                </StatusBadge>
              </OrderMetaItem>
            </OrderMeta>
          </OrderHeader>
          
          <OrderContent>
            <Grid>
              <div>
                <SectionTitle className={language === 'ar' ? 'rtl-reverse' : ''}>
                  <FaIcons.FaUser /> {t('customer_info')}
                </SectionTitle>
                <InfoCard>
                  <InfoList>
                    <InfoItem>
                      <InfoLabel>{t('name')}</InfoLabel>
                      <InfoValue>
                        {order.customer?.firstName || ''} {order.customer?.lastName || ''}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>{t('email')}</InfoLabel>
                      <InfoValue>{order.customer?.email || t('not_provided')}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>{t('phone_label')}</InfoLabel>
                      <InfoValue>{order.customer?.phone || order.phoneNumber || t('not_provided')}</InfoValue>
                    </InfoItem>
                  </InfoList>
                </InfoCard>
              </div>
              
              <div>
                <SectionTitle className={language === 'ar' ? 'rtl-reverse' : ''}>
                  <FaIcons.FaTruck /> {t('shipping_info')}
                </SectionTitle>
                <InfoCard>
                  <InfoList>
                    <InfoItem>
                      <InfoLabel>{t('address')}</InfoLabel>
                      <InfoValue>
                        {typeof order.shippingAddress === 'string' 
                          ? order.shippingAddress 
                          : (order.shippingAddress as any)?.street || order.shippingAddress || t('not_provided')}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>{t('city')}</InfoLabel>
                      <InfoValue>
                        {typeof order.shippingAddress === 'string' 
                          ? (order as any).shippingCity 
                          : (order.shippingAddress as any)?.city || (order as any).shippingCity || t('not_provided')}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>{t('postal_code_label')}</InfoLabel>
                      <InfoValue>
                        {typeof order.shippingAddress === 'string' 
                          ? (order as any).shippingZipCode 
                          : (order.shippingAddress as any)?.zipCode || (order as any).shippingZipCode || t('not_provided')}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>{t('country')}</InfoLabel>
                      <InfoValue>
                        {typeof order.shippingAddress === 'string' 
                          ? (order as any).shippingCountry 
                          : (order.shippingAddress as any)?.country || (order as any).shippingCountry || t('default_country')}
                      </InfoValue>
                    </InfoItem>
                  </InfoList>
                </InfoCard>
              </div>
            </Grid>
            
            <div style={{ marginTop: '2rem' }}>
              <SectionTitle className={language === 'ar' ? 'rtl-reverse' : ''}>
                <FaIcons.FaBoxOpen /> {t('ordered_products')}
              </SectionTitle>
              
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>{t('product_name')}</TableHeader>
                    <TableHeader>{t('product_price')}</TableHeader>
                    <TableHeader>{t('product_quantity')}</TableHeader>
                    <TableHeader>{t('order_total')}</TableHeader>
                  </TableRow>
                </TableHead>
                <tbody>
                  {(order.items || []).map((item, index) => (
                    <TableRow key={item.id || index}>
                      <TableCell>
                        <ProductInfo className={language === 'ar' ? 'rtl-reverse' : ''}>
                          <ProductImage 
                            src={(item.product && item.product.images && item.product.images[0]) || 'placeholder-image.jpg'} 
                            alt={(item.product && item.product.name) || t('product_name')}
                          />
                          <div>
                            <ProductName>{(item.product && item.product.name) || (item as any).name || t('product_name')}</ProductName>
                            <ProductSku>SKU: {(item.product && item.product.id) || item.productId || t('not_available')}</ProductSku>
                          </div>
                        </ProductInfo>
                      </TableCell>
                      <TableCell>
                        {item.price !== undefined && item.price !== null
                          ? (typeof item.price === 'number' 
                              ? item.price.toFixed(3) 
                              : Number(item.price).toFixed(3))
                          : '0.000'} DT
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        {item.price !== undefined && item.price !== null
                          ? (typeof item.price === 'number' 
                              ? (item.price * item.quantity).toFixed(3) 
                              : (Number(item.price) * item.quantity).toFixed(3))
                          : '0.000'} DT
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  <TotalRow>
                    <TableCell colSpan={3} style={{ textAlign: language === 'ar' ? 'left' : 'right' }}>{t('order_subtotal')}:</TableCell>
                    <TableCell>{calculateTotal(order.items || []).toFixed(3)} DT</TableCell>
                  </TotalRow>
                  <TotalRow>
                    <TableCell colSpan={3} style={{ textAlign: language === 'ar' ? 'left' : 'right' }}>{t('shipping_fee')}:</TableCell>
                    <TableCell>
                      {order.shippingFee !== undefined && order.shippingFee !== null 
                        ? (typeof order.shippingFee === 'number' 
                            ? order.shippingFee.toFixed(3) 
                            : Number(order.shippingFee).toFixed(3)) 
                        : '0.000'} DT
                    </TableCell>
                  </TotalRow>
                  <TotalRow>
                    <TableCell colSpan={3} style={{ textAlign: language === 'ar' ? 'left' : 'right' }}>{t('order_total')}:</TableCell>
                    <TableCell>
                      {(order.totalPrice !== undefined && order.totalPrice !== null)
                        ? (typeof order.totalPrice === 'number'
                            ? order.totalPrice.toFixed(3)
                            : Number(order.totalPrice).toFixed(3))
                        : (calculateTotal(order.items || []) + (
                            order.shippingFee !== undefined && order.shippingFee !== null 
                              ? (typeof order.shippingFee === 'number' 
                                  ? order.shippingFee 
                                  : Number(order.shippingFee)) 
                              : 0
                          )).toFixed(3)} DT
                    </TableCell>
                  </TotalRow>
                </tbody>
              </Table>
            </div>
            
            <div style={{ marginTop: '2rem' }}>
              <SectionTitle className={language === 'ar' ? 'rtl-reverse' : ''}>
                <FaIcons.FaMoneyBillWave /> {t('payment_info')}
              </SectionTitle>
              <InfoCard>
                <InfoList>
                  <InfoItem>
                    <InfoLabel>{t('payment_method')}</InfoLabel>
                    <InfoValue>{order.paymentMethod || t('cash_on_delivery')}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>{t('payment_status')}</InfoLabel>
                    <InfoValue>
                      {(() => {
                        const paymentDisplay = getPaymentStatusDisplay(order.paymentStatus, order.status);
                        return (
                          <span style={{ color: paymentDisplay.color, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            {paymentDisplay.icon} {paymentDisplay.text}
                          </span>
                        );
                      })()}
                    </InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>{t('transaction_id')}</InfoLabel>
                    <InfoValue>{order.transactionId || t('not_available')}</InfoValue>
                  </InfoItem>
                </InfoList>
              </InfoCard>
            </div>
            
            <OrderActions className={language === 'ar' ? 'rtl-reverse' : ''}>
              {order.status === 'pending' && (
                <ActionButton
                  $variant="process"
                  onClick={() => handleStatusUpdate('processing')}
                  disabled={updatingStatus}
                  className="no-print"
                >
                  <FaIcons.FaSync /> {t('mark_as_processing')}
                </ActionButton>
              )}
              
              {order.status === 'processing' && (
                <ActionButton
                  $variant="ship"
                  onClick={() => handleStatusUpdate('shipped')}
                  disabled={updatingStatus}
                  className="no-print"
                >
                  <FaIcons.FaTruck /> {t('mark_as_shipped')}
                </ActionButton>
              )}
              
              {order.status === 'shipped' && (
                <ActionButton
                  $variant="deliver"
                  onClick={() => handleStatusUpdate('delivered')}
                  disabled={updatingStatus}
                  className="no-print"
                >
                  <FaIcons.FaCheckCircle /> {t('mark_as_delivered')}
                </ActionButton>
              )}
              
              {['pending', 'processing'].includes(order.status) && (
                <ActionButton
                  $variant="cancel"
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={updatingStatus}
                  className="no-print"
                >
                  <FaIcons.FaBan /> {t('cancel_order')}
                </ActionButton>
              )}
              
              <SecondaryButton onClick={handlePrint} className="no-print">
                <FaIcons.FaFileInvoice /> {t('print_invoice')}
              </SecondaryButton>
            </OrderActions>
          </OrderContent>
        </OrderCard>
      </PageContainer>
      
      {/* Hidden invoice for printing */}
      {order && (
        <div className="invoice-print" ref={printRef}>
          <InvoicePrint order={order as any} companyInfo={COMPANY_INFO} />
        </div>
      )}
    </AdminLayout>
  );
};

export default OrderDetailPage; 