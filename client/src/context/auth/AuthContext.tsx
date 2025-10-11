import axios from "axios";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface User {
  id: string;
  username: string;
  email: string | null;
  rol: "admin" | "user";
}

interface AuthContext {
  isAuthenticated: boolean;
  user: User | null;
  login: (id: string, username: string, rol: "admin" | "user") => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContext | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // validar si existe cookie con name token 
    const cookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='));

    if (!cookie) {
      logout();
      return;
    };

    axios.get('/profile')
      .then(response => {
        if (response.status === 200 && response.data) {
          const { id, username, role } = response.data;
          login(id, username, role);
        }
      })
      .catch(error => {
        console.error(error);
      })
  }, [])

  const login = (id: string, username: string, rol: "admin" | "user") => {
    setIsAuthenticated(true);
    setUser({ id, username, email: null, rol });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    axios.post('/logout')
      .then(response => {
        if (response.status === 200) {
          console.log('User logged out successfully');
        }
      })
      .catch(error => {
        console.error(error);
      })
  };

  return (
    <AuthContext value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
