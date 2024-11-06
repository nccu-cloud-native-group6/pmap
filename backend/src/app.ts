import express from 'express';
import { join } from 'path';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import YAML from 'yaml';

const app = express();
const port = process.env.PORT || 3000;

// Swagger API doc
const file  = fs.readFileSync(join(__dirname, '../docs/swagger.yaml'), 'utf8')
const swaggerDocument = YAML.parse(file)

  app.use(  '/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});