import React from 'react';
import { styled } from 'styled-components';
import { ReviewData } from '../../features/products/services/types';
import { useLanguage } from '../../provider/LanguageProvider';

// Custom SVG icons
const StarSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
  </svg>
);

const StarHalfSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M5.354 5.119 7.538.792A.516.516 0 0 1 8 .5c.183 0 .366.097.465.292l2.184 4.327 4.898.696A.537.537 0 0 1 16 6.32a.548.548 0 0 1-.17.445l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256a.52.52 0 0 1-.146.05c-.342.06-.668-.254-.6-.642l.83-4.73L.173 6.765a.55.55 0 0 1-.172-.403.58.58 0 0 1 .085-.302.513.513 0 0 1 .37-.245l4.898-.696zM8 12.027a.5.5 0 0 1 .232.056l3.686 1.894-.694-3.957a.565.565 0 0 1 .162-.505l2.907-2.77-4.052-.576a.525.525 0 0 1-.393-.288L8.001 2.223 8 2.226v9.8z"/>
  </svg>
);

const UserSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c0-.001-0-1.001-5.006-1.001C3.984 11.995 3.99 12.004 4 13h10z"/>
  </svg>
);

const CheckSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
    <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
  </svg>
);

const CommentSlashSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2.5a2 2 0 0 0-1.6.8L8 14.333 6.1 11.8a2 2 0 0 0-1.6-.8H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2.5a1 1 0 0 1 .8.4l1.9 2.533a1 1 0 0 0 1.6 0l1.9-2.533a1 1 0 0 1 .8-.4H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
    <path d="M3.707 3.293a1 1 0 0 1 1.414 0L8 6.586l2.879-2.293a1 1 0 0 1 1.414 1.414L9.414 8l2.879 2.293a1 1 0 0 1-1.414 1.414L8 9.414l-2.879 2.293a1 1 0 0 1-1.414-1.414L6.586 8 3.707 5.707a1 1 0 0 1 0-1.414z"/>
  </svg>
);

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
  <StyledStarIcon><StarSVG /></StyledStarIcon>
);

const HalfStarIcon: React.FC = () => (
  <StyledHalfStarIcon><StarHalfSVG /></StyledHalfStarIcon>
);

const EmptyStarIcon: React.FC = () => (
  <StyledEmptyStarIcon><StarSVG /></StyledEmptyStarIcon>
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
          <EmptyStateIcon>
            <CommentSlashSVG />
          </EmptyStateIcon>
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
                      <UserSVG />
                    </AuthorIcon>
                    <AuthorInfo>
                      <AuthorName>
                        {review.firstName ? `${review.firstName} ${review.lastName?.charAt(0)}.` : t('user')}
                        {review.isVerified && (
                          <VerifiedBadge>
                            <CheckSVG /> {t('verified_purchase')}
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