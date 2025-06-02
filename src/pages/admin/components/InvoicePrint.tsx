import React from 'react';
import styled from 'styled-components';
import { OrderData } from '../../../features/orders/services/types';
import { useLanguage } from '../../../provider/LanguageProvider';

// Styles for print-friendly invoice
const InvoiceContainer = styled.div`
  font-family: 'Arial', sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
  background-color: white;
  color: #333;
  
  @media print {
    padding: 0;
    width: 100%;
    max-width: 100%;
    
    @page {
      size: A4;
      margin: 1cm;
    }
  }
`;

const InvoiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
  border-bottom: 2px solid #eee;
  padding-bottom: 20px;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #0f3460;
`;

const InvoiceTitle = styled.div`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #0f3460;
`;

const InvoiceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
`;

const InvoiceSection = styled.div`
  margin-bottom: 10px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #0f3460;
`;

const InvoiceTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 30px 0;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 12px 8px;
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8f9fa;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #dee2e6;
  }
`;

const TableCell = styled.td`
  padding: 12px 8px;
`;

const TotalRow = styled.tr`
  font-weight: bold;
  border-top: 2px solid #dee2e6;
  
  td {
    padding-top: 12px;
  }
`;

const GrandTotal = styled.tr`
  font-weight: bold;
  font-size: 18px;
  background-color: #f8f9fa;
  
  td {
    padding: 15px 8px;
  }
`;

const Footer = styled.div`
  margin-top: 40px;
  padding-top: 20px;
  border-top: 2px solid #eee;
  text-align: center;
  font-size: 14px;
  color: #666;
`;

const Text = styled.p`
  margin: 5px 0;
  line-height: 1.5;
`;

const TextBold = styled.p`
  margin: 5px 0;
  font-weight: bold;
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  
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

interface InvoicePrintProps {
  order: OrderData;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    taxId: string;
  };
}

// Add a function to get payment status text based on order status
const getPaymentStatusText = (paymentStatus: string, orderStatus: string, t: (key: string) => string) => {
  // If explicit payment status exists, use it
  if (paymentStatus === 'paid') {
    return t('paid');
  }
  
  // Otherwise derive from order status
  switch (orderStatus) {
    case 'delivered':
      return t('paid');
    case 'cancelled':
      return t('status_cancelled');
    case 'processing':
    case 'shipped':
      return t('processing_label');
    default:
      return t('pending_payment');
  }
};

const InvoicePrint: React.FC<InvoicePrintProps> = ({ order, companyInfo }) => {
  const { t, language } = useLanguage();
  
  // Format date based on language
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-TN' : 'fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };
  
  // Get appropriate status text with translations
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
  
  // Calculate order total
  const calculateTotal = (items: any[]) => {
    if (!items || !items.length) return 0;
    
    return items.reduce((total, item) => {
      if (item.price === undefined || item.price === null) {
        return total;
      }
      
      // Convert price to number if it's a string
      const price = typeof item.price === 'number' ? item.price : Number(item.price);
      
      // Ensure quantity is a number
      const quantity = item.quantity ? Number(item.quantity) : 0;
      
      return total + (price * quantity);
    }, 0);
  };
  
  // Assign order reference/number
  const orderNumber = order.reference || order.orderNumber || `#${order.id}`;
  const customerName = `${order.customer?.firstName || order.firstName || ''} ${order.customer?.lastName || order.lastName || ''}`;
  const customerEmail = order.customer?.email || order.email || '';
  const customerPhone = order.customer?.phone || order.phoneNumber || '';
  const shippingAddress = order.shippingAddress?.street || order.shippingAddress || '';
  const shippingCity = order.shippingAddress?.city || order.shippingCity || '';
  const shippingZipCode = order.shippingAddress?.zipCode || order.shippingZipCode || '';
  const shippingCountry = order.shippingAddress?.country || order.shippingCountry || 'Tunisie';
  const subtotal = calculateTotal(order.items || []);
  const shippingFee = order.shippingFee !== undefined && order.shippingFee !== null
    ? (typeof order.shippingFee === 'number' ? order.shippingFee : Number(order.shippingFee))
    : 0;
  const total = order.totalPrice !== undefined && order.totalPrice !== null
    ? (typeof order.totalPrice === 'number' ? order.totalPrice : Number(order.totalPrice))
    : subtotal + shippingFee;
  
  // Get payment status text
  const paymentStatusText = getPaymentStatusText(order.paymentStatus, order.status, t);
  
  // Set document direction based on language
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  
  return (
    <InvoiceContainer dir={dir} className={language === 'ar' ? 'rtl' : ''}>
      <InvoiceHeader className={language === 'ar' ? 'rtl-flex-reverse' : ''}>
        <div>
          <Logo>{companyInfo.name}</Logo>
          <Text>{companyInfo.address}</Text>
          <Text className={language === 'ar' ? 'rtl-flex-reverse' : ''}>
            {t('phone_label')}: {companyInfo.phone}
          </Text>
          <Text>{companyInfo.email}</Text>
          <Text>{companyInfo.website}</Text>
          <Text className={language === 'ar' ? 'rtl-flex-reverse' : ''}>
            {t('tax_id')}: {companyInfo.taxId}
          </Text>
        </div>
        <div>
          <InvoiceTitle>{t('invoice')}</InvoiceTitle>
          <Text>
            {t('order_id')}: {orderNumber}
          </Text>
          <Text>
            {t('order_created_date')}: {formatDate(order.createdAt)}
          </Text>
          <Text>
            {order.updatedAt && order.status !== 'pending'
              ? `${t('processing_date')}: ${formatDate(order.updatedAt)}`
              : ''}
          </Text>
          <Text className={language === 'ar' ? 'rtl-flex-reverse' : ''}>
            {t('order_current_status')}: 
            <StatusBadge $status={order.status} style={{ marginLeft: language === 'ar' ? '0' : '8px', marginRight: language === 'ar' ? '8px' : '0' }}>
              {getStatusText(order.status)}
            </StatusBadge>
          </Text>
        </div>
      </InvoiceHeader>
      
      <InvoiceInfo>
        <InvoiceSection>
          <SectionTitle>{t('seller')}</SectionTitle>
          <TextBold>{companyInfo.name}</TextBold>
          <Text>{companyInfo.address}</Text>
          <Text className={language === 'ar' ? 'rtl-flex-reverse' : ''}>
            {t('phone_label')}: {companyInfo.phone}
          </Text>
          <Text>{companyInfo.email}</Text>
        </InvoiceSection>
        
        <InvoiceSection>
          <SectionTitle>{t('client')}</SectionTitle>
          <TextBold>
            {order.customer?.firstName || order.firstName || ''} {order.customer?.lastName || order.lastName || ''}
          </TextBold>
          <Text>
            {order.shippingAddress?.street || order.shippingAddress || ''}
          </Text>
          <Text>
            {order.shippingAddress?.city || order.shippingCity || ''} {order.shippingAddress?.zipCode || order.shippingZipCode || ''}
          </Text>
          <Text>
            {order.shippingAddress?.country || order.shippingCountry || ''}
          </Text>
          <Text className={language === 'ar' ? 'rtl-flex-reverse' : ''}>
            {t('phone_label')}: {order.customer?.phone || order.phoneNumber || '-'}
          </Text>
        </InvoiceSection>
      </InvoiceInfo>
      
      <InvoiceTable>
        <thead>
          <TableRow>
            <TableHeader style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>{t('product_name')}</TableHeader>
            <TableHeader style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>{t('product_price')}</TableHeader>
            <TableHeader style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>{t('product_quantity')}</TableHeader>
            <TableHeader style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>{t('order_total')}</TableHeader>
          </TableRow>
        </thead>
        <tbody>
          {(order.items || []).map((item, index) => (
            <TableRow key={item.id || index}>
              <TableCell style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
                {(item.product && item.product.name) || item.name || t('product_name')}
              </TableCell>
              <TableCell style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
                {item.price !== undefined && item.price !== null 
                  ? (typeof item.price === 'number' 
                    ? item.price.toFixed(3) 
                    : Number(item.price).toFixed(3)) 
                  : '0.000'} DT
              </TableCell>
              <TableCell style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
                {item.quantity}
              </TableCell>
              <TableCell style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
                {item.price !== undefined && item.price !== null 
                  ? (typeof item.price === 'number' 
                    ? (item.price * item.quantity).toFixed(3) 
                    : (Number(item.price) * item.quantity).toFixed(3)) 
                  : '0.000'} DT
              </TableCell>
            </TableRow>
          ))}
          
          <TotalRow>
            <TableCell colSpan={3} style={{ textAlign: language === 'ar' ? 'left' : 'right' }}>
              {t('order_subtotal')}:
            </TableCell>
            <TableCell style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
              {calculateTotal(order.items || []).toFixed(3)} DT
            </TableCell>
          </TotalRow>
          
          <TotalRow>
            <TableCell colSpan={3} style={{ textAlign: language === 'ar' ? 'left' : 'right' }}>
              {t('shipping_fee')}:
            </TableCell>
            <TableCell style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
              {order.shippingFee !== undefined && order.shippingFee !== null 
                ? (typeof order.shippingFee === 'number' 
                  ? order.shippingFee.toFixed(3) 
                  : Number(order.shippingFee).toFixed(3)) 
                : '0.000'} DT
            </TableCell>
          </TotalRow>
          
          <GrandTotal>
            <TableCell colSpan={3} style={{ textAlign: language === 'ar' ? 'left' : 'right' }}>
              {t('order_total')}:
            </TableCell>
            <TableCell style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
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
          </GrandTotal>
        </tbody>
      </InvoiceTable>
      
      <div style={{ marginTop: '30px' }}>
        <SectionTitle>{t('payment_info')}</SectionTitle>
        <Text className={language === 'ar' ? 'rtl-flex-reverse' : ''}>
          {t('payment_method')}: {order.paymentMethod || t('cash_on_delivery')}
        </Text>
        <Text className={language === 'ar' ? 'rtl-flex-reverse' : ''}>
          {t('payment_status')}: {paymentStatusText}
        </Text>
      </div>
      
      <Footer>
        <Text>{t('thank_you')}</Text>
        <Text>
          {t('contact_question')} {companyInfo.email}
        </Text>
      </Footer>
    </InvoiceContainer>
  );
};

export default InvoicePrint; 