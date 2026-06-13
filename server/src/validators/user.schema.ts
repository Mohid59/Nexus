import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    name: z.string().min(2).max(80).optional(),
    bio: z.string().max(2000).optional(),
    avatarUrl: z.string().url().or(z.literal('')).optional(),
    isOnline: z.boolean().optional(),

    // Entrepreneur
    startupName: z.string().max(120).optional(),
    pitchSummary: z.string().max(2000).optional(),
    fundingNeeded: z.string().max(60).optional(),
    industry: z.string().max(80).optional(),
    location: z.string().max(120).optional(),
    foundedYear: z.number().int().min(1900).max(2100).optional(),
    teamSize: z.number().int().min(1).max(1_000_000).optional(),

    // Investor
    investmentInterests: z.array(z.string().max(60)).max(50).optional(),
    investmentStage: z.array(z.string().max(60)).max(50).optional(),
    portfolioCompanies: z.array(z.string().max(120)).max(200).optional(),
    totalInvestments: z.number().int().min(0).optional(),
    minimumInvestment: z.string().max(60).optional(),
    maximumInvestment: z.string().max(60).optional(),
  })
  .strict();

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  search: z.string().max(120).optional(),
  industry: z.string().max(80).optional(),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user id'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
