import { lazy, Suspense } from 'react';

import { useAuth } from '../context/auth/AuthContext';
import Loading from '../components/ui/Loading';

const LoginPage = lazy(() => import('../components/LoginForm'));
const Layout = lazy(() => import('./Layout'));

function Root() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Suspense fallback={<Loading />}>
        <LoginPage />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<Loading />}>
      <Layout />
    </Suspense>
  );
}

export default Root;