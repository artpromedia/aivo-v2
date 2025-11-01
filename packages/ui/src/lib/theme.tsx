'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { EducationTheme } from './utils';

export interface ThemeContextType {
  theme: EducationTheme;
  setTheme: (theme: EducationTheme) => void;
  isDark: boolean;
  toggleDark: () => void;
  systemTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: EducationTheme;
  defaultDark?: boolean;
  storageKey?: string;
  enableSystem?: boolean;
}

/**
 * Educational theme provider with grade-level theming and dark mode support
 */
export function ThemeProvider({
  children,
  defaultTheme = 'k5',
  defaultDark = false,
  storageKey = 'aivo-education-theme',
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<EducationTheme>(defaultTheme);
  const [isDark, setIsDark] = useState(defaultDark);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const { educationTheme, darkMode } = JSON.parse(stored);
        if (educationTheme) setThemeState(educationTheme);
        if (typeof darkMode === 'boolean') setIsDark(darkMode);
      }
    } catch {
      // Ignore localStorage errors
    }

    // Detect system theme preference
    if (enableSystem && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
      
      const handleChange = (e: MediaQueryListEvent) => {
        setSystemTheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [storageKey, enableSystem]);

  // Apply theme classes to document
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('theme-k5', 'theme-68', 'theme-912', 'dark');
    
    // Add new theme class
    root.classList.add(`theme-${theme}`);
    
    // Add dark mode class
    if (isDark) {
      root.classList.add('dark');
    }

    // Save to localStorage
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        educationTheme: theme,
        darkMode: isDark
      }));
    } catch {
      // Ignore localStorage errors
    }
  }, [theme, isDark, storageKey]);

  const setTheme = (newTheme: EducationTheme) => {
    setThemeState(newTheme);
  };

  const toggleDark = () => {
    setIsDark(!isDark);
  };

  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    isDark,
    toggleDark,
    systemTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

/**
 * Hook to get theme-specific classes
 */
export function useThemeClasses() {
  const { theme } = useTheme();
  
  return {
    primary: theme === 'k5' ? 'bg-education-primary-500' : 
             theme === '68' ? 'bg-education-secondary-500' : 
             'bg-education-tertiary-500',
    text: theme === 'k5' ? 'text-grade-k2' :
          theme === '68' ? 'text-grade-35' :
          'text-grade-68',
    radius: theme === 'k5' ? 'rounded-lg' :
            theme === '68' ? 'rounded-md' :
            'rounded-sm',
    spacing: theme === 'k5' ? 'p-6' :
             theme === '68' ? 'p-4' :
             'p-3',
  };
}

/**
 * Grade level detection based on user age or explicit grade
 */
export function detectGradeLevel(age?: number, grade?: string): EducationTheme {
  if (grade) {
    const gradeNum = parseInt(grade.replace(/\D/g, ''));
    if (gradeNum <= 5) return 'k5';
    if (gradeNum <= 8) return '68';
    return '912';
  }
  
  if (age) {
    if (age <= 11) return 'k5'; // Typically K-5
    if (age <= 14) return '68';  // Typically 6-8
    return '912'; // Typically 9-12
  }
  
  // Default to K-5 for safety
  return 'k5';
}

/**
 * Theme preset configurations for different educational contexts
 */
export const themePresets = {
  elementary: {
    theme: 'k5' as EducationTheme,
    colors: 'bright and playful',
    fontSize: 'larger for developing readers',
    spacing: 'generous for touch targets',
  },
  middle: {
    theme: '68' as EducationTheme,
    colors: 'balanced and engaging',
    fontSize: 'standard reading size',
    spacing: 'moderate for content density',
  },
  high: {
    theme: '912' as EducationTheme,
    colors: 'professional and mature',
    fontSize: 'compact for information density',
    spacing: 'tight for advanced interfaces',
  },
} as const;