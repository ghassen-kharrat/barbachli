import { useState, useEffect, useMemo } from 'react';
import { styled } from 'styled-components';
import { ProductData, ProductDataMutation } from '../../../features/products/services/types';
import { FaIcons } from './Icons';
import { useCategories } from '../../../features/products/hooks/use-categories-query';
import axios from 'axios';
import React from 'react';
import { IconBaseProps } from 'react-icons';

interface ProductFormProps {
  product?: ProductData;
  onSubmit: (data: ProductDataMutation) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

// Placeholder image data URL
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_img%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_img%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2275%22%20y%3D%22105%22%3EImage%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';

// Styles
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: bold;
  color: var(--text-color);
  
  /* Improve visibility in dark mode */
  [data-theme="dark"] & {
    color: var(--light-text);
  }
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 1rem;
  background-color: var(--card-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }
  
  /* Enhanced styling for dark mode */
  [data-theme="dark"] & {
    border-color: var(--border-color);
    
    &:focus {
      border-color: var(--secondary-color);
      box-shadow: 0 0 0 1px var(--secondary-color);
    }
  }
`;

const Textarea = styled.textarea`
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  background-color: var(--card-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }
  
  /* Enhanced styling for dark mode */
  [data-theme="dark"] & {
    border-color: var(--border-color);
    
    &:focus {
      border-color: var(--secondary-color);
      box-shadow: 0 0 0 1px var(--secondary-color);
    }
  }
`;

const Select = styled.select`
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 1rem;
  background-color: var(--card-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }
  
  /* Enhanced styling for dark mode */
  [data-theme="dark"] & {
    border-color: var(--border-color);
    
    option {
      background-color: var(--card-bg);
      color: var(--text-color);
    }
    
    &:focus {
      border-color: var(--secondary-color);
      box-shadow: 0 0 0 1px var(--secondary-color);
    }
  }
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  font-size: 0.8rem;
  margin-top: 0.3rem;
`;

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ImagePreviewContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
`;

const ImagePreviewWrapper = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  overflow: hidden;
  background-color: var(--light-bg);
  
  /* Enhanced for dark mode */
  [data-theme="dark"] & {
    border-color: var(--border-color);
  }
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 0.3rem;
  right: 0.3rem;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(233, 69, 96, 0.8);
  }
`;

const ImagePlaceholder = styled.div`
  width: 150px;
  height: 150px;
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--light-text);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
  }
  
  /* Enhanced for dark mode */
  [data-theme="dark"] & {
    border-color: var(--border-color);
    
    &:hover {
      border-color: var(--secondary-color);
      color: var(--secondary-color);
    }
  }
`;

const FileInput = styled.input`
  display: none;
`;

const UploadIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`;

const ButtonsGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background-color: var(--card-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  
  &:hover:not(:disabled) {
    background-color: var(--light-bg);
  }
  
  /* Enhanced for dark mode */
  [data-theme="dark"] & {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: var(--border-color);
    color: var(--light-text);
    
    &:hover:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.15);
    }
  }
`;

const SubmitButton = styled(Button)`
  background-color: var(--accent-color);
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: var(--primary-color);
  }
  
  /* Enhanced for dark mode */
  [data-theme="dark"] & {
    background-color: var(--secondary-color);
    
    &:hover:not(:disabled) {
      background-color: var(--primary-color);
    }
  }
`;

// Define a proper type for the errors object
interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  discountPrice?: string;
  category?: string;
  stock?: string;
  images?: string;
  [key: string]: string | undefined;
}

const ProductForm = ({ product, onSubmit, onCancel, isSubmitting }: ProductFormProps) => {
  // Fetch categories from backend with hierarchical=false to get all categories flat
  const { data: categoriesResponse, isLoading: isLoadingCategories } = useCategories(false);
  const allCategories = categoriesResponse?.data || [];
  
  // Create a map of parent IDs to parent names for easier lookup
  const parentCategoryMap = useMemo(() => {
    const map: Record<number, string> = {};
    allCategories.forEach(cat => {
      if (!cat.parentId) {
        map[cat.id] = cat.name;
      }
    });
    return map;
  }, [allCategories]);
  
  // Log categories for debugging
  useEffect(() => {
    console.log('All categories (flat):', allCategories);
    console.log('Parent category map:', parentCategoryMap);
  }, [allCategories, parentCategoryMap]);

  // État du formulaire
  const [formData, setFormData] = useState<ProductDataMutation>({
    name: product?.name || '',
    description: product?.description || '',
    price: typeof product?.price === 'string' ? parseFloat(product.price) || 0 : product?.price || 0,
    discountPrice: product?.discountPrice ? (typeof product.discountPrice === 'string' ? parseFloat(product.discountPrice) || null : product.discountPrice) : null,
    stock: product?.stock || 0,
    category: product?.category || '',
    images: product?.images || []
  });
  
  // État pour les erreurs de validation
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Gestionnaire pour les changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price' || name === 'stock') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else if (name === 'discountPrice') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? parseFloat(value) : null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Fonction pour ajouter des images
  const addImage = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, imageUrl]
    }));
  };
  
  // Fonction pour supprimer une image
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  
  // Fonction pour convertir un fichier en Data URL
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  // Gestionnaire pour l'upload d'image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    
    // For demo purposes, we'll use file URLs directly
    // In a real application, you would upload these to a server
    const newImages = files.map(file => {
      // Use explicit type assertion for File object to Blob
      const blob: Blob = file as any;
      return URL.createObjectURL(blob);
    });
    
    setFormData({
      ...formData,
      images: [...formData.images, ...newImages]
    });
  };
  
  // Fonction de validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const isEditMode = !!product;
    
    if (!formData.name) {
      newErrors.name = 'Le nom du produit est obligatoire';
    }
    
    if (!formData.description) {
      newErrors.description = 'La description est obligatoire';
    }
    
    if (!formData.price) {
      newErrors.price = 'Le prix est obligatoire';
    } else if (isNaN(parseFloat(String(formData.price))) || parseFloat(String(formData.price)) <= 0) {
      newErrors.price = 'Le prix doit être un nombre supérieur à 0';
    }
    
    if (formData.discountPrice && (isNaN(parseFloat(String(formData.discountPrice))) || parseFloat(String(formData.discountPrice)) <= 0)) {
      newErrors.discountPrice = 'Le prix réduit doit être un nombre supérieur à 0';
    }
    
    if (!formData.category) {
      newErrors.category = 'La catégorie est obligatoire';
    }
    
    if (!formData.stock) {
      newErrors.stock = 'Le stock est obligatoire';
    } else if (isNaN(parseInt(String(formData.stock))) || parseInt(String(formData.stock)) < 0) {
      newErrors.stock = 'Le stock doit être un nombre entier positif';
    }
    
    if (!isEditMode && formData.images.length === 0) {
      newErrors.images = 'Au moins une image est requise';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Gestionnaire de soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label htmlFor="name">Nom du produit</Label>
        <Input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Entrez le nom du produit"
        />
        {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Entrez la description du produit"
        />
        {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
      </FormGroup>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <FormGroup style={{ flex: 1 }}>
          <Label htmlFor="price">Prix (DT)</Label>
          <Input
            type="number"
            id="price"
            name="price"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
          />
          {errors.price && <ErrorMessage>{errors.price}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup style={{ flex: 1 }}>
          <Label htmlFor="discountPrice">Prix réduit (DT) (optionnel)</Label>
          <Input
            type="number"
            id="discountPrice"
            name="discountPrice"
            min="0"
            step="0.01"
            value={formData.discountPrice === null ? '' : formData.discountPrice}
            onChange={handleChange}
            placeholder="0.00"
          />
        </FormGroup>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <FormGroup style={{ flex: 1 }}>
          <Label htmlFor="stock">Stock</Label>
          <Input
            type="number"
            id="stock"
            name="stock"
            min="0"
            value={formData.stock}
            onChange={handleChange}
            placeholder="0"
          />
          {errors.stock && <ErrorMessage>{errors.stock}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup style={{ flex: 1 }}>
          <Label htmlFor="category">Catégorie</Label>
          <Select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={isLoadingCategories}
          >
            <option value="">Sélectionnez une catégorie</option>
            {/* Main categories first */}
            <optgroup label="Catégories principales">
              {allCategories
                .filter(cat => !cat.parentId)
                .map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))
              }
            </optgroup>
            
            {/* Then subcategories */}
            <optgroup label="Sous-catégories">
              {allCategories
                .filter(cat => cat.parentId)
                .map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name} ({parentCategoryMap[cat.parentId] || 'Sous-catégorie'})
                  </option>
                ))
              }
            </optgroup>
          </Select>
          {errors.category && <ErrorMessage>{errors.category}</ErrorMessage>}
          {isLoadingCategories && <div>Chargement des catégories...</div>}
        </FormGroup>
      </div>
      
      <ImageSection>
        <Label>Images du produit</Label>
        <ImagePreviewContainer>
          {formData.images.map((image, index) => (
            <ImagePreviewWrapper key={index}>
              <ImagePreview src={image} alt={`Product ${index}`} />
              <RemoveImageButton onClick={() => removeImage(index)}>
                <FaIcons.FaTimes size={12} />
              </RemoveImageButton>
            </ImagePreviewWrapper>
          ))}
          
          <label htmlFor="imageUpload">
            <ImagePlaceholder>
              <UploadIcon>
                <FaIcons.FaUpload />
              </UploadIcon>
              <div>Ajouter une image</div>
              <FileInput
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </ImagePlaceholder>
          </label>
        </ImagePreviewContainer>
        {errors.images && <ErrorMessage>{errors.images}</ErrorMessage>}
      </ImageSection>
      
      <ButtonsGroup>
        <CancelButton type="button" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </CancelButton>
        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'En cours...' : product ? 'Mettre à jour' : 'Créer le produit'}
        </SubmitButton>
      </ButtonsGroup>
    </Form>
  );
};

export default ProductForm; 