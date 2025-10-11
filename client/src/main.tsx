import { RouterProvider } from 'react-router';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import axios from 'axios';
import './index.css';

axios.defaults.baseURL = import.meta.env.VITE_API_URL ?? '/api'
axios.defaults.withCredentials = true;

import { Toaster } from 'sonner';
import { BrowserRouter } from './routes/index';
import { AuthProvider } from './context/auth/AuthContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={BrowserRouter} />
      <Toaster position="top-right" duration={5000} richColors />
    </AuthProvider>
  </StrictMode>,
)
