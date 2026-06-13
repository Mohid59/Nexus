import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, CircleDollarSign, Building2, LogIn, AlertCircle, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UserRole } from '../../types';

const RingMotif: React.FC = () => (
  <svg
    className="pointer-events-none absolute -bottom-32 -right-28 h-[34rem] w-[34rem] text-white/10"
    viewBox="0 0 400 400"
    fill="none"
    aria-hidden
  >
    {[60, 110, 162, 214].map((r) => (
      <circle key={r} cx="200" cy="200" r={r} stroke="currentColor" strokeWidth="1" />
    ))}
    <circle cx="200" cy="140" r="5" className="fill-white/40" />
    <circle cx="310" cy="200" r="4" className="fill-white/30" />
    <circle cx="200" cy="362" r="4" className="fill-white/20" />
    <circle cx="38" cy="200" r="3" className="fill-white/20" />
  </svg>
);

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('entrepreneur');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    <div className="min-h-screen bg-app lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand-panel p-12 text-white lg:flex xl:p-16">
        <div className="grain absolute inset-0 opacity-[0.07]" />
        <RingMotif />

        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">Business Nexus</span>
        </div>

        <div className="relative max-w-lg">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Investor &times; Entrepreneur</p>
          <h1 className="display-xl text-5xl font-semibold xl:text-6xl">
            Where founders and capital find each other.
          </h1>
          <p className="mt-6 max-w-md text-lg text-white/70">
            Raise, invest, and close deals on one platform built for serious collaboration.
          </p>
        </div>

        <div className="relative grid max-w-md grid-cols-3 gap-6 border-t border-white/15 pt-6">
          {[
            ['120+', 'Active investors'],
            ['$48M', 'Capital connected'],
            ['300+', 'Founders'],
          ].map(([stat, label]) => (
            <div key={label}>
              <p className="font-display text-2xl font-semibold">{stat}</p>
              <p className="mt-1 text-xs text-white/55">{label}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Form panel */}
      <main className="relative flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
        <button
          onClick={toggleTheme}
          className="absolute right-5 top-5 rounded-lg p-2 text-muted transition-colors hover:bg-gray-100 hover:text-ink dark:hover:bg-gray-800"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        <div className="w-full max-w-md">
          {/* Mobile brand mark */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-700 text-white shadow-soft">
              <Building2 size={18} />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-ink">Business Nexus</span>
          </div>

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
        </div>
      </main>
    </div>
  );
};
