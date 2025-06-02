import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { styled } from 'styled-components';
import { FaIcons } from '../pages/admin/components/Icons';
import { useLogout } from '../features/auth/hooks/use-auth-query';
import { useAuthCheck } from '../features/auth/hooks/use-auth-query';
import ThemeToggle from '../components/ui/ThemeToggle';

// Styles
const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--light-bg);
`;

const Sidebar = styled.aside<{ $isOpen: boolean }>`
  width: 260px;
  background-color: var(--primary-color);
  color: white;
  padding: 1.5rem 0;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  transition: transform 0.3s ease-in-out;
  z-index: 1000;
  overflow-y: auto;
  
  @media (max-width: 992px) {
    transform: ${({ $isOpen }) => $isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    box-shadow: ${({ $isOpen }) => $isOpen ? '0 0 20px rgba(0, 0, 0, 0.2)' : 'none'};
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1.5rem;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: white;
    opacity: 0.9;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  display: none;
  
  @media (max-width: 992px) {
    display: block;
  }
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MenuItem = styled.li`
  margin-bottom: 0.5rem;
`;

const MenuLink = styled(Link)<{ $active: string }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1.5rem;
  color: ${({ $active }) => $active === 'true' ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  text-decoration: none;
  background-color: ${({ $active }) => $active === 'true' ? 'var(--secondary-color)' : 'transparent'};
  transition: var(--transition);
  border-left: 4px solid transparent;
  border-left-color: ${({ $active }) => $active === 'true' ? 'white' : 'transparent'};
  
  &:hover {
    background-color: ${({ $active }) => $active === 'true' ? 'var(--secondary-color)' : 'rgba(255, 255, 255, 0.1)'};
    border-left-color: ${({ $active }) => $active === 'true' ? 'white' : 'var(--secondary-color)'};
  }
`;

const MenuIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  font-size: 1.1rem;
`;

const MenuText = styled.span`
  font-weight: 500;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  background: transparent;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: var(--transition);
  border-left: 4px solid transparent;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
    border-left-color: var(--secondary-color);
  }
`;

const Content = styled.div`
  flex: 1;
  margin-left: 260px;
  padding: 0;
  
  @media (max-width: 992px) {
    margin-left: 0;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--card-bg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 99;
  
  /* Add subtle border in dark mode */
  [data-theme="dark"] & {
    border-bottom: 1px solid var(--border-color);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  color: var(--primary-color);
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const OpenButton = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 1.5rem;
  cursor: pointer;
  margin-right: 1rem;
  display: none;
  
  @media (max-width: 992px) {
    display: block;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Avatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: var(--accent-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  /* Add glow effect in dark mode */
  [data-theme="dark"] & {
    box-shadow: 0 0 8px rgba(78, 158, 255, 0.4);
    background-color: var(--accent-color);
  }
`;

const UserName = styled.div`
  font-weight: 600;
  color: var(--text-color);
`;

const UserRole = styled.div`
  font-size: 0.8rem;
  color: var(--light-text);
`;

const Main = styled.main`
  padding: 2rem;
  background-color: var(--light-bg);
  min-height: calc(100vh - 70px);
`;

const PageContent = styled.div`
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: var(--box-shadow);
  padding: 1.5rem;
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  display: ${({ $isOpen }) => $isOpen ? 'block' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: logout } = useLogout();
  const { data: authData } = useAuthCheck();
  
  // Handle resize for mobile/desktop view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 992) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    // Set initial state based on window size
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth <= 992) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // User data
  const userData = authData?.data || { firstName: 'Admin', lastName: 'User', role: 'admin' };
  const userInitials = userData && userData.firstName && userData.lastName 
    ? `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`.toUpperCase() 
    : 'AU';
  
  // Render user information with proper defaults
  const renderUserInfo = () => {
    const firstName = userData?.firstName || 'Admin';
    const lastName = userData?.lastName || 'User';
    const role = userData?.role === 'admin' ? 'Administrateur' : 'Utilisateur';
    
    return (
      <div>
        <UserName>{firstName} {lastName}</UserName>
        <UserRole>{role}</UserRole>
      </div>
    );
  };

  return (
    <Container>
      <Sidebar $isOpen={isSidebarOpen}>
        <SidebarHeader>
          <Logo to="/admin">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src="/logo barbachli.png" alt="Barbachli" style={{ height: '40px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '0.8rem', 
                  marginTop: '3px', 
                  fontWeight: '600',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  background: 'linear-gradient(90deg, #3498db, #e74c3c)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>Barbachli</span>
                <span style={{ fontSize: '0.7rem', color: '#ffffff80' }}>Admin Panel</span>
              </div>
            </div>
          </Logo>
          <CloseButton onClick={() => setIsSidebarOpen(false)}>
            <FaIcons.FaTimes />
          </CloseButton>
        </SidebarHeader>
        
        <MenuList>
          <MenuItem>
            <MenuLink 
              to="/admin" 
              $active={(location.pathname === '/admin').toString()}
            >
              <MenuIcon><FaIcons.FaTachometerAlt /></MenuIcon>
              <MenuText>Tableau de bord</MenuText>
            </MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink 
              to="/admin/products" 
              $active={location.pathname.includes('/admin/products').toString()}
            >
              <MenuIcon><FaIcons.FaBox /></MenuIcon>
              <MenuText>Produits</MenuText>
            </MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink 
              to="/admin/categories" 
              $active={location.pathname.includes('/admin/categories').toString()}
            >
              <MenuIcon><FaIcons.FaTag /></MenuIcon>
              <MenuText>Catégories</MenuText>
            </MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink 
              to="/admin/carousel" 
              $active={location.pathname.includes('/admin/carousel').toString()}
            >
              <MenuIcon><FaIcons.FaImages /></MenuIcon>
              <MenuText>Carousel</MenuText>
            </MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink 
              to="/admin/orders" 
              $active={location.pathname.includes('/admin/orders').toString()}
            >
              <MenuIcon><FaIcons.FaShoppingCart /></MenuIcon>
              <MenuText>Commandes</MenuText>
            </MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink 
              to="/admin/users" 
              $active={location.pathname.includes('/admin/users').toString()}
            >
              <MenuIcon><FaIcons.FaUsers /></MenuIcon>
              <MenuText>Utilisateurs</MenuText>
            </MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink 
              to="/" 
              $active={'false'}
            >
              <MenuIcon><FaIcons.FaStore /></MenuIcon>
              <MenuText>Voir le site</MenuText>
            </MenuLink>
          </MenuItem>
          <MenuItem>
            <LogoutButton onClick={handleLogout}>
              <MenuIcon><FaIcons.FaSignOutAlt /></MenuIcon>
              <MenuText>Déconnexion</MenuText>
            </LogoutButton>
          </MenuItem>
        </MenuList>
      </Sidebar>
      
      <Content>
        <Header>
          <HeaderContent>
            <OpenButton onClick={() => setIsSidebarOpen(true)}>
              <FaIcons.FaBars />
            </OpenButton>
            <PageTitle>{title}</PageTitle>
          </HeaderContent>
          
          <UserInfo>
            <ThemeToggle />
            <Avatar>{userInitials}</Avatar>
            {renderUserInfo()}
          </UserInfo>
        </Header>
        
        <Main>
          <PageContent>{children}</PageContent>
        </Main>
      </Content>
      
      <Overlay $isOpen={isSidebarOpen} onClick={() => setIsSidebarOpen(false)} />
    </Container>
  );
};

export default AdminLayout; 