import React, { useState } from 'react';
import { styled } from 'styled-components';
import { CreateUserData } from '../../../features/admin/services/types';

interface UserFormProps {
  onSubmit: (data: CreateUserData) => void;
  initialData?: Partial<CreateUserData & { id?: number }>;
  isLoading: boolean;
  onCancel: () => void;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  font-weight: 500;
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
  
  &::placeholder {
    color: var(--light-text);
    opacity: 0.7;
  }
  
  /* Enhanced styling for dark mode */
  [data-theme="dark"] & {
    border-color: var(--border-color);
    background-color: var(--card-bg);
    color: var(--text-color);
    
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
    background-color: var(--card-bg);
    color: var(--text-color);
    
    option {
      background-color: var(--card-bg);
      color: var(--text-color);
    }
  }
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 0.5rem 0;
  padding: 0.5rem;
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--light-bg);
  }
  
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: var(--accent-color);
    cursor: pointer;
    
    /* Enhanced visibility for dark mode */
    [data-theme="dark"] & {
      accent-color: var(--secondary-color);
      box-shadow: 0 0 4px var(--secondary-color);
    }
  }
  
  /* Make checkbox label more visible in dark mode */
  [data-theme="dark"] & {
    background-color: rgba(255, 255, 255, 0.05);
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const CancelButton = styled(Button)`
  background-color: var(--light-bg);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  
  &:hover {
    background-color: var(--light-bg);
    opacity: 0.9;
  }
  
  /* Enhanced styling for dark mode */
  [data-theme="dark"] & {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: var(--border-color);
    color: var(--light-text);
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.15);
    }
  }
`;

const SubmitButton = styled(Button)<{ $loading: boolean }>`
  background-color: var(--accent-color);
  border: none;
  color: white;
  font-weight: bold;
  padding: 0.8rem 2rem;
  
  &:hover {
    background-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
    
    &:hover {
      background-color: var(--primary-color);
      box-shadow: 0 4px 12px rgba(233, 69, 96, 0.4);
    }
    
    &:disabled {
      background-color: rgba(255, 255, 255, 0.2);
      box-shadow: none;
    }
  }
`;

const UserForm: React.FC<UserFormProps> = ({ onSubmit, initialData, isLoading, onCancel }) => {
  const [formData, setFormData] = useState<CreateUserData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    password: initialData?.password || '',
    role: initialData?.role || 'user',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    zipCode: initialData?.zipCode || '',
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      <FormRow>
        <FormGroup>
          <Label htmlFor="firstName">Prénom *</Label>
          <Input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="lastName">Nom *</Label>
          <Input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </FormGroup>
      </FormRow>
      
      <FormGroup>
        <Label htmlFor="email">Email *</Label>
        <Input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="password">Mot de passe *</Label>
        <Input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required={!initialData?.id}
          placeholder={initialData?.id ? "Laissez vide pour ne pas changer" : ""}
        />
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="role">Rôle *</Label>
        <Select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="user">Utilisateur</option>
          <option value="admin">Administrateur</option>
        </Select>
      </FormGroup>
      
      <FormRow>
        <FormGroup>
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="zipCode">Code postal</Label>
          <Input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
          />
        </FormGroup>
      </FormRow>
      
      <FormGroup>
        <Label htmlFor="address">Adresse</Label>
        <Input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="city">Ville</Label>
        <Input
          type="text"
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
        />
      </FormGroup>
      
      <Checkbox>
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
        />
        <Label htmlFor="isActive" style={{ margin: 0 }}>Compte actif</Label>
      </Checkbox>
      
      <ButtonsContainer>
        <CancelButton type="button" onClick={onCancel}>
          Annuler
        </CancelButton>
        <SubmitButton type="submit" $loading={isLoading} disabled={isLoading}>
          {isLoading ? 'En cours...' : initialData?.id ? 'Modifier' : 'Créer'}
        </SubmitButton>
      </ButtonsContainer>
    </Form>
  );
};

export default UserForm; 