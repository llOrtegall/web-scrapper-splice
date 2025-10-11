import { dowloadSample, downloadFile, getDownloadStatus } from "../controllers/dowload"
import { Router } from "express";

const dowloadRouter = Router();

// Iniciar descarga (no bloquea)
dowloadRouter.post('/download', dowloadSample);

// Consultar estado de la descarga
dowloadRouter.get('/download/:id/status', getDownloadStatus);

// Descargar el audio cuando esté listo
dowloadRouter.get('/download/:id/file', downloadFile);

export { dowloadRouter } 