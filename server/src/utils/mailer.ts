import nodemailer, { Transporter } from 'nodemailer';
import { env, isProd } from '../config/env';
import { logger } from './logger';
import { AppError } from './AppError';

let transporter: Transporter | null = null;

async function getTransport(): Promise<Transporter> {
  if (transporter) return transporter;

  if (env.SMTP_HOST && env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  } else if (!isProd) {
    // Dev fallback: spin up an Ethereal test inbox so emails are viewable via preview URL.
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    logger.info('Mailer: using Ethereal test account (dev). Preview URLs will be logged.');
  } else {
    throw new AppError(500, 'Email transport is not configured (set SMTP_* env vars).');
  }

  return transporter;
}

/** Sends a password-reset email. Never throws in dev — logs the reset URL as a fallback. */
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  try {
    const tx = await getTransport();
    const info = await tx.sendMail({
      from: env.MAIL_FROM,
      to,
      subject: 'Reset your Nexus password',
      html: `
        <p>You requested a password reset for your Nexus account.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>This link expires in 30 minutes. If you didn't request this, you can safely ignore this email.</p>
      `,
    });
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) logger.info(`Password reset email preview URL: ${preview}`);
    logger.info(`Password reset email sent to ${to}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`Failed to send password reset email: ${message}`);
    if (!isProd) logger.info(`DEV fallback — reset URL for ${to}: ${resetUrl}`);
    else throw err;
  }
}
