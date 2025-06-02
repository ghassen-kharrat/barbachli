import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import UserLayout from '../../layouts/UserLayout';
import { useAuthCheck, useLogin } from '../../features/auth/hooks/use-auth-query';

// Styles
const Container = styled.div`
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--box-shadow);
  background-color: var(--card-bg);
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  text-align: center;
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
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
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

const RegisterLink = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  
  a {
    color: var(--accent-color);
    text-decoration: underline;
    
    &:hover {
      color: var(--secondary-color);
    }
  }
`;

const HelpBox = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: var(--light-bg);
  border-radius: 4px;
  font-size: 0.9rem;
  color: var(--light-text);
`;

const AccountInfo = styled.div`
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: var(--card-bg);
  border-radius: 4px;
  border: 1px dashed var(--border-color);
`;

// Schéma de validation Yup
const validationSchema = Yup.object({
  email: Yup.string()
    .email('Adresse email invalide')
    .required('Email requis'),
  password: Yup.string()
    .required('Mot de passe requis')
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { mutate: login, isPending: isLoading, error } = useLogin();
  const { data: authData } = useAuthCheck();
  
  // Rediriger si déjà connecté
  useEffect(() => {
    if (authData && authData.data) {
      navigate('/');
    }
  }, [authData, navigate]);
  
  // Formik pour gérer le formulaire
  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema,
    onSubmit: (values) => {
      login(values, {
        onSuccess: () => {
          navigate('/');
        }
      });
    }
  });
  
  return (
    <UserLayout>
      <Container>
        <Title>Connexion</Title>
        
        <Form onSubmit={formik.handleSubmit}>
          {error && (
            <ErrorText>
              Identifiants incorrects. Veuillez réessayer.
            </ErrorText>
          )}
          
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="votre@email.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <ErrorText>{formik.errors.email}</ErrorText>
            )}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Votre mot de passe"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.password && formik.errors.password && (
              <ErrorText>{formik.errors.password}</ErrorText>
            )}
          </FormGroup>
          
          <SubmitButton 
            type="submit" 
            disabled={isLoading || !formik.isValid}
          >
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </SubmitButton>
        </Form>
        
        <RegisterLink>
          Pas encore de compte ? <Link to="/register">S'inscrire</Link>
        </RegisterLink>
        
        <HelpBox>
          <p><strong>Information:</strong> Pour tester les fonctionnalités, vous pouvez utiliser ces comptes:</p>
          <AccountInfo>
            <p><strong>Admin:</strong> admin@example.com / admin123</p>
            <p><strong>Utilisateur:</strong> jean@example.com / password123</p>
          </AccountInfo>
        </HelpBox>
      </Container>
    </UserLayout>
  );
};

export default LoginPage; 