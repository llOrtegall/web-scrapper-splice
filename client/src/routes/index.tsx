import { createBrowserRouter } from 'react-router';
import Root from './Root';
import DownloaderSample from '@/components/Dowloader';

export const BrowserRouter = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <DownloaderSample />
      },
    ]
  }
]);