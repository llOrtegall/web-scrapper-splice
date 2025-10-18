import { proxyS3, searchSpliceGraphQL, processAudio } from '../controllers/splice.js';
import { authenticateToken } from '../middlewares/authToken.js';
import { Router } from 'express';

const routerSplice = Router();

// Ruta para proxy GraphQL
routerSplice.post('/graphql', searchSpliceGraphQL);
// Ruta para proxy S3
routerSplice.get('/s3', authenticateToken, proxyS3);
// process audio
routerSplice.get('/process', authenticateToken, processAudio);
export { routerSplice };