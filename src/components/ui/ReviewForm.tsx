import React, { useState } from 'react';
import { styled } from 'styled-components';
import { FaStar, FaTimes } from 'react-icons/fa';
import { ReviewInput } from '../../features/products/services/types';
import { useLanguage } from '../../provider/LanguageProvider';

interface ReviewFormProps {
  onSubmit: (reviewData: ReviewInput) => void;
  isLoading?: boolean;
  initialValues?: Partial<ReviewInput>;
  onCancel?: () => void;
}

const FormContainer = styled.form`
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--box-shadow);
  position: relative;
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const FormTitle = styled.h3`
  margin: 0;
  color: var(--text-color);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--light-text);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  
  &:hover {
    color: var(--accent-color);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-color);
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--input-bg);
  color: var(--text-color);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--input-bg);
  color: var(--text-color);
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
  }
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const RatingStars = styled.div`
  display: flex;
  margin-left: 1rem;
`;

const StyledStarIcon = styled.span<{ $active: boolean }>`
  cursor: pointer;
  font-size: 1.5rem;
  margin-right: 0.3rem;
  color: ${({ $active }) => $active ? 'var(--secondary-color)' : 'var(--border-color)'};
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--secondary-color);
  }
`;

const StarIcon: React.FC<{ $active: boolean; onClick: () => void }> = ({ $active, onClick }) => (
  <StyledStarIcon $active={$active} onClick={onClick}>
    {React.createElement(FaStar)}
  </StyledStarIcon>
);

const RatingText = styled.span<{ $hasRating: boolean }>`
  margin-left: 1rem;
  color: ${({ $hasRating }) => $hasRating ? 'var(--text-color)' : 'var(--light-text)'};
  font-size: 0.9rem;
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  font-size: 0.9rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  
  &:before {
    content: '⚠️';
    margin-right: 0.5rem;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const CancelButton = styled.button`
  background-color: var(--light-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  padding: 0.8rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background-color: var(--border-color);
  }
`;

const SubmitButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover:not(:disabled) {
    background-color: var(--accent-color);
  }
  
  &:disabled {
    background-color: var(--light-bg);
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ReviewForm: React.FC<ReviewFormProps> = ({ 
  onSubmit, 
  isLoading = false, 
  initialValues,
  onCancel
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<ReviewInput>({
    rating: initialValues?.rating || 0,
    title: initialValues?.title || '',
    comment: initialValues?.comment || '',
  });
  
  const [errors, setErrors] = useState<{
    rating?: string;
    title?: string;
    comment?: string;
  }>({});
  
  const getRatingText = (rating: number): string => {
    switch (rating) {
      case 1: return t('rating_very_dissatisfied');
      case 2: return t('rating_dissatisfied');
      case 3: return t('rating_neutral');
      case 4: return t('rating_satisfied');
      case 5: return t('rating_very_satisfied');
      default: return t('select_rating');
    }
  };
  
  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
    // Clear error when rating is selected
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: undefined }));
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is changed
    if (errors[name as keyof ReviewInput]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: {
      rating?: string;
      title?: string;
      comment?: string;
    } = {};
    
    if (formData.rating === 0) {
      newErrors.rating = t('rating_required');
    }
    
    if (!formData.title.trim()) {
      newErrors.title = t('title_required');
    }
    
    if (!formData.comment.trim()) {
      newErrors.comment = t('comment_required');
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = t('comment_too_short');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onCancel) onCancel();
  };
  
  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormHeader>
        <FormTitle>{t('add_review')}</FormTitle>
        {onCancel && (
          <CloseButton type="button" onClick={handleCancel} aria-label={t('cancel')}>
            {React.createElement(FaTimes)}
          </CloseButton>
        )}
      </FormHeader>
      
      <FormGroup>
        <Label>{t('your_rating')}</Label>
        <RatingContainer>
          <RatingStars>
            {[1, 2, 3, 4, 5].map(star => (
              <StarIcon 
                key={star}
                $active={formData.rating >= star}
                onClick={() => handleRatingClick(star)}
              />
            ))}
          </RatingStars>
          <RatingText $hasRating={formData.rating > 0}>
            {getRatingText(formData.rating)}
          </RatingText>
        </RatingContainer>
        {errors.rating && <ErrorMessage>{errors.rating}</ErrorMessage>}
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="title">{t('review_title')}</Label>
        <Input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder={t('review_title_placeholder')}
        />
        {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="comment">{t('your_review')}</Label>
        <TextArea
          id="comment"
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          placeholder={t('review_comment_placeholder')}
        />
        {errors.comment && <ErrorMessage>{errors.comment}</ErrorMessage>}
      </FormGroup>
      
      <ButtonsContainer>
        {onCancel && (
          <CancelButton type="button" onClick={handleCancel}>
            {t('cancel')}
          </CancelButton>
        )}
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? t('submitting') : t('submit_review')}
        </SubmitButton>
      </ButtonsContainer>
    </FormContainer>
  );
};

export default ReviewForm; 