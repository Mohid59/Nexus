import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const amountSchema = z.object({
  amount: z.number().positive().max(1_000_000),
});

export const transferSchema = z.object({
  to: objectId,
  amount: z.number().positive().max(1_000_000),
  note: z.string().max(200).optional(),
});

export const listTxQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type TransferInput = z.infer<typeof transferSchema>;
export type ListTxQuery = z.infer<typeof listTxQuery>;
