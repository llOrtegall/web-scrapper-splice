import { createContext, useContext, useState, type Dispatch, type ReactNode } from "react";

interface User {
  id: string;
  username: string;
  email: string | null;
  rol: "admin" | "user";
}

interface AuthContext {
  isAuthenticated: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContext | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => {
    setIsAuthenticated(true);
    setUser({
      id: "1",
      username: "Andrek52",
      email: null,
      rol: "user"
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
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
