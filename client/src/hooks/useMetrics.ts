import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// Tipos para las respuestas de métricas
export interface DailyMetric {
  date: string;
  plays: number;
  downloads: number;
  processes: number;
  activeUsers: number;
}

export interface MonthlyMetric {
  monthStart: string;
  plays: number;
  downloads: number;
  processes: number;
  activeUsers: number;
}

export interface UserMetrics {
  username: string;
  period: string;
  daysAnalyzed: number;
  totals: {
    plays: number;
    downloads: number;
    processes: number;
    activeDays: number;
  };
  averages: {
    playsPerDay: number;
    downloadsPerDay: number;
    processesPerDay: number;
  };
  ranking: {
    position: number;
    totalUsers: number;
  };
  dailyActivity: Array<{
    dateSave: string;
    countPlay: number;
    countDownload: number;
    countProcess: number;
  }>;
}

interface DailyMetricsResponse {
  period: string;
  data: DailyMetric[];
}

interface MonthlyMetricsResponse {
  period: string;
  data: MonthlyMetric[];
}

/**
 * Hook para obtener métricas diarias (GLOBALES - todos los usuarios)
 */
export function useDailyMetrics() {
  const [data, setData] = useState<DailyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<DailyMetricsResponse>("/metrics/daily");
      setData(response.data.data);
    } catch (err) {
      const errorMsg = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : "Error desconocido al cargar métricas diarias";
      setError(errorMsg);
      console.error("Error fetching daily metrics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { data, loading, error, refetch: fetchMetrics };
}

/**
 * Hook para obtener métricas mensuales (GLOBALES - todos los usuarios)
 */
export function useMonthlyMetrics() {
  const [data, setData] = useState<MonthlyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<MonthlyMetricsResponse>("/metrics/monthly");
      setData(response.data.data);
    } catch (err) {
      const errorMsg = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : "Error desconocido al cargar métricas mensuales";
      setError(errorMsg);
      console.error("Error fetching monthly metrics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { data, loading, error, refetch: fetchMetrics };
}

/**
 * Hook para obtener métricas de un usuario específico
 */
export function useUserMetrics(username: string, period: "day" | "week" | "month" = "month") {
  const [data, setData] = useState<UserMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    if (!username) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<UserMetrics>(`/metrics/user/${username}`, {
        params: { period }
      });
      setData(response.data);
    } catch (err) {
      const errorMsg = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : "Error desconocido al cargar métricas del usuario";
      setError(errorMsg);
      console.error("Error fetching user metrics:", err);
    } finally {
      setLoading(false);
    }
  }, [username, period]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { data, loading, error, refetch: fetchMetrics };
}
