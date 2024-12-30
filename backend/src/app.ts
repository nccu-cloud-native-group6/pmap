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
import subscriptionRouter from './Router/subscriptionRouter.js';
import userRouter from './Router/reportRouter.js';
import imgRouter from './Router/imgRouter.js';
import logger from './Logger/index.js';
import { multerErrorHandling } from './Middlewares/multer.js';
import { notificationService } from './Infrastructure/Service/notificationService.js';
import cors from 'cors';
import { reportService } from './Infrastructure/Service/reportService.js';
import promClient from 'prom-client';
const app = express();
const port = process.env.BACKEND_PORT;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 收集預設系統指標
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestCount = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status_code'],
});
// Swagger API doc
const file = fs.readFileSync(
  path.resolve(__dirname, '../docs/swagger.yaml'),
  'utf8',
);
const swaggerDocument = YAML.parse(file);

app.use(cors());
app.use(express.json());
// Middleware：紀錄每次request
app.use((req, res, next) => {
  res.on('finish', () => {
    const { method, path } = req;
    const { statusCode } = res;
    httpRequestCount.labels(method, path, statusCode.toString()).inc();
  });
  next();
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/weather', weatherRouter);
app.use('/api/auth', authRouter);
app.use('/api/reports', userRouter);
app.use('/api/image', imgRouter);
app.use('/api/users/:userId/subscriptions', subscriptionRouter);

app.get('/api/health', (req: Request, res: Response) => {
  res.send('Hello');
});
// /metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
app.use(multerErrorHandling);
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
});

notificationService.startSchedler();

reportService.startReportTriggerWeatherComputing();
