import { useAuth } from '../context/auth/AuthContext';
import { lazy } from 'react';

const LoginPage = lazy(() => import('@/pages/Login'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));

function Root() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />
  }

  return <Dashboard />;
}

export default Root;  