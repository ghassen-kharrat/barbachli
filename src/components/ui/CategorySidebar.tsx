import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import axios from 'axios';
import { useLanguage } from '../../provider/LanguageProvider';

// Types
interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  subcategories: Category[];
}

// Simple SVG icons as components
const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
  </svg>
);

const ChevronUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
  </svg>
);

// Styled Components
const SidebarContainer = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  margin-bottom: 1.5rem;
  height: fit-content;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--card-bg);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--text-muted);
  }
`;

const SidebarHeader = styled.div`
  background-color: var(--primary-color);
  color: white;
  padding: 0.75rem 1rem;
  font-weight: 600;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CategoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const CategoryItem = styled.li`
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
`;

const CategoryLink = styled.div<{ $isActive?: boolean; $rtl?: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  transition: background-color 0.2s;
  justify-content: space-between;
  cursor: pointer;
  
  ${props => props.$rtl && `
    flex-direction: row-reverse;
    text-align: right;
  `}
  
  &:hover {
    background-color: var(--hover-bg);
  }
  
  ${props => props.$isActive && `
    background-color: var(--hover-bg);
    font-weight: 600;
  `}
`;

const IconWrapper = styled.span<{ $rtl?: boolean }>`
  margin-right: ${props => props.$rtl ? '0' : '0.75rem'};
  margin-left: ${props => props.$rtl ? '0.75rem' : '0'};
  display: flex;
  align-items: center;
  color: var(--primary-color);
`;

const CategoryName = styled.span`
  flex: 1;
`;

const ExpandIcon = styled.span`
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
`;

const SubcategoryList = styled.ul<{ $isOpen: boolean }>`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: ${props => (props.$isOpen ? '1000px' : '0')};
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
  background-color: var(--subcategory-bg, rgba(0, 0, 0, 0.03));
`;

const SubcategoryItem = styled.li`
  border-top: 1px solid var(--border-color);
`;

const SubcategoryLink = styled.div<{ $isActive?: boolean; $rtl?: boolean }>`
  display: block;
  padding: ${props => props.$rtl ? '0.6rem 2.5rem 0.6rem 1rem' : '0.6rem 1rem 0.6rem 2.5rem'};
  color: var(--text-color);
  text-decoration: none;
  transition: background-color 0.2s;
  font-size: 0.95rem;
  cursor: pointer;
  text-align: ${props => props.$rtl ? 'right' : 'left'};
  
  &:hover {
    background-color: var(--hover-bg);
  }
  
  ${props => props.$isActive && `
    background-color: var(--hover-bg);
    font-weight: 600;
  `}
`;

const LoadingState = styled.div`
  padding: 1.5rem;
  text-align: center;
  color: var(--text-muted);
`;

const ErrorState = styled.div`
  padding: 1.5rem;
  text-align: center;
  color: var(--danger-color);
`;

// Helper function to map category names to translation keys
const getCategoryTranslationKey = (name: string): string => {
  const categoryMap: Record<string, string> = {
    // Main categories
    'Téléphone & Tablette': 'category_phones_tablets',
    'TV & High Tech': 'category_tv_tech',
    'Informatique': 'category_computers',
    'Maison, cuisine & bureau': 'category_home_kitchen',
    'Électroménager': 'category_appliances',
    'Vêtements & Chaussures': 'category_clothing',
    'Beauté & Santé': 'category_health_beauty',
    'Jeux vidéos & Consoles': 'category_gaming',
    'Bricolage': 'category_diy',
    'Sports & Loisirs': 'category_sports',
    'Bébé & Jouets': 'category_baby',
    
    // Subcategories for Téléphone & Tablette
    'Smartphones': 'subcategory_smartphones',
    'Tablettes': 'subcategory_tablets',
    'Accessoires téléphones': 'subcategory_phone_accessories',
    
    // Subcategories for Informatique
    'Ordinateurs portables': 'subcategory_laptops',
    'Ordinateurs de bureau': 'subcategory_desktops',
    'Périphériques': 'subcategory_peripherals',
    'Stockage': 'subcategory_storage',
  };
  
  return categoryMap[name] || '';
};

const CategorySidebar: React.FC = () => {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
        const response = await axios.get(`${API_URL}/categories`);
        if (response.data) {
          const categoriesData = response.data.success ? response.data.data : response.data;
          setCategories(categoriesData);
        } else {
          setError(t('categories_load_error'));
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(t('categories_load_error'));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [t]);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleCategoryClick = (category: Category) => {
    if (category.subcategories && category.subcategories.length > 0) {
      toggleCategory(category.id);
    } else {
      navigate(`/products?category=${encodeURIComponent(category.name)}`);
    }
  };

  const handleSubcategoryClick = (subcategory: Category) => {
    navigate(`/products?category=${encodeURIComponent(subcategory.name)}`);
  };

  const getCategoryDisplayName = (category: Category): string => {
    const translationKey = getCategoryTranslationKey(category.name);
    if (translationKey && t(translationKey) !== translationKey) {
      return t(translationKey);
    }
    return category.name;
  };

  if (loading) {
    return (
      <SidebarContainer>
        <SidebarHeader>
          <ListIcon /> {t('categories')}
        </SidebarHeader>
        <LoadingState>{t('loading_categories')}</LoadingState>
      </SidebarContainer>
    );
  }

  if (error) {
    return (
      <SidebarContainer>
        <SidebarHeader>
          <ListIcon /> {t('categories')}
        </SidebarHeader>
        <ErrorState>{error}</ErrorState>
      </SidebarContainer>
    );
  }

  if (categories.length === 0) {
    return (
      <SidebarContainer>
        <SidebarHeader>
          <ListIcon /> {t('categories')}
        </SidebarHeader>
        <LoadingState>{t('no_categories_found')}</LoadingState>
      </SidebarContainer>
    );
  }

  return (
    <SidebarContainer>
      <SidebarHeader>
        <ListIcon /> {t('categories')}
      </SidebarHeader>
      <CategoryList>
        {categories.map(category => (
          <CategoryItem key={category.id}>
            <CategoryLink 
              onClick={() => handleCategoryClick(category)}
              $isActive={false}
              $rtl={language === 'ar'}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                flexDirection: language === 'ar' ? 'row-reverse' : 'row' 
              }}>
                <IconWrapper $rtl={language === 'ar'}>
                  <ListIcon />
                </IconWrapper>
                <CategoryName>{getCategoryDisplayName(category)}</CategoryName>
              </div>
              {category.subcategories && category.subcategories.length > 0 && (
                <ExpandIcon>
                  {expandedCategories[category.id] ? (
                    <ChevronUpIcon />
                  ) : (
                    <ChevronDownIcon />
                  )}
                </ExpandIcon>
              )}
            </CategoryLink>
            
            {category.subcategories && category.subcategories.length > 0 && (
              <SubcategoryList $isOpen={!!expandedCategories[category.id]}>
                {category.subcategories.map(subcategory => (
                  <SubcategoryItem key={subcategory.id}>
                    <SubcategoryLink
                      onClick={() => handleSubcategoryClick(subcategory)}
                      $isActive={false}
                      $rtl={language === 'ar'}
                    >
                      {getCategoryDisplayName(subcategory)}
                    </SubcategoryLink>
                  </SubcategoryItem>
                ))}
              </SubcategoryList>
            )}
          </CategoryItem>
        ))}
      </CategoryList>
    </SidebarContainer>
  );
};

export default CategorySidebar; 