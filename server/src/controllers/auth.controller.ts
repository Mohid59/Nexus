import crypto from 'crypto';
import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { User, IUser } from '../models/User';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signPendingToken,
  verifyPendingToken,
} from '../utils/tokens';
import { setRefreshCookie, clearRefreshCookie, REFRESH_COOKIE } from '../utils/cookies';
import { sendPasswordResetEmail, sendOtpEmail } from '../utils/mailer';
import { env, isProd } from '../config/env';
import { RegisterInput, LoginInput } from '../validators/auth.schema';

/** Signs an access token, sets the refresh cookie, and returns { accessToken, user }. */
function issueSession(res: Response, user: IUser, statusCode = 200): void {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, tv: user.tokenVersion });
  setRefreshCookie(res, refreshToken);
  res.status(statusCode).json({ accessToken, user: user.toJSON() });
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body as RegisterInput;

  const existing = await User.findOne({ email });
  if (existing) throw new AppError(409, 'An account with this email already exists');

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff`;
  const user = await User.create({ name, email, password, role, avatarUrl, isOnline: true });

  issueSession(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body as LoginInput;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError(401, 'Invalid email or password');
  }

  if (user.twoFactorEnabled) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    user.twoFactorCode = crypto.createHash('sha256').update(code).digest('hex');
    user.twoFactorExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    await sendOtpEmail(user.email, code);
    res.status(200).json({
      twoFactorRequired: true,
      pendingToken: signPendingToken(user.id),
      ...(isProd ? {} : { devCode: code }),
    });
    return;
  }

  issueSession(res, user, 200);
});

export const verifyTwoFactor = asyncHandler(async (req, res) => {
  const { pendingToken, code } = req.body as { pendingToken: string; code: string };

  let payload: { sub: string };
  try {
    payload = verifyPendingToken(pendingToken);
  } catch {
    throw new AppError(401, 'Verification session expired. Please log in again.');
  }

  const user = await User.findById(payload.sub).select('+twoFactorCode +twoFactorExpires');
  if (!user || !user.twoFactorCode || !user.twoFactorExpires) {
    throw new AppError(400, 'No pending verification for this account');
  }
  if (user.twoFactorExpires.getTime() < Date.now()) {
    throw new AppError(400, 'Code expired. Please log in again.');
  }
  const hashed = crypto.createHash('sha256').update(code).digest('hex');
  if (hashed !== user.twoFactorCode) {
    throw new AppError(401, 'Invalid verification code');
  }

  user.twoFactorCode = undefined;
  user.twoFactorExpires = undefined;
  await user.save({ validateBeforeSave: false });

  issueSession(res, user, 200);
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (!token) throw new AppError(401, 'No refresh token provided');

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(payload.sub);
  if (!user || user.tokenVersion !== payload.tv) {
    throw new AppError(401, 'Refresh token has been revoked');
  }

  // Rotate: a fresh refresh token is issued on every successful refresh.
  issueSession(res, user, 200);
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      // Bump tokenVersion → invalidates every outstanding refresh token for this user.
      await User.findByIdAndUpdate(payload.sub, { $inc: { tokenVersion: 1 } });
    } catch {
      /* token already invalid — nothing to revoke */
    }
  }
  clearRefreshCookie(res);
  res.status(200).json({ message: 'Logged out' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body as { email: string };
  const user = await User.findOne({ email });

  let devResetUrl: string | undefined;
  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${env.CLIENT_RESET_URL}?token=${rawToken}`;
    devResetUrl = resetUrl;
    await sendPasswordResetEmail(user.email, resetUrl);
  }

  // Always 200 — avoid leaking which emails are registered.
  res.status(200).json({
    message: 'If an account exists for that email, a reset link has been sent.',
    ...(isProd ? {} : { devResetUrl }),
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body as { token: string; password: string };
  const hashed = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) throw new AppError(400, 'Invalid or expired reset token');

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.tokenVersion += 1; // log out existing sessions after a reset
  await user.save();

  res.status(200).json({ message: 'Password has been reset. Please log in.' });
});
