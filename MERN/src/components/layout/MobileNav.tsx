import React, { useState } from 'react';
import {
  Bell,
  Bookmark,
  Compass,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  MessageSquare,
  PlusCircle,
  Settings,
  Shield,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppRoute } from '../../types/marketplace';
import { getInitials } from '../../utils/formatters';
import { Logo } from '../ui/Logo';

export const MobileWorkspaceChrome: React.FC = () => {
  const {
    route,
    currentUser,
    unreadMessagesCount,
    unreadNotificationsCount,
    navigate,
    logout,
  } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const go = (target: AppRoute) => {
    setDrawerOpen(false);
    navigate(target);
  };

  return (
    <>
      {/* Compact top bar on tablet/mobile inside workspace */}
      <header className="lg:hidden sticky top-0 z-30 h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between gap-4">
        <Logo onClick={() => go('dashboard')} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go('notifications')}
            className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 text-[10px] font-mono-tabular font-bold bg-teal-700 text-white rounded-full px-1 leading-tight">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label="Open workspace navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Slide-over drawer for full workspace links */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-950/50 flex justify-end"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="w-72 bg-white h-full flex flex-col justify-between p-4 shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <Logo onClick={() => go('dashboard')} />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {currentUser && (
                <div className="py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-700 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                    {getInitials(currentUser.fullName)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {currentUser.fullName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{currentUser.university}</p>
                  </div>
                </div>
              )}

              <nav className="py-3 space-y-1">
                {[
                  { id: 'dashboard' as AppRoute, label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
                  { id: 'browse' as AppRoute, label: 'Browse Products', icon: <Compass className="w-4 h-4" /> },
                  { id: 'sell' as AppRoute, label: 'Sell Product', icon: <PlusCircle className="w-4 h-4" /> },
                  { id: 'my-listings' as AppRoute, label: 'My Listings', icon: <ListChecks className="w-4 h-4" /> },
                  { id: 'saved' as AppRoute, label: 'Saved Items', icon: <Bookmark className="w-4 h-4" /> },
                  {
                    id: 'messages' as AppRoute,
                    label: 'Messages',
                    icon: <MessageSquare className="w-4 h-4" />,
                    count: unreadMessagesCount,
                  },
                  {
                    id: 'notifications' as AppRoute,
                    label: 'Notifications',
                    icon: <Bell className="w-4 h-4" />,
                    count: unreadNotificationsCount,
                  },
                  { id: 'profile' as AppRoute, label: 'Profile', icon: <UserIcon className="w-4 h-4" /> },
                  { id: 'settings' as AppRoute, label: 'Settings', icon: <Settings className="w-4 h-4" /> },
                  ...(currentUser?.role === 'admin' ? [{ id: 'admin' as AppRoute, label: 'Admin Dashboard', icon: <Shield className="w-4 h-4" /> }] : []),
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                      route === item.id
                        ? 'bg-teal-50 text-teal-800 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </span>
                    {typeof item.count === 'number' && item.count > 0 && (
                      <span className="text-xs font-mono-tabular font-semibold text-teal-700">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <button
              type="button"
              onClick={() => {
                setDrawerOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Compact mobile bottom bar (56px height <= 15% mobile viewport cap) */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 h-14 bg-white border-t border-slate-200 grid grid-cols-5"
        aria-label="Mobile navigation"
      >
        {[
          { id: 'dashboard' as AppRoute, label: 'Home', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'browse' as AppRoute, label: 'Browse', icon: <Compass className="w-4 h-4" /> },
          { id: 'sell' as AppRoute, label: 'Sell', icon: <PlusCircle className="w-4 h-4" /> },
          {
            id: 'messages' as AppRoute,
            label: 'Chat',
            icon: <MessageSquare className="w-4 h-4" />,
            count: unreadMessagesCount,
          },
          { id: 'profile' as AppRoute, label: 'Profile', icon: <UserIcon className="w-4 h-4" /> },
        ].map((tab) => {
          const active = route === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => go(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
                active ? 'text-teal-700' : 'text-slate-500'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span className="absolute top-1.5 right-3.5 text-[10px] font-mono-tabular font-bold text-teal-700">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
