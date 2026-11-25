import React from 'react';
import {
  Bell,
  Bookmark,
  Compass,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MessageSquare,
  PlusCircle,
  Settings,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppRoute } from '../../types/marketplace';
import { getInitials } from '../../utils/formatters';
import { Logo } from '../ui/Logo';

export const AppSidebar: React.FC = () => {
  const {
    route,
    currentUser,
    unreadMessagesCount,
    unreadNotificationsCount,
    navigate,
    logout,
  } = useApp();

  const navItems: {
    id: AppRoute;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'browse', label: 'Browse', icon: <Compass className="w-4 h-4" /> },
    { id: 'sell', label: 'Sell Product', icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'my-listings', label: 'My Listings', icon: <ListChecks className="w-4 h-4" /> },
    { id: 'saved', label: 'Saved Items', icon: <Bookmark className="w-4 h-4" /> },
    {
      id: 'messages',
      label: 'Messages',
      icon: <MessageSquare className="w-4 h-4" />,
      count: unreadMessagesCount,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-4 h-4" />,
      count: unreadNotificationsCount,
    },
    { id: 'profile', label: 'Profile', icon: <UserIcon className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-white border-r border-slate-200 min-h-screen sticky top-0 h-screen">
      <div className="h-16 px-5 flex items-center border-b border-slate-200">
        <Logo onClick={() => navigate('landing')} />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Workspace navigation">
        {navItems.map((item) => {
          const active = route === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-teal-50 text-teal-800 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <span className={active ? 'text-teal-700' : 'text-slate-400'}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </span>
              {typeof item.count === 'number' && item.count > 0 && (
                <span className="text-xs font-mono-tabular font-semibold text-teal-700">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}


      </nav>

      <div className="p-3 border-t border-slate-200 space-y-2">
        {currentUser && (
          <button
            type="button"
            onClick={() => navigate('profile')}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 text-left transition-colors cursor-pointer"
          >
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-teal-700 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                {getInitials(currentUser.fullName)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 truncate">{currentUser.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{currentUser.university}</p>
            </div>
          </button>
        )}
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
