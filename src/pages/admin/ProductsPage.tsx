import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaExclamationCircle,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  useProductsList,
  useDeleteProduct
} from '../../features/products/hooks/use-products-query';
import { useCategories } from '../../features/products/hooks/use-categories-query';
import { ProductData, ProductFilters } from '../../features/products/services/types';
import ProductModal from './components/ProductModal';
import ConfirmationModal from './components/ConfirmationModal';
import { FaIcons } from './components/Icons';
import axiosClient from '../../apis/axios-client';
import { toast } from 'react-toastify';

// Placeholder image data URL
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2250%22%20height%3D%2250%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2050%2050%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_img%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_img%22%3E%3Crect%20width%3D%2250%22%20height%3D%2250%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2213%22%20y%3D%2230%22%3EImg%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';

// Styles
const PageContainer = styled.div`
  padding: 1.5rem;
`;

const PageHeader = styled.div`
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

const PageTitle = styled.h1`
  color: var(--primary-color);
  margin: 0;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const AddCategoryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background-color: var(--accent-color);
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--accent-color);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background-color: var(--primary-color);
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 1rem;
  background-color: var(--card-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const CategorySelect = styled.select`
  padding: 0.6rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--card-bg);
  color: var(--text-color);
  width: 200px;
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const StatCard = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 1.5rem;
  min-width: 200px;
  flex: 1;
`;

const StatTitle = styled.div`
  color: var(--light-text);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  color: var(--text-color);
  font-size: 1.5rem;
  font-weight: bold;
`;

const StatFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

const TableContainer = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  
  [data-theme="dark"] & {
    border: 1px solid var(--border-color);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
`;

const TableHead = styled.thead`
  background-color: var(--light-bg);
  border-bottom: 2px solid var(--border-color);
  
  th {
    color: var(--text-color);
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.85rem;
    padding: 1rem;
  }
`;

const TableRow = styled.tr`
  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }
  
  &:hover {
    background-color: var(--light-bg);
  }
  
  /* Alternate row coloring for better readability in dark mode */
  [data-theme="dark"] &:nth-child(even) {
    background-color: rgba(255, 255, 255, 0.03);
  }
`;

const TableHeaderCell = styled.th<{ $sortable?: boolean }>`
  padding: 1rem;
  text-align: left;
  font-weight: bold;
  color: var(--text-color);
  cursor: ${({ $sortable }) => $sortable ? 'pointer' : 'default'};
  
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    ${({ $sortable }) => $sortable && `
      color: var(--accent-color);
    `}
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  vertical-align: middle;
  color: var(--text-color);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const EditButton = styled(ActionButton)`
  background-color: var(--info-color);
  color: white;
  
  &:hover {
    background-color: var(--primary-color);
  }
`;

const DeleteButton = styled(ActionButton)`
  background-color: var(--error-color);
  color: white;
  
  &:hover {
    background-color: var(--error-color-dark);
  }
`;

const ImagePreview = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: var(--border-radius);
`;

const ProductName = styled.div`
  font-weight: 500;
  color: var(--text-color);
`;

const ProductDescription = styled.div`
  color: var(--light-text);
  font-size: 0.9rem;
  margin-top: 0.3rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Price = styled.div`
  font-weight: 500;
  color: var(--text-color);
  display: flex;
  flex-direction: column;
`;

const DiscountPrice = styled.div`
  color: var(--secondary-color);
  font-weight: bold;
`;

const OriginalPrice = styled.div`
  text-decoration: line-through;
  color: var(--light-text);
  font-size: 0.9rem;
`;

const StockIndicator = styled.div<{ $inStock: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ $inStock }) => $inStock ? 'var(--success-color)' : 'var(--error-color)'};
  
  /* Brighter colors for dark mode */
  [data-theme="dark"] & {
    color: ${({ $inStock }) => $inStock ? '#4CAF50' : '#FF5252'};
  }
`;

const Category = styled.div`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background-color: var(--light-bg);
  border-radius: 1rem;
  color: var(--text-color);
  font-size: 0.9rem;
  
  /* Add subtle border in dark mode */
  [data-theme="dark"] & {
    border: 1px solid var(--border-color);
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem;
  color: var(--light-text);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  color: var(--light-text);
`;

const EmptyStateText = styled.p`
  color: var(--light-text);
  margin-bottom: 1.5rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const PageButton = styled.button<{ $active?: boolean; $disabled?: boolean }>`
  padding: 0.5rem 0.8rem;
  border: 1px solid ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--border-color)'};
  background-color: ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--card-bg)'};
  color: ${({ $active }) => $active ? 'white' : 'var(--text-color)'};
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  border-radius: var(--border-radius);
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};
  
  &:hover {
    background-color: ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--light-bg)'};
  }
`;

// Types
type SortDirection = 'asc' | 'desc';
type ProductSortField = "name" | "price" | "createdAt" | "rating" | "stock";

const ProductsPage = () => {
  const navigate = useNavigate();
  
  // State for filters
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 10
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sortField, setSortField] = useState<ProductSortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  
  // Add missing state variables
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Fetch products with filters
  const { 
    data: productsData, 
    isLoading: isLoadingProducts,
    refetch: refetchProducts
  } = useProductsList(filters);
  
  // Fetch categories for the dropdown
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();
  const categories = categoriesData?.data || [];
  
  // Log categories for debugging
  useEffect(() => {
    console.log('Categories response in ProductsPage:', categoriesData);
    console.log('Categories in ProductsPage:', categories);
  }, [categoriesData, categories]);
  
  // Delete product mutation
  const deleteProduct = useDeleteProduct();
  
  // Apply search and category filters
  useEffect(() => {
    const newFilters: ProductFilters = { ...filters };
    
    if (searchQuery) {
      newFilters.search = searchQuery;
    } else {
      delete newFilters.search;
    }
    
    if (selectedCategory) {
      newFilters.category = selectedCategory;
    } else {
      delete newFilters.category;
    }
    
    newFilters.sortBy = sortField;
    newFilters.sortDirection = sortDirection;
    
    setFilters(newFilters);
  }, [searchQuery, selectedCategory, sortField, sortDirection]);
  
  // Update page in filters when currentPage changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      page: currentPage
    }));
  }, [currentPage]);
  
  // Données des produits
  const products: ProductData[] = productsData?.items || [];
  const totalPages = productsData?.totalPages || 1;
  
  // Calculer les statistiques des produits
  const totalProducts = productsData?.total || 0;
  const lowStockProducts = products.filter(p => p.stock <= 5).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  
  // Gérer le changement de direction de tri
  const handleSort = (field: ProductSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Afficher l'icône de tri appropriée
  const renderSortIcon = (field: ProductSortField) => {
    if (sortField !== field) return <FaIcons.FaSort />;
    return sortDirection === 'asc' ? <FaIcons.FaSortUp /> : <FaIcons.FaSortDown />;
  };
  
  // Ouvrir le modal d'édition avec le produit sélectionné
  const handleEditProduct = (product: ProductData) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };
  
  // Ouvrir le modal d'ajout de produit
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };
  
  // Ouvrir le modal de confirmation de suppression
  const handleDeleteClick = (productId: number) => {
    setProductToDelete(productId);
    setIsDeleteModalOpen(true);
  };
  
  // Confirmer et supprimer un produit
  const confirmDeleteProduct = () => {
    if (productToDelete) {
      setIsDeleting(true);
      deleteProduct.mutate(productToDelete, {
        onSuccess: () => {
          console.log('Produit supprimé avec succès');
          setIsDeleteModalOpen(false);
          setIsDeleting(false);
          // Si on est sur la dernière page et qu'il n'y a qu'un seul produit, on revient à la page précédente
          if (currentPage > 1 && products.length === 1) {
            setCurrentPage(prev => prev - 1);
          } else {
            refetchProducts();
          }
        },
        onError: () => {
          console.error('Erreur lors de la suppression du produit');
          setIsDeleteModalOpen(false);
          setIsDeleting(false);
        }
      });
    }
  };
  
  // Formatter le prix avec et sans remise
  const formatPrice = (product: ProductData) => {
    try {
      // Ensure prices are treated as numbers and handle edge cases
      const price = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price || 0);
      
      if (product.discountPrice) {
        const discountPrice = typeof product.discountPrice === 'string' ? 
          parseFloat(product.discountPrice) : Number(product.discountPrice || 0);
        
        return (
          <Price>
            <DiscountPrice>{discountPrice.toFixed(3)} DT</DiscountPrice>
            <OriginalPrice>{price.toFixed(3)} DT</OriginalPrice>
          </Price>
        );
      }
      
      return <Price>{price.toFixed(3)} DT</Price>;
    } catch (error) {
      console.error("Error formatting price:", error);
      return <Price>Prix indisponible</Price>;
    }
  };
  
  // Add this handler for the add category button
  const handleAddCategory = () => {
    navigate('/admin/categories/add');
  };
  
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle category selection
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };
  
  return (
    <AdminLayout title="Gestion des Produits">
      <PageContainer>
        <PageHeader>
          <PageTitle>Gestion des Produits</PageTitle>
          <ButtonsContainer>
            <AddCategoryButton onClick={handleAddCategory}>
              <FaIcons.FaStore />
              Ajouter une catégorie
            </AddCategoryButton>
            <AddButton onClick={handleAddProduct}>
              <FaIcons.FaPlus />
              Ajouter un produit
            </AddButton>
          </ButtonsContainer>
        </PageHeader>
        
        <StatsContainer>
          <StatCard>
            <StatTitle>Total des produits</StatTitle>
            <StatValue>{totalProducts}</StatValue>
          </StatCard>
          <StatCard>
            <StatTitle>Stock faible</StatTitle>
            <StatValue>{lowStockProducts}</StatValue>
            <StatFooter>
              <FaIcons.FaExclamationCircle style={{ color: "#ff9800" }} /> {lowStockProducts} produits ont un stock ≤ 5
            </StatFooter>
          </StatCard>
          <StatCard>
            <StatTitle>Rupture de stock</StatTitle>
            <StatValue>{outOfStockProducts}</StatValue>
            <StatFooter>
              <FaIcons.FaTimesCircle style={{ color: "#e94560" }} /> {outOfStockProducts} produits en rupture
            </StatFooter>
          </StatCard>
        </StatsContainer>
        
        <FiltersContainer>
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <FaIcons.FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--light-text)' }} />
          <SearchInput 
              type="text" 
            placeholder="Rechercher un produit..." 
            value={searchQuery}
              onChange={handleSearchChange}
          />
          </div>
          <CategorySelect 
            value={selectedCategory} 
            onChange={handleCategoryChange}
          >
            <option value="">Toutes les catégories</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </CategorySelect>
        </FiltersContainer>
        
        {isLoadingProducts ? (
          <LoadingSpinner>Chargement des produits...</LoadingSpinner>
        ) : products.length === 0 ? (
          <EmptyState>
            <EmptyStateText>
              {searchQuery || selectedCategory ? 
                'Aucun produit ne correspond à votre recherche.' :
                'Aucun produit trouvé. Ajoutez votre premier produit !'}
            </EmptyStateText>
            <AddButton onClick={handleAddProduct}>
              <FaIcons.FaPlus />
              Ajouter un produit
            </AddButton>
          </EmptyState>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <tr>
                    <th>Image</th>
                    <th>Nom</th>
                    <th>Prix</th>
                    <th>Stock</th>
                    <th>Catégorie</th>
                    <th>Actions</th>
                  </tr>
                </TableHead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <ImagePreview 
                          src={product.images[0] || PLACEHOLDER_IMAGE} 
                          alt={product.name} 
                        />
                      </td>
                      <td>
                        <ProductName>{product.name}</ProductName>
                        <ProductDescription>{product.description}</ProductDescription>
                      </td>
                      <td>{formatPrice(product)}</td>
                      <td>
                        <StockIndicator $inStock={product.stock > 0}>
                          {product.stock > 0 ? 
                            <FaCheckCircle /> : 
                            <FaExclamationCircle />}
                          {product.stock} {product.stock > 1 ? 'unités' : 'unité'}
                        </StockIndicator>
                      </td>
                      <td>
                        <Category>{product.category}</Category>
                      </td>
                      <td>
                        <ActionButtons>
                          <EditButton onClick={() => handleEditProduct(product)}>
                            <FaIcons.FaEdit />
                          </EditButton>
                          <DeleteButton onClick={() => handleDeleteClick(product.id)}>
                            <FaIcons.FaTrash />
                          </DeleteButton>
                        </ActionButtons>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableContainer>
            
            <Pagination>
              <PageButton 
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                $disabled={currentPage === 1}
              >
                Précédent
              </PageButton>
              
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                // Logique pour afficher jusqu'à 5 boutons de page centrés sur la page actuelle
                let pageNumber;
                
                if (totalPages <= 5) {
                  // Si il y a 5 pages ou moins, afficher toutes les pages
                  pageNumber = i + 1;
                } else {
                  // Sinon, afficher les pages centrées sur la page actuelle
                  let start = Math.max(1, currentPage - 2);
                  let end = Math.min(totalPages, start + 4);
                  
                  // Si on est proche de la fin, ajuster le début
                  if (end === totalPages) {
                    start = Math.max(1, totalPages - 4);
                  }
                  
                  pageNumber = start + i;
                }
                
                return (
                  <PageButton 
                    key={pageNumber}
                    $active={currentPage === pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </PageButton>
                );
              })}
              
              <PageButton 
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                $disabled={currentPage === totalPages}
              >
                Suivant
              </PageButton>
            </Pagination>
          </>
        )}
        
        {/* Modals */}
        <ProductModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          product={selectedProduct || undefined}
        />
        
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDeleteProduct}
          title="Supprimer le produit ?"
          message="Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible."
          confirmLabel="Supprimer"
          cancelLabel="Annuler"
          isLoading={isDeleting}
          type="danger"
        />
      </PageContainer>
    </AdminLayout>
  );
};

export default ProductsPage; 