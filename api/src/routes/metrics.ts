// import { authenticateToken } from "../middlewares/authToken.js";
import { getGeneralMetrics, getUsersMonthMetrics } from "../controllers/metrics.js";

import { Router } from "express";

export const metricsRouter = Router();

metricsRouter.get("/metrics/general", getGeneralMetrics);

metricsRouter.post("/metrics/monthUsers", getUsersMonthMetrics)
