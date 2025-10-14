import { RouterProvider } from 'react-router';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import './index.css';

axios.defaults.baseURL = import.meta.env.VITE_API_URL ?? '/api'
axios.defaults.withCredentials = true;

import { BrowserRouter } from './routes/index';
import { AuthProvider } from '@/context/auth/AuthContext';
import { ThemeProvider } from '@/context/theme/ThemeProvider';
import { Toaster } from 'sonner';


createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={BrowserRouter} />
      <Toaster position="top-right" duration={5000} richColors />
    </ThemeProvider>
  </AuthProvider>
)
