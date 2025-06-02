import React, { useState, useEffect, useRef } from 'react';
import { styled } from 'styled-components';
import { FaIcons } from './Icons';
import { useLanguage } from '../../../provider/LanguageProvider';
import { toast } from 'react-toastify';
import { CarouselSlide, CarouselSlideFormData } from '../../../features/carousel/types';
import { useCreateCarouselSlide, useUpdateCarouselSlide } from '../../../features/carousel/hooks/use-carousel-query';

// Types
interface CarouselSlideFormProps {
  slide: CarouselSlide | null;
  onSuccess: () => void;
  onCancel: () => void;
}

// Styled Components
const FormContainer = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  overflow: hidden;
`;

const FormHeader = styled.div`
  background-color: var(--primary-color);
  color: white;
  padding: 1.25rem 1.5rem;
  font-weight: 600;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  
  &:hover {
    opacity: 0.8;
  }
`;

const FormContent = styled.div`
  padding: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--input-bg);
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const FormTextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--input-bg);
  transition: border-color 0.2s;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin-top: 0.5rem;
`;

const CheckboxInput = styled.input`
  cursor: pointer;
  width: 18px;
  height: 18px;
`;

const CheckboxLabel = styled.label`
  cursor: pointer;
  user-select: none;
`;

const ImagePreviewContainer = styled.div`
  margin-top: 1rem;
  position: relative;
  width: 100%;
  max-width: 400px;
`;

const ImagePreview = styled.img`
  width: 100%;
  height: auto;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  object-fit: cover;
  max-height: 200px;
`;

const NoImagePlaceholder = styled.div`
  width: 100%;
  height: 200px;
  background-color: var(--hover-bg);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  flex-direction: column;
  gap: 1rem;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(220, 53, 69, 0.8);
  }
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background-color: var(--button-secondary-bg);
  color: var(--button-secondary-text);
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--button-secondary-hover);
  }
`;

const FormFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: var(--button-secondary-bg);
  color: var(--button-secondary-text);
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--button-secondary-hover);
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: var(--primary-dark);
  }
  
  &:disabled {
    background-color: var(--text-muted);
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: var(--danger-color);
  font-size: 0.85rem;
  margin-top: 0.5rem;
`;

// Default form values
const defaultFormValues: CarouselSlideFormData = {
  image: '',
  title: '',
  subtitle: '',
  buttonText: 'Shop Now',
  buttonLink: '/products',
  active: true,
  order: 1,
};

// Main Component
const CarouselSlideForm: React.FC<CarouselSlideFormProps> = ({ slide, onSuccess, onCancel }) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createMutation = useCreateCarouselSlide();
  const updateMutation = useUpdateCarouselSlide();
  
  // Form state
  const [formData, setFormData] = useState<CarouselSlideFormData>(defaultFormValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with slide data if editing
  useEffect(() => {
    if (slide) {
      setFormData({
        image: slide.image,
        title: slide.title,
        subtitle: slide.subtitle,
        buttonText: slide.buttonText,
        buttonLink: slide.buttonLink,
        active: slide.active,
        order: slide.order,
      });
      setImagePreview(slide.image);
    }
  }, [slide]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked,
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle image upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({
        ...prev,
        image: t('carousel_slide_image_type_error'),
      }));
      return;
    }
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        image: t('carousel_slide_image_size_error'),
      }));
      return;
    }
    
    // Create preview URL and set it directly as the image value
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result as string;
      setImagePreview(base64Image);
      
      // Important: set the base64 string directly as the image value
      setFormData(prev => ({
        ...prev,
        image: base64Image,
      }));
    };
    reader.readAsDataURL(file);
    
    // Clear error
    if (errors.image) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
    }
  };
  
  // Handle remove image
  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: '',
    }));
    setImagePreview(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.image && !imagePreview) {
      newErrors.image = t('carousel_slide_image_required');
    }
    
    if (!formData.title.trim()) {
      newErrors.title = t('carousel_slide_title_required');
    }
    
    if (!formData.subtitle.trim()) {
      newErrors.subtitle = t('carousel_slide_subtitle_required');
    }
    
    if (!formData.buttonText.trim()) {
      newErrors.buttonText = t('carousel_slide_button_text_required');
    }
    
    if (!formData.buttonLink.trim()) {
      newErrors.buttonLink = t('carousel_slide_button_link_required');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Log the data we're about to send for debugging
      console.log('Submitting carousel slide data:', {
        title: formData.title,
        subtitle: formData.subtitle,
        buttonText: formData.buttonText,
        buttonLink: formData.buttonLink,
        active: formData.active,
        order: formData.order,
        hasImage: !!formData.image
      });
      
      if (slide) {
        // Update existing slide
        await updateMutation.mutateAsync({
          id: slide.id,
          slideData: formData,
        });
        toast.success(t('carousel_slide_updated_success'));
      } else {
        // Create new slide
        await createMutation.mutateAsync(formData);
        toast.success(t('carousel_slide_created_success'));
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving carousel slide:', error);
      toast.error(slide ? t('carousel_slide_updated_error') : t('carousel_slide_created_error'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <FormContainer>
      <FormHeader>
        {slide ? t('edit_carousel_slide') : t('add_carousel_slide')}
        <CloseButton onClick={onCancel} aria-label={t('close')}>
          <FaIcons.FaTimes />
        </CloseButton>
      </FormHeader>
      
      <form onSubmit={handleSubmit}>
        <FormContent>
          <FormGroup>
            <FormLabel>{t('image')}</FormLabel>
            <input 
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            
            <UploadButton type="button" onClick={handleUploadClick}>
              <FaIcons.FaUpload />
              {imagePreview ? t('change_image') : t('upload_image')}
            </UploadButton>
            
            {errors.image && <ErrorMessage>{errors.image}</ErrorMessage>}
            
            <ImagePreviewContainer>
              {imagePreview ? (
                <>
                  <ImagePreview src={imagePreview} alt="Preview" />
                  <RemoveImageButton 
                    type="button" 
                    onClick={handleRemoveImage}
                    aria-label={t('remove_image')}
                  >
                    <FaIcons.FaTimes size={16} />
                  </RemoveImageButton>
                </>
              ) : (
                <NoImagePlaceholder>
                  <FaIcons.FaImage size={48} opacity={0.5} />
                  <div>{t('no_image_selected')}</div>
                </NoImagePlaceholder>
              )}
            </ImagePreviewContainer>
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="title">{t('title')}</FormLabel>
            <FormInput 
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t('carousel_slide_title_placeholder')}
            />
            {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="subtitle">{t('subtitle')}</FormLabel>
            <FormTextArea 
              id="subtitle"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              placeholder={t('carousel_slide_subtitle_placeholder')}
            />
            {errors.subtitle && <ErrorMessage>{errors.subtitle}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="buttonText">{t('button_text')}</FormLabel>
            <FormInput 
              type="text"
              id="buttonText"
              name="buttonText"
              value={formData.buttonText}
              onChange={handleChange}
              placeholder={t('carousel_slide_button_text_placeholder')}
            />
            {errors.buttonText && <ErrorMessage>{errors.buttonText}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="buttonLink">{t('button_link')}</FormLabel>
            <FormInput 
              type="text"
              id="buttonLink"
              name="buttonLink"
              value={formData.buttonLink}
              onChange={handleChange}
              placeholder={t('carousel_slide_button_link_placeholder')}
            />
            {errors.buttonLink && <ErrorMessage>{errors.buttonLink}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="order">{t('order')}</FormLabel>
            <FormInput 
              type="number"
              id="order"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min="1"
            />
          </FormGroup>
          
          <CheckboxContainer>
            <CheckboxInput 
              type="checkbox"
              id="active"
              name="active"
              checked={formData.active}
              onChange={handleChange}
            />
            <CheckboxLabel htmlFor="active">{t('active')}</CheckboxLabel>
          </CheckboxContainer>
        </FormContent>
        
        <FormFooter>
          <CancelButton type="button" onClick={onCancel}>
            {t('cancel')}
          </CancelButton>
          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting && <FaIcons.FaSpinner style={{ animation: 'spin 1s linear infinite' }} />}
            {slide ? t('update') : t('create')}
          </SubmitButton>
        </FormFooter>
      </form>
    </FormContainer>
  );
};

export default CarouselSlideForm; 