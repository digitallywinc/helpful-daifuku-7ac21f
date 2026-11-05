import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

// Auth Protection
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';

// Layout
import { DashboardLayout } from './components/layout/DashboardLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Customer Pages
import { CustomerDashboardPage } from './pages/customer/CustomerDashboardPage';
import { AiChatPage } from './pages/customer/AiChatPage';
import { TicketsPage } from './pages/customer/TicketsPage';
import { CreateTicketPage } from './pages/customer/CreateTicketPage';
import { TicketDetailPage } from './pages/customer/TicketDetailPage';
import { FaqPage } from './pages/customer/FaqPage';
import { ProfilePage } from './pages/customer/ProfilePage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminTicketsPage } from './pages/admin/AdminTicketsPage';
import { AdminTicketDetailPage } from './pages/admin/AdminTicketDetailPage';
import { AdminFaqsPage } from './pages/admin/AdminFaqsPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminConversationsPage } from './pages/admin/AdminConversationsPage';

// 404
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected Customer Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<CustomerDashboardPage />} />
                <Route path="/chat" element={<AiChatPage />} />
                <Route path="/chat/:id" element={<AiChatPage />} />
                <Route path="/tickets" element={<TicketsPage />} />
                <Route path="/tickets/new" element={<CreateTicketPage />} />
                <Route path="/tickets/:id" element={<TicketDetailPage />} />
                <Route path="/faqs" element={<FaqPage />} />
                <Route path="/profile" element={<ProfilePage />} />

                {/* Admin Only Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/tickets"
                  element={
                    <AdminRoute>
                      <AdminTicketsPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/tickets/:id"
                  element={
                    <AdminRoute>
                      <AdminTicketDetailPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/faqs"
                  element={
                    <AdminRoute>
                      <AdminFaqsPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/customers"
                  element={
                    <AdminRoute>
                      <AdminCustomersPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/conversations"
                  element={
                    <AdminRoute>
                      <AdminConversationsPage />
                    </AdminRoute>
                  }
                />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

