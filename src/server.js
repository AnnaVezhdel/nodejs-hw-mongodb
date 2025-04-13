import express from 'express';
import cors from 'cors';
import path from 'node:path';
import * as fs from 'node:fs';

import { getEnvVar } from './utils/getEnvVar.js';

import authRouter from './routers/auth.js';
import contactsRouter from './routers/contacts.js';
import { logger } from './middlewares/logger.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import cookieParser from 'cookie-parser';
import swaggerUIExpress from 'swagger-ui-express';

export const setupServer = () => {
  const app = express();

  const swaggerDocument = JSON.parse(
    fs.readFileSync(path.resolve('docs', 'swagger.json'), 'utf-8'),
  );

  app.use(
    '/api-docs',
    swaggerUIExpress.serve,
    swaggerUIExpress.setup(swaggerDocument),
  );
  app.use('/uploads', express.static(path.resolve('src', 'uploads')));

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use(logger);

  app.use('/auth', authRouter);
  app.use('/contacts', contactsRouter);

  app.use(notFoundHandler);

  app.use(errorHandler);

  const port = Number(getEnvVar('PORT', 3000));

  app.listen(port, () => console.log(`Server is running on ${port} port`));
};
