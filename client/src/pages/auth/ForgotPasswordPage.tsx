import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch {
      // Error is surfaced (toast) by the AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      {isSubmitted ? (
        <div>
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-500">
            <CheckCircle2 size={24} />
          </div>
          <h2 className="display-xl text-3xl font-semibold text-ink">Check your inbox</h2>
          <p className="mt-2 text-muted">
            If an account exists for <span className="font-medium text-ink">{email}</span>, a reset link is on its way.
          </p>
          <Link to="/login" className="mt-6 inline-block">
            <Button variant="outline" leftIcon={<ArrowLeft size={16} />}>
              Back to sign in
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <h2 className="display-xl text-4xl font-semibold text-ink">Reset password</h2>
          <p className="mt-2 text-muted">Enter your email and we'll send you a reset link.</p>

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              startAdornment={<Mail size={18} />}
            />
            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              Send reset link
            </Button>
          </form>

          <Link
            to="/login"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-800 dark:text-primary-300"
          >
            <ArrowLeft size={16} /> Back to sign in
          </Link>
        </>
      )}
    </AuthLayout>
  );
};
