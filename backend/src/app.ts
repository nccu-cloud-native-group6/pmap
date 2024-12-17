import express, { Request, Response } from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import YAML from 'yaml';
import { fileURLToPath } from 'url';
import { errorHandler } from './Middlewares/errorHandler.js';
import userRouter from './Router/userRouter.js';
import weatherRouter from './Router/weatherRouter.js';

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
app.use(express.json());
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/1.0/user', userRouter);
app.use('/api/1.0/weather', weatherRouter);

app.get('/api/1.0/health', (req: Request, res: Response) => {
  res.send('Hello');
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
