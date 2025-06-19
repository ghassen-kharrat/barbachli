import { useState } from 'react';
import { Link } from 'react-router-dom';
import { styled } from 'styled-components';
import UserLayout from '../../layouts/UserLayout';
import { useProductsList } from '../../features/products/hooks/use-products-query';
import { useCategories } from '../../features/products/hooks/use-categories-query';
import { FaIcons } from '../../pages/admin/components/Icons';
import ProductCard from '../../components/ui/ProductCard';
import { useLanguage } from '../../provider/LanguageProvider';
import HomeCarousel from '../../components/ui/HomeCarousel';
import FlashSales from '../../components/ui/FlashSales';
import { toast } from 'react-toastify';
import { ProductData, CategoryData } from '../../features/products/services/types';

// Styles
const SectionContainer = styled.div`
  margin-bottom: 4rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  
  @media (max-width: 576px) {
    margin-bottom: 1.5rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  position: relative;
  display: inline-block;
  
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
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 576px) {
    font-size: 1.35rem;
    
    &:after {
      bottom: -6px;
      width: 50px;
      height: 3px;
    }
  }
`;

const SeeAllLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateX(4px);
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.25rem;
  }
  
  @media (max-width: 576px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
`;

const CategoriesSection = styled.section`
  margin-bottom: 4rem;
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const CategoryCard = styled(Link)<{ $bgColor: string }>`
  background-color: ${({ $bgColor }) => $bgColor};
  border-radius: var(--border-radius);
  padding: 2rem;
  text-align: center;
  text-decoration: none;
  color: white;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--box-shadow);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
    z-index: 1;
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    
    .category-icon {
      transform: scale(1.1);
    }
  }
  
  @media (max-width: 768px) {
    min-height: 160px;
    padding: 1.5rem;
  }
  
  @media (max-width: 576px) {
    min-height: 140px;
    padding: 1.25rem;
  }
`;

const CategoryIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
`;

const CategoryName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  position: relative;
  z-index: 2;
`;

const NewsletterSection = styled.section`
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
  padding: 4rem 2rem;
  border-radius: var(--border-radius);
  margin-bottom: 4rem;
  text-align: center;
  color: white;
  
  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
    margin-bottom: 3rem;
  }
  
  @media (max-width: 576px) {
    padding: 2rem 1.25rem;
    margin-bottom: 2.5rem;
  }
`;

const NewsletterContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const NewsletterTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 576px) {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
  }
`;

const NewsletterSubtitle = styled.p`
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  
  @media (max-width: 576px) {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const NewsletterForm = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const NewsletterInput = styled.input`
  flex: 1;
  min-width: 250px;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
  }
  
  @media (max-width: 576px) {
    min-width: 0;
    width: 100%;
    padding: 0.875rem 1.25rem;
  }
`;

const NewsletterButton = styled.button`
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 1rem 2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--primary-color);
    transform: translateY(-2px);
  }
  
  @media (max-width: 576px) {
    width: 100%;
    padding: 0.875rem 1.5rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
  
  svg {
    margin-bottom: 1rem;
    opacity: 0.5;
  }
`;

const NewsletterInfo = styled.p`
  font-size: 0.9rem;
  margin-top: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
`;

type CategoryIconMap = Record<string, { 
  icon: React.ComponentType; 
  color: string;
}>;

const HomePage = () => {
  const { t, language } = useLanguage();
  const [emailSubscribe, setEmailSubscribe] = useState('');
  
  // Set flash sale end time - 24 hours from now
  const flashSaleEndTime = new Date();
  flashSaleEndTime.setHours(flashSaleEndTime.getHours() + 24);
  
  // Fetch featured products
  const { 
    data: featuredProductsData, 
    isLoading: featuredProductsLoading 
  } = useProductsList({ 
    limit: 4,
    sortBy: 'createdAt',
    sortDirection: 'desc'
  });
  
  // Fetch new products
  const { 
    data: newProductsData, 
    isLoading: newProductsLoading 
  } = useProductsList({ 
    limit: 4,
    sortBy: 'createdAt',
    sortDirection: 'desc'
  });
  
  // Fetch sale products for flash sales
  const { 
    data: saleProductsData, 
    isLoading: saleProductsLoading 
  } = useProductsList({ 
    limit: 6,
    hasDiscount: true,
    sortBy: 'discountPrice',
    sortDirection: 'asc'
  });
  
  // Get the products arrays
  const featuredProducts = featuredProductsData?.items || [];
  const newProducts = newProductsData?.items || [];
  const saleProducts = saleProductsData?.items || [];
  
  // Create fallback products when API fails
  const fallbackProducts = [
    {
      id: 1,
      name: 'Smartphone XYZ Pro',
      description: 'Latest smartphone with amazing features',
      price: 899,
      discountPrice: 799,
      images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'],
      stock: 10,
      categoryId: 1,
      category: 'Téléphone & Tablette',
      categoryName: 'Téléphone & Tablette',
      categorySlug: 'telephone-tablette',
      rating: 4.5,
      createdAt: '2023-05-20T10:00:00Z',
      updatedAt: '2023-05-20T10:00:00Z'
    },
    {
      id: 2,
      name: 'Ultra HD Smart TV',
      description: '55-inch Smart TV with crystal clear display',
      price: 1299,
      discountPrice: null,
      images: ['https://images.unsplash.com/photo-1593784991095-a205069470b6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'],
      stock: 5,
      categoryId: 3,
      category: 'TV & High Tech',
      categoryName: 'TV & High Tech',
      categorySlug: 'tv-high-tech',
      rating: 4.2,
      createdAt: '2023-05-15T10:00:00Z',
      updatedAt: '2023-05-15T10:00:00Z'
    },
    {
      id: 3,
      name: 'Wireless Headphones',
      description: 'Noise cancelling wireless headphones',
      price: 299,
      discountPrice: 249,
      images: ['https://images.unsplash.com/photo-1578319439584-104c94d37305?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'],
      stock: 15,
      categoryId: 3,
      category: 'TV & High Tech',
      categoryName: 'TV & High Tech',
      categorySlug: 'tv-high-tech',
      rating: 4.8,
      createdAt: '2023-05-18T10:00:00Z',
      updatedAt: '2023-05-18T10:00:00Z'
    },
    {
      id: 4,
      name: 'Laptop Pro X',
      description: 'Powerful laptop for professionals',
      price: 1499,
      discountPrice: 1399,
      images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'],
      stock: 7,
      categoryId: 2,
      category: 'Informatique',
      categoryName: 'Informatique',
      categorySlug: 'informatique',
      rating: 4.6,
      createdAt: '2023-05-12T10:00:00Z',
      updatedAt: '2023-05-12T10:00:00Z'
    }
  ];
  
  // Fetch categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading
  } = useCategories();
  
  // Get the categories array
  const categories = categoriesData?.data || [];
  
  // Fallback categories for when API fails
  const fallbackCategories = categories.length > 0 ? categories : [
    { id: 1, name: 'Téléphone & Tablette', slug: 'telephone-tablette', icon: null, subcategories: [], createdAt: '2023-01-01T00:00:00Z' },
    { id: 2, name: 'Informatique', slug: 'informatique', icon: null, subcategories: [], createdAt: '2023-01-01T00:00:00Z' },
    { id: 3, name: 'TV & High Tech', slug: 'tv-high-tech', icon: null, subcategories: [], createdAt: '2023-01-01T00:00:00Z' },
    { id: 4, name: 'Électroménager', slug: 'electromenager', icon: null, subcategories: [], createdAt: '2023-01-01T00:00:00Z' },
    { id: 5, name: 'Maison, cuisine & bureau', slug: 'maison-cuisine-bureau', icon: null, subcategories: [], createdAt: '2023-01-01T00:00:00Z' },
    { id: 6, name: 'Vêtements & Chaussures', slug: 'vetements-chaussures', icon: null, subcategories: [], createdAt: '2023-01-01T00:00:00Z' },
  ];
  
  // Map of category names to icons and colors
  const categoryIconMap: CategoryIconMap = {
    'Téléphone & Tablette': { icon: FaIcons.FaPhone, color: '#3498db' },
    'TV & High Tech': { icon: FaIcons.FaDesktop, color: '#9b59b6' },
    'Informatique': { icon: FaIcons.FaLaptop, color: '#2ecc71' },
    'Maison, cuisine & bureau': { icon: FaIcons.FaHome, color: '#e67e22' },
    'Électroménager': { icon: FaIcons.FaHome, color: '#1abc9c' },
    'Vêtements & Chaussures': { icon: FaIcons.FaTshirt, color: '#e74c3c' },
    'Beauté & Santé': { icon: FaIcons.FaHeartbeat, color: '#f39c12' },
    'Jeux vidéos & Consoles': { icon: FaIcons.FaGamepad, color: '#8e44ad' },
    'Sports & Loisirs': { icon: FaIcons.FaRunning, color: '#16a085' }
  };
  
  // Helper function to get display name with translation support
  const getCategoryDisplayName = (category: CategoryData): string => {
    // Map category name to translation key
    const translationKey = `category_${category.slug || category.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    return t(translationKey) !== translationKey ? t(translationKey) : category.name;
  };
  
  // Handler for newsletter submission
  const handleSubmitNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription API call
    console.log('Subscribing email:', emailSubscribe);
    toast.success(t('newsletter_subscribed'));
    setEmailSubscribe('');
  };
  
  // Handler for adding product to cart
  const handleAddToCart = (productId: number, quantity: number = 1) => {
    // TODO: Implement add to cart functionality
    console.log('Adding to cart:', productId, quantity);
    toast.success(t('product_added_to_cart'));
  };

  return (
    <UserLayout>
      <div className="container">
        {/* Homepage Carousel */}
        <HomeCarousel />
        
        {/* Flash Sales Section */}
        {saleProductsLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <FaIcons.FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : saleProducts.length > 0 ? (
          <FlashSales 
            products={saleProducts} 
            endTime={flashSaleEndTime}
          />
        ) : (
          <FlashSales 
            products={fallbackProducts.filter(p => p.discountPrice !== null)}
            endTime={flashSaleEndTime}
          />
        )}
        
        {/* Featured Products Section */}
        <SectionContainer>
          <SectionHeader>
            <SectionTitle>{t('featured_products')}</SectionTitle>
            <SeeAllLink to="/products">
              {t('see_all')} <FaIcons.FaArrowRight size={14} />
            </SeeAllLink>
          </SectionHeader>
          
          {featuredProductsLoading ? (
            <ProductsGrid>
              {[...Array(4)].map((_, index) => (
                <div key={index}>Loading...</div>
              ))}
            </ProductsGrid>
          ) : featuredProducts.length > 0 ? (
            <ProductsGrid>
              {featuredProducts.map((product: ProductData) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  isNew={false}
                  isSale={product.discountPrice !== null && product.discountPrice !== undefined}
                />
              ))}
            </ProductsGrid>
          ) : (
            <ProductsGrid>
              {fallbackProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  isNew={false}
                  isSale={product.discountPrice !== null && product.discountPrice !== undefined}
                />
              ))}
            </ProductsGrid>
          )}
        </SectionContainer>
        
        {/* Categories Section */}
        <CategoriesSection>
          <SectionHeader>
            <SectionTitle>{t('shop_by_category')}</SectionTitle>
            <SeeAllLink to="/products">
              {t('explore_all')} <FaIcons.FaArrowRight size={14} />
            </SeeAllLink>
          </SectionHeader>
          
          {categoriesLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <FaIcons.FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : fallbackCategories.length > 0 ? (
            <CategoriesGrid>
              {fallbackCategories.slice(0, 6).map((category: CategoryData) => {
                const iconInfo = categoryIconMap[category.name] || {
                  icon: FaIcons.FaBox,
                  color: '#3498db'
                };
                
                return (
                  <CategoryCard
                    key={category.id}
                    to={`/products?category=${encodeURIComponent(category.name)}`}
                    $bgColor={iconInfo.color}
                  >
                    <CategoryIcon className="category-icon">
                      <iconInfo.icon />
                    </CategoryIcon>
                    <CategoryName>{getCategoryDisplayName(category)}</CategoryName>
                  </CategoryCard>
                );
              })}
            </CategoriesGrid>
          ) : (
            <EmptyState>
              <FaIcons.FaTag size={48} />
              <p>{t('no_categories')}</p>
            </EmptyState>
          )}
        </CategoriesSection>
        
        {/* New Arrivals Section */}
        <SectionContainer>
          <SectionHeader>
            <SectionTitle>{t('new_arrivals')}</SectionTitle>
            <SeeAllLink to="/products?sort=newest">
              {t('see_all')} <FaIcons.FaArrowRight size={14} />
            </SeeAllLink>
          </SectionHeader>
          
          {newProductsLoading ? (
            <ProductsGrid>
              {[...Array(4)].map((_, index) => (
                <div key={index}>Loading...</div>
              ))}
            </ProductsGrid>
          ) : newProducts.length > 0 ? (
            <ProductsGrid>
              {newProducts.map((product: ProductData) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  isNew={true}
                  isSale={product.discountPrice !== null && product.discountPrice !== undefined}
                />
              ))}
            </ProductsGrid>
          ) : (
            <ProductsGrid>
              {fallbackProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  isNew={true}
                  isSale={product.discountPrice !== null && product.discountPrice !== undefined}
                />
              ))}
            </ProductsGrid>
          )}
        </SectionContainer>
        
        {/* Newsletter Section */}
        <NewsletterSection>
          <NewsletterContent>
            <NewsletterTitle>{t('newsletter_title')}</NewsletterTitle>
            <NewsletterSubtitle>{t('newsletter_subtitle')}</NewsletterSubtitle>
            
            <NewsletterForm onSubmit={handleSubmitNewsletter}>
              <NewsletterInput 
                type="email" 
                placeholder={t('your_email')}
                value={emailSubscribe}
                onChange={(e) => setEmailSubscribe(e.target.value)}
                required
              />
              <NewsletterButton type="submit">
                {t('subscribe')}
              </NewsletterButton>
            </NewsletterForm>
            
            <NewsletterInfo>{t('newsletter_info')}</NewsletterInfo>
          </NewsletterContent>
        </NewsletterSection>
      </div>
    </UserLayout>
  );
};

export default HomePage; 