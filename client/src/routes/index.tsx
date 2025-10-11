import { createBrowserRouter } from 'react-router';
import Loading from '../components/ui/Loading';
import { lazy, Suspense } from 'react';
import Root from './Root';

const MainPage = lazy(() => import('../components/DowloaderSample'));

export const BrowserRouter = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element:
        <Suspense fallback={<Loading />}>
          <MainPage />
        </Suspense>
      },
    ]
  }
]);