import { cleanAudiosFolder } from './utils/funtions.js';
import { connPostgreSQL } from './database/connPg.js';
import { dowloadRouter} from './routes/dowload.js';
import { routerUsers } from './routes/user.r.js';
import cookieParser from 'cookie-parser';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

const PORT = process.env.PORT || 4000;
const app = express();

app.use(cors({
  origin: process.env.ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.status(200).send('API is healthy');
});

app.use('/api/v1', dowloadRouter);
app.use('/api/v1', routerUsers);

cleanAudiosFolder().then(() => {
  app.listen(PORT, () => {
    console.log(`API server is running on port http://localhost:${PORT}`);
  });
});


connPostgreSQL.authenticate().then(() => {
  console.log('PostgreSQL connection has been established successfully.');
}).catch((error) => {
  console.error('Unable to connect to the database:', error);
});