"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ThemeContextType = {
  theme: string;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const getSystemDefaultTheme = () => {
    if (typeof window !== "undefined" && window.matchMedia) {
      // Check the system preference for dark mode
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  };

  const getInitialTheme = () => {
    if (typeof window !== "undefined") {
      // First, check localStorage for a saved theme
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme;
      }
      // If no saved theme, use the system default
      return getSystemDefaultTheme();
    }
    // Default theme for SSR (you can set this to 'light' or 'dark' based on your preference)
    return 'light';
  };

  const [theme, setTheme] = useState<string>(getInitialTheme);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Apply the current theme by setting the data-theme attribute on the html element
      document.documentElement.setAttribute("data-theme", theme);
      // Save the theme to localStorage
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}