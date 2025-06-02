import { useState } from 'react';
import { styled } from 'styled-components';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaIcons } from '../admin/components/Icons';
import UserLayout from '../../layouts/UserLayout';
import { useUserProfile, useUpdateProfile, useUpdatePassword } from '../../features/auth/hooks/use-auth-query';

// Styles
const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  color: #1a1a2e;
  margin-bottom: 1.5rem;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 1px solid #ddd;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 1rem 2rem;
  background-color: transparent;
  border: none;
  font-weight: ${({ $active }) => $active ? 'bold' : 'normal'};
  color: ${({ $active }) => $active ? '#e94560' : '#333'};
  border-bottom: 2px solid ${({ $active }) => $active ? '#e94560' : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: #e94560;
  }
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #0f3460;
  }
`;

const ErrorText = styled.div`
  color: #e94560;
  font-size: 0.8rem;
`;

const SuccessText = styled.div`
  color: #2ecc71;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #e8f5e9;
  border-radius: 4px;
`;

const SubmitButton = styled.button`
  background-color: #e94560;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 1rem 2rem;
  font-weight: bold;
  cursor: pointer;
  align-self: flex-start;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #d3405c;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

// Schémas de validation
const profileValidationSchema = Yup.object({
  firstName: Yup.string().required('Le prénom est requis'),
  lastName: Yup.string().required('Le nom est requis'),
  email: Yup.string().email('Email invalide').required('Email requis'),
  phone: Yup.string(),
  address: Yup.string(),
  city: Yup.string(),
  zipCode: Yup.string()
});

const passwordValidationSchema = Yup.object({
  currentPassword: Yup.string().required('Le mot de passe actuel est requis'),
  newPassword: Yup.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .required('Le nouveau mot de passe est requis'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Les mots de passe doivent correspondre')
    .required('La confirmation du mot de passe est requise')
});

// Énumération des onglets
enum ProfileTab {
  INFORMATION = 'information',
  SECURITY = 'security'
}

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<ProfileTab>(ProfileTab.INFORMATION);
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);
  
  const { data: userData, isLoading } = useUserProfile();
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
  const { mutate: updatePassword, isPending: isUpdatingPassword } = useUpdatePassword();
  
  // Ensure null values are converted to empty strings
  const user = userData?.data ? {
    firstName: userData.data.first_name || '',
    lastName: userData.data.last_name || '',
    email: userData.data.email || '',
    phone: userData.data.phone || '',
    address: userData.data.address || '',
    city: userData.data.city || '',
    zipCode: userData.data.zip_code || ''
  } : {
    firstName: '',
    lastName: '', 
    email: '', 
    phone: '', 
    address: '', 
    city: '', 
    zipCode: ''
  };
  
  // Formulaire pour les informations du profil
  const profileFormik = useFormik({
    initialValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      zipCode: user.zipCode
    },
    validationSchema: profileValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      updateProfile(values, {
        onSuccess: () => {
          setProfileUpdateSuccess(true);
          setTimeout(() => setProfileUpdateSuccess(false), 3000);
        }
      });
    }
  });
  
  // Formulaire pour la modification du mot de passe
  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: passwordValidationSchema,
    onSubmit: (values) => {
      updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmPassword
      }, {
        onSuccess: () => {
          passwordFormik.resetForm();
          setPasswordUpdateSuccess(true);
          setTimeout(() => setPasswordUpdateSuccess(false), 3000);
        }
      });
    }
  });
  
  // Afficher un message de chargement
  if (isLoading) {
    return (
      <UserLayout>
        <div>Chargement des informations du profil...</div>
      </UserLayout>
    );
  }
  
  return (
    <UserLayout>
      <PageContainer>
        <PageTitle>Mon profil</PageTitle>
        
        <TabContainer>
          <Tab 
            $active={activeTab === ProfileTab.INFORMATION} 
            onClick={() => setActiveTab(ProfileTab.INFORMATION)}
          >
            Mes informations
          </Tab>
          <Tab 
            $active={activeTab === ProfileTab.SECURITY} 
            onClick={() => setActiveTab(ProfileTab.SECURITY)}
          >
            Sécurité
          </Tab>
        </TabContainer>
        
        {activeTab === ProfileTab.INFORMATION && (
          <Card>
            {profileUpdateSuccess && (
              <SuccessText>Vos informations ont été mises à jour avec succès!</SuccessText>
            )}
            
            <Form onSubmit={profileFormik.handleSubmit}>
              <FormRow>
                <FormGroup>
                  <Label htmlFor="firstName">
                    <FaIcons.FaUser /> Prénom
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={profileFormik.values.firstName}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                  />
                  {profileFormik.touched.firstName && profileFormik.errors.firstName && (
                    <ErrorText>{String(profileFormik.errors.firstName)}</ErrorText>
                  )}
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="lastName">
                    <FaIcons.FaUser /> Nom
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={profileFormik.values.lastName}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                  />
                  {profileFormik.touched.lastName && profileFormik.errors.lastName && (
                    <ErrorText>{String(profileFormik.errors.lastName)}</ErrorText>
                  )}
                </FormGroup>
              </FormRow>
              
              <FormGroup>
                <Label htmlFor="email">
                  <FaIcons.FaEnvelope /> Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profileFormik.values.email}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                />
                {profileFormik.touched.email && profileFormik.errors.email && (
                  <ErrorText>{String(profileFormik.errors.email)}</ErrorText>
                )}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="phone">
                  <FaIcons.FaPhoneAlt /> Téléphone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={profileFormik.values.phone}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                />
                {profileFormik.touched.phone && profileFormik.errors.phone && (
                  <ErrorText>{String(profileFormik.errors.phone)}</ErrorText>
                )}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="address">
                  <FaIcons.FaMapMarkerAlt /> Adresse
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={profileFormik.values.address}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                />
                {profileFormik.touched.address && profileFormik.errors.address && (
                  <ErrorText>{String(profileFormik.errors.address)}</ErrorText>
                )}
              </FormGroup>
              
              <FormRow>
                <FormGroup>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    name="city"
                    value={profileFormik.values.city}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                  />
                  {profileFormik.touched.city && profileFormik.errors.city && (
                    <ErrorText>{String(profileFormik.errors.city)}</ErrorText>
                  )}
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="zipCode">Code postal</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={profileFormik.values.zipCode}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                  />
                  {profileFormik.touched.zipCode && profileFormik.errors.zipCode && (
                    <ErrorText>{String(profileFormik.errors.zipCode)}</ErrorText>
                  )}
                </FormGroup>
              </FormRow>
              
              <SubmitButton 
                type="submit" 
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? 'Mise à jour...' : 'Enregistrer les modifications'}
              </SubmitButton>
            </Form>
          </Card>
        )}
        
        {activeTab === ProfileTab.SECURITY && (
          <Card>
            {passwordUpdateSuccess && (
              <SuccessText>Votre mot de passe a été modifié avec succès!</SuccessText>
            )}
            
            <Form onSubmit={passwordFormik.handleSubmit}>
              <FormGroup>
                <Label htmlFor="currentPassword">
                  <FaIcons.FaKey /> Mot de passe actuel
                </Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordFormik.values.currentPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="newPassword">
                  <FaIcons.FaKey /> Nouveau mot de passe
                </Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordFormik.values.newPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="confirmPassword">
                  <FaIcons.FaKey /> Confirmer le nouveau mot de passe
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordFormik.values.confirmPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                />
              </FormGroup>
              
              <SubmitButton 
                type="submit" 
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? 'Modification en cours...' : 'Modifier le mot de passe'}
              </SubmitButton>
            </Form>
          </Card>
        )}
      </PageContainer>
    </UserLayout>
  );
};

export default ProfilePage; 