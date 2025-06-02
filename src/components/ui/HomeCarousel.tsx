import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { styled, keyframes } from 'styled-components';
import { FaIcons } from '../../pages/admin/components/Icons';
import { CarouselSlide } from '../../features/carousel/types';
import { useCarouselSlides } from '../../features/carousel/hooks/use-carousel-query';
import { useLanguage } from '../../provider/LanguageProvider';

// Keyframes for animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(1.05);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: var(--box-shadow);
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    height: 400px;
  }
  
  @media (max-width: 576px) {
    height: 350px;
  }
`;

const SlideContainer = styled.div<{ $isActive: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: ${props => (props.$isActive ? 1 : 0)};
  transition: opacity 0.8s ease-in-out;
  display: ${props => (props.$isActive ? 'block' : 'none')};
`;

const SlideImage = styled.div<{ $imageUrl: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$imageUrl});
  background-size: cover;
  background-position: center;
  background-color: #2c3e50; /* Fallback color if image fails to load */
  animation: ${fadeIn} 1s ease-out;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0.4) 50%,
      rgba(0, 0, 0, 0.1) 100%
    );
  }
`;

const SlideContent = styled.div<{ $rtl?: boolean }>`
  position: absolute;
  top: 0;
  ${props => props.$rtl ? 'right: 0;' : 'left: 0;'}
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 4rem;
  color: white;
  text-align: ${props => props.$rtl ? 'right' : 'left'};
  z-index: 2;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  
  @media (max-width: 992px) {
    width: 60%;
    padding: 0 3rem;
  }
  
  @media (max-width: 768px) {
    width: 80%;
    padding: 0 2rem;
  }
  
  @media (max-width: 576px) {
    width: 100%;
    padding: 0 1.5rem;
  }
`;

const SlideTitle = styled.h2`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  animation: ${slideIn} 0.8s ease-out;
  animation-delay: 0.2s;
  animation-fill-mode: both;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
  
  @media (max-width: 992px) {
    font-size: 2.5rem;
  }
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 576px) {
    font-size: 1.8rem;
  }
`;

const SlideSubtitle = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  animation: ${slideIn} 0.8s ease-out;
  animation-delay: 0.4s;
  animation-fill-mode: both;
  max-width: 90%;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }
`;

const SlideButton = styled(Link)`
  display: inline-block;
  background-color: var(--secondary-color);
  color: white;
  padding: 0.8rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  animation: ${slideIn} 0.8s ease-out;
  animation-delay: 0.6s;
  animation-fill-mode: both;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background-color: var(--secondary-dark, #d7394c);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  }
  
  [data-theme="light"] & {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 768px) {
    padding: 0.7rem 1.5rem;
    font-size: 1rem;
  }
`;

const CarouselControls = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 10;
`;

const CarouselDot = styled.button<{ $active: boolean }>`
  width: ${props => (props.$active ? '2rem' : '0.75rem')};
  height: 0.75rem;
  border-radius: 999px;
  background-color: ${props => (props.$active ? 'var(--secondary-color)' : 'rgba(255, 255, 255, 0.5)')};
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => (props.$active ? 'var(--secondary-color)' : 'rgba(255, 255, 255, 0.8)')};
  }
  
  [data-theme="light"] & {
    background-color: ${props => (props.$active ? 'var(--secondary-color)' : 'rgba(255, 255, 255, 0.7)')};
    box-shadow: ${props => (props.$active ? '0 0 5px rgba(0, 0, 0, 0.2)' : 'none')};
  }
`;

const CarouselArrows = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 1rem;
  z-index: 10;
  
  @media (max-width: 576px) {
    display: none;
  }
`;

const ArrowButton = styled.button`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.5);
    transform: scale(1.1);
  }
  
  [data-theme="light"] & {
    background-color: rgba(0, 0, 0, 0.5);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.7);
    }
  }
  
  &:focus {
    outline: none;
  }
  
  @media (max-width: 768px) {
    width: 2.5rem;
    height: 2.5rem;
  }
`;

const LoadingState = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--card-bg);
  color: var(--text-muted);
  border-radius: 12px;
`;

const ErrorState = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--card-bg);
  color: var(--danger-color);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
`;

// Main Component
const HomeCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  const { data: slides, isLoading, isError } = useCarouselSlides();
  
  // Fall back to static slides if there's an error or no slides from API
  const staticSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&h=900&q=80',
      title: t('welcome_slide_title'),
      subtitle: t('welcome_slide_subtitle'),
      buttonText: t('shop_now'),
      buttonLink: '/products'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&h=900&q=80',
      title: t('new_arrivals_slide_title'),
      subtitle: t('new_arrivals_slide_subtitle'),
      buttonText: t('view_new_items'),
      buttonLink: '/products?sort=newest'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1607083208023-c4e9f5a4f98c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&h=900&q=80',
      title: t('special_offers_slide_title'),
      subtitle: t('special_offers_slide_subtitle'),
      buttonText: t('view_offers'),
      buttonLink: '/products?discount=true'
    }
  ];

  // Use API slides if available, otherwise use static slides
  const displaySlides = slides && slides.length > 0 ? slides : staticSlides;

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(current => (current + 1) % displaySlides.length);
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(interval);
  }, [displaySlides.length]);

  // Handler for next slide
  const nextSlide = useCallback(() => {
    setCurrentSlide(current => (current + 1) % displaySlides.length);
  }, [displaySlides.length]);

  // Handler for previous slide
  const prevSlide = useCallback(() => {
    setCurrentSlide(current => (current - 1 + displaySlides.length) % displaySlides.length);
  }, [displaySlides.length]);

  // Handler for dot navigation
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <CarouselContainer>
        <LoadingState>
          <FaIcons.FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '2rem' }} />
        </LoadingState>
      </CarouselContainer>
    );
  }

  return (
    <CarouselContainer>
      {displaySlides.map((slide, index) => (
        <SlideContainer key={slide.id} $isActive={index === currentSlide}>
          <SlideImage $imageUrl={slide.image} />
          <SlideContent $rtl={isRTL}>
            <SlideTitle>{slide.title}</SlideTitle>
            <SlideSubtitle>{slide.subtitle}</SlideSubtitle>
            <SlideButton to={slide.buttonLink}>{slide.buttonText}</SlideButton>
          </SlideContent>
        </SlideContainer>
      ))}
      
      <CarouselArrows>
        <ArrowButton onClick={prevSlide} aria-label={isRTL ? t('next') : t('previous')}>
          {isRTL ? <FaIcons.FaChevronRight /> : <FaIcons.FaChevronLeft />}
        </ArrowButton>
        <ArrowButton onClick={nextSlide} aria-label={isRTL ? t('previous') : t('next')}>
          {isRTL ? <FaIcons.FaChevronLeft /> : <FaIcons.FaChevronRight />}
        </ArrowButton>
      </CarouselArrows>
      
      <CarouselControls>
        {displaySlides.map((_, index) => (
          <CarouselDot
            key={index}
            $active={index === currentSlide}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </CarouselControls>
    </CarouselContainer>
  );
};

export default HomeCarousel; 