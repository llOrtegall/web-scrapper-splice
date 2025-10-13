import { useAuth } from '../context/auth/AuthContext';
import { Outlet } from 'react-router';

import LoginForm from '../components/LoginForm';

function Root() {
  const { user } = useAuth();

  if (!user) {
    return <LoginForm />
  }

  return <Outlet />
}

export default Root;  