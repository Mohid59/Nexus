import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { resetPassword } = useAuth();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || password !== confirmPassword) return;
    setIsLoading(true);
    try {
      await resetPassword(token, password);
      navigate('/login');
    } catch {
      // Error is surfaced (toast) by the AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <h2 className="display-xl text-3xl font-semibold text-ink">Invalid reset link</h2>
        <p className="mt-2 text-muted">This password reset link is invalid or has expired.</p>
        <Button className="mt-6" onClick={() => navigate('/forgot-password')}>
          Request a new link
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2 className="display-xl text-4xl font-semibold text-ink">Set a new password</h2>
      <p className="mt-2 text-muted">Choose a strong password for your account.</p>

      <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
        <Input
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          startAdornment={<Lock size={18} />}
        />
        <Input
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          fullWidth
          startAdornment={<Lock size={18} />}
          error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
        />
        <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
          Reset password
        </Button>
      </form>

      <Link
        to="/login"
        className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-800 dark:text-primary-300"
      >
        <ArrowLeft size={16} /> Back to sign in
      </Link>
    </AuthLayout>
  );
};
