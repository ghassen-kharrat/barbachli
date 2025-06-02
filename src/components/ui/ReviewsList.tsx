import React from 'react';
import { styled } from 'styled-components';
import { FaStar, FaStarHalf, FaUser, FaCheck, FaCommentSlash } from 'react-icons/fa';
import { ReviewData } from '../../features/products/services/types';
import { useLanguage } from '../../provider/LanguageProvider';

interface ReviewsListProps {
  reviews: ReviewData[];
  loading?: boolean;
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
}

const Container = styled.div`
  margin-bottom: 3rem;
`;

const ReviewsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
  }
`;

const ReviewsTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: var(--text-color);
`;

const ReviewsCount = styled.div`
  color: var(--light-text);
  margin-bottom: 1rem;
`;

const RatingSummary = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  min-width: 250px;
`;

const AverageRating = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 0.5rem;
`;

const RatingStars = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const StyledStarIcon = styled.span`
  color: var(--secondary-color);
  font-size: 1.2rem;
  margin-right: 0.2rem;
`;

const StyledHalfStarIcon = styled.span`
  color: var(--secondary-color);
  font-size: 1.2rem;
  margin-right: 0.2rem;
`;

const StyledEmptyStarIcon = styled.span`
  color: var(--border-color);
  font-size: 1.2rem;
  margin-right: 0.2rem;
`;

const StarIcon: React.FC = () => (
  <StyledStarIcon>{React.createElement(FaStar)}</StyledStarIcon>
);

const HalfStarIcon: React.FC = () => (
  <StyledHalfStarIcon>{React.createElement(FaStarHalf)}</StyledHalfStarIcon>
);

const EmptyStarIcon: React.FC = () => (
  <StyledEmptyStarIcon>{React.createElement(FaStar)}</StyledEmptyStarIcon>
);

const RatingBars = styled.div`
  width: 100%;
`;

const RatingBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const RatingLabel = styled.div`
  min-width: 30px;
  margin-right: 0.5rem;
  font-size: 0.9rem;
  color: var(--light-text);
`;

const BarContainer = styled.div`
  flex: 1;
  height: 8px;
  background-color: var(--light-bg);
  border-radius: 4px;
  overflow: hidden;
`;

const BarFill = styled.div<{ $percentage: number }>`
  height: 100%;
  background-color: var(--secondary-color);
  width: ${({ $percentage }) => `${$percentage}%`};
`;

const BarCount = styled.div`
  min-width: 40px;
  margin-left: 0.5rem;
  font-size: 0.9rem;
  color: var(--light-text);
  text-align: right;
`;

const ReviewsListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ReviewCard = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--box-shadow);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const ReviewAuthor = styled.div`
  display: flex;
  align-items: center;
`;

const AuthorIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--light-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: var(--light-text);
`;

const AuthorInfo = styled.div``;

const AuthorName = styled.div`
  font-weight: 500;
  color: var(--text-color);
  display: flex;
  align-items: center;
`;

const VerifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  background-color: var(--success-color-light);
  color: var(--success-color);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-left: 0.5rem;
`;

const ReviewDate = styled.div`
  font-size: 0.9rem;
  color: var(--light-text);
`;

const ReviewRating = styled.div`
  display: flex;
  align-items: center;
`;

const ReviewTitle = styled.h4`
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: var(--text-color);
`;

const ReviewContent = styled.p`
  color: var(--text-color);
  line-height: 1.6;
  margin-bottom: 0;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--light-text);
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: var(--light-bg);
  border-radius: var(--border-radius);
  color: var(--light-text);
  font-size: 1.1rem;
  margin-top: 1rem;
  box-shadow: var(--box-shadow);
  
  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.6;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 0.8rem;
  border: 1px solid ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--border-color)'};
  background-color: ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--card-bg)'};
  color: ${({ $active }) => $active ? 'white' : 'var(--text-color)'};
  cursor: pointer;
  border-radius: var(--border-radius);
  
  &:hover:not(:disabled) {
    background-color: ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--light-bg)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageNumber = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 0.8rem;
  border: 1px solid ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--border-color)'};
  background-color: ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--card-bg)'};
  color: ${({ $active }) => $active ? 'white' : 'var(--text-color)'};
  cursor: pointer;
  border-radius: var(--border-radius);
  
  &:hover:not(:disabled) {
    background-color: ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--light-bg)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ReviewsList: React.FC<ReviewsListProps> = ({
  reviews,
  loading = false,
  onPageChange,
  currentPage,
  totalPages
}) => {
  const { t, language } = useLanguage();

  // Ensure we have valid data
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  
  // Calculate average rating from reviews
  const averageRating = safeReviews.length > 0 
    ? safeReviews.reduce((sum, review) => sum + review.rating, 0) / safeReviews.length 
    : 0;
  
  // Calculate rating distribution
  const calculateDistribution = () => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    safeReviews.forEach(review => {
      const rating = Math.min(5, Math.max(1, review.rating));
      counts[rating] = counts[rating] + 1;
    });
    
    return [
      { rating: 5, count: counts[5] },
      { rating: 4, count: counts[4] },
      { rating: 3, count: counts[3] },
      { rating: 2, count: counts[2] },
      { rating: 1, count: counts[1] }
    ];
  };
  
  const distribution = calculateDistribution();

  // Format date to a readable format based on current language
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'ar-SA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Render rating stars (including half stars)
  const renderRatingStars = (rating: number) => {
    // Ensure rating is a number
    const numRating = Number(rating) || 0;
    
    const stars = [];
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={`full-${i}`} />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<HalfStarIcon key="half" />);
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<EmptyStarIcon key={`empty-${i}`} />);
    }
    
    return stars;
  };
  
  // Calculate percentage for rating bars
  const calculatePercentage = (count: number) => {
    if (safeReviews.length === 0) return 0;
    return (count / safeReviews.length) * 100;
  };
  
  if (loading) {
    return <LoadingMessage>{t('loading_reviews')}</LoadingMessage>;
  }
  
  return (
    <Container>
      <ReviewsHeader>
        <div>
          <ReviewsTitle>{t('customer_reviews')}</ReviewsTitle>
          <ReviewsCount>{safeReviews.length} {t('reviews')}</ReviewsCount>
        </div>
        
        <RatingSummary>
          <AverageRating>{averageRating.toFixed(1)}</AverageRating>
          <RatingStars>{renderRatingStars(averageRating)}</RatingStars>
          
          <RatingBars>
            {distribution.map((item) => (
              <RatingBar key={item.rating}>
                <RatingLabel>{item.rating}</RatingLabel>
                  <BarContainer>
                  <BarFill $percentage={calculatePercentage(item.count)} />
                  </BarContainer>
                <BarCount>{item.count}</BarCount>
                </RatingBar>
            ))}
          </RatingBars>
        </RatingSummary>
      </ReviewsHeader>
      
      {safeReviews.length === 0 ? (
        <EmptyMessage>
          {React.createElement(FaCommentSlash)}
          <div>{t('no_reviews')} {t('be_first')}</div>
        </EmptyMessage>
      ) : (
        <>
          <ReviewsListContainer>
            {safeReviews.map((review) => (
              <ReviewCard key={review.id}>
                <ReviewHeader>
                  <ReviewAuthor>
                    <AuthorIcon>
                      {React.createElement(FaUser)}
                    </AuthorIcon>
                    <AuthorInfo>
                      <AuthorName>
                        {review.firstName ? `${review.firstName} ${review.lastName?.charAt(0)}.` : t('user')}
                        {review.isVerified && (
                          <VerifiedBadge>
                            {React.createElement(FaCheck, { style: { marginRight: '0.3rem' } })} {t('verified_purchase')}
                          </VerifiedBadge>
                        )}
                      </AuthorName>
                      <ReviewDate>{formatDate(review.createdAt)}</ReviewDate>
                    </AuthorInfo>
                  </ReviewAuthor>
                  <ReviewRating>
                    {renderRatingStars(review.rating)}
                  </ReviewRating>
                </ReviewHeader>
                
                <ReviewTitle>{review.title}</ReviewTitle>
                <ReviewContent>{review.comment}</ReviewContent>
              </ReviewCard>
            ))}
          </ReviewsListContainer>
          
          {totalPages > 1 && (
            <Pagination>
              <PageButton 
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                {t('previous')}
              </PageButton>
              
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNumber: number;
                
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else {
                  let start = Math.max(1, currentPage - 2);
                  let end = Math.min(totalPages, start + 4);
                  
                  if (end === totalPages) {
                    start = Math.max(1, totalPages - 4);
                  }
                  
                  pageNumber = start + i;
                }
                
                if (pageNumber <= totalPages) {
                return (
                    <PageNumber 
                    key={pageNumber}
                    $active={currentPage === pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                  >
                    {pageNumber}
                    </PageNumber>
                );
                }
                
                return null;
              })}
              
              <PageButton 
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                {t('next')}
              </PageButton>
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
};

export default ReviewsList; 