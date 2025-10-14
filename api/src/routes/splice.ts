import { proxyS3, searchSpliceGraphQL } from '../controllers/splice.js';
import { Router } from 'express';

const routerSplice = Router();

// Ruta para proxy GraphQL
routerSplice.post('/graphql', searchSpliceGraphQL);
// Ruta para proxy S3
routerSplice.get('/s3', proxyS3);

export { routerSplice };