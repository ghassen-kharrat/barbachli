import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { styled } from 'styled-components';
import UserLayout from '../../layouts/UserLayout';
import { useRegister } from '../../features/auth/hooks/use-auth-query';
import { useState } from 'react';

// Styles
const PageContainer = styled.div`
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: var(--box-shadow);
`;

const PageTitle = styled.h1`
  text-align: center;
  color: var(--text-color);
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: bold;
  color: var(--text-color);
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--card-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }
`;

const ErrorText = styled.div`
  color: var(--error-color);
  font-size: 0.8rem;
`;

const SubmitButton = styled.button`
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: var(--primary-color);
  }
  
  &:disabled {
    background-color: var(--border-color);
    cursor: not-allowed;
  }
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  color: var(--light-text);
  
  a {
    color: var(--secondary-color);
    text-decoration: none;
    font-weight: bold;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

// Schéma de validation
const validationSchema = Yup.object({
  firstName: Yup.string().required('Le prénom est requis'),
  lastName: Yup.string().required('Le nom est requis'),
  email: Yup.string().email('Email invalide').required('Email requis'),
  phone: Yup.string(),
  password: Yup.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').required('Mot de passe requis'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Les mots de passe doivent correspondre')
    .required('La confirmation du mot de passe est requise')
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const { mutate: register, isPending: isLoading, error } = useRegister();
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: ''
    },
    validationSchema,
    onSubmit: (values) => {
      // Clear any previous errors
      setPasswordMismatch(false);
      setRegistrationError(null);
      
      // Double-check if passwords match (both client and form validation)
      if (values.password !== values.confirmPassword) {
        setPasswordMismatch(true);
        return;
      }
      
      // Only send the required fields to the backend in snake_case format
      const registrationData = {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        password: values.password,
        phone: values.phone || ''
      };
      
      console.log('Submitting registration with data:', { ...registrationData, password: '******' });
      
      register(registrationData, {
        onSuccess: () => {
          navigate('/login?registered=true');
        },
        onError: (error) => {
          if (error instanceof Error) {
            // Display specific error message
            setRegistrationError(error.message);
            
            // If error mentions password, highlight the password mismatch
            if (error.message.toLowerCase().includes('mot de passe') || 
                error.message.toLowerCase().includes('password')) {
              setPasswordMismatch(true);
            }
          } else {
            setRegistrationError('Une erreur est survenue lors de l\'inscription');
          }
        }
      });
    }
  });
  
  return (
    <UserLayout>
      <PageContainer>
        <PageTitle>Créer un compte</PageTitle>
        
        <Form onSubmit={formik.handleSubmit}>
          <FormGroup>
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="Votre prénom"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.firstName && formik.errors.firstName && (
              <ErrorText>{formik.errors.firstName}</ErrorText>
            )}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Votre nom"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.lastName && formik.errors.lastName && (
              <ErrorText>{formik.errors.lastName}</ErrorText>
            )}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Votre email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <ErrorText>{formik.errors.email}</ErrorText>
            )}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Votre numéro de téléphone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Votre mot de passe"
              value={formik.values.password}
              onChange={(e) => {
                formik.handleChange(e);
                if (passwordMismatch) setPasswordMismatch(false);
                if (registrationError) setRegistrationError(null);
              }}
              onBlur={formik.handleBlur}
            />
            {formik.touched.password && formik.errors.password && (
              <ErrorText>{formik.errors.password}</ErrorText>
            )}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirmez votre mot de passe"
              value={formik.values.confirmPassword}
              onChange={(e) => {
                formik.handleChange(e);
                if (passwordMismatch) setPasswordMismatch(false);
                if (registrationError) setRegistrationError(null);
              }}
              onBlur={formik.handleBlur}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <ErrorText>{formik.errors.confirmPassword}</ErrorText>
            )}
          </FormGroup>
          
          {passwordMismatch && (
            <ErrorText>Les mots de passe ne correspondent pas</ErrorText>
          )}
          
          {registrationError && (
            <ErrorText>{registrationError}</ErrorText>
          )}
          
          {error && !registrationError && (
            <ErrorText>
              {error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'inscription'}
            </ErrorText>
          )}
          
          <SubmitButton type="submit" disabled={!formik.isValid || isLoading}>
            {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
          </SubmitButton>
        </Form>
        
        <LoginLink>
          Vous avez déjà un compte ? <Link to="/login">Connectez-vous</Link>
        </LoginLink>
      </PageContainer>
    </UserLayout>
  );
};

export default RegisterPage; 