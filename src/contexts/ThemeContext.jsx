import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }) {
  useEffect(() => {
    // Força sempre o tema claro
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add('light');
  }, []);

  const value = {
    theme: 'light',
    setTheme: () => {}, // No-op - tema é sempre claro
    toggleTheme: () => {}, // No-op - tema é sempre claro
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}