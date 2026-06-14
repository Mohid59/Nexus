import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut, User as UserIcon, Settings, ChevronRight, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../ui/Avatar';
import { Dropdown, DropdownItem, DropdownDivider } from '../ui/Dropdown';

const LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  entrepreneur: 'Entrepreneur',
  investor: 'Investor',
  investors: 'Investors',
  entrepreneurs: 'Startups',
  messages: 'Messages',
  meetings: 'Meetings',
  wallet: 'Wallet',
  notifications: 'Notifications',
  documents: 'Documents',
  settings: 'Settings',
  help: 'Help & Support',
  deals: 'Deals',
  profile: 'Profile',
  chat: 'Chat',
};

export const Navbar: React.FC<{ onMenu: () => void }> = ({ onMenu }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const crumbs = location.pathname.split('/').filter(Boolean).slice(0, 3);
  const profileRoute = `/profile/${user.role}/${user.id}`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-line bg-surface/80 backdrop-blur">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenu}
            className="rounded-md p-1.5 text-muted hover:bg-gray-100 hover:text-ink dark:hover:bg-gray-800 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <nav className="flex min-w-0 items-center gap-1.5 text-sm">
            {crumbs.map((seg, i) => (
              <span key={i} className="flex min-w-0 items-center gap-1.5">
                {i > 0 && <ChevronRight size={14} className="shrink-0 text-muted" />}
                <span className={`truncate ${i === crumbs.length - 1 ? 'font-semibold text-ink' : 'text-muted'}`}>
                  {LABELS[seg] ?? decodeURIComponent(seg)}
                </span>
              </span>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-gray-100 hover:text-ink dark:hover:bg-gray-800"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <Link
            to="/notifications"
            className="relative rounded-lg p-2 text-muted transition-colors hover:bg-gray-100 hover:text-ink dark:hover:bg-gray-800"
            aria-label="Notifications"
          >
            <Bell size={19} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-500 ring-2 ring-surface" />
          </Link>

          <Dropdown
            trigger={
              <span className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                <Avatar src={user.avatarUrl} alt={user.name} size="sm" status={user.isOnline ? 'online' : 'offline'} />
                <span className="hidden max-w-[10rem] truncate text-sm font-medium text-ink sm:block">{user.name}</span>
              </span>
            }
          >
            <div className="border-b border-line px-4 py-2.5">
              <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
            <DropdownItem icon={<UserIcon size={16} />} onClick={() => navigate(profileRoute)}>
              Profile
            </DropdownItem>
            <DropdownItem icon={<Settings size={16} />} onClick={() => navigate('/settings')}>
              Settings
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem icon={<LogOut size={16} />} onClick={handleLogout} className="text-error-600">
              Log out
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};
