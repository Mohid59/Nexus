import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, CircleDollarSign, Building2, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('entrepreneur');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password, role);
      navigate(role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor');
    } catch (err) {
      setError((err as Error).message);
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (userRole: UserRole) => {
    if (userRole === 'entrepreneur') {
      setEmail('sarah@techwave.io');
      setPassword('Password123!');
    } else {
      setEmail('michael@vcinnovate.com');
      setPassword('Password123!');
    }
    setRole(userRole);
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
      <h2 className="display-xl text-4xl font-semibold text-ink">Welcome back</h2>
      <p className="mt-2 text-muted">Sign in to your Business Nexus account.</p>

      {error && (
        <div className="mt-6 flex items-start gap-2 rounded-lg border border-error-500/40 bg-error-50 px-4 py-3 text-error-700 dark:bg-error-500/10">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">I am a</label>
          <div className="grid grid-cols-2 gap-3">
            {roleButton('entrepreneur', Building2, 'Entrepreneur')}
            {roleButton('investor', CircleDollarSign, 'Investor')}
          </div>
        </div>

        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          startAdornment={<User size={18} />}
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" className="h-4 w-4 rounded border-line text-primary-600 focus:ring-primary-500" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-primary-700 hover:text-primary-800 dark:text-primary-300">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth size="lg" isLoading={isLoading} leftIcon={<LogIn size={18} />}>
          Sign in
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted">
        <span className="h-px flex-1 bg-line" />
        Demo accounts
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => fillDemoCredentials('entrepreneur')} leftIcon={<Building2 size={16} />}>
          Entrepreneur
        </Button>
        <Button variant="outline" onClick={() => fillDemoCredentials('investor')} leftIcon={<CircleDollarSign size={16} />}>
          Investor
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-primary-700 hover:text-primary-800 dark:text-primary-300">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
};
