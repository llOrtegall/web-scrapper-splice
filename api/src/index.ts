import { cleanAudiosFolder } from './utils/funtions';
import { dowloadRouter} from './routes/dowload'
import express from 'express';
import cors from 'cors';

const PORT = process.env.PORT || 4000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.status(200).send('API is healthy');
});

app.use('/api/v1/download', dowloadRouter);

cleanAudiosFolder().then(() => {
  app.listen(PORT, () => {
    console.log(`API server is running on port http://localhost:${PORT}`);
  });
});