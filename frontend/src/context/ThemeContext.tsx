import React, { createContext, useContext } from 'react';

type Theme = 'dark';
type ThemeContextType = {
  theme: Theme;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always dark theme
  const theme: Theme = 'dark';

  // Apply dark theme to the <html> tag
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);