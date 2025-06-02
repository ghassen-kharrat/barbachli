import React from 'react';
import { styled } from 'styled-components';
import { Link } from 'react-router-dom';
import { ProductData } from '../../features/products/services/types';
import { useAddToCart } from '../../features/cart/hooks/use-cart-query';
import { FaIcons } from '../../pages/admin/components/Icons';
import { useLanguage } from '../../provider/LanguageProvider';

const Card = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  height: 220px;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  ${Card}:hover &::after {
    opacity: 1;
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  
  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const Badge = styled.span<{ $type: string }>`
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 1;
  background-color: ${({ $type }) => 
    $type === 'sale' ? 'var(--secondary-color)' : 
    $type === 'new' ? 'var(--success-color)' : 
    'var(--accent-color)'};
  color: white;
`;

const WishlistButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
  background-color: var(--card-bg);
  color: var(--light-text);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  
  &:hover {
    color: var(--secondary-color);
  }
  
  ${Card}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
`;

const QuickView = styled.button`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  padding: 8px 0;
  text-align: center;
  opacity: 0;
  transform: translateY(100%);
  transition: all 0.3s ease;
  z-index: 1;
  
  ${Card}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
  
  &:hover {
    background-color: var(--secondary-color);
  }
`;

const Content = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const Category = styled.span`
  font-size: 0.8rem;
  color: var(--light-text);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
`;

const Title = styled.h3`
  font-size: 1rem;
  margin: 0 0 0.5rem;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.4;
  
  a {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s ease;
    
    &:hover {
      color: var(--secondary-color);
    }
  }
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0.5rem 0;
  gap: 0.5rem;
`;

const Price = styled.span`
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--secondary-color);
`;

const OriginalPrice = styled.span`
  font-size: 0.9rem;
  text-decoration: line-through;
  color: var(--light-text);
`;

const Discount = styled.span`
  background-color: rgba(233, 69, 96, 0.1);
  color: var(--secondary-color);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  margin-left: auto;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 0.25rem;
`;

const Stars = styled.div`
  color: var(--warning-color);
  display: flex;
`;

const ReviewCount = styled.span`
  font-size: 0.8rem;
  color: var(--light-text);
  margin-left: 0.5rem;
`;

const Stock = styled.div<{ $inStock: boolean }>`
  margin: 0.5rem 0;
  color: ${({ $inStock }) => $inStock ? 'var(--success-color)' : 'var(--secondary-color)'};
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const StockIndicator = styled.span<{ $inStock: boolean }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ $inStock }) => $inStock ? 'var(--success-color)' : 'var(--secondary-color)'};
`;

const ActionContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 1rem;
`;

const AddToCartButton = styled.button`
  flex: 1;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--secondary-color);
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

interface ProductCardProps {
  product: ProductData;
  isNew?: boolean;
  isSale?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  isNew = false, 
  isSale = false 
}) => {
  const { t } = useLanguage();
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ productId: product.id, quantity: 1 });
  };
  
  const calculateDiscountPercentage = (): number => {
    if (product.discountPrice && product.price) {
      // Convert values to numbers to ensure proper calculation
      const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
      const discountPrice = typeof product.discountPrice === 'string' 
        ? parseFloat(product.discountPrice) 
        : product.discountPrice;
      
      if (price > 0 && discountPrice && price > discountPrice) {
        return Math.round(((price - discountPrice) / price) * 100);
      }
    }
    return 0;
  };
  
  const discount = calculateDiscountPercentage();
  const isDiscount = discount > 0;
  const inStock = product.stock > 0;
  
  // Generate star rating
  const renderStars = () => {
    const rating = product.rating || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    const stars = [];
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaIcons.FaStar key={`full-${i}`} />);
    }
    
    // Half star if applicable
    if (hasHalfStar) {
      stars.push(<FaIcons.FaStarHalfAlt key="half" />);
    }
    
    // Empty stars
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaIcons.FaRegStar key={`empty-${i}`} />);
    }
    
    return stars;
  };
  
  return (
    <Card className="product-card">
      <ImageContainer>
        {isNew && <Badge $type="new">{t('new')}</Badge>}
        {isSale && <Badge $type="sale">{t('sale')}</Badge>}
        {isDiscount && !isSale && <Badge $type="discount">-{discount}%</Badge>}
        
        <Link to={`/products/${product.id}`}>
          <ProductImage 
            src={product.images[0]} 
            alt={product.name} 
            loading="lazy"
          />
        </Link>
        
        <WishlistButton aria-label={t('add_to_wishlist')}>
          <FaIcons.FaRegHeart />
        </WishlistButton>
        
        <Link to={`/products/${product.id}`}>
          <QuickView>{t('view_product')}</QuickView>
        </Link>
      </ImageContainer>
      
      <Content>
        <Category>{product.category}</Category>
        <Title>
          <Link to={`/products/${product.id}`}>
            {product.name}
          </Link>
        </Title>
        
        <PriceContainer>
          <Price>
            {product.discountPrice ? `${product.discountPrice} DT` : `${product.price} DT`}
          </Price>
          {product.discountPrice && (
            <OriginalPrice>{product.price} DT</OriginalPrice>
          )}
          {isDiscount && <Discount>{discount}% {t('discount')}</Discount>}
        </PriceContainer>
        
        <Rating>
          <Stars>{renderStars()}</Stars>
          {product.reviews && (
            <ReviewCount>({product.reviews})</ReviewCount>
          )}
        </Rating>
        
        <Stock $inStock={inStock}>
          <StockIndicator $inStock={inStock} />
          {inStock ? t('in_stock') : t('out_of_stock')}
        </Stock>
        
        <ActionContainer>
          <AddToCartButton 
            onClick={handleAddToCart}
            disabled={!inStock || isAddingToCart}
          >
            {isAddingToCart ? (
              <>
                {React.createElement(FaIcons.FaSpinner, { 
                  style: { animation: 'spin 1s linear infinite' } 
                })}
                {t('in_progress')}
              </>
            ) : (
              <>
                <FaIcons.FaShoppingCart /> 
                {t('add_to_cart')}
              </>
            )}
          </AddToCartButton>
        </ActionContainer>
      </Content>
    </Card>
  );
};

export default ProductCard; 