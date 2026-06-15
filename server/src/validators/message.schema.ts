import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const sendMessageSchema = z.object({
  to: objectId,
  content: z.string().min(1).max(5000),
});

export const userIdParam = z.object({ id: objectId });
