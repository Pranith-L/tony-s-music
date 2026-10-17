import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.js';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative items-center gap-2 p-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FA243C]/40 ${
        isDark
          ? 'bg-[#242426] hover:bg-[#2C2C2E] text-[#F5D77F] border border-[#3A3A3C] shadow-[0_0_12px_rgba(245,215,127,0.15)]'
          : 'bg-[#F2F2F7] hover:bg-[#FEE2E2] text-[#86868B] hover:text-[#FA243C] border border-[#E5E5EA] shadow-sm'
      } ${className || 'inline-flex'}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-4 h-4 sm:w-4.5 sm:h-4.5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-[#F5D77F] transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-[#6E6E73] group-hover:text-[#FA243C] transition-transform duration-300 -rotate-12 hover:rotate-0" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-semibold truncate pr-1">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
};
