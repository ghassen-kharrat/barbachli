import { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import { FaIcons } from '../admin/components/Icons';
import UserLayout from '../../layouts/UserLayout';
import { useProducts } from '../../features/products/hooks/use-products-query';
import { useCategories } from '../../features/products/hooks/use-categories-query';
import { ProductFilters } from '../../features/products/services/types';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../../provider/LanguageProvider';
import ProductCard from '../../components/ui/ProductCard';

// Styles
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  margin-bottom: 0.5rem;
  color: var(--primary-color);
`;

const PageDescription = styled.p`
  color: var(--light-text);
  margin-bottom: 2rem;
`;

const FiltersContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.2rem;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const FiltersButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 0.7rem 1.2rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
  color: var(--text-color);
  
  &:hover {
    border-color: var(--accent-color);
    background-color: var(--light-bg);
  }
  
  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
  }
`;

const CategorySelect = styled.select`
  padding: 0.7rem 1.2rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--card-bg);
  color: var(--text-color);
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  
  &:focus {
    border-color: var(--accent-color);
  }
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const SortSelect = styled.select`
  padding: 0.7rem 1.2rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--card-bg);
  color: var(--text-color);
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  
  &:focus {
    border-color: var(--accent-color);
  }
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.8rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--card-bg);
  color: var(--text-color);
  font-size: 0.95rem;
  transition: var(--transition);
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(15, 52, 96, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--light-text);
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 2rem;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.span`
  margin-left: 1rem;
  color: var(--text-color);
  font-size: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  color: var(--light-text);
  margin-bottom: 1rem;
`;

const EmptyStateTitle = styled.h3`
  margin-bottom: 0.5rem;
  color: var(--primary-color);
`;

const EmptyStateText = styled.p`
  color: var(--light-text);
  margin-bottom: 1rem;
`;

const EmptyStateButton = styled(Link)`
  padding: 0.8rem 1.2rem;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
  text-decoration: none;
  display: inline-block;
  
  &:hover {
    background-color: var(--primary-color);
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 3rem;
`;

const PaginationButton = styled.button<{ active?: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background-color: ${({ active }) => active ? 'var(--accent-color)' : 'white'};
  color: ${({ active }) => active ? 'white' : 'var(--text-color)'};
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  
  &:hover:not(:disabled) {
    background-color: ${({ active }) => active ? 'var(--primary-color)' : 'var(--light-bg)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PaginationNumber = styled(PaginationButton)`
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 3rem;
`;

const ViewButton = styled.button`
  width: 100%;
  padding: 0.8rem;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: var(--primary-color);
  }
`;

const ProductsPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 12
  });
  
  // Get URL search params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlSearch = params.get('search');
    const urlCategory = params.get('category');
    const urlPage = params.get('page');
    
    const newFilters: ProductFilters = { ...filters };
    
    if (urlSearch) {
      newFilters.search = urlSearch;
      setSearchQuery(urlSearch);
    }
    
    if (urlCategory) {
      newFilters.category = urlCategory;
    }
    
    if (urlPage) {
      newFilters.page = parseInt(urlPage);
    }
    
    setFilters(newFilters);
  }, [location.search]);
  
  const { data: productsData, isLoading: isLoadingProducts } = useProducts(filters);
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();
  
  const products = productsData?.items || [];
  const categories = categoriesData?.data || [];
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchQuery, page: 1 });
    
    // Update URL
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (filters.category) params.set('category', filters.category);
    
    navigate(`/products?${params.toString()}`);
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    const newFilters = { 
      ...filters, 
      category: category === 'all' ? undefined : category,
      page: 1
    };
    setFilters(newFilters);
    
    // Update URL
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (category !== 'all') params.set('category', category);
    
    navigate(`/products?${params.toString()}`);
  };
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split('-');
    setFilters({ 
      ...filters, 
      sortBy: sortBy as 'price' | 'createdAt' | 'name' | 'rating' | 'discountPrice' | 'stock', 
      sortDirection: sortOrder as 'asc' | 'desc' 
    });
  };
  
  const handleViewProduct = (productId: number) => {
    navigate(`/products/${productId}`);
  };
  
  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
    
    // Update URL
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (filters.category) params.set('category', filters.category);
    params.set('page', newPage.toString());
    
    navigate(`/products?${params.toString()}`);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Process categories for the dropdown
  const categoryOptions = [
    { id: 'all', name: t('all_categories'), slug: 'all' },
    ...categories.map(category => ({
      ...category,
      slug: category.name // Use name as slug to match with URL parameter
    }))
  ];
  
  // Calculate discount percentage
  const calculateDiscount = (price: number | string, discountPrice: number | string) => {
    if (!discountPrice) return null;
    const priceNum = Number(price);
    const discountPriceNum = Number(discountPrice);
    if (isNaN(priceNum) || isNaN(discountPriceNum)) return null;
    const discount = Math.round(((priceNum - discountPriceNum) / priceNum) * 100);
    return discount > 0 ? discount : null;
  };
  
  // Render star rating (mock implementation)
  const renderStars = (rating: number = 4.5) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div>
        {[...Array(fullStars)].map((_, i) => (
          <FaIcons.FaStar key={`full-${i}`} />
        ))}
        {halfStar && <FaIcons.FaStarHalfAlt />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaIcons.FaRegStar key={`empty-${i}`} />
        ))}
      </div>
    );
  };
  
  const isLoading = isLoadingProducts || isLoadingCategories;
  
  // Calculate total pages
  const totalPages = productsData?.totalPages || 1;
  
  return (
    <UserLayout>
      <PageContainer>
        <PageHeader>
          <PageTitle>{t('all_our_products')}</PageTitle>
          <PageDescription>
            {t('discover_products')}
          </PageDescription>
        </PageHeader>
        
        <FiltersContainer>
          <FilterGroup>
            <CategorySelect 
              value={filters.category || 'all'} 
              onChange={handleCategoryChange}
            >
              {categoryOptions.map(category => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </CategorySelect>
            
            <SortSelect 
              value={`${filters.sortBy || 'created_at'}-${filters.sortDirection || 'desc'}`}
              onChange={handleSortChange}
            >
              <option value="created_at-desc">{t('sort_newest')}</option>
              <option value="price-asc">{t('sort_price_asc')}</option>
              <option value="price-desc">{t('sort_price_desc')}</option>
              <option value="name-asc">{t('sort_name_asc')}</option>
              <option value="name-desc">{t('sort_name_desc')}</option>
            </SortSelect>
          </FilterGroup>
          
          <SearchContainer>
            <form onSubmit={handleSearch}>
              <SearchIcon>
                <FaIcons.FaSearch />
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder={t('search_product')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </SearchContainer>
        </FiltersContainer>
        
        {isLoading ? (
          <LoadingContainer>
            <Spinner />
            <LoadingText>{t('loading')}</LoadingText>
          </LoadingContainer>
        ) : products.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>
              <FaIcons.FaBoxOpen />
            </EmptyStateIcon>
            <EmptyStateTitle>{t('no_products_found')}</EmptyStateTitle>
            <EmptyStateText>
              {t('try_filters')}
            </EmptyStateText>
            <EmptyStateButton to="/">{t('home')}</EmptyStateButton>
          </EmptyState>
        ) : (
          <>
            <ProductsGrid>
              {products.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  isNew={index === 0 && filters.page === 1}
                  isSale={product.discountPrice && calculateDiscount(product.price, product.discountPrice) >= 20}
                />
              ))}
            </ProductsGrid>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <PaginationContainer>
                <PaginationButton 
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                >
                  <FaIcons.FaChevronLeft />
                </PaginationButton>
                
                {/* Generate pagination buttons - limited to max 5 visible for simplicity */}
                {Array.from({ length: Math.min(5, totalPages) })
                  .map((_, idx) => {
                    let pageNumber = idx + 1;
                    
                    // Handle case when current page is toward the end
                    if (filters.page > 3 && totalPages > 5) {
                      pageNumber = filters.page + idx - 2;
                      
                      // Adjust to show last 5 pages when at end
                      if (pageNumber > totalPages) {
                        pageNumber = totalPages - (4 - idx);
                      }
                      
                      // Make sure we don't go below page 1
                      pageNumber = Math.max(1, pageNumber);
                    }
                    
                    return (
                      <PaginationButton 
                        key={pageNumber}
                        active={pageNumber === filters.page}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </PaginationButton>
                    );
                  })}
                
                <PaginationButton 
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === totalPages}
                >
                  <FaIcons.FaChevronRight />
                </PaginationButton>
              </PaginationContainer>
            )}
          </>
        )}
      </PageContainer>
    </UserLayout>
  );
};

export default ProductsPage; 