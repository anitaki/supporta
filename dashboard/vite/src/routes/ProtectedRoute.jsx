import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { user, token, loading } = useAuth();
  if (loading) return null
  if (!user || !token) return <Navigate to="/auth/login" replace />;

  return <Outlet />;
}
