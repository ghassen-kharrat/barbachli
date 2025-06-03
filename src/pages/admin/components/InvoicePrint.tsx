import React from 'react';
import { styled } from 'styled-components';
import { OrderData } from '../../../features/orders/services/types';
import { useLanguage } from '../../../provider/LanguageProvider';
import logo from '../../../assets/images/logo.png';

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

const InvoiceContainer = styled.div`
  background-color: white;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Arial', sans-serif;
  color: #333;
  
  @media print {
    padding: 0;
    width: 100%;
    color: #000;
  }
`;

const InvoiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  
  @media print {
    margin-bottom: 1.5rem;
  }
`;

const Logo = styled.div`
  img {
    max-height: 80px;
    max-width: 200px;
  }
`;

const CompanyInfo = styled.div`
  text-align: right;
  font-size: 14px;
  line-height: 1.5;
`;

const InvoiceTitle = styled.h1`
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin: 2rem 0;
  color: #2c3e50;
  
  @media print {
    margin: 1rem 0;
    color: #000;
  }
`;

const InvoiceMeta = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  
  @media print {
    margin-bottom: 1.5rem;
  }
`;

const InvoiceMetaItem = styled.div`
  width: 48%;
`;

const InvoiceMetaTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
  
  @media print {
    color: #000;
  }
`;

const InvoiceMetaContent = styled.div`
  font-size: 14px;
  line-height: 1.5;
`;

const InvoiceTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
  font-size: 14px;
  
  @media print {
    margin-bottom: 1.5rem;
  }
`;

const TableHeader = styled.thead`
  background-color: #f8f9fa;
  
  @media print {
    background-color: #f0f0f0;
  }
`;

const TableHeaderCell = styled.th`
  padding: 0.75rem;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
  font-weight: bold;
`;

const TableCell = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #dee2e6;
  vertical-align: top;
`;

const TotalSection = styled.div`
  margin-left: auto;
  width: 300px;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 14px;
  
  &:last-child {
    font-weight: bold;
    font-size: 16px;
    border-top: 2px solid #dee2e6;
    padding-top: 0.75rem;
    margin-top: 0.25rem;
  }
`;

const InvoiceFooter = styled.div`
  margin-top: 3rem;
  text-align: center;
  font-size: 12px;
  color: #6c757d;
  
  @media print {
    margin-top: 2rem;
    color: #666;
  }
`;

const ThankYouNote = styled.div`
  text-align: center;
  margin: 2rem 0;
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
  
  @media print {
    color: #000;
  }
`;

const PaymentInfo = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
  
  @media print {
    padding: 0.75rem;
  }
`;

const PaymentTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  
  @media print {
    color: #000;
  }
`;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 2
  }).format(amount);
};

const InvoicePrint: React.FC<InvoicePrintProps> = ({ order, companyInfo }) => {
  const { t } = useLanguage();
  
  // Calculate totals
  const subtotal = order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingFee = order.shippingFee || 0;
  const totalPrice = order.totalPrice || (subtotal + shippingFee);
  
  // Calculate tax (TVA) - Tunisian VAT is 19%
  const taxRate = 0.19;
  const taxAmount = subtotal * taxRate;
  
  return (
    <InvoiceContainer>
      <InvoiceHeader>
        <Logo>
          <img src={logo} alt={companyInfo.name} />
        </Logo>
        <CompanyInfo>
          <strong>{companyInfo.name}</strong><br />
          {companyInfo.address}<br />
          {t('phone')}: {companyInfo.phone}<br />
          {t('email')}: {companyInfo.email}<br />
          {t('website')}: {companyInfo.website}<br />
          {t('tax_id')}: {companyInfo.taxId}
        </CompanyInfo>
      </InvoiceHeader>
      
      <InvoiceTitle>{t('invoice')}</InvoiceTitle>
      
      <InvoiceMeta>
        <InvoiceMetaItem>
          <InvoiceMetaTitle>{t('bill_to')}</InvoiceMetaTitle>
          <InvoiceMetaContent>
            <strong>{order.customer?.firstName} {order.customer?.lastName}</strong><br />
            {order.shippingAddress?.street || order.shippingAddress || ''}<br />
            {order.shippingAddress?.city || order.shippingCity || ''}, {order.shippingAddress?.zipCode || order.shippingZipCode || ''}<br />
            {order.shippingAddress?.country || order.shippingCountry || t('default_country')}<br />
            {t('phone')}: {order.customer?.phone || order.phoneNumber || t('not_provided')}<br />
            {t('email')}: {order.customer?.email || t('not_provided')}
          </InvoiceMetaContent>
        </InvoiceMetaItem>
        
        <InvoiceMetaItem>
          <InvoiceMetaTitle>{t('invoice_details')}</InvoiceMetaTitle>
          <InvoiceMetaContent>
            <strong>{t('invoice_number')}:</strong> INV-{order.reference || order.id}<br />
            <strong>{t('order_number')}:</strong> {order.reference || `#${order.id}`}<br />
            <strong>{t('invoice_date')}:</strong> {formatDate(order.createdAt)}<br />
            <strong>{t('payment_method')}:</strong> {order.paymentMethod || t('cash_on_delivery')}<br />
            <strong>{t('payment_status')}:</strong> {order.paymentStatus || (order.status === 'delivered' ? t('paid') : t('pending'))}
          </InvoiceMetaContent>
        </InvoiceMetaItem>
      </InvoiceMeta>
      
      <InvoiceTable>
        <TableHeader>
          <tr>
            <TableHeaderCell>{t('product')}</TableHeaderCell>
            <TableHeaderCell>{t('quantity')}</TableHeaderCell>
            <TableHeaderCell>{t('unit_price')}</TableHeaderCell>
            <TableHeaderCell>{t('total')}</TableHeaderCell>
          </tr>
        </TableHeader>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={index}>
              <TableCell>
                <div style={{ fontWeight: 'bold' }}>{item.product?.name || `Product #${item.productId}`}</div>
                {item.product?.id && <div style={{ fontSize: '12px', color: '#6c757d' }}>SKU: {item.product.id}</div>}
              </TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{formatCurrency(item.price)}</TableCell>
              <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
            </tr>
          ))}
        </tbody>
      </InvoiceTable>
      
      <TotalSection>
        <TotalRow>
          <div>{t('subtotal')}:</div>
          <div>{formatCurrency(subtotal)}</div>
        </TotalRow>
        <TotalRow>
          <div>{t('tax')} (19%):</div>
          <div>{formatCurrency(taxAmount)}</div>
        </TotalRow>
        <TotalRow>
          <div>{t('shipping')}:</div>
          <div>{formatCurrency(shippingFee)}</div>
        </TotalRow>
        <TotalRow>
          <div>{t('total')}:</div>
          <div>{formatCurrency(totalPrice)}</div>
        </TotalRow>
      </TotalSection>
      
      {order.notes && (
        <PaymentInfo>
          <PaymentTitle>{t('notes')}</PaymentTitle>
          <div>{order.notes}</div>
        </PaymentInfo>
      )}
      
      <ThankYouNote>
        {t('thank_you_for_your_business')}
      </ThankYouNote>
      
      <InvoiceFooter>
        {t('invoice_generated_on')} {new Date().toLocaleDateString('fr-FR')}
      </InvoiceFooter>
    </InvoiceContainer>
  );
};

export default InvoicePrint; 