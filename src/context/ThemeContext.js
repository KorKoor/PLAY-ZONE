import React, { createContext, useState, useLayoutEffect } from 'react';

export const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
});

const themes = {
  dark: {
    '--color-background-primary': '#0F141F',
    '--color-background-secondary': '#1C2738',
    '--color-card': '#28374E',
    '--color-input-bg': '#141D2B',
    '--color-border': '#3D4A66',
    '--color-accent-blue': '#00C6FF',
    '--color-primary': 'var(--color-accent-blue)',
    '--color-primary-rgb': '0, 198, 255',
    '--color-accent-hover': '#0099CC',
    '--color-text-light': '#E0E7FF',
    '--color-text-secondary': '#9FAACF',
    '--color-success': '#38A169',
    '--color-danger': '#E53E3E',
    '--color-secondary': '#4A5C7F',
    '--color-overlay': 'rgba(0, 0, 0, 0.75)',
  },
  light: {
    '--color-background-primary': '#FFFAF0',      /* Fondo FloralWhite */
    '--color-background-secondary': '#FFFAF0',    /* Header FloralWhite */
    '--color-card': '#FFFAF0',                    /* Tarjetas FloralWhite */
    '--color-input-bg': '#F0F2F5',                /* Input gris claro */
    '--color-border': '#D9DDE3',
    '--color-accent-blue': '#FFA07A',             /* Cambia el acento a un tono peach/salmón */
    '--color-primary': 'var(--color-accent-blue)',
    '--color-primary-rgb': '255, 160, 122',       /* RGB del peach */
    '--color-accent-hover': '#E9967A',
    '--color-text-light': '#000000',              /* Texto negro */
    '--color-text-secondary': '#333333',          /* Gris oscuro */
    '--color-success': '#20B2AA',                 /* Verde azulado */
    '--color-danger': '#DC3545',                  /* Rojo */
    '--color-secondary': '#000080',               /* Azul marino */
    '--color-overlay': 'rgba(0, 0, 0, 0.6)',
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useLayoutEffect(() => {
    const themeColors = themes[theme];

    // Direct style manipulation as a final measure
    document.body.style.backgroundColor = themeColors['--color-background-primary'];
    document.body.style.color = themeColors['--color-text-light'];

    // Also update the CSS variables on the body's style for other components to use
    for (const [key, value] of Object.entries(themeColors)) {
      document.body.style.setProperty(key, value);
    }

    // We can keep this for components that might still rely on it, but the direct styling above is more forceful.
    document.body.setAttribute('data-theme', theme);

  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
