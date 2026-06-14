import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Routing guards
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { RoleRoute } from './components/routing/RoleRoute';
import { RouteLoader } from './components/routing/RouteLoader';

// Layouts
import { DashboardLayout } from './components/layout/DashboardLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Dashboard Pages
import { EntrepreneurDashboard } from './pages/dashboard/EntrepreneurDashboard';
import { InvestorDashboard } from './pages/dashboard/InvestorDashboard';

// Profile Pages
import { EntrepreneurProfile } from './pages/profile/EntrepreneurProfile';
import { InvestorProfile } from './pages/profile/InvestorProfile';

// Feature Pages
import { InvestorsPage } from './pages/investors/InvestorsPage';
import { EntrepreneursPage } from './pages/entrepreneurs/EntrepreneursPage';
import { MessagesPage } from './pages/messages/MessagesPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { DocumentsPage } from './pages/documents/DocumentsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { HelpPage } from './pages/help/HelpPage';
import { DealsPage } from './pages/deals/DealsPage';

// Chat Pages
import { ChatPage } from './pages/chat/ChatPage';

// Meetings
import { MeetingsPage } from './pages/meetings/MeetingsPage';

// Video call
import { CallPage } from './pages/call/CallPage';

// Logged-in → role dashboard; otherwise → login.
const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <RouteLoader />;
  return <Navigate to={user ? `/dashboard/${user.role}` : '/login'} replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#FFFFFF',
            color: '#1C1B22',
            border: '1px solid #E6E4DC',
            borderRadius: '0.75rem',
            boxShadow: '0 18px 40px -16px rgba(28,27,34,0.22)',
            fontSize: '0.875rem',
            padding: '10px 14px',
          },
          success: { iconTheme: { primary: '#0F766E', secondary: '#FFFFFF' } },
          error: { iconTheme: { primary: '#DC2626', secondary: '#FFFFFF' } },
        }}
      />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Authenticated routes */}
          <Route element={<ProtectedRoute />}>
            {/* Full-screen video call (no dashboard shell) */}
            <Route path="/call/:roomId" element={<CallPage />} />

            {/* Role-specific dashboards */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route element={<RoleRoute role="entrepreneur" />}>
                <Route path="entrepreneur" element={<EntrepreneurDashboard />} />
              </Route>
              <Route element={<RoleRoute role="investor" />}>
                <Route path="investor" element={<InvestorDashboard />} />
              </Route>
            </Route>

            {/* Profiles */}
            <Route path="/profile" element={<DashboardLayout />}>
              <Route path="entrepreneur/:id" element={<EntrepreneurProfile />} />
              <Route path="investor/:id" element={<InvestorProfile />} />
            </Route>

            {/* Feature areas */}
            <Route path="/investors" element={<DashboardLayout />}>
              <Route index element={<InvestorsPage />} />
            </Route>
            <Route path="/entrepreneurs" element={<DashboardLayout />}>
              <Route index element={<EntrepreneursPage />} />
            </Route>
            <Route path="/messages" element={<DashboardLayout />}>
              <Route index element={<MessagesPage />} />
            </Route>
            <Route path="/meetings" element={<DashboardLayout />}>
              <Route index element={<MeetingsPage />} />
            </Route>
            <Route path="/notifications" element={<DashboardLayout />}>
              <Route index element={<NotificationsPage />} />
            </Route>
            <Route path="/documents" element={<DashboardLayout />}>
              <Route index element={<DocumentsPage />} />
            </Route>
            <Route path="/settings" element={<DashboardLayout />}>
              <Route index element={<SettingsPage />} />
            </Route>
            <Route path="/help" element={<DashboardLayout />}>
              <Route index element={<HelpPage />} />
            </Route>
            <Route path="/deals" element={<DashboardLayout />}>
              <Route index element={<DealsPage />} />
            </Route>

            {/* Chat */}
            <Route path="/chat" element={<DashboardLayout />}>
              <Route index element={<ChatPage />} />
              <Route path=":userId" element={<ChatPage />} />
            </Route>
          </Route>

          {/* Root + catch-all */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
