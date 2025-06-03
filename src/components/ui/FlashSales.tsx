import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { styled } from 'styled-components';
import { FaIcons } from '../../pages/admin/components/Icons';
import { useLanguage } from '../../provider/LanguageProvider';
import { ProductData } from '../../features/products/services/types';
import ProductCard from './ProductCard';

// Styled Components
const FlashSalesContainer = styled.div`
  background-color: var(--danger-color);
  border-radius: var(--border-radius);
  padding: 1rem 2rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -15px;
    left: -15px;
    width: 50px;
    height: 50px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -25px;
    right: -25px;
    width: 70px;
    height: 70px;
    background-color: rgba(255, 255, 255, 0.15);
    border-radius: 50%;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1rem;
    gap: 0.5rem;
  }
`;

const FlashIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.4rem;
  font-weight: 700;
  
  svg {
    filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.5));
    font-size: 1.5rem;
  }
`;

const CountdownContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  
  @media (max-width: 768px) {
    margin: 0.5rem 0;
  }
`;

const CountdownTimer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const TimeUnit = styled.div`
  background-color: rgba(0, 0, 0, 0.3);
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  min-width: 2.5rem;
  text-align: center;
  font-size: 1.1rem;
`;

const TimeSeparator = styled.div`
  font-weight: bold;
  display: flex;
  align-items: center;
`;

const ViewMoreLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-weight: 600;
  text-decoration: none;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.5);
    transform: translateX(3px);
  }
`;

const ProductsContainer = styled.div`
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 576px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
`;

const ProductCardWrapper = styled.div`
  transform: scale(0.98);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1);
  }
`;

interface FlashSalesProps {
  products: ProductData[];
  endTime: Date;
}

const FlashSales: React.FC<FlashSalesProps> = ({ products, endTime }) => {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  // Use persisted end time from localStorage or fallback to props
  const [persistedEndTime, setPersistedEndTime] = useState<Date>(() => {
    const storedEndTime = localStorage.getItem('flashSaleEndTime');
    if (storedEndTime) {
      const savedTime = new Date(storedEndTime);
      // If the saved end time is in the past, use the new endTime from props
      if (savedTime > new Date()) {
        return savedTime;
      }
    }
    // Store the new end time in localStorage
    localStorage.setItem('flashSaleEndTime', endTime.toISOString());
    return endTime;
  });
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = persistedEndTime.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        // Time's up - reset with a new end time (24 hours from now)
        const newEndTime = new Date();
        newEndTime.setHours(newEndTime.getHours() + 24);
        
        localStorage.setItem('flashSaleEndTime', newEndTime.toISOString());
        setPersistedEndTime(newEndTime);
        
        setTimeLeft({ hours: 24, minutes: 0, seconds: 0 });
      }
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [persistedEndTime]);
  
  const formatTime = (value: number): string => {
    return value.toString().padStart(2, '0');
  };
  
  return (
    <div>
      <FlashSalesContainer>
        <FlashIcon>
          <span>{React.createElement(FaIcons.FaBolt)}</span>
          {t('flash_sales')}
        </FlashIcon>
        
        <CountdownContainer>
          {t('ends_in')}:
          <CountdownTimer>
            <TimeUnit>{formatTime(timeLeft.hours)}</TimeUnit>
            <TimeSeparator>:</TimeSeparator>
            <TimeUnit>{formatTime(timeLeft.minutes)}</TimeUnit>
            <TimeSeparator>:</TimeSeparator>
            <TimeUnit>{formatTime(timeLeft.seconds)}</TimeUnit>
          </CountdownTimer>
        </CountdownContainer>
        
        <ViewMoreLink to="/products?sale=flash">
          {t('view_more')} <span>{React.createElement(FaIcons.FaArrowRight)}</span>
        </ViewMoreLink>
      </FlashSalesContainer>
      
      <ProductsContainer>
        {products.slice(0, 6).map(product => (
          <ProductCardWrapper key={product.id}>
            <ProductCard 
              product={product}
              isSale={true}
              isNew={false}
            />
          </ProductCardWrapper>
        ))}
      </ProductsContainer>
    </div>
  );
};

export default FlashSales; 