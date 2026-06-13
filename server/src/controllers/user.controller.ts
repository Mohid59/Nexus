import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { User } from '../models/User';
import { UserRole } from '../types';
import { ListQuery } from '../validators/user.schema';

const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new AppError(404, 'User not found');
  res.json({ user: user.toJSON() });
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user!.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new AppError(404, 'User not found');
  res.json({ user: user.toJSON() });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError(404, 'User not found');
  res.json({ user: user.toJSON() });
});

async function listByRole(role: UserRole, query: ListQuery, res: Response): Promise<void> {
  const { page, limit, search, industry } = query;

  const filter: Record<string, unknown> = { role };
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { name: rx },
      { bio: rx },
      { startupName: rx },
      { industry: rx },
      { pitchSummary: rx },
    ];
  }
  if (industry) filter.industry = new RegExp(`^${escapeRegex(industry)}$`, 'i');

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({
    data: items.map((u) => u.toJSON()),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export const listInvestors = asyncHandler(async (req, res) => {
  await listByRole('investor', req.query as unknown as ListQuery, res);
});

export const listEntrepreneurs = asyncHandler(async (req, res) => {
  await listByRole('entrepreneur', req.query as unknown as ListQuery, res);
});
