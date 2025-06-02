import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import { FaIcons } from './components/Icons';
import AdminLayout from '../../layouts/AdminLayout';
import { useProductDetail, useCreateProduct, useUpdateProduct } from '../../features/products/hooks/use-products-query';
import { useCategories } from '../../features/products/hooks/use-categories-query';
import { toast } from 'react-toastify';

// Styles
const FormContainer = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 2rem;
`;

const FormTitle = styled.h2`
  margin-bottom: 1.5rem;
  color: var(--primary-color);
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 1rem;
  background-color: var(--card-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(15, 52, 96, 0.2);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;
  background-color: var(--card-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(15, 52, 96, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 1rem;
  background-color: var(--card-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(15, 52, 96, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const SubmitButton = styled(Button)`
  background-color: var(--accent-color);
  color: white;
  
  &:hover {
    background-color: var(--primary-color);
  }
  
  &:disabled {
    background-color: var(--border-color);
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background-color: var(--card-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  
  &:hover {
    background-color: var(--light-bg);
  }
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const ImagePreviewContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const ImagePreview = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: var(--border-radius);
  overflow: hidden;
  border: 1px solid var(--border-color);
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

const ProductFormPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const productId = isEditMode ? parseInt(id) : 0;
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    stock: '',
    images: []
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch product data if in edit mode
  const { data: productData, isLoading: isLoadingProduct } = useProductDetail(
    isEditMode ? productId : 0
  );
  
  // Fetch categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();
  const categories = categoriesData?.data || [];
  
  // Mutation hooks for create/update product
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  
  // Populate form with existing data when in edit mode
  useEffect(() => {
    if (isEditMode && productData && productData.data) {
      const product = productData.data;
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price ? product.price.toString() : '',
        discountPrice: product.discountPrice ? product.discountPrice.toString() : '',
        category: product.category || '',
        stock: product.stock ? product.stock.toString() : '',
        images: product.images || []
      });
    }
  }, [isEditMode, productData]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
      setFormData({
        ...formData,
        [name]: value
      });
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Handle image input
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // For demo purposes, we'll use file URLs directly
    // In a real application, you would upload these to a server
    const newImages = files.map(file => URL.createObjectURL(file));
    
    setFormData({
      ...formData,
      images: [...formData.images, ...newImages]
    });
  };
  
  // Remove image
  const handleRemoveImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    
    setFormData({
      ...formData,
      images: newImages
    });
  };
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Le nom du produit est obligatoire';
    }
    
    if (!formData.description) {
      newErrors.description = 'La description est obligatoire';
    }
    
    if (!formData.price) {
      newErrors.price = 'Le prix est obligatoire';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Le prix doit être un nombre supérieur à 0';
    }
    
    if (formData.discountPrice && (isNaN(parseFloat(formData.discountPrice)) || parseFloat(formData.discountPrice) <= 0)) {
      newErrors.discountPrice = 'Le prix réduit doit être un nombre supérieur à 0';
    }
    
    if (!formData.category) {
      newErrors.category = 'La catégorie est obligatoire';
    }
    
    if (!formData.stock) {
      newErrors.stock = 'Le stock est obligatoire';
    } else if (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Le stock doit être un nombre entier positif';
    }
    
    if (!isEditMode && formData.images.length === 0) {
      newErrors.images = 'Au moins une image est requise';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Find the selected category to get its ID
      const selectedCategory = categories.find(cat => cat.name === formData.category);
      const categoryId = selectedCategory ? selectedCategory.id : null;
      
      const productPayload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        stock: parseInt(formData.stock),
        category: formData.category,
        categoryId: categoryId,
        images: formData.images
      };
      
      if (isEditMode) {
        await updateProduct.mutateAsync({
          id: productId,
          data: productPayload
        });
        
        toast.success('Produit mis à jour avec succès');
      } else {
        await createProduct.mutateAsync(productPayload);
        
        toast.success('Produit créé avec succès');
      }
      
      // Navigate back to products list
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      
      // Handle API validation errors
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
      toast.error(`Erreur lors de la ${isEditMode ? 'mise à jour' : 'création'} du produit`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate('/admin/products');
  };
  
  const isLoading = isLoadingProduct || isLoadingCategories;
  
  return (
    <AdminLayout title={isEditMode ? 'Modifier le produit' : 'Ajouter un produit'}>
      {isLoading ? (
        <div>Chargement...</div>
      ) : (
        <FormContainer>
          <FormTitle>{isEditMode ? 'Modifier le produit' : 'Ajouter un produit'}</FormTitle>
          
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <FormGroup>
                <Label htmlFor="name">Nom du produit*</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="category">Catégorie*</Label>
                <Select
                  id="category"
                  name="category"
                  value={formData.category || ''}
                  onChange={handleChange}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </Select>
                {errors.category && <ErrorMessage>{errors.category}</ErrorMessage>}
              </FormGroup>
            </FormGrid>
            
            <FormGroup>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
              {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
            </FormGroup>
            
            <FormGrid>
              <FormGroup>
                <Label htmlFor="price">Prix*</Label>
                <Input
                  type="number"
                  id="price"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                />
                {errors.price && <ErrorMessage>{errors.price}</ErrorMessage>}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="discountPrice">Prix réduit</Label>
                <Input
                  type="number"
                  id="discountPrice"
                  name="discountPrice"
                  min="0"
                  step="0.01"
                  value={formData.discountPrice}
                  onChange={handleChange}
                />
                {errors.discountPrice && <ErrorMessage>{errors.discountPrice}</ErrorMessage>}
              </FormGroup>
            </FormGrid>
            
            <FormGroup>
              <Label htmlFor="stock">Stock*</Label>
              <Input
                type="number"
                id="stock"
                name="stock"
                min="0"
                step="1"
                value={formData.stock}
                onChange={handleChange}
              />
              {errors.stock && <ErrorMessage>{errors.stock}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="images">Images</Label>
              <Input
                type="file"
                id="images"
                name="images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
              
              {formData.images.length > 0 && (
                <ImagePreviewContainer>
                  {formData.images.map((image, index) => (
                    <ImagePreview key={index}>
                      <Image src={image} alt={`Preview ${index + 1}`} />
                      <RemoveImageButton
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <FaIcons.FaTimes />
                      </RemoveImageButton>
                    </ImagePreview>
                  ))}
                </ImagePreviewContainer>
              )}
            </FormGroup>
            
            <ButtonGroup>
              <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  'Sauvegarde en cours...'
                ) : (
                  <>
                    <FaIcons.FaSave />
                    {isEditMode ? 'Mettre à jour' : 'Enregistrer'}
                  </>
                )}
              </SubmitButton>
              
              <CancelButton type="button" onClick={handleCancel}>
                <FaIcons.FaTimes />
                Annuler
              </CancelButton>
            </ButtonGroup>
          </form>
        </FormContainer>
      )}
    </AdminLayout>
  );
};

export default ProductFormPage; 