import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, CircleDollarSign, Building2, AlertCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UserRole } from '../../types';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('entrepreneur');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await register(name, email, password, role);
      navigate(role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor');
    } catch (err) {
      setError((err as Error).message);
      setIsLoading(false);
    }
  };

  const roleButton = (value: UserRole, Icon: typeof Building2, label: string) => (
    <button
      type="button"
      onClick={() => setRole(value)}
      className={`flex items-center justify-center gap-2 rounded-lg border py-3 px-4 text-sm font-medium transition-colors ${
        role === value
          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300'
          : 'border-line text-ink hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <AuthLayout>
      <h2 className="display-xl text-4xl font-semibold text-ink">Create your account</h2>
      <p className="mt-2 text-muted">Join Business Nexus to connect with partners.</p>

      {error && (
        <div className="mt-6 flex items-start gap-2 rounded-lg border border-error-500/40 bg-error-50 px-4 py-3 text-error-700 dark:bg-error-500/10">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">I am registering as a</label>
          <div className="grid grid-cols-2 gap-3">
            {roleButton('entrepreneur', Building2, 'Entrepreneur')}
            {roleButton('investor', CircleDollarSign, 'Investor')}
          </div>
        </div>

        <Input
          label="Full name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          startAdornment={<User size={18} />}
        />
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          startAdornment={<Mail size={18} />}
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          startAdornment={<Lock size={18} />}
        />
        <Input
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          fullWidth
          startAdornment={<Lock size={18} />}
          error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
        />

        <label className="flex items-start gap-2 text-sm text-ink">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-line text-primary-600 focus:ring-primary-500" />
          <span>
            I agree to the{' '}
            <a href="#" className="font-medium text-primary-700 hover:text-primary-800 dark:text-primary-300">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="font-medium text-primary-700 hover:text-primary-800 dark:text-primary-300">Privacy Policy</a>
          </span>
        </label>

        <Button type="submit" fullWidth size="lg" isLoading={isLoading} leftIcon={<UserPlus size={18} />}>
          Create account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-700 hover:text-primary-800 dark:text-primary-300">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};
