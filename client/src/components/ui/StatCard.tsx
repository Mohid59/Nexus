import React from 'react';

export type StatTone = 'primary' | 'secondary' | 'accent' | 'success';

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tone?: StatTone;
  hint?: string;
}

const toneClasses: Record<StatTone, string> = {
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300',
  secondary: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-500/15 dark:text-secondary-300',
  accent: 'bg-accent-100 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300',
  success: 'bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-500',
};

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value, tone = 'primary', hint }) => (
  <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card">
    <div className="flex items-center gap-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        <p className="font-display text-2xl font-semibold leading-tight text-ink">{value}</p>
      </div>
    </div>
    {hint && <p className="mt-3 text-xs text-muted">{hint}</p>}
  </div>
);
