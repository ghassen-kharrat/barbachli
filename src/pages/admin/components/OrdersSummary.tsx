import React from 'react';
import { styled } from 'styled-components';
import { FaIcons } from './Icons';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../provider/LanguageProvider';

// Types
interface OrdersSummaryProps {
  stats: {
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    revenue: number;
  };
  isLoading?: boolean;
}

// Styled Components
const SummaryContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--box-shadow-hover);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const IconWrapper = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: ${props => `${props.$color}15`};
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const CardTitle = styled.h3`
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0;
`;

const CardValue = styled.div`
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-color);
  margin-top: 0.5rem;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  margin-top: auto;
  padding-top: 1rem;
  font-size: 0.85rem;
  color: var(--text-muted);
`;

const TrendUp = styled.span`
  color: var(--success-color);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-right: 0.5rem;
`;

const TrendDown = styled.span`
  color: var(--danger-color);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-right: 0.5rem;
`;

const LoadingCard = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 1.5rem;
  height: 140px;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    animation: loading 1.5s infinite;
  }
  
  @keyframes loading {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

const LoadingCardHeader = styled.div`
  height: 48px;
  width: 48px;
  border-radius: 12px;
  background-color: var(--border-color);
  margin-bottom: 1rem;
`;

const LoadingCardTitle = styled.div`
  height: 18px;
  width: 120px;
  border-radius: 4px;
  background-color: var(--border-color);
  margin-bottom: 0.8rem;
`;

const LoadingCardValue = styled.div`
  height: 28px;
  width: 80px;
  border-radius: 4px;
  background-color: var(--border-color);
`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 2
  }).format(amount);
};

// OrdersSummary Component
const OrdersSummary: React.FC<OrdersSummaryProps> = ({ stats, isLoading = false }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  if (isLoading) {
    return (
      <SummaryContainer>
        {[1, 2, 3, 4].map((item) => (
          <LoadingCard key={item}>
            <LoadingCardHeader />
            <LoadingCardTitle />
            <LoadingCardValue />
          </LoadingCard>
        ))}
      </SummaryContainer>
    );
  }
  
  const cards = [
    {
      title: t('total_orders'),
      value: stats.totalOrders,
      icon: <FaIcons.FaShoppingCart />,
      color: '#4361ee',
      trend: '+5%',
      trendDirection: 'up',
      trendText: t('from_last_month'),
      onClick: () => navigate('/admin/orders')
    },
    {
      title: t('pending_orders'),
      value: stats.pendingOrders,
      icon: <FaIcons.FaRegClock />,
      color: '#f9a825',
      onClick: () => navigate('/admin/orders?status=pending')
    },
    {
      title: t('processing_orders'),
      value: stats.processingOrders,
      icon: <FaIcons.FaSync />,
      color: '#1976d2',
      onClick: () => navigate('/admin/orders?status=processing')
    },
    {
      title: t('shipped_orders'),
      value: stats.shippedOrders,
      icon: <FaIcons.FaTruck />,
      color: '#00897b',
      onClick: () => navigate('/admin/orders?status=shipped')
    },
    {
      title: t('delivered_orders'),
      value: stats.deliveredOrders,
      icon: <FaIcons.FaCheckCircle />,
      color: '#43a047',
      trend: '+12%',
      trendDirection: 'up',
      trendText: t('from_last_month'),
      onClick: () => navigate('/admin/orders?status=delivered')
    },
    {
      title: t('cancelled_orders'),
      value: stats.cancelledOrders,
      icon: <FaIcons.FaBan />,
      color: '#e53935',
      trend: '-3%',
      trendDirection: 'down',
      trendText: t('from_last_month'),
      onClick: () => navigate('/admin/orders?status=cancelled')
    },
    {
      title: t('total_revenue'),
      value: formatCurrency(stats.revenue),
      icon: <FaIcons.FaMoneyBillWave />,
      color: '#388e3c',
      trend: '+8%',
      trendDirection: 'up',
      trendText: t('from_last_month'),
      onClick: () => navigate('/admin/reports/revenue')
    }
  ];
  
  return (
    <SummaryContainer>
      {cards.map((card, index) => (
        <Card key={index} onClick={card.onClick}>
          <CardHeader>
            <IconWrapper $color={card.color}>
              {card.icon}
            </IconWrapper>
          </CardHeader>
          
          <CardTitle>{card.title}</CardTitle>
          <CardValue>{card.value}</CardValue>
          
          {card.trend && (
            <CardFooter>
              {card.trendDirection === 'up' ? (
                <TrendUp>
                  <FaIcons.FaArrowUp size={12} />
                  {card.trend}
                </TrendUp>
              ) : (
                <TrendDown>
                  <FaIcons.FaArrowDown size={12} />
                  {card.trend}
                </TrendDown>
              )}
              {card.trendText}
            </CardFooter>
          )}
        </Card>
      ))}
    </SummaryContainer>
  );
};

export default OrdersSummary; 