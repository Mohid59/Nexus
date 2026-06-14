import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  role: z.enum(['entrepreneur', 'investor']),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Invalid token'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const verify2faSchema = z.object({
  pendingToken: z.string().min(10),
  code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
