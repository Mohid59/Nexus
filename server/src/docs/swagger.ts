import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../config/env';

/**
 * Base OpenAPI definition. Endpoint paths are documented via JSDoc `@openapi`
 * annotations in the route files and expanded across phases (full coverage in Phase 3).
 */
export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Nexus API',
      version: '0.1.0',
      description: 'Investor & Entrepreneur collaboration platform — REST API.',
    },
    servers: [{ url: `http://localhost:${env.PORT}/api`, description: 'Local' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
});
