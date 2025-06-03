import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import AdminLayout from '../../layouts/AdminLayout';
import { FaIcons } from './components/Icons';
import { useLanguage } from '../../provider/LanguageProvider';
import { useOrderTrends, useSalesTrends } from '../../features/admin/hooks/use-admin-query';
import { ChartPeriod } from '../../features/admin/services/types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import OrdersSummary from './components/OrdersSummary';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Styled Components
const PageContainer = styled.div`
  padding: 1.5rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const PageTitle = styled.h1`
  color: var(--text-color);
  margin: 0;
  font-size: 1.8rem;
`;

const PeriodSelector = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PeriodButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--border-radius);
  background-color: ${props => props.$active ? 'var(--primary-color)' : 'var(--card-bg)'};
  color: ${props => props.$active ? 'white' : 'var(--text-color)'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.$active ? 'var(--primary-dark)' : 'var(--hover-bg)'};
  }
`;

const ReportGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 1.5rem;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ChartTitle = styled.h2`
  font-size: 1.2rem;
  margin: 0;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: var(--primary-color);
  font-size: 1.5rem;
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--danger-color);
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
`;

const StatTitle = styled.h3`
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0 0 0.5rem 0;
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-color);
`;

const StatFooter = styled.div`
  margin-top: 1rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 2
  }).format(amount);
};

// Mock data for demonstration
const mockStats = {
  totalOrders: 256,
  pendingOrders: 32,
  processingOrders: 45,
  shippedOrders: 67,
  deliveredOrders: 98,
  cancelledOrders: 14,
  revenue: 18756.5,
  averageOrderValue: 128.45,
  returnsRate: 2.7,
  topSellingProducts: [
    { name: 'Smartphone XYZ', sales: 38, revenue: 7600 },
    { name: 'Laptop Pro', sales: 23, revenue: 18400 },
    { name: 'Wireless Earbuds', sales: 56, revenue: 2800 },
    { name: 'Smart Watch', sales: 31, revenue: 4650 },
  ],
  topCategories: [
    { name: 'Electronics', sales: 145, revenue: 23500 },
    { name: 'Clothing', sales: 87, revenue: 6530 },
    { name: 'Home & Kitchen', sales: 62, revenue: 4960 },
    { name: 'Sports & Outdoors', sales: 41, revenue: 2870 },
  ]
};

const OrderReportPage: React.FC = () => {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<ChartPeriod>('month');
  
  // Fetch order trends data
  const { 
    data: orderTrendsData, 
    isLoading: isLoadingOrderTrends, 
    error: orderTrendsError 
  } = useOrderTrends(period);
  
  // Fetch sales trends data
  const { 
    data: salesTrendsData, 
    isLoading: isLoadingSalesTrends, 
    error: salesTrendsError 
  } = useSalesTrends(period);
  
  // Prepare order trends chart data
  const orderTrendsChartData = {
    labels: orderTrendsData?.data?.map(item => item.date) || [],
    datasets: [
      {
        label: t('orders'),
        data: orderTrendsData?.data?.map(item => item.value) || [],
        borderColor: '#4361ee',
        backgroundColor: 'rgba(67, 97, 238, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };
  
  // Prepare sales trends chart data
  const salesTrendsChartData = {
    labels: salesTrendsData?.data?.map(item => item.date) || [],
    datasets: [
      {
        label: t('revenue'),
        data: salesTrendsData?.data?.map(item => item.value) || [],
        backgroundColor: 'rgba(67, 160, 71, 0.6)',
        borderColor: '#43a047',
        borderWidth: 1,
      },
    ],
  };
  
  // Chart options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
  };
  
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
  };
  
  return (
    <AdminLayout title={t('order_reports')}>
      <PageContainer>
        <PageHeader>
          <PageTitle>{t('order_reports_and_analytics')}</PageTitle>
          
          <PeriodSelector>
            <PeriodButton 
              $active={period === 'day'}
              onClick={() => setPeriod('day')}
            >
              {t('daily')}
            </PeriodButton>
            <PeriodButton 
              $active={period === 'week'}
              onClick={() => setPeriod('week')}
            >
              {t('weekly')}
            </PeriodButton>
            <PeriodButton 
              $active={period === 'month'}
              onClick={() => setPeriod('month')}
            >
              {t('monthly')}
            </PeriodButton>
            <PeriodButton 
              $active={period === 'year'}
              onClick={() => setPeriod('year')}
            >
              {t('yearly')}
            </PeriodButton>
          </PeriodSelector>
        </PageHeader>
        
        {/* Order Summary Cards */}
        <OrdersSummary 
          stats={mockStats}
          isLoading={false}
        />
        
        {/* Additional Stats */}
        <StatGrid>
          <StatCard>
            <StatTitle>{t('average_order_value')}</StatTitle>
            <StatValue>{formatCurrency(mockStats.averageOrderValue)}</StatValue>
            <StatFooter>
              <FaIcons.FaInfoCircle style={{ marginRight: '0.5rem' }} />
              {t('calculated_from_all_orders')}
            </StatFooter>
          </StatCard>
          
          <StatCard>
            <StatTitle>{t('returns_rate')}</StatTitle>
            <StatValue>{mockStats.returnsRate}%</StatValue>
            <StatFooter>
              <FaIcons.FaInfoCircle style={{ marginRight: '0.5rem' }} />
              {t('percentage_of_returned_orders')}
            </StatFooter>
          </StatCard>
          
          <StatCard>
            <StatTitle>{t('conversion_rate')}</StatTitle>
            <StatValue>3.2%</StatValue>
            <StatFooter>
              <FaIcons.FaInfoCircle style={{ marginRight: '0.5rem' }} />
              {t('visitors_who_placed_orders')}
            </StatFooter>
          </StatCard>
          
          <StatCard>
            <StatTitle>{t('repeat_customer_rate')}</StatTitle>
            <StatValue>28%</StatValue>
            <StatFooter>
              <FaIcons.FaInfoCircle style={{ marginRight: '0.5rem' }} />
              {t('customers_with_multiple_orders')}
            </StatFooter>
          </StatCard>
        </StatGrid>
        
        {/* Trend Charts */}
        <ReportGrid>
          <ChartCard>
            <ChartHeader>
              <ChartTitle>
                <FaIcons.FaChartLine />
                {t('order_trends')}
              </ChartTitle>
            </ChartHeader>
            
            {isLoadingOrderTrends ? (
              <LoadingSpinner>
                <FaIcons.FaSpinner />
              </LoadingSpinner>
            ) : orderTrendsError ? (
              <ErrorState>
                <FaIcons.FaExclamationTriangle style={{ marginRight: '0.5rem' }} />
                {t('error_loading_chart_data')}
              </ErrorState>
            ) : (
              <div style={{ height: '300px' }}>
                <Line options={lineChartOptions} data={orderTrendsChartData} />
              </div>
            )}
          </ChartCard>
          
          <ChartCard>
            <ChartHeader>
              <ChartTitle>
                <FaIcons.FaChartBar />
                {t('revenue_trends')}
              </ChartTitle>
            </ChartHeader>
            
            {isLoadingSalesTrends ? (
              <LoadingSpinner>
                <FaIcons.FaSpinner />
              </LoadingSpinner>
            ) : salesTrendsError ? (
              <ErrorState>
                <FaIcons.FaExclamationTriangle style={{ marginRight: '0.5rem' }} />
                {t('error_loading_chart_data')}
              </ErrorState>
            ) : (
              <div style={{ height: '300px' }}>
                <Bar options={barChartOptions} data={salesTrendsChartData} />
              </div>
            )}
          </ChartCard>
        </ReportGrid>
        
        {/* Top Products and Categories */}
        <ReportGrid>
          <ChartCard>
            <ChartHeader>
              <ChartTitle>
                <FaIcons.FaBoxOpen />
                {t('top_selling_products')}
              </ChartTitle>
            </ChartHeader>
            
            <Table>
              <THead>
                <tr>
                  <Th>{t('product')}</Th>
                  <Th>{t('sales')}</Th>
                  <Th>{t('revenue')}</Th>
                </tr>
              </THead>
              <TBody>
                {mockStats.topSellingProducts.map((product, index) => (
                  <Tr key={index}>
                    <Td>{product.name}</Td>
                    <Td>{product.sales}</Td>
                    <Td>{formatCurrency(product.revenue)}</Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </ChartCard>
          
          <ChartCard>
            <ChartHeader>
              <ChartTitle>
                <FaIcons.FaLayerGroup />
                {t('top_categories')}
              </ChartTitle>
            </ChartHeader>
            
            <Table>
              <THead>
                <tr>
                  <Th>{t('category')}</Th>
                  <Th>{t('sales')}</Th>
                  <Th>{t('revenue')}</Th>
                </tr>
              </THead>
              <TBody>
                {mockStats.topCategories.map((category, index) => (
                  <Tr key={index}>
                    <Td>{category.name}</Td>
                    <Td>{category.sales}</Td>
                    <Td>{formatCurrency(category.revenue)}</Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </ChartCard>
        </ReportGrid>
      </PageContainer>
    </AdminLayout>
  );
};

// Table components
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const THead = styled.thead`
  background-color: var(--light-bg);
`;

const TBody = styled.tbody``;

const Th = styled.th`
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
`;

const Tr = styled.tr`
  &:hover {
    background-color: var(--hover-bg);
  }
`;

export default OrderReportPage; 