// import { authenticateToken } from "../middlewares/authToken.js";
import { getGeneralMetrics } from "../controllers/metrics.js";

import { Router } from "express";

export const metricsRouter = Router();

metricsRouter.get("/metrics/general", getGeneralMetrics);
