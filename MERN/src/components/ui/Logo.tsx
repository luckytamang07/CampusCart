import React from 'react';

interface LogoProps {
  onClick?: () => void;
  variant?: 'default' | 'light';
}

export const Logo: React.FC<LogoProps> = ({ onClick, variant = 'default' }) => {
  const textColor = variant === 'light' ? 'text-white' : 'text-slate-900';
  const markBg = variant === 'light' ? 'bg-teal-500' : 'bg-teal-700';

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
      aria-label="CampusCart Home"
    >
      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${markBg} text-white shrink-0`}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 7h12l-1.2 11.2a1.5 1.5 0 0 1-1.5 1.3H8.7a1.5 1.5 0 0 1-1.5-1.3L6 7Z" />
          <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
          <path d="M9.5 12.5h5" />
        </svg>
      </span>
      <span className={`font-display text-lg font-bold tracking-tight ${textColor} whitespace-nowrap shrink-0`}>
        CampusCart
      </span>
    </button>
  );
};
