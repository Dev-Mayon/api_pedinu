import React, { createContext, useContext, useState, useEffect } from 'react';

const CatalogThemeContext = createContext();

export function useCatalogTheme() {
  const context = useContext(CatalogThemeContext);
  if (!context) {
    throw new Error('useCatalogTheme deve ser usado dentro de um CatalogThemeProvider');
  }
  return context;
}

export function CatalogThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Força o tema claro para o catálogo público sempre
    const root = window.document.documentElement;
    
    // Remove qualquer classe de tema existente
    root.classList.remove('light', 'dark');
    
    // Força o tema claro
    root.classList.add('light');
    
    // Força variáveis CSS para tema claro
    root.style.setProperty('--background', 'var(--background-light)');
    root.style.setProperty('--foreground', 'var(--foreground-light)');
    root.style.setProperty('--card', 'var(--card-light)');
    root.style.setProperty('--card-foreground', 'var(--card-foreground-light)');
    root.style.setProperty('--popover', 'var(--popover-light)');
    root.style.setProperty('--popover-foreground', 'var(--popover-foreground-light)');
    root.style.setProperty('--primary', 'var(--primary-light)');
    root.style.setProperty('--primary-foreground', 'var(--primary-foreground-light)');
    root.style.setProperty('--secondary', 'var(--secondary-light)');
    root.style.setProperty('--secondary-foreground', 'var(--secondary-foreground-light)');
    root.style.setProperty('--muted', 'var(--muted-light)');
    root.style.setProperty('--muted-foreground', 'var(--muted-foreground-light)');
    root.style.setProperty('--accent', 'var(--accent-light)');
    root.style.setProperty('--accent-foreground', 'var(--accent-foreground-light)');
    root.style.setProperty('--destructive', 'var(--destructive-light)');
    root.style.setProperty('--destructive-foreground', 'var(--destructive-foreground-light)');
    root.style.setProperty('--border', 'var(--border-light)');
    root.style.setProperty('--input', 'var(--input-light)');
    root.style.setProperty('--ring', 'var(--ring-light)');

    // Cleanup function para restaurar o tema quando sair do catálogo
    return () => {
      // Remove as propriedades CSS customizadas
      root.style.removeProperty('--background');
      root.style.removeProperty('--foreground');
      root.style.removeProperty('--card');
      root.style.removeProperty('--card-foreground');
      root.style.removeProperty('--popover');
      root.style.removeProperty('--popover-foreground');
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-foreground');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--secondary-foreground');
      root.style.removeProperty('--muted');
      root.style.removeProperty('--muted-foreground');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-foreground');
      root.style.removeProperty('--destructive');
      root.style.removeProperty('--destructive-foreground');
      root.style.removeProperty('--border');
      root.style.removeProperty('--input');
      root.style.removeProperty('--ring');
    };
  }, []);

  const value = {
    theme: 'light', // Sempre light
    setTheme: () => {}, // No-op, tema é fixo
  };

  return (
    <CatalogThemeContext.Provider value={value}>
      {children}
    </CatalogThemeContext.Provider>
  );
}