import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export interface User {
  id: string;
  username: string;
  email?: string;
  rol: "admin" | "user";
  state: boolean;
}

interface UsersResponse {
  users: User[];
}

/**
 * Hook para obtener la lista de todos los usuarios
 */
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<UsersResponse>("/users");
      setUsers(response.data.users || []);
    } catch (err) {
      const errorMsg = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : "Error desconocido al cargar usuarios";
      setError(errorMsg);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
}
