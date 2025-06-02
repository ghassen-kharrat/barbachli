import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
// Icons are imported from the shared component
import AdminLayout from '../../layouts/AdminLayout';
import { useAdminStats, useOrderTrends, useSalesTrends } from '../../features/admin/hooks/use-admin-query';
import { FaIcons } from './components/Icons';
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
  TimeScale,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { ChartPeriod } from '../../features/admin/services/types';

// Define types for orders display
interface LatestOrder {
  id: number;
  reference: string;
  customer: string;
  amount: number;
  date: Date;
}

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

// Styles
const PageContainer = styled.div`
  padding: 1rem;
`;

const PageTitle = styled.h1`
  color: var(--text-color);
  margin-bottom: 2rem;
`;

const StatsGrid = styled.div`
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
  align-items: center;
  transition: transform 0.3s ease;
  
  [data-theme="dark"] & {
    border: 1px solid var(--border-color);
  }
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const StatIcon = styled.div<{ color: string }>`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background-color: ${({ color }) => color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-right: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--text-color);
`;

const StatLabel = styled.div`
  color: var(--light-text);
  font-size: 0.9rem;
`;

const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 1.5rem;
  height: 400px;
  position: relative;
  overflow: hidden;
  
  /* Add subtle inner highlight for dark mode */
  [data-theme="dark"] & {
    border: 1px solid var(--border-color);
  }
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ChartTitle = styled.h2`
  font-size: 1.2rem;
  color: var(--text-color);
  margin: 0;
`;

const PeriodSelector = styled.select`
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: var(--card-bg);
  color: var(--text-color);
`;

const ChartPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  background-color: var(--light-bg);
  border-radius: 8px;
  color: var(--light-text);
`;

const LatestOrdersCard = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 1.5rem;
  margin-top: 1.5rem;
  
  [data-theme="dark"] & {
    border: 1px solid var(--border-color);
  }
`;

const LatestOrdersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const LatestOrdersTitle = styled.h2`
  font-size: 1.2rem;
  color: var(--text-color);
  margin: 0;
`;

const ViewAllLink = styled.a`
  color: var(--secondary-color);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: bold;
  
  &:hover {
    text-decoration: underline;
  }
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
`;

const OrderItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.3s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: var(--light-bg);
    border-radius: var(--border-radius);
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    margin: 0 -0.5rem;
  }
`;

const OrderIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--light-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: var(--secondary-color);
  font-size: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  [data-theme="dark"] & {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
`;

const OrderDetails = styled.div`
  flex: 1;
`;

const OrderReference = styled.div`
  font-weight: bold;
  color: var(--text-color);
`;

const OrderCustomer = styled.div`
  color: var(--light-text);
  font-size: 0.9rem;
`;

const OrderAmount = styled.div`
  font-weight: bold;
  color: var(--secondary-color);
  text-align: right;
`;

const OrderTime = styled.div`
  color: var(--light-text);
  font-size: 0.9rem;
  text-align: right;
`;

// Formatter les dates pour l'affichage
const formatDate = (dateString: string | Date, period: ChartPeriod): string => {
  const date = new Date(dateString);
  
  switch (period) {
    case 'day':
      return `${date.getHours()}h`;
    case 'week':
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    case 'month':
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    case 'year':
      return date.toLocaleDateString('fr-FR', { month: 'short' });
    default:
      return date.toLocaleDateString('fr-FR');
  }
};

// Fonction pour formater les montants
const formatCurrency = (amount: number) => {
  try {
    // Using TND (Tunisian Dinar) instead of EUR
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'TND',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    })
    .format(amount)
    .replace('TND', 'DT');
  } catch (e) {
    return `${amount.toFixed(3)} DT`;
  }
};

// Fonction pour formater le temps écoulé
const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 60) {
    return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  } else {
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  }
};

// Create styled components for loading and error states
const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--light-text);
`;

const ErrorMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--error-color);
`;

const NoDataMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--light-text);
`;

const DashboardPage = () => {
  const [salesPeriod, setSalesPeriod] = useState<ChartPeriod>('week');
  const [ordersPeriod, setOrdersPeriod] = useState<ChartPeriod>('week');
  
  // Fetch data from APIs
  const { data: statsData, isLoading: isLoadingStats, error: statsError } = useAdminStats();
  const { data: salesData, isLoading: isLoadingSales, error: salesError } = useSalesTrends(salesPeriod);
  const { data: ordersData, isLoading: isLoadingOrders, error: ordersError } = useOrderTrends(ordersPeriod);
  
  // Log data for debugging
  useEffect(() => {
    if (salesData) {
      console.log('Sales data structure:', {
        success: salesData?.data?.success,
        dataExists: !!salesData?.data,
        isArray: Array.isArray(salesData?.data),
        length: Array.isArray(salesData?.data) ? salesData.data.length : 'not an array',
        firstFewItems: Array.isArray(salesData?.data) ? salesData.data.slice(0, 3) : 'not applicable'
      });
    }
    
    if (ordersData) {
      console.log('Orders data structure:', {
        success: ordersData?.data?.success,
        dataExists: !!ordersData?.data,
        isArray: Array.isArray(ordersData?.data),
        length: Array.isArray(ordersData?.data) ? ordersData.data.length : 'not an array',
        firstFewItems: Array.isArray(ordersData?.data) ? ordersData.data.slice(0, 3) : 'not applicable'
      });
    }
  }, [salesData, ordersData]);
  
  const stats = statsData?.data || {
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenue: 0,
    latestOrders: []
  };
  
  // Format latest orders data from API
  const latestOrders = stats.latestOrders?.map((order: {
    id: number;
    reference: string;
    customerFirstName?: string;
    customerLastName?: string;
    totalPrice: number;
    createdAt: string;
  }) => ({
    id: order.id,
    reference: order.reference,
    customer: `${order.customerFirstName || 'Client'} ${order.customerLastName || 'Inconnu'}`,
    amount: order.totalPrice,
    date: new Date(order.createdAt)
  })) || [];
  
  // Update chart options for better dark mode visibility
  const getChartOptions = (theme = document.documentElement.getAttribute('data-theme')) => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
          labels: {
            color: 'var(--text-color)'
          }
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
          backgroundColor: 'var(--card-bg)',
          titleColor: 'var(--text-color)',
          bodyColor: 'var(--text-color)',
          borderColor: 'var(--border-color)',
          borderWidth: 1,
          padding: 12,
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          callbacks: {
            label: (context: any) => {
              const label = context.dataset.label || '';
              if (label.includes('Ventes')) {
                return `${label}: ${formatCurrency(context.raw)}`;
              }
              return `${label}: ${context.raw}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: theme === 'dark', // Only show grid in dark mode
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false,
          },
          ticks: {
            color: 'var(--light-text)',
            font: {
              size: 10
            }
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: 'var(--light-text)',
            font: {
              size: 10
            },
            // Include a euro sign for sales charts
            callback: (value: any) => {
              if (salesPeriod) {
                return formatCurrency(value);
              }
              return value;
            }
          },
          grid: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            borderDash: [2, 4],
            drawBorder: false
          }
        }
      }
    };
  };
  
  // Update the chart data preparation function with better colors for dark mode
  const getSalesChartData = () => {
    const theme = document.documentElement.getAttribute('data-theme');
    const isLight = theme !== 'dark';
    
    return {
      labels: salesData?.data && Array.isArray(salesData.data) ? 
        salesData.data.map((item: any) => formatDate(item.date, salesPeriod)) : [],
      datasets: [
        {
          label: 'Ventes (DT)',
          data: salesData?.data && Array.isArray(salesData.data) ? 
            salesData.data.map((item: any) => item.value) : [],
          backgroundColor: isLight 
            ? 'rgba(233, 69, 96, 0.2)' 
            : 'rgba(255, 95, 126, 0.3)',
          borderColor: isLight 
            ? 'var(--secondary-color)' 
            : '#ff5f7e',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: isLight 
            ? 'var(--secondary-color)' 
            : '#ff5f7e',
          pointBorderColor: 'var(--card-bg)',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        }
      ]
    };
  };
  
  // Update the order chart data for better dark mode visibility
  const getOrdersChartData = () => {
    const theme = document.documentElement.getAttribute('data-theme');
    const isLight = theme !== 'dark';
    
    return {
      labels: ordersData?.data && Array.isArray(ordersData.data) ? 
        ordersData.data.map((item: any) => formatDate(item.date, ordersPeriod)) : [],
      datasets: [
        {
          label: 'Commandes',
          data: ordersData?.data && Array.isArray(ordersData.data) ? 
            ordersData.data.map((item: any) => item.value) : [],
          backgroundColor: isLight 
            ? 'rgba(15, 52, 96, 0.7)' 
            : 'rgba(78, 158, 255, 0.7)',
          borderColor: isLight 
            ? 'var(--primary-color)' 
            : '#4e9eff',
          borderWidth: 1,
          borderRadius: 4,
        }
      ]
    };
  };
  
  // Check if any data is loading
  const isLoading = isLoadingStats || isLoadingSales || isLoadingOrders;
  
  // Check for errors
  const hasError = statsError || salesError || ordersError;
  
  // Add a state for chart options
  const [chartOptions, setChartOptions] = useState(getChartOptions());
  
  // Replace the original chart data references with the new dynamic functions
  const salesChartData = getSalesChartData();
  const ordersChartData = getOrdersChartData();
  
  // Add a useEffect hook to update chart options when theme changes
  useEffect(() => {
    // This will force the charts to update when theme changes
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    
    // Update chart options based on current theme
    setChartOptions(getChartOptions(theme));
    
  }, [document.documentElement.getAttribute('data-theme')]);
  
  if (isLoading) {
    return (
      <AdminLayout title="Tableau de bord">
        <div>Chargement des statistiques...</div>
      </AdminLayout>
    );
  }
  
  if (hasError) {
    return (
      <AdminLayout title="Tableau de bord">
        <div style={{ 
          color: 'var(--error-color)', 
          padding: '20px', 
          background: 'var(--error-bg)', 
          borderRadius: '5px', 
          margin: '20px 0',
          border: '1px solid var(--error-color)' 
        }}>
          <h2>Erreur lors du chargement des données</h2>
          <p>Un problème est survenu lors de la connexion à la base de données. Veuillez vérifier votre connexion et réessayer.</p>
          {statsError && <div>Erreur statistiques: {(statsError as Error).message}</div>}
          {salesError && <div>Erreur ventes: {(salesError as Error).message}</div>}
          {ordersError && <div>Erreur commandes: {(ordersError as Error).message}</div>}
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title="Tableau de bord">
      <PageContainer>
        <PageTitle>Tableau de bord</PageTitle>
        
        <StatsGrid>
          <StatCard>
            <StatIcon color="#e94560">
              <FaIcons.FaShoppingBag />
            </StatIcon>
            <StatContent>
              <StatValue>{stats.totalOrders}</StatValue>
              <StatLabel>Commandes totales</StatLabel>
            </StatContent>
          </StatCard>
          
          <StatCard>
            <StatIcon color="#0f3460">
              <FaIcons.FaUsers />
            </StatIcon>
            <StatContent>
              <StatValue>{stats.totalUsers}</StatValue>
              <StatLabel>Utilisateurs</StatLabel>
            </StatContent>
          </StatCard>
          
          <StatCard>
            <StatIcon color="#16213e">
              <FaIcons.FaBoxOpen />
            </StatIcon>
            <StatContent>
              <StatValue>{stats.totalProducts}</StatValue>
              <StatLabel>Produits</StatLabel>
            </StatContent>
          </StatCard>
          
          <StatCard>
            <StatIcon color="#4caf50">
              <FaIcons.FaMoneyBillWave />
            </StatIcon>
            <StatContent>
              <StatValue>{formatCurrency(stats.revenue)}</StatValue>
              <StatLabel>Revenu total</StatLabel>
            </StatContent>
          </StatCard>
        </StatsGrid>
        
        <ChartsContainer>
          <ChartCard>
            <ChartHeader>
              <ChartTitle>Évolution des ventes</ChartTitle>
              <PeriodSelector 
                value={salesPeriod} 
                onChange={(e) => setSalesPeriod(e.target.value as ChartPeriod)}
              >
                <option value="day">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </PeriodSelector>
            </ChartHeader>
            
            <div style={{ height: '300px', padding: '10px' }}>
              {isLoadingSales ? (
                <LoadingMessage>
                  Chargement des données...
                </LoadingMessage>
              ) : salesError ? (
                <ErrorMessage>
                  Erreur de chargement des données
                </ErrorMessage>
              ) : !salesData?.data || !Array.isArray(salesData.data) || salesData.data.length === 0 ? (
                <NoDataMessage>
                  Aucune donnée disponible pour cette période
                </NoDataMessage>
              ) : (
                <Line data={salesChartData} options={chartOptions} />
              )}
            </div>
          </ChartCard>
          
          <ChartCard>
            <ChartHeader>
              <ChartTitle>Commandes par jour</ChartTitle>
              <PeriodSelector 
                value={ordersPeriod} 
                onChange={(e) => setOrdersPeriod(e.target.value as ChartPeriod)}
              >
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </PeriodSelector>
            </ChartHeader>
            
            <div style={{ height: '300px', padding: '10px' }}>
              {isLoadingOrders ? (
                <LoadingMessage>
                  Chargement des données...
                </LoadingMessage>
              ) : ordersError ? (
                <ErrorMessage>
                  Erreur de chargement des données
                </ErrorMessage>
              ) : !ordersData?.data || !Array.isArray(ordersData.data) || ordersData.data.length === 0 ? (
                <NoDataMessage>
                  Aucune donnée disponible pour cette période
                </NoDataMessage>
              ) : (
                <Bar data={ordersChartData} options={chartOptions} />
              )}
            </div>
          </ChartCard>
        </ChartsContainer>
        
        <LatestOrdersCard>
          <LatestOrdersHeader>
            <LatestOrdersTitle>Dernières commandes</LatestOrdersTitle>
            <ViewAllLink href="/admin/orders">Voir toutes les commandes</ViewAllLink>
          </LatestOrdersHeader>
          
          <OrdersList>
            {latestOrders.length > 0 ? (
              latestOrders.map((order: LatestOrder) => (
                <OrderItem key={order.id}>
                  <OrderIcon>
                    <FaIcons.FaShoppingBag />
                  </OrderIcon>
                  <OrderDetails>
                    <OrderReference>{order.reference}</OrderReference>
                    <OrderCustomer>{order.customer}</OrderCustomer>
                  </OrderDetails>
                  <div>
                    <OrderAmount>{formatCurrency(order.amount)}</OrderAmount>
                    <OrderTime>{formatTimeAgo(order.date)}</OrderTime>
                  </div>
                </OrderItem>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#777' }}>
                Aucune commande récente
              </div>
            )}
          </OrdersList>
        </LatestOrdersCard>
      </PageContainer>
    </AdminLayout>
  );
};

export default DashboardPage; 