import { authenticateToken } from "../middlewares/authToken.js";
import { 
  getMetrics, 
  getDailyMetrics, 
  getWeeklyMetrics, 
  getMonthlyMetrics,
  getUserMetrics,
  getTopUsers
} from "../controllers/metrics.js";
import { Router } from "express";

export const metricsRouter = Router();

/**
 * Rutas de métricas - todas protegidas con autenticación
 */

// Métricas generales con opción de filtrar por período y usuario
metricsRouter.get("/metrics", authenticateToken, getMetrics);

// Métricas agrupadas por día (últimos 30 días)
metricsRouter.get("/metrics/daily", authenticateToken, getDailyMetrics);

// Métricas agrupadas por semana (últimos 30 días)
metricsRouter.get("/metrics/weekly", authenticateToken, getWeeklyMetrics);

// Métricas agrupadas por mes (último mes)
metricsRouter.get("/metrics/monthly", authenticateToken, getMonthlyMetrics);

// Métricas detalladas de un usuario específico
metricsRouter.get("/metrics/user/:username", authenticateToken, getUserMetrics);

// Top usuarios por actividad
metricsRouter.get("/metrics/top-users", authenticateToken, getTopUsers);