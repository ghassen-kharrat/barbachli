import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from './provider/ThemeProvider';
import { useLanguage, LanguageProvider } from './provider/LanguageProvider';

// User pages
import HomePage from './pages/user/HomePage';
import LoginPage from './pages/user/LoginPage';
import RegisterPage from './pages/user/RegisterPage';
import ProductsPage from './pages/user/ProductsPage';
import ProductDetailPage from './pages/user/ProductDetailPage';
import CartPage from './pages/user/CartPage';
import CheckoutPage from './pages/user/CheckoutPage';
import OrdersPage from './pages/user/OrdersPage';
import OrderDetailPage from './pages/user/OrderDetailPage';
import ProfilePage from './pages/user/ProfilePage';

// Admin pages
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/ProductsPage';
import AdminProductFormPage from './pages/admin/ProductFormPage';
import AdminOrdersPage from './pages/admin/OrdersPage';
import AdminOrderDetailPage from './pages/admin/OrderDetailPage';
import AdminUsersPage from './pages/admin/UsersPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import CategoryFormPage from './pages/admin/CategoryFormPage';
import CarouselPage from './pages/admin/CarouselPage';

// Auth provider
import { AuthProvider } from './provider/AuthProvider';
import RequireAuth from './provider/RequireAuth';
import { ThemeProvider } from './provider/ThemeProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
      retry: 1
    },
  },
});

// Wrapper component to apply theme to toasts
const ThemedApp = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            
            {/* User routes - no authentication required */}
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <RequireAuth requiredRole="admin">
                <AdminDashboardPage />
              </RequireAuth>
            } />
            <Route path="/admin/products" element={
              <RequireAuth requiredRole="admin">
                <AdminProductsPage />
              </RequireAuth>
            } />
            <Route path="/admin/products/new" element={
              <RequireAuth requiredRole="admin">
                <AdminProductFormPage />
              </RequireAuth>
            } />
            <Route path="/admin/products/:id" element={
              <RequireAuth requiredRole="admin">
                <AdminProductFormPage />
              </RequireAuth>
            } />
            <Route path="/admin/orders" element={
              <RequireAuth requiredRole="admin">
                <AdminOrdersPage />
              </RequireAuth>
            } />
            <Route path="/admin/orders/:id" element={
              <RequireAuth requiredRole="admin">
                <AdminOrderDetailPage />
              </RequireAuth>
            } />
            <Route path="/admin/users" element={
              <RequireAuth requiredRole="admin">
                <AdminUsersPage />
              </RequireAuth>
            } />
            <Route path="/admin/categories" element={
              <RequireAuth requiredRole="admin">
                <CategoriesPage />
              </RequireAuth>
            } />
            <Route path="/admin/categories/add" element={
              <RequireAuth requiredRole="admin">
                <CategoryFormPage />
              </RequireAuth>
            } />
            <Route path="/admin/categories/edit/:id" element={
              <RequireAuth requiredRole="admin">
                <CategoryFormPage />
              </RequireAuth>
            } />
            <Route path="/admin/carousel" element={
              <RequireAuth requiredRole="admin">
                <CarouselPage />
              </RequireAuth>
            } />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          <ToastContainer
            position="bottom-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={language === 'ar'}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={theme === 'dark' ? 'dark' : 'light'}
            limit={3}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ThemedApp />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
