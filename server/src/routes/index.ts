import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import { listQuerySchema } from '../validators/user.schema';
import { listInvestors, listEntrepreneurs } from '../controllers/user.controller';

const api = Router();

api.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

api.use('/auth', authRoutes);
api.use('/users', userRoutes);

api.get('/investors', requireAuth, validate({ query: listQuerySchema }), listInvestors);
api.get('/entrepreneurs', requireAuth, validate({ query: listQuerySchema }), listEntrepreneurs);

export default api;
