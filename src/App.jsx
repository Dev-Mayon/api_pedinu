import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext';
import { CatalogThemeProvider } from '@/contexts/CatalogThemeContext';
import { CustomerProvider } from '@/contexts/CustomerContext';

import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import UpdatePasswordPage from '@/pages/UpdatePasswordPage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Dashboard from '@/pages/Dashboard';
import MenuManager from '@/pages/MenuManager';
import ProductsPage from '@/pages/ProductsPage';
import WelcomePage from '@/pages/WelcomePage';
import Kitchen from '@/pages/Kitchen';
import Inventory from '@/pages/Inventory';
import WhatsAppBot from '@/pages/WhatsAppBot';
import Marketing from '@/pages/Marketing';
import Settings from '@/pages/Settings';
import PublicDigitalMenu from '@/pages/PublicCatalog';
import FinancialPage from '@/pages/FinancialPage';
import OrderStatusPage from '@/pages/OrderStatusPage';
import MyOrdersPage from '@/pages/MyOrdersPage';
import MyAddressesPage from '@/pages/MyAddressesPage';
import CustomersPage from '@/pages/Customers';
import SubscriptionPage from '@/pages/SubscriptionPage';
import ChangeDocumentPage from '@/pages/ChangeDocumentPage';

import AdminLayout from '@/components/admin/AdminLayout';
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminWithdrawalsPage from '@/pages/admin/AdminWithdrawalsPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';
import AdminWhatsAppSettingsPage from '@/pages/admin/AdminWhatsAppSettingsPage';

const ADMIN_LOGIN_PATH = "/admin-273598secret{userMessage}!@/login";

function LoadingSpinner({ message = "Carregando..." }) {
  return (
    <div className="fixed inset-0 flex flex-col h-screen items-center justify-center bg-gray-100 text-gray-800 z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
      <p className="text-lg font-medium">{message}</p>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <LoadingSpinner message="Carregando..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AdminProtectedRoute({ children }) {
  const { adminUser, loading } = useAdminAuth();

  if (loading) {
    return <LoadingSpinner message="Carregando painel admin..." />;
  }

  if (!adminUser) {
    return <Navigate to={ADMIN_LOGIN_PATH} replace />;
  }

  return children;
}

function AdminPublicRoute({ children }) {
  const { adminUser, loading } = useAdminAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (adminUser) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

function AppBody() {
  return (
    <div className="min-h-screen"> 
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/update-password" element={<UpdatePasswordPage />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/menu" element={<ProtectedRoute><DashboardLayout><MenuManager /></DashboardLayout></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><DashboardLayout><ProductsPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/welcome" element={<ProtectedRoute><DashboardLayout><WelcomePage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/kitchen" element={<ProtectedRoute><DashboardLayout><Kitchen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><DashboardLayout><Inventory /></DashboardLayout></ProtectedRoute>} />
          <Route path="/whatsapp" element={<ProtectedRoute><DashboardLayout><WhatsAppBot /></DashboardLayout></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><DashboardLayout><CustomersPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/marketing" element={<ProtectedRoute><DashboardLayout><Marketing /></DashboardLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
          <Route path="/settings/change-document" element={<ProtectedRoute><DashboardLayout><ChangeDocumentPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/financial" element={<ProtectedRoute><DashboardLayout><FinancialPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/planos" element={<ProtectedRoute><DashboardLayout><SubscriptionPage /></DashboardLayout></ProtectedRoute>} />
          
          <Route path="/cardapio/:businessSlug" element={
            <CustomerProvider>
              <CatalogThemeProvider>
                <PublicDigitalMenu />
              </CatalogThemeProvider>
            </CustomerProvider>
          } />
          
          <Route path="/order/status/:orderId" element={
              <CustomerProvider>
                  <OrderStatusPage />
              </CustomerProvider>
          } />

          <Route path="/my-orders" element={
            <CustomerProvider>
              <MyOrdersPage />
            </CustomerProvider>
          } />

          <Route path="/my-addresses" element={
            <CustomerProvider>
              <MyAddressesPage />
            </CustomerProvider>
          } />

          {/* Admin Routes */}
          <Route path={ADMIN_LOGIN_PATH} element={<AdminPublicRoute><AdminLoginPage /></AdminPublicRoute>} />
          <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminLayout><AdminDashboardPage /></AdminLayout></AdminProtectedRoute>} />
          <Route path="/admin/users" element={<AdminProtectedRoute><AdminLayout><AdminUsersPage /></AdminLayout></AdminProtectedRoute>} />
          <Route path="/admin/withdrawals" element={<AdminProtectedRoute><AdminLayout><AdminWithdrawalsPage /></AdminLayout></AdminProtectedRoute>} />
          <Route path="/admin/settings" element={<AdminProtectedRoute><AdminLayout><AdminSettingsPage /></AdminLayout></AdminProtectedRoute>} />
          <Route path="/admin/settings/whatsapp" element={<AdminProtectedRoute><AdminLayout><AdminWhatsAppSettingsPage /></AdminLayout></AdminProtectedRoute>} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin/login" element={<Navigate to={ADMIN_LOGIN_PATH} replace />} />
        </Routes>
      </Suspense>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AdminAuthProvider>
          <AuthProvider>
            <DataProvider>
              <AppBody />
            </DataProvider>
          </AuthProvider>
        </AdminAuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;