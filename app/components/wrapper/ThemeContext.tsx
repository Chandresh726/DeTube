'use client';
// Legacy shim: preserved for existing imports. Delegates to next-themes.
import { useTheme as useNextTheme } from 'next-themes';
import { createContext, useContext, type ReactNode } from 'react';

type ThemeContextType = {
  theme: string;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const current = theme === 'system' ? (resolvedTheme ?? 'light') : (theme ?? 'light');
  const toggleTheme = () => setTheme(current === 'dark' ? 'light' : 'dark');
  return <ThemeContext.Provider value={{ theme: current, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const current = theme === 'system' ? (resolvedTheme ?? 'light') : (theme ?? 'light');
  const toggleTheme = () => setTheme(current === 'dark' ? 'light' : 'dark');
  if (context) return context;
  // Fallback when used outside legacy provider but inside next-themes provider.
  return { theme: current, toggleTheme };
}
