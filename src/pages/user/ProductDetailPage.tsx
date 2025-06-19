import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { styled } from 'styled-components';
import { FaIcons } from '../admin/components/Icons';
import UserLayout from '../../layouts/UserLayout';
import { useProductDetail } from '../../features/products/hooks/use-products-query';
import { useAddToCart } from '../../features/cart/hooks/use-cart-query';
import { useAuthCheck } from '../../features/auth/hooks/use-auth-query';
import { toast } from 'react-toastify';
import { ProductDetailSkeleton } from '../../components/Skeletons';
import { useProductReviews, useCreateReview } from '../../features/products/hooks/use-reviews-query';
import ReviewForm from '../../components/ui/ReviewForm';
import ReviewsList from '../../components/ui/ReviewsList';
import { useLanguage } from '../../provider/LanguageProvider';

// Styles
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  
  @media (max-width: 576px) {
    padding: 0 1rem;
  }
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  color: var(--light-text);
  flex-wrap: wrap;
  
  @media (max-width: 576px) {
    margin-bottom: 1.5rem;
    font-size: 0.8rem;
  }
`;

const BreadcrumbSeparator = styled.span`
  color: var(--light-text);
`;

const BreadcrumbLink = styled(Link)`
  color: var(--light-text);
  text-decoration: none;
  transition: var(--transition);
  
  &:hover {
    color: var(--accent-color);
  }
`;

const CurrentBreadcrumb = styled.span`
  color: var(--primary-color);
  font-weight: 500;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--accent-color);
  text-decoration: none;
  margin-bottom: 1.5rem;
  font-weight: 500;
  transition: var(--transition);
  
  &:hover {
    color: var(--secondary-color);
    transform: translateX(-3px);
  }
`;

const ProductContainer = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  gap: 3rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  @media (max-width: 576px) {
    gap: 1.5rem;
  }
`;

const ImageGallery = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MainImageContainer = styled.div`
  position: relative;
  width: 100%;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
  
  &::after {
    content: '';
    display: block;
    padding-bottom: 100%;
  }
`;

const MainImage = styled.img`
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: white;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.03);
  }
`;

const DiscountBadge = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background-color: var(--secondary-color);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-weight: 600;
  z-index: 2;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

const ThumbnailsContainer = styled.div`
  display: flex;
  gap: 0.8rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 576px) {
    gap: 0.5rem;
  }
`;

const ThumbnailWrapper = styled.div<{ $active: boolean }>`
  width: 80px;
  height: 80px;
  border: 2px solid ${({ $active }) => $active ? 'var(--secondary-color)' : 'transparent'};
  border-radius: var(--border-radius);
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--box-shadow);
  }
  
  @media (max-width: 576px) {
    width: 60px;
    height: 60px;
  }
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const CategoryTag = styled.div`
  display: inline-block;
  background-color: var(--light-bg);
  color: var(--accent-color);
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  margin-bottom: 0.5rem;
`;

const ProductName = styled.h1`
  font-size: 2rem;
  color: var(--primary-color);
  margin: 0 0 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 576px) {
    font-size: 1.35rem;
  }
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
`;

const Price = styled.span`
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--secondary-color);
  
  @media (max-width: 576px) {
    font-size: 1.5rem;
  }
`;

const DiscountPrice = styled.span`
  text-decoration: line-through;
  color: var(--light-text);
  font-size: 1.2rem;
  
  @media (max-width: 576px) {
    font-size: 1rem;
  }
`;

const SaveAmount = styled.span`
  font-size: 0.9rem;
  color: #2e7d32;
  font-weight: 500;
  background-color: rgba(46, 125, 50, 0.1);
  padding: 0.3rem 0.8rem;
  border-radius: var(--border-radius);
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
`;

const Stars = styled.div`
  display: flex;
  color: #ffc107;
  font-size: 1.1rem;
`;

const ReviewsCount = styled.span`
  color: var(--light-text);
  font-size: 0.9rem;
`;

const WriteReviewLink = styled.a`
  color: var(--accent-color);
  font-size: 0.9rem;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 1rem 0;
`;

const StockStatus = styled.div<{ $inStock: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  font-size: 0.9rem;
  color: ${({ $inStock }) => ($inStock ? '#2e7d32' : '#d32f2f')};
  background-color: ${({ $inStock }) => ($inStock ? 'rgba(46, 125, 50, 0.1)' : 'rgba(211, 47, 47, 0.1)')};
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ $inStock }) => $inStock ? '#2e7d32' : '#d32f2f'};
  }
`;

const ProductDescription = styled.div`
  margin-top: 1rem;
  color: var(--text-color);
  line-height: 1.7;
  
  @media (max-width: 576px) {
    font-size: 0.95rem;
    line-height: 1.6;
  }
`;

const KeyFeatures = styled.ul`
  padding-left: 1.5rem;
  margin: 1rem 0;
  
  li {
    margin-bottom: 0.5rem;
    position: relative;
  }
  
  li::before {
    content: '✓';
    color: var(--accent-color);
    font-weight: bold;
    position: absolute;
    left: -1.2rem;
  }
`;

const AddToCartSection = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
`;

const QuantityLabel = styled.span`
  font-weight: 500;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  overflow: hidden;
  
  @media (max-width: 576px) {
    width: 100%;
  }
`;

const QuantityButton = styled.button`
  background-color: var(--light-bg);
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background-color: var(--border-color);
  }
  
  @media (max-width: 576px) {
    padding: 0.75rem 1rem;
  }
`;

const QuantityInput = styled.input`
  width: 50px;
  border: none;
  text-align: center;
  font-weight: 500;
  padding: 0.5rem 0;
  
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  @media (max-width: 576px) {
    flex: 1;
    padding: 0.75rem 0;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }
`;

const AddToCartButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 1rem 2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: var(--transition);
  flex: 1;
  
  &:hover {
    background-color: var(--secondary-color);
  }
  
  @media (max-width: 576px) {
    width: 100%;
    padding: 0.875rem;
  }
`;

const BuyNowButton = styled.button`
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 1rem 2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background-color: var(--primary-color);
  }
  
  @media (max-width: 576px) {
    width: 100%;
    padding: 0.875rem;
  }
`;

const DeliveryInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: var(--light-bg);
  border-radius: var(--border-radius);
`;

const DeliveryIcon = styled.div`
  font-size: 1.3rem;
  color: var(--accent-color);
`;

const DeliveryText = styled.div`
  font-size: 0.9rem;
  color: var(--text-color);
`;

const ShareContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const ShareLabel = styled.span`
  font-weight: 500;
  color: var(--text-color);
`;

const ShareButtons = styled.div`
  display: flex;
  gap: 0.8rem;
`;

const ShareButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  font-size: 1rem;
  transition: var(--transition);
  
  &:hover {
    transform: translateY(-3px);
  }
`;

const FacebookShare = styled(ShareButton)`
  background-color: #1877f2;
`;

const TwitterShare = styled(ShareButton)`
  background-color: #1da1f2;
`;

const PinterestShare = styled(ShareButton)`
  background-color: #e60023;
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  padding: 0.8rem;
  background-color: rgba(244, 67, 54, 0.1);
  border-radius: var(--border-radius);
  margin-top: 1rem;
`;

const SuccessMessage = styled.div`
  color: var(--success-color);
  padding: 0.8rem;
  background-color: rgba(76, 175, 80, 0.1);
  border-radius: var(--border-radius);
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AdditionalInfo = styled.div`
  margin-top: 3rem;
`;

const TabsContainer = styled.div`
  margin-top: 3rem;
  
  @media (max-width: 576px) {
    margin-top: 2rem;
  }
`;

const TabsHeader = styled.div`
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 2rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  @media (max-width: 576px) {
    margin-bottom: 1.5rem;
  }
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid ${({ $active }) => $active ? 'var(--secondary-color)' : 'transparent'};
  color: ${({ $active }) => $active ? 'var(--secondary-color)' : 'var(--text-color)'};
  font-weight: ${({ $active }) => $active ? '600' : '400'};
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
  
  &:hover {
    color: var(--secondary-color);
  }
  
  @media (max-width: 576px) {
    padding: 0.75rem 1.25rem;
  }
`;

const TabContent = styled.div`
  padding: 1.5rem;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
`;

const TabContentInner = styled.div`
  line-height: 1.6;
`;

const Section = styled.section`
  margin-top: 3rem;
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -8px;
    width: 60px;
    height: 4px;
    background-color: var(--secondary-color);
    border-radius: 2px;
  }
`;

const LoginPrompt = styled.div`
  background-color: var(--light-bg);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  margin-bottom: 2rem;
  text-align: center;
`;

const LoginButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--accent-color);
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: var(--border-radius);
  text-decoration: none;
  font-weight: 500;
  margin-top: 1rem;
  transition: var(--transition);
  
  &:hover {
    background-color: var(--primary-color);
  }
`;

const EmptyReviewsMessage = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  margin-bottom: 2rem;
`;

const EmptyReviewsIcon = styled.div`
  font-size: 3rem;
  color: var(--light-text);
  margin-bottom: 1rem;
`;

const EmptyReviewsTitle = styled.h3`
  margin-bottom: 0.5rem;
  color: var(--text-color);
`;

const EmptyReviewsText = styled.p`
  color: var(--light-text);
  margin-bottom: 1.5rem;
`;

const WriteReviewButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--accent-color);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background-color: var(--primary-color);
  }
`;

const ReviewFormTitle = styled.h3`
  margin-bottom: 1.5rem;
  color: var(--primary-color);
`;

const TabsSection = styled.div`
  margin-top: 3rem;
`;

const ReviewsSection = styled.section`
  margin-top: 1rem;
`;

const ReviewsHeader = styled.div`
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

const ReviewsTitle = styled.h3`
  margin: 0;
  color: var(--primary-color);
`;

const ReviewsOverview = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--box-shadow);
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
`;

const AverageRating = styled.div`
  display: flex;
  align-items: baseline;
  margin-right: 2rem;
  
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 1rem;
  }
`;

const RatingValue = styled.span`
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--text-color);
`;

const MaxRating = styled.span`
  font-size: 1.5rem;
  color: var(--light-text);
  margin-left: 0.2rem;
`;

const RatingStars = styled.div`
  display: flex;
  align-items: center;
  margin-right: 2rem;
  
  svg {
    color: var(--secondary-color);
    font-size: 1.5rem;
    margin-right: 0.3rem;
  }
  
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 1rem;
  }
`;

const AddReviewButton = styled.button`
  background-color: var(--accent-color);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover:not(:disabled) {
    background-color: var(--primary-color);
  }
  
  &:disabled {
    background-color: var(--border-color);
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const LoginToReview = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--light-bg);
  padding: 1rem;
  border-radius: var(--border-radius);
  margin-bottom: 2rem;
  
  a {
    color: var(--accent-color);
    margin-left: 0.5rem;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  margin: 2rem 0;
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  color: var(--error-color);
  margin-bottom: 1.5rem;
`;

const ErrorTitle = styled.h2`
  color: var(--text-color);
  margin-bottom: 1rem;
`;

const BackToProducts = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--accent-color);
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: var(--border-radius);
  text-decoration: none;
  font-weight: 500;
  margin-top: 1.5rem;
  transition: var(--transition);
  
  &:hover {
    background-color: var(--primary-color);
  }
`;

const ProductFeatures = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const Feature = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem;
  background-color: var(--light-bg);
  border-radius: var(--border-radius);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 2rem;
  color: var(--accent-color);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background-color: rgba(var(--accent-color-rgb), 0.1);
  border-radius: 50%;
`;

const FeatureText = styled.div`
  flex: 1;
`;

const FeatureTitle = styled.h4`
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: var(--text-color);
`;

const FeatureDescription = styled.p`
  margin: 0;
  color: var(--light-text);
  font-size: 0.9rem;
`;

const ProductDetailPage = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const productId = id ? parseInt(id) : 0;
  const navigate = useNavigate();
  const location = useLocation();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const reviewFormRef = useRef<HTMLDivElement>(null);
  const reviewsSectionRef = useRef<HTMLElement>(null);
  
  const { data: productData, isLoading, error } = useProductDetail(productId);
  const { data: authData } = useAuthCheck();
  const addToCartMutation = useAddToCart();
  const { data: reviewsData, isLoading: isLoadingReviews, refetch: refetchReviews } = useProductReviews(
    productId ? Number(productId) : 0,
    reviewPage
  );
  
  // Debug logs for reviews
  useEffect(() => {
    // Force console to always show reviewsData, even if it appears to be falsy
    console.log('Debug - Force log reviewsData:', reviewsData);
    console.log('Debug - Force log reviewsData?.data:', reviewsData?.data);
    console.log('Debug - Force log reviewsData?.total:', reviewsData?.total);
    
    // Double check ProductID being used for the API call
    console.log('Debug - ProductID for reviews API call:', productId);
  }, [reviewsData, productId]);
  
  const createReview = useCreateReview();
  const isAuthenticated = authData && !!authData.data;
  const user = authData?.data;
  
  const product = productData?.data;
  
  // Get review stats - Fix the way we access reviewsData
  const reviewsArray = reviewsData?.data || [];
  const reviewsTotal = reviewsData?.total || reviewsArray.length || 0;
  const averageRating = reviewsData?.stats?.averageRating ? 
    Number(reviewsData.stats.averageRating) : 
    (reviewsArray.length > 0 ? 
      reviewsArray.reduce((sum, review) => sum + review.rating, 0) / reviewsArray.length : 
      0);
  
  // Reset success message after 3 seconds
  useEffect(() => {
    if (addToCartSuccess) {
      const timer = setTimeout(() => setAddToCartSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [addToCartSuccess]);
  
  // Scroll to review form when showReviewForm changes
  useEffect(() => {
    if (showReviewForm && reviewFormRef.current) {
      reviewFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showReviewForm]);
  
  // Handle scroll to reviews section
  const scrollToReviews = () => {
    // Set the active tab to reviews
    setActiveTab('reviews');
    
    // Show the review form if user is authenticated
    if (isAuthenticated) {
      setShowReviewForm(true);
    }
    
    // Scroll to the reviews section after a short delay to ensure the tab content is rendered
    setTimeout(() => {
      if (reviewsSectionRef.current) {
        reviewsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  // Calculate price and discount
  const calculateDiscount = () => {
    if (!product || !product.discountPrice) return null;
    const productPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const discountPrice = typeof product.discountPrice === 'string' ? parseFloat(product.discountPrice) : product.discountPrice;
    const discount = Math.round(((productPrice - discountPrice) / productPrice) * 100);
    return discount > 0 ? discount : null;
  };
  
  const calculateSavings = () => {
    if (!product || !product.discountPrice) return null;
    const productPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const discountPrice = typeof product.discountPrice === 'string' ? parseFloat(product.discountPrice) : product.discountPrice;
    return (productPrice - discountPrice).toFixed(2);
  };
  
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      // Redirect to login page with return URL
      navigate(`/login?redirect=/products/${productId}`);
      return;
    }
    
    if (product) {
      addToCartMutation.mutate(
        { productId: product.id, quantity },
        {
          onSuccess: () => {
            setAddToCartSuccess(true);
            toast.success(t('product_added_to_cart'));
          },
          onError: (err) => {
            toast.error(t('error_adding_to_cart'));
            console.error('Add to cart error:', err);
          }
        }
      );
    }
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  const handleReviewSubmit = (reviewData) => {
    if (!isAuthenticated) {
      toast.error(t('login_required_for_review'));
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    
    createReview.mutate(
      { productId: productId ? Number(productId) : 0, reviewData },
      {
        onSuccess: () => {
          toast.success(t('review_added_success'));
          setShowReviewForm(false);
          refetchReviews();
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || t('error_adding_review')
          );
        }
      }
    );
  };
  
  if (isLoading) {
    return (
      <UserLayout>
        <Container>
          <Breadcrumb>
            <BreadcrumbLink to="/">{t('home')}</BreadcrumbLink>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbLink to="/products">{t('products')}</BreadcrumbLink>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <CurrentBreadcrumb>{t('product_details')}</CurrentBreadcrumb>
          </Breadcrumb>
          <ProductDetailSkeleton />
        </Container>
      </UserLayout>
    );
  }
  
  if (error || !product) {
    return (
      <UserLayout>
        <Container>
          <ErrorContainer>
            <ErrorIcon>
              <FaIcons.FaExclamationTriangle />
            </ErrorIcon>
            <ErrorTitle>{t('product_not_found')}</ErrorTitle>
            <ErrorMessage>{t('product_not_found_message')}</ErrorMessage>
            <BackToProducts to="/products">{t('back_to_products')}</BackToProducts>
          </ErrorContainer>
        </Container>
      </UserLayout>
    );
  }
  
  // Create array of product images or use placeholder if none
  const productImages = product.images && product.images.length > 0
    ? product.images
    : ['data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20300%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_img%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_img%22%3E%3Crect%20width%3D%22300%22%20height%3D%22300%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22100%22%20y%3D%22150%22%3EProduit%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'];
  
  // Calculate discount percentage
  const discountPercent = calculateDiscount();
  
  return (
    <UserLayout>
      <Container>
        <Breadcrumb>
          <BreadcrumbLink to="/">{t('home')}</BreadcrumbLink>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbLink to="/products">{t('products')}</BreadcrumbLink>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbLink to={`/products?category=${encodeURIComponent(product.category)}`}>
            {product.category}
          </BreadcrumbLink>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <CurrentBreadcrumb>{product.name}</CurrentBreadcrumb>
        </Breadcrumb>
        
        <BackLink to="/products">
          <FaIcons.FaArrowLeft /> {t('back_to_products')}
        </BackLink>
        
        <ProductContainer>
          <ImageGallery>
            <MainImageContainer>
              {discountPercent && (
                <DiscountBadge>-{discountPercent}%</DiscountBadge>
              )}
              <MainImage 
                src={productImages[selectedImage]} 
                alt={product.name} 
              />
            </MainImageContainer>
            
            {productImages.length > 1 && (
              <ThumbnailsContainer>
                {productImages.map((image, index) => (
                  <ThumbnailWrapper 
                    key={index} 
                    $active={selectedImage === index}
                    onClick={() => setSelectedImage(index)}
                  >
                    <Thumbnail src={image} alt={`${product.name} - ${index + 1}`} />
                  </ThumbnailWrapper>
                ))}
              </ThumbnailsContainer>
            )}
          </ImageGallery>
          
          <ProductInfo>
            <div>
              <CategoryTag>{product.category}</CategoryTag>
              <ProductName>{product.name}</ProductName>
              
              <RatingContainer>
                <Stars>
                  {Array.from({ length: 5 }).map((_, i) => {
                    const value = i + 1;
                    return value <= Math.floor(averageRating) ? (
                      <FaIcons.FaStar key={i} />
                    ) : value - 0.5 <= averageRating ? (
                      <FaIcons.FaStarHalfAlt key={i} />
                    ) : (
                      <FaIcons.FaRegStar key={i} />
                    );
                  })}
                </Stars>
                <ReviewsCount>
                  <strong>{reviewsTotal}</strong> {t('reviews')}
                </ReviewsCount>
                <WriteReviewLink onClick={scrollToReviews}>
                  {t('add_review')}
                </WriteReviewLink>
              </RatingContainer>
              
              <PriceContainer>
                <Price>
                  {product.discountPrice ? `${product.discountPrice} DT` : `${product.price} DT`}
                </Price>
                {product.discountPrice && (
                    <DiscountPrice>{product.price} DT</DiscountPrice>
                )}
              </PriceContainer>
              
              {product.discountPrice && (
                <SaveAmount>
                  {t('you_save')} {calculateSavings()} DT ({discountPercent}%)
                </SaveAmount>
              )}
            </div>
            
            <Divider />
              
              <StockStatus $inStock={product.stock > 0}>
                {product.stock > 0 ? (
                <span>{t('in_stock')}</span>
                ) : (
                <span>{t('out_of_stock')}</span>
                )}
              </StockStatus>
            
            <AddToCartSection>
              <QuantitySelector>
                <QuantityLabel>{t('quantity')}:</QuantityLabel>
                <QuantityControls>
                  <QuantityButton onClick={decrementQuantity} disabled={quantity <= 1}>
                    <FaIcons.FaMinus />
                  </QuantityButton>
                  <QuantityInput
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    max={product.stock}
                  />
                  <QuantityButton 
                    onClick={incrementQuantity}
                    disabled={product.stock <= quantity}
                  >
                    <FaIcons.FaPlus />
                  </QuantityButton>
                </QuantityControls>
              </QuantitySelector>
              
                <ActionButtons>
                  <AddToCartButton 
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || addToCartMutation.isPending}
                  >
                  {addToCartMutation.isPending ? (
                    <>
                      <FaIcons.FaSpinner /> {t('adding')}...
                    </>
                    ) : (
                      <>
                      <FaIcons.FaShoppingCart /> {t('add_to_cart')}
                      </>
                    )}
                  </AddToCartButton>
                  
                  <BuyNowButton 
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || addToCartMutation.isPending}
                  >
                    {t('buy_now')}
                  </BuyNowButton>
                </ActionButtons>
              
              {addToCartSuccess && (
                <SuccessMessage>
                  <FaIcons.FaCheckCircle /> {t('product_added_to_cart')}
                </SuccessMessage>
              )}
            </AddToCartSection>
            
            <Divider />
            
            <ProductFeatures>
              <Feature>
                <FeatureIcon>
                  <FaIcons.FaTruck />
                </FeatureIcon>
                <FeatureText>
                  <FeatureTitle>{t('free_shipping')}</FeatureTitle>
                  <FeatureDescription>{t('free_shipping_desc')}</FeatureDescription>
                </FeatureText>
              </Feature>
              
              <Feature>
                <FeatureIcon>
                  <FaIcons.FaShieldAlt />
                </FeatureIcon>
                <FeatureText>
                  <FeatureTitle>{t('money_guarantee')}</FeatureTitle>
                  <FeatureDescription>{t('money_guarantee_desc')}</FeatureDescription>
                </FeatureText>
              </Feature>
              
              <Feature>
                <FeatureIcon>
                  <FaIcons.FaHeadset />
                </FeatureIcon>
                <FeatureText>
                  <FeatureTitle>{t('support_247')}</FeatureTitle>
                  <FeatureDescription>{t('support_247_desc')}</FeatureDescription>
                </FeatureText>
              </Feature>
            </ProductFeatures>
          </ProductInfo>
        </ProductContainer>
        
        <TabsSection>
          <TabsHeader>
            <TabButton 
              $active={activeTab === 'description'} 
              onClick={() => setActiveTab('description')}
            >
              {t('description')}
            </TabButton>
            <TabButton 
              $active={activeTab === 'reviews'} 
              onClick={() => setActiveTab('reviews')}
            >
              {t('reviews')} ({reviewsTotal})
            </TabButton>
          </TabsHeader>
          
          <TabContent>
            {activeTab === 'description' ? (
              <ProductDescription>
                {product.description}
              </ProductDescription>
            ) : (
              <ReviewsSection ref={reviewsSectionRef}>
                <ReviewsHeader>
                  <ReviewsTitle>{t('customer_reviews')}</ReviewsTitle>
                  <ReviewsCount>
                    {reviewsTotal} {t('reviews')}
                  </ReviewsCount>
                </ReviewsHeader>
                
                <ReviewsOverview>
                  <AverageRating>
                    <RatingValue>{averageRating.toFixed(1)}</RatingValue>
                    <MaxRating>/5</MaxRating>
                  </AverageRating>
                  
                  <RatingStars>
                    {Array.from({ length: 5 }).map((_, i) => {
                      const value = i + 1;
                      return value <= Math.floor(averageRating) ? (
                        <FaIcons.FaStar key={i} />
                      ) : value - 0.5 <= averageRating ? (
                        <FaIcons.FaStarHalfAlt key={i} />
                      ) : (
                        <FaIcons.FaRegStar key={i} />
                      );
                    })}
                  </RatingStars>
                  
                  <AddReviewButton 
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    disabled={!isAuthenticated}
                  >
                    {showReviewForm ? t('cancel') : t('add_review')}
                  </AddReviewButton>
                </ReviewsOverview>
                
                      {showReviewForm && (
                        <div ref={reviewFormRef}>
                          <ReviewForm 
                            onSubmit={handleReviewSubmit}
                            isLoading={createReview.isPending}
                          />
                        </div>
                      )}
                      
                {!isAuthenticated && (
                  <LoginToReview>
                    <FaIcons.FaInfoCircle /> {t('login_to_review')}
                    <Link to={`/login?redirect=/products/${productId}`}>
                      {t('login')}
                    </Link>
                  </LoginToReview>
                    )}
                
                  <ReviewsList 
                    reviews={reviewsArray}
                    loading={isLoadingReviews}
                    totalPages={Math.ceil(reviewsTotal / 10)}
                    currentPage={reviewPage}
                    onPageChange={setReviewPage}
                  />
              </ReviewsSection>
            )}
          </TabContent>
        </TabsSection>
      </Container>
    </UserLayout>
  );
};

export default ProductDetailPage; 