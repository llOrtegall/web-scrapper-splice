import { useAuth } from '../context/auth/AuthContext';
import { Outlet } from 'react-router';
import { lazy } from 'react';

const LoginPage = lazy(() => import('@/pages/Login'));

function Root() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />
  }

  return <Outlet />
}

export default Root;  