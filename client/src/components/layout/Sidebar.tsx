import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  X, LayoutDashboard, Building2, CircleDollarSign, Users,
  MessagesSquare, Bell, FileText, Settings, HelpCircle, Handshake,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const BrandMark: React.FC = () => (
  <Link to="/" className="flex items-center gap-2.5">
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-700 text-white shadow-soft">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
    <span className="font-display text-lg font-semibold tracking-tight text-ink">Business Nexus</span>
  </Link>
);

const NavRow: React.FC<NavItem & { onNavigate: () => void }> = ({ to, icon, label, onNavigate }) => (
  <NavLink
    to={to}
    end
    onClick={onNavigate}
    className={({ isActive }) =>
      `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300'
          : 'text-muted hover:bg-gray-100 hover:text-ink dark:hover:bg-gray-800'
      }`
    }
  >
    {({ isActive }) => (
      <>
        {isActive && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary-700" />}
        <span className={isActive ? 'text-primary-700' : 'text-muted group-hover:text-ink'}>{icon}</span>
        {label}
      </>
    )}
  </NavLink>
);

export const Sidebar: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { user } = useAuth();
  if (!user) return null;

  const entrepreneurItems: NavItem[] = [
    { to: '/dashboard/entrepreneur', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: `/profile/entrepreneur/${user.id}`, icon: <Building2 size={18} />, label: 'My Startup' },
    { to: '/investors', icon: <CircleDollarSign size={18} />, label: 'Find Investors' },
    { to: '/messages', icon: <MessagesSquare size={18} />, label: 'Messages' },
    { to: '/notifications', icon: <Bell size={18} />, label: 'Notifications' },
    { to: '/documents', icon: <FileText size={18} />, label: 'Documents' },
  ];

  const investorItems: NavItem[] = [
    { to: '/dashboard/investor', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: `/profile/investor/${user.id}`, icon: <CircleDollarSign size={18} />, label: 'My Portfolio' },
    { to: '/entrepreneurs', icon: <Users size={18} />, label: 'Find Startups' },
    { to: '/messages', icon: <MessagesSquare size={18} />, label: 'Messages' },
    { to: '/notifications', icon: <Bell size={18} />, label: 'Notifications' },
    { to: '/deals', icon: <Handshake size={18} />, label: 'Deals' },
  ];

  const items = user.role === 'entrepreneur' ? entrepreneurItems : investorItems;
  const commonItems: NavItem[] = [
    { to: '/settings', icon: <Settings size={18} />, label: 'Settings' },
    { to: '/help', icon: <HelpCircle size={18} />, label: 'Help & Support' },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-ink/40 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-surface transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <BrandMark />
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted hover:bg-gray-100 hover:text-ink lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pt-4">
          <Badge variant={user.role === 'investor' ? 'secondary' : 'accent'} rounded size="sm" className="uppercase">
            {user.role}
          </Badge>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => (
            <NavRow key={item.to} {...item} onNavigate={onClose} />
          ))}

          <div className="mt-4 border-t border-line pt-4">
            <p className="px-3 pb-1 text-2xs font-semibold uppercase tracking-wider text-muted">General</p>
            {commonItems.map((item) => (
              <NavRow key={item.to} {...item} onNavigate={onClose} />
            ))}
          </div>
        </nav>

        <div className="border-t border-line p-4">
          <div className="rounded-xl bg-primary-50 p-4 dark:bg-primary-500/10">
            <p className="text-xs font-medium text-primary-900">Need a hand?</p>
            <p className="mt-0.5 text-xs text-primary-700/80">Our team is here to help you connect.</p>
            <a
              href="mailto:support@businessnexus.com"
              className="mt-2 inline-block text-xs font-semibold text-primary-700 hover:text-primary-800"
            >
              support@businessnexus.com
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};
