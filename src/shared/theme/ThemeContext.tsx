import React, { createContext, useContext, useMemo } from 'react';

import { Colors, lightColors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

interface ThemeContextValue {
  colors: Colors;
  typography: typeof typography;
  spacing: typeof spacing;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const value = useMemo(() => ({ colors: lightColors, typography, spacing }), []);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
