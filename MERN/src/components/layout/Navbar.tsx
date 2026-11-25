import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getInitials } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';

interface NavbarProps {
  onScrollToSection?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onScrollToSection }) => {
  const { route, currentUser, navigate, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (target: 'landing' | 'browse' | 'sell', sectionId?: string) => {
    setMobileMenuOpen(false);
    if (sectionId && route === 'landing' && onScrollToSection) {
      onScrollToSection(sectionId);
      return;
    }
    if (sectionId) {
      navigate('landing');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
      return;
    }
    navigate(target);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <Logo onClick={() => navigate(currentUser ? 'dashboard' : 'landing')} />

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600" aria-label="Main navigation">
          <button
            type="button"
            onClick={() => handleNavClick('landing')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              route === 'landing' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('browse')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              route === 'browse' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            Browse
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('landing', 'categories-section')}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Categories
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('sell')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              route === 'sell' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            Sell
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('landing', 'about-section')}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            About
          </button>
        </nav>

        {/* Zone 3: Auth / Account action */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {currentUser ? (
            <>
              <button
                type="button"
                onClick={() => navigate('dashboard')}
                className="inline-flex items-center gap-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span className="w-7 h-7 rounded-full bg-teal-700 text-white text-xs font-semibold flex items-center justify-center">
                  {getInitials(currentUser.fullName)}
                </span>
                <span>Dashboard</span>
              </button>
              <Button size="sm" onClick={() => navigate('sell')}>
                Sell Item
              </Button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate('login')}
                className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Login
              </button>
              <Button size="sm" onClick={() => navigate('signup')}>
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          <button
            type="button"
            onClick={() => handleNavClick('landing')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('browse')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Browse Products
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('landing', 'categories-section')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Categories
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('sell')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Sell an Item
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('landing', 'about-section')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            About
          </button>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {currentUser ? (
              <>
                <Button
                  fullWidth
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('dashboard');
                  }}
                >
                  Open Dashboard
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('login');
                  }}
                >
                  Login
                </Button>
                <Button
                  fullWidth
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('signup');
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
