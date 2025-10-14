import { createBrowserRouter } from 'react-router';
import Root from './Root';
import DownloaderSample from '@/components/Dowloader';
import AdminPanel from '@/components/AdminPanel';

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
        element: <AdminPanel />
      }
    ]
  }
]);