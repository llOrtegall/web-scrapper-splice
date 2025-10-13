import { dowloadSample, downloadFile, getDownloadStatus } from "../controllers/dowload.js"
import { authenticateToken } from "../middlewares/authToken.js";
import { Router } from "express";

const dowloadRouter = Router();

// Iniciar descarga (no bloquea)
dowloadRouter.post('/download', authenticateToken, dowloadSample);

// Consultar estado de la descarga
dowloadRouter.get('/download/:id/status', getDownloadStatus);

// Descargar el audio cuando esté listo
dowloadRouter.get('/download/:id/file', authenticateToken, downloadFile);

export { dowloadRouter } 