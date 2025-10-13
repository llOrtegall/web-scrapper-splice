import { useCallback } from 'react';
import axios from 'axios';

interface LoginCredentials {
  username: string;
  password: string;
}

export const useAuthActions = () => {
  const login = useCallback(async (credentials: LoginCredentials) => {
    const { data } = await axios.post('/login', credentials);
    return data;
  }, []);

  const logout = useCallback(async () => {
    const { data } = await axios.post('/logout');
    return data;
  }, []);

  const getProfile = useCallback(async () => {
    const { data } = await axios.get('/profile');
    return data;
  }, []);

  return {
    login,
    logout,
    getProfile
  };
};
