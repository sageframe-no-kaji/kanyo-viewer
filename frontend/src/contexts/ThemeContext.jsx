import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // Always default to dark mode
    // Only respect localStorage if it was explicitly set
    const stored = localStorage.getItem('kanyo-theme');
    // If nothing stored, default to dark
    if (!stored) {
      return true;
    }
    return stored === 'dark';
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
