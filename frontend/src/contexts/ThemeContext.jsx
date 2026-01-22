import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem('kanyo-theme');
    if (stored) {
      return stored === 'dark';
    }
    // Default to dark mode
    return true;
  });

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    // Save to localStorage
    localStorage.setItem('kanyo-theme', isDark ? 'dark' : 'light');
    console.log('Theme changed:', isDark ? 'dark' : 'light', 'Classes:', root.className);
  }, [isDark]);

  const toggleTheme = () => {
    console.log('Toggle clicked, current:', isDark);
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
