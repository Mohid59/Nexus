import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.schema';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many attempts. Please try again later.' } },
});

const router = Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), register);
router.post('/login', authLimiter, validate({ body: loginSchema }), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, validate({ body: forgotPasswordSchema }), forgotPassword);
router.post('/reset-password', authLimiter, validate({ body: resetPasswordSchema }), resetPassword);

export default router;
