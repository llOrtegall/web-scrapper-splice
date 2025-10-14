import { AdminRoute } from '@/components/ProtectedRoute';
import DownloaderSample from '@/components/Dowloader';
import { createBrowserRouter } from 'react-router';
import AdminPanel from '@/components/AdminPanel';
import LoginPage from '@/pages/Login';
import Root from './Root';

export const BrowserRouter = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <div>Home Page</div>
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