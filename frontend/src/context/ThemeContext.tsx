import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'tony_music_theme';

const isMobileScreen = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      // On mobile devices, always automatically follow the phone's native system setting
      if (isMobileScreen()) {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      }

      // On desktop, check local storage or fallback to system
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  const applyThemeToDOM = (t: Theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', t === 'dark' ? '#000000' : '#FFFFFF');
    }
  };

  useEffect(() => {
    applyThemeToDOM(theme);
    if (!isMobileScreen()) {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme]);

  // Listen to phone's system preference changes (e.g. user toggles dark mode in iOS/Android settings)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemChange = (e: MediaQueryListEvent) => {
      // On mobile, always update with phone's setting
      if (isMobileScreen()) {
        setThemeState(e.matches ? 'dark' : 'light');
      } else {
        // On desktop, only update if user hasn't explicitly set a preference
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          setThemeState(e.matches ? 'dark' : 'light');
        }
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
      return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }
  }, []);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
