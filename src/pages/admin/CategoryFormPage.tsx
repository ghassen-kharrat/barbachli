import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import { FaIcons } from './components/Icons';
import AdminLayout from '../../layouts/AdminLayout';
import { toast } from 'react-toastify';
import axiosClient from '../../apis/axios-client';
import { useQueryClient } from '@tanstack/react-query';
import { CATEGORIES_QUERY_KEYS } from '../../features/products/hooks/use-categories-query';
import categoriesApi from '../../features/products/services/categories.api';
import { CategoryData } from '../../features/products/services/types';

// Styles
const FormContainer = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 2rem;
  
  /* Add subtle border in dark mode for better visibility */
  [data-theme="dark"] & {
    border: 1px solid var(--border-color);
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  }
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
  
  /* Enhanced styling for dark mode */
  [data-theme="dark"] & {
    border-color: var(--border-color);
    
    &:focus {
      border-color: var(--secondary-color);
      box-shadow: 0 0 0 2px rgba(233, 69, 96, 0.2);
    }
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
  
  /* Enhanced styling for dark mode */
  [data-theme="dark"] & {
    border-color: var(--border-color);
    
    &:focus {
      border-color: var(--secondary-color);
      box-shadow: 0 0 0 2px rgba(233, 69, 96, 0.2);
    }
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
  font-weight: 600;
  min-width: 150px;
  
  &:hover {
    background-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    background-color: var(--border-color);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  /* Enhanced styling for dark mode */
  [data-theme="dark"] & {
    background-color: var(--secondary-color);
    
    &:hover:not(:disabled) {
      background-color: #ff768f;
      box-shadow: 0 4px 12px rgba(255, 95, 126, 0.4);
    }
    
    &:disabled {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
`;

const CancelButton = styled(Button)`
  background-color: var(--card-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  font-weight: 500;
  min-width: 120px;
  
  &:hover {
    background-color: var(--light-bg);
    transform: translateY(-2px);
  }
  
  /* Enhanced styling for dark mode */
  [data-theme="dark"] & {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: var(--border-color);
    color: white;
    
    &:hover:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.15);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
  }
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const CategoryFormPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const categoryId = isEditMode ? parseInt(id) : 0;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Form state
  const [formData, setFormData] = useState<Omit<CategoryData, 'id' | 'createdAt' | 'productCount'>>({
    name: '',
    slug: '',
    description: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  
  // Fetch category data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      setIsLoading(true);
      
      categoriesApi.getById(categoryId)
        .then(response => {
          if (response.data) {
            const category = response.data;
            setFormData({
              name: category.name || '',
              slug: category.slug || '',
              description: category.description || ''
            });
          }
        })
        .catch(error => {
          console.error('Error fetching category:', error);
          toast.error('Erreur lors de la récupération de la catégorie');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isEditMode, categoryId]);
  
  // Generate slug automatically from name
  useEffect(() => {
    if (!isEditMode && formData.name && !formData.slug) {
      // Simple slug generation - lowercase, replace spaces with hyphens, remove special chars
      const slug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '')    // Remove special chars
        .replace(/\s+/g, '-')            // Replace spaces with hyphens
        .replace(/-+/g, '-');            // Replace multiple hyphens with single hyphen
      
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  }, [formData.name, formData.slug, isEditMode]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
  
  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string | null> = {};
    
    if (!formData.name) {
      newErrors.name = 'Le nom de la catégorie est obligatoire';
    }
    
    if (!formData.slug) {
      newErrors.slug = 'Le slug est obligatoire';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Le slug ne doit contenir que des lettres minuscules, des chiffres et des tirets';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Form data before submission:', formData);
      
      // Ensure we're sending the right data structure
      const categoryPayload: Omit<CategoryData, 'id' | 'createdAt' | 'productCount'> = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description?.trim() || ''
      };
      
      console.log("Sending category data:", categoryPayload);
      
      if (isEditMode) {
        const response = await categoriesApi.update(categoryId, categoryPayload);
        console.log('Update response:', response);
        
        if (response && response.success) {
          toast.success('Catégorie mise à jour avec succès');
          // First invalidate the cache
          await queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEYS.list() });
          // Navigate to admin products page
          navigate('/admin/products');
        }
      } else {
        console.log('Creating new category...');
        const response = await categoriesApi.create(categoryPayload);
        console.log('Create response:', response);
        
        if (response && response.success) {
          toast.success('Catégorie créée avec succès');
          // First invalidate the cache
          await queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEYS.list() });
          // Force immediate navigation to admin products page
          console.log('Navigating to /admin/products');
          navigate('/admin/products');
        } else {
          console.error('API returned success: false', response);
          toast.error('Erreur lors de la création de la catégorie');
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
      
      // Enhanced error handling
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        if (error.response.data && error.response.data.errors) {
          setErrors(error.response.data.errors);
        } else if (error.response.data && error.response.data.message) {
          toast.error(`Erreur: ${error.response.data.message}`);
        } else {
          toast.error(`Erreur ${error.response.status}: Impossible de sauvegarder la catégorie`);
        }
      } else if (error.request) {
        toast.error('Aucune réponse reçue du serveur, vérifiez votre connexion');
      } else {
        toast.error(`Erreur lors de la ${isEditMode ? 'mise à jour' : 'création'} de la catégorie`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    console.log('Cancelling - navigating to admin products page');
    navigate('/admin/products');
  };
  
  return (
    <AdminLayout title={isEditMode ? 'Modifier la catégorie' : 'Ajouter une catégorie'}>
      {isLoading ? (
        <div>Chargement...</div>
      ) : (
        <FormContainer>
          <FormTitle>{isEditMode ? 'Modifier la catégorie' : 'Ajouter une catégorie'}</FormTitle>
          
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="name">Nom de la catégorie*</Label>
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
              <Label htmlFor="slug">Slug* (URL)</Label>
              <Input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="ex: nom-de-categorie"
              />
              {errors.slug && <ErrorMessage>{errors.slug}</ErrorMessage>}
            </FormGroup>
            
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

export default CategoryFormPage; 