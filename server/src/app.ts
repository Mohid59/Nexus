import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { isProd, CLIENT_ORIGINS } from './config/env';
import api from './routes';
import { notFound, errorHandler } from './middleware/errorHandler';
import { swaggerSpec } from './docs/swagger';
import { stripeWebhook } from './controllers/payment.controller';

export function createApp(): Application {
  const app = express();

  app.set('trust proxy', 1);

  // contentSecurityPolicy disabled so the bundled Swagger UI assets load; this is a JSON API.
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: CLIENT_ORIGINS, credentials: true }));

  // Stripe webhook needs the raw body for signature verification — mount before express.json.
  app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(mongoSanitize());
  if (!isProd) app.use(morgan('dev'));

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use('/api', api);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
