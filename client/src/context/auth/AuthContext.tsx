import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuthActions } from "../../hooks/useAuthActions";

interface User {
  id: string;
  username: string;
  email: string | null;
  rol: "admin" | "user";
}

interface AuthContext {
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContext | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { login: loginApi, logout: logoutApi, getProfile } = useAuthActions();

  useEffect(() => {
    // // validar si existe cookie con name token
    // const cookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='));

    // if (!cookie) {
    //   setLoading(false);
    //   return;
    // }

    const checkAuth = async () => {
      try {
        const response = await getProfile();
        if (response?.user) {
          const { id, username, role } = response.user;
          setUser({ id, username, email: null, rol: role });
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Error silencioso, el usuario no está autenticado
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [getProfile]);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await loginApi(credentials);
      if (response?.user) {
        const { id, username, role } = response.user;
        setUser({ id, username, email: null, rol: role });
        setIsAuthenticated(true);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      setIsAuthenticated(false);
      setUser(null);

      // Limpiar cookie
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    }
  };

  return (
    <AuthContext value={{ isAuthenticated, user, login, logout, loading }}>
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
