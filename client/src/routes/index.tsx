import DownloaderSample from '../components/DowloaderSample';
import { createBrowserRouter } from 'react-router';
import Loading from '../components/ui/Loading';
import { Suspense } from 'react';
import Root from './Root';

export const BrowserRouter = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <Suspense fallback={<Loading />}>
          <DownloaderSample />
        </Suspense>
      },
    ]
  }
]);