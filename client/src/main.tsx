import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App.tsx';
import axios from 'axios';
import './index.css';

axios.defaults.baseURL = import.meta.env.VITE_API_URL ?? '/api'
axios.defaults.withCredentials = true;

import { AuthProvider } from './context/auth/AuthContext.tsx'
import { Toaster } from 'sonner';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster position="top-right" duration={5000} richColors />
    </AuthProvider>
  </StrictMode>,
)
