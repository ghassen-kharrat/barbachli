import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import axios from 'axios';
import { BiCategory } from 'react-icons/bi';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { useLanguage } from '../../provider/LanguageProvider';
import { FaIcons } from '../../pages/admin/components/Icons';

// Create proper React component wrappers for icons
const BiIcons = {
  BiCategory: () => <BiCategory />
};

// Additional icon wrappers for direct use in this component
const ChevronIcons = {
  FaChevronUp: ({ size }: { size?: number }) => <FaChevronUp size={size} />,
  FaChevronDown: ({ size }: { size?: number }) => <FaChevronDown size={size} />
};

// Types
interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  subcategories: Category[];
}

// Styled Components
const SidebarContainer = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  margin-bottom: 1.5rem;
  height: fit-content;
  max-height: calc(100vh - 100px); /* Limit height to viewport minus some space for header */
  overflow-y: auto;
  
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  /* Track */
  &::-webkit-scrollbar-track {
    background: var(--card-bg);
  }
  
  /* Handle */
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }
  
  /* Handle on hover */
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

const CategoryIcon = styled.span<{ $rtl?: boolean }>`
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

// Dynamic icon component
const DynamicIcon = ({ iconName }: { iconName: string | null }) => {
  if (!iconName) return <BiCategory />;

  // Check if icon exists in FaIcons
  const IconComponent = (FaIcons as any)[iconName] || BiCategory;
  return <IconComponent />;
};

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
    
    // Add more subcategories as needed
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
        const response = await axios.get('http://localhost:5001/api/categories');
        if (response.data && response.data.success) {
          setCategories(response.data.data);
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
      // Store original category name for navigation even when displaying translated names
      navigate(`/products?category=${encodeURIComponent(category.name)}`);
    }
  };

  const handleSubcategoryClick = (subcategory: Category) => {
    // Store original subcategory name for navigation even when displaying translated names
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
          <BiCategory /> {t('categories')}
        </SidebarHeader>
        <LoadingState>{t('loading_categories')}</LoadingState>
      </SidebarContainer>
    );
  }

  if (error) {
    return (
      <SidebarContainer>
        <SidebarHeader>
          <BiCategory /> {t('categories')}
        </SidebarHeader>
        <ErrorState>{error}</ErrorState>
      </SidebarContainer>
    );
  }

  if (categories.length === 0) {
    return (
      <SidebarContainer>
        <SidebarHeader>
          <BiCategory /> {t('categories')}
        </SidebarHeader>
        <LoadingState>{t('no_categories_found')}</LoadingState>
      </SidebarContainer>
    );
  }

  return (
    <SidebarContainer>
      <SidebarHeader>
        <BiCategory /> {t('categories')}
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
                <CategoryIcon $rtl={language === 'ar'}>
                  <BiCategory />
                </CategoryIcon>
                <CategoryName>{getCategoryDisplayName(category)}</CategoryName>
              </div>
              {category.subcategories && category.subcategories.length > 0 && (
                <ExpandIcon>
                  {expandedCategories[category.id] ? (
                    <ChevronIcons.FaChevronUp size={12} />
                  ) : (
                    <ChevronIcons.FaChevronDown size={12} />
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