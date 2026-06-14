import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const docIdParam = z.object({ id: objectId });

export const signSchema = z.object({
  signature: z.string().min(20).startsWith('data:image/', 'Signature must be an image data URL'),
});

export const shareSchema = z.object({
  userIds: z.array(objectId).min(1).max(50),
});
