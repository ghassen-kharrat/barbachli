import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { styled } from 'styled-components';
import { useCart } from '../features/cart/hooks/use-cart-query';
import { useAuthCheck, useLogout } from '../features/auth/hooks/use-auth-query';
import { useAuth } from '../provider/AuthProvider';
import { FaIcons } from '../pages/admin/components/Icons';
import ThemeToggle from '../components/ui/ThemeToggle';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import CategorySidebar from '../components/ui/CategorySidebar';
import { useLanguage } from '../provider/LanguageProvider';
// Icons are imported from the shared component

// Styles
const Header = styled.header`
  background-color: var(--header-bg);
  color: white;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: var(--box-shadow);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  
  @media (max-width: 576px) {
    padding: 0.75rem 0;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  
  @media (max-width: 576px) {
    padding: 0 1rem;
  }
`;

const Logo = styled(Link)`
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: white;
    opacity: 0.9;
  }
  
  @media (max-width: 576px) {
    font-size: 1.5rem;
  }
`;

const LogoImage = styled.img`
  height: 50px;
  
  @media (max-width: 576px) {
    height: 40px;
  }
  
  @media (max-width: 480px) {
    height: 36px;
  }
`;

const LogoText = styled.span`
  font-size: 0.9rem;
  margin-top: 3px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  background: linear-gradient(90deg, #3498db, #e74c3c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 576px) {
    font-size: 0.8rem;
    margin-top: 2px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
`;

const Nav = styled.nav<{ $isOpen: boolean }>`
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 992px) {
    position: fixed;
    top: 0;
    left: ${({ $isOpen }) => ($isOpen ? '0' : '-100%')};
    width: 275px;
    height: 100vh;
    background-color: var(--header-bg);
    flex-direction: column;
    padding: 5rem 2rem 2rem;
    transition: left 0.3s ease;
    z-index: 1001;
    box-shadow: ${({ $isOpen }) => ($isOpen ? 'var(--box-shadow)' : 'none')};
    overflow-y: auto; /* Allow scrolling on mobile menu */
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  font-size: 1.5rem;
  color: white;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 1002;
  padding: 0.5rem;
  
  @media (max-width: 992px) {
    display: block;
  }
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 0.5rem;
  position: relative;
  font-weight: 500;
  
  &:hover {
    color: var(--secondary-color);
  }
  
  &.active {
    color: var(--secondary-color);
    
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0.5rem;
      right: 0.5rem;
      height: 2px;
      background-color: var(--secondary-color);
    }
  }
  
  @media (max-width: 992px) {
    margin-bottom: 1rem;
    display: block;
    width: 100%;
    padding: 0.75rem 0.5rem;
    
    &.active:after {
      display: none;
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: white;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  display: none;
  
  @media (max-width: 992px) {
    display: block;
  }
`;

const SearchBar = styled.div`
  display: flex;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 0.5rem;
  width: 300px;
  transition: width 0.3s ease;
  
  @media (max-width: 1200px) {
    width: 250px;
  }
  
  @media (max-width: 992px) {
    display: none;
  }
`;

const MobileSearch = styled.div`
  display: none;
  padding: 0.5rem 0;
  width: 100%;
  
  @media (max-width: 992px) {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }
  
  form {
    width: 100%;
    display: flex;
    gap: 0.5rem;
  }
  
  input {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    color: var(--text-color);
    
    &:focus {
      outline: none;
      border-color: var(--accent-color);
    }
    
    @media (max-width: 576px) {
      padding: 0.6rem 0.75rem;
    }
  }
`;

const MobileThemeToggle = styled.div`
  display: none;
  margin-bottom: 1rem;
  
  @media (max-width: 992px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    width: 100%;
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  width: 100%;
  padding: 0 0.5rem;
  background-color: var(--card-bg);
  color: var(--text-color);
  border-radius: var(--border-radius);
  
  @media (max-width: 992px) {
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
  }
`;

const SearchButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--primary-color);
  padding: 0.25rem 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 992px) {
    background-color: var(--secondary-color);
    color: white;
    border-radius: var(--border-radius);
    padding: 0.5rem 0.75rem;
  }
  
  @media (max-width: 576px) {
    padding: 0.5rem;
  }
`;

const Icons = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
  
  @media (max-width: 576px) {
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.75rem;
  }
`;

const IconLink = styled(Link)`
  color: white;
  font-size: 1.3rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  
  &:hover {
    color: var(--secondary-color);
    transform: translateY(-2px);
  }
  
  @media (max-width: 576px) {
    font-size: 1.1rem;
  }
  
  span {
    @media (max-width: 480px) {
      display: none;
    }
  }
`;

const CartCount = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: var(--secondary-color);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  
  @media (max-width: 480px) {
    width: 18px;
    height: 18px;
    top: -6px;
    right: -6px;
    font-size: 0.65rem;
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
  
  &:hover {
    color: var(--secondary-color);
    transform: translateY(-2px);
  }
  
  @media (max-width: 576px) {
    font-size: 1.1rem;
  }
`;

const Main = styled.main`
  min-height: calc(100vh - 60px - 200px); // Adjust for header and footer
  padding: 2rem 0;
  
  @media (max-width: 768px) {
    padding: 1.5rem 0;
  }
  
  @media (max-width: 576px) {
    padding: 1rem 0;
    min-height: calc(100vh - 60px - 150px);
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  
  @media (max-width: 576px) {
    padding: 0 1rem;
  }
`;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 220px 1fr;
    gap: 1.5rem;
  }
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const Sidebar = styled.aside`
  position: sticky;
  top: 80px; /* Position below the header */
  height: fit-content;
  align-self: flex-start;
  
  @media (max-width: 992px) {
    display: none;
  }
`;

const Content = styled.div``;

const Footer = styled.footer`
  background-color: var(--footer-bg);
  color: white;
  padding: 3rem 0 1.5rem;
  
  @media (max-width: 768px) {
    padding: 2rem 0 1rem;
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }
`;

const FooterColumn = styled.div`
  margin-bottom: 1.5rem;
  
  @media (max-width: 576px) {
    margin-bottom: 2rem;
  }
`;

const FooterTitle = styled.h4`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 0.5rem;
  color: white;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 50px;
    height: 2px;
    background-color: var(--secondary-color);
  }
  
  @media (max-width: 576px) {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FooterLink = styled.li`
  margin-bottom: 0.8rem;
  
  a {
    color: var(--light-text);
    text-decoration: none;
    transition: color 0.3s ease;
    display: inline-block;
    
    &:hover {
      color: var(--secondary-color);
      transform: translateX(5px);
    }
  }
  
  @media (max-width: 576px) {
    margin-bottom: 0.6rem;
    
    a {
      font-size: 0.95rem;
    }
  }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 576px) {
    gap: 0.75rem;
  }
`;

const SocialIconLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--secondary-color);
    transform: translateY(-3px);
  }
  
  @media (max-width: 576px) {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  color: var(--light-text);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 576px) {
    margin-top: 1rem;
    padding-top: 1rem;
    font-size: 0.9rem;
  }
`;

const BackToTop = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--secondary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 99;
  
  &.visible {
    opacity: 1;
    visibility: visible;
  }
  
  &:hover {
    background-color: var(--accent-color);
    transform: translateY(-3px);
  }
  
  @media (max-width: 576px) {
    width: 36px;
    height: 36px;
    bottom: 15px;
    right: 15px;
    font-size: 0.9rem;
  }
`;

const ContactItem = styled.p`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0.7rem;
  color: var(--light-text);
  
  @media (max-width: 576px) {
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
  }
`;

const MobileOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout = ({ children }: UserLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data: cartData } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { mutate: logout } = useLogout();
  const { language, t } = useLanguage();
  
  // Show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debug for user and authentication state
  useEffect(() => {
    if (user) {
      console.log('UserLayout - User state:', user.email, 'Role:', user.role, 'isAuthenticated:', isAuthenticated);
    } else {
      console.log('UserLayout - User state: Not logged in, isAuthenticated:', isAuthenticated);
    }
  }, [user, isAuthenticated]);
  
  const handleLogout = () => {
    logout();
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };
  
  // Check if current page is products page to show sidebar
  const isProductsPage = location.pathname === '/products' || location.pathname.startsWith('/products?');
  const isHomePage = location.pathname === '/';
  const shouldShowSidebar = isProductsPage || isHomePage;
  
  return (
    <>
      <Header>
        <HeaderContent>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <MobileMenuButton onClick={() => setMobileMenuOpen(true)}>
              <FaIcons.FaBars />
            </MobileMenuButton>
            <Logo to="/">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <LogoImage src="/logo barbachli.png" alt="Barbachli" />
                <LogoText>Barbachli</LogoText>
              </div>
            </Logo>
          </div>
          
          <Nav $isOpen={mobileMenuOpen} className={language === 'ar' ? 'rtl-reverse' : ''}>
            <CloseButton onClick={() => setMobileMenuOpen(false)}>
              <FaIcons.FaTimes />
            </CloseButton>
            <NavLink 
              to="/" 
              className={isActive('/') ? 'active' : ''} 
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('home')}
            </NavLink>
            <NavLink 
              to="/products" 
              className={isActive('/products') && !location.pathname.includes('/cart') ? 'active' : ''}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('products')}
            </NavLink>
            {isAuthenticated && (
              <NavLink 
                to="/orders" 
                className={isActive('/orders') ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('my_orders')}
              </NavLink>
            )}
            
            <MobileThemeToggle>
              <ThemeToggle />
              <LanguageSwitcher />
            </MobileThemeToggle>
            
            <MobileSearch>
              <form onSubmit={handleSearch}>
                <SearchInput 
                  type="text" 
                  placeholder={t('search_product')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <SearchButton type="submit">
                  <FaIcons.FaSearch />
                </SearchButton>
              </form>
            </MobileSearch>
          </Nav>
          
          <form onSubmit={handleSearch}>
            <SearchBar>
              <SearchInput 
                type="text" 
                placeholder={t('search_product')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchButton type="submit">
                <FaIcons.FaSearch />
              </SearchButton>
            </SearchBar>
          </form>
          
          <Icons className={language === 'ar' ? 'rtl-reverse' : ''}>
            <ThemeToggle />
            <LanguageSwitcher />
            <IconLink to="/cart">
              <FaIcons.FaShoppingBag />
              {cartData?.data?.items && cartData.data.items.length > 0 && (
                <CartCount>{cartData.data.items.length}</CartCount>
              )}
            </IconLink>
            {isAuthenticated ? (
              <>
                <IconLink to="/profile" title={t('profile')}>
                  <FaIcons.FaUser />
                </IconLink>
                {user?.role === 'admin' && (
                  <IconLink to="/admin" title={t('admin')} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FaIcons.FaTachometerAlt />
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{t('admin')}</span>
                  </IconLink>
                )}
                <LogoutButton onClick={handleLogout} title={t('logout')}>
                  <FaIcons.FaSignOutAlt />
                </LogoutButton>
              </>
            ) : (
              <>
                <IconLink to="/login" title={t('login')} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaIcons.FaSignInAlt />
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{t('login')}</span>
                </IconLink>
                <IconLink to="/register" title={t('register')} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaIcons.FaUserPlus />
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{t('register')}</span>
                </IconLink>
              </>
            )}
          </Icons>
        </HeaderContent>
      </Header>
      
      <Main>
        <Container>
          {shouldShowSidebar ? (
            <ContentWrapper>
              <Sidebar>
                <CategorySidebar />
              </Sidebar>
              <Content>
                {children}
              </Content>
            </ContentWrapper>
          ) : (
            children
          )}
        </Container>
      </Main>
      
      <Footer>
        <FooterContent>
          <FooterColumn>
            <FooterTitle>{t('about_us')}</FooterTitle>
            <p style={{ color: 'var(--light-text)', marginBottom: '1rem' }}>
              {t('about_us_text')}
            </p>
            <SocialIcons>
              <SocialIconLink href="#" aria-label="Facebook">
                <FaIcons.FaFacebook />
              </SocialIconLink>
              <SocialIconLink href="#" aria-label="Twitter">
                <FaIcons.FaTwitter />
              </SocialIconLink>
              <SocialIconLink href="#" aria-label="Instagram">
                <FaIcons.FaInstagram />
              </SocialIconLink>
              <SocialIconLink href="#" aria-label="LinkedIn">
                <FaIcons.FaLinkedin />
              </SocialIconLink>
            </SocialIcons>
          </FooterColumn>
          
          <FooterColumn>
            <FooterTitle>{t('categories')}</FooterTitle>
            <FooterLinks>
              <FooterLink><Link to="/products?category=Électronique">{t('electronics')}</Link></FooterLink>
              <FooterLink><Link to="/products?category=Mode">{t('fashion')}</Link></FooterLink>
              <FooterLink><Link to="/products?category=Maison">{t('home_garden')}</Link></FooterLink>
              <FooterLink><Link to="/products?category=Sports">{t('sports')}</Link></FooterLink>
              <FooterLink><Link to="/products?category=Beauté">{t('beauty_health')}</Link></FooterLink>
            </FooterLinks>
          </FooterColumn>
          
          <FooterColumn>
            <FooterTitle>{t('useful_links')}</FooterTitle>
            <FooterLinks>
              <FooterLink><Link to="/">{t('home')}</Link></FooterLink>
              <FooterLink><Link to="/products">{t('products')}</Link></FooterLink>
              <FooterLink><Link to="/profile">{t('profile')}</Link></FooterLink>
              <FooterLink><Link to="/cart">{t('cart')}</Link></FooterLink>
              <FooterLink><Link to="/orders">{t('my_orders')}</Link></FooterLink>
            </FooterLinks>
          </FooterColumn>
          
          <FooterColumn>
            <FooterTitle>{t('contact')}</FooterTitle>
            <div>
              <ContactItem>
                <FaIcons.FaMapMarkerAlt /> 123 Rue du Commerce, 75001 Paris
              </ContactItem>
              <ContactItem>
                <FaIcons.FaPhone /> +33 1 23 45 67 89
              </ContactItem>
              <ContactItem>
                <FaIcons.FaEnvelope /> contact@e-shop.com
              </ContactItem>
            </div>
          </FooterColumn>
        </FooterContent>
        
        <Copyright>
          <p>&copy; {new Date().getFullYear()} E-Shop. {t('all_rights_reserved')}</p>
        </Copyright>
      </Footer>
      
      <BackToTop 
        onClick={scrollToTop} 
        className={showBackToTop ? 'visible' : ''}
        aria-label="Back to top"
      >
        <FaIcons.FaArrowUp />
      </BackToTop>
      
      <MobileOverlay $isOpen={mobileMenuOpen} onClick={() => setMobileMenuOpen(false)}>
        {/* Mobile menu overlay content */}
      </MobileOverlay>
    </>
  );
};

export default UserLayout; 