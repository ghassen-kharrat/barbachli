import { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import { ProductData } from '../../../features/products/services/types';
import ProductForm from './ProductForm';
import { ProductDataMutation } from '../../../features/products/services/types';
import { useCreateProduct, useUpdateProduct } from '../../../features/products/hooks/use-products-query';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductData;
}

// Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--box-shadow);
  padding: 2rem;
  position: relative;
  
  /* Add border in dark mode for better visibility */
  [data-theme="dark"] & {
    border: 1px solid var(--border-color);
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: var(--text-color);
  font-size: 1.5rem;
  
  /* Enhanced for dark mode */
  [data-theme="dark"] & {
    color: white;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--light-text);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    color: var(--text-color);
    background-color: var(--light-bg);
  }
  
  /* Enhanced for dark mode */
  [data-theme="dark"] & {
    color: var(--light-text);
    
    &:hover {
      color: white;
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
`;

const ProductModal = ({ isOpen, onClose, product }: ProductModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  
  // Fermer le modal lorsque la soumission est réussie
  useEffect(() => {
    const isCreating = createProduct.isPending !== undefined ? createProduct.isPending : false;
    const isUpdating = updateProduct.isPending !== undefined ? updateProduct.isPending : false;
    
    if (!isCreating && !isUpdating && isSubmitting) {
      setIsSubmitting(false);
      onClose();
    }
  }, [createProduct, updateProduct, isSubmitting, onClose]);
  
  // Gestionnaire de soumission de formulaire
  const handleSubmit = (data: ProductDataMutation) => {
    setIsSubmitting(true);
    
    if (product) {
      // Mettre à jour un produit existant
      updateProduct.mutate({
        id: product.id,
        ...data
      });
    } else {
      // Créer un nouveau produit
      createProduct.mutate(data);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {product ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        <ProductForm
          product={product}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </ModalContent>
    </ModalOverlay>
  );
};

export default ProductModal; 