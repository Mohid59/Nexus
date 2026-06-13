import React from 'react';
import { Building2, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

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

/** Editorial split shell shared by all auth screens: branded panel + form column. */
export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-app lg:grid lg:grid-cols-[1.05fr_1fr]">
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

      <main className="relative flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
        <button
          onClick={toggleTheme}
          className="absolute right-5 top-5 rounded-lg p-2 text-muted transition-colors hover:bg-gray-100 hover:text-ink dark:hover:bg-gray-800"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-700 text-white shadow-soft">
              <Building2 size={18} />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-ink">Business Nexus</span>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
};
