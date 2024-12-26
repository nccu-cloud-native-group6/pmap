import express, { Request, Response } from 'express';
import 'reflect-metadata';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import YAML from 'yaml';
import { fileURLToPath } from 'url';
import { errorHandler } from './Middlewares/errorHandler.js';
import weatherRouter from './Router/weatherRouter.js';
import authRouter from './Router/authRouter.js';
import userRouter from './Router/reportRouter.js';
import imgRouter from './Router/imgRouter.js';
import logger from './Logger/index.js';
import cors from 'cors';
import { multerErrorHandling } from './Middlewares/multer.js';

const app = express();
const port = process.env.BACKEND_PORT;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Swagger API doc
const file = fs.readFileSync(
  path.resolve(__dirname, '../docs/swagger.yaml'),
  'utf8',
);
const swaggerDocument = YAML.parse(file);

app.use(cors());
app.use(express.json());
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/weather', weatherRouter);
app.use('/api/auth', authRouter);
app.use('/api/reports', userRouter);
app.use('/api/image', imgRouter);

app.get('/api/health', (req: Request, res: Response) => {
  res.send('Hello');
});
app.use(multerErrorHandling);
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
});
