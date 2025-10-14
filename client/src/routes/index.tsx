import { AdminRoute } from '@/components/ProtectedRoute';
import DownloaderSample from '@/components/Dowloader';
import { createBrowserRouter } from 'react-router';
import AdminPanel from '@/components/AdminPanel';
import LoginPage from '@/pages/Login';
import Root from './Root';

import SearchSpliceSample from '@/pages/SearchSplice';

export const BrowserRouter = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <SearchSpliceSample />
      },
      {
        path: 'downloader',
        element: <DownloaderSample />
      },
      {
        path: '/admin-panel',
        element: (
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        )
      }
    ]
  },
  {
    path: '/login',
    element: <LoginPage />
  }
]);