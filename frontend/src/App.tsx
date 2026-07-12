import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import CampaignsPage from './pages/CampaignsPage';
import ConversationsPage from './pages/ConversationsPage';
import TemplatesPage from './pages/TemplatesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AiPage from './pages/AiPage';
import SettingsPage from './pages/SettingsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="conversations" element={<ConversationsPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="ai" element={<AiPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
