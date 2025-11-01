import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function for merging Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Educational theme variants for different grade levels
 */
export type EducationTheme = 'k5' | '68' | '912';

/**
 * Component size variants
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Component variants for semantic meaning
 */
export type ComponentVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'ghost';

/**
 * Apply theme-specific classes based on grade level
 */
export function getThemeClasses(theme: EducationTheme): string {
  const themeMap = {
    k5: 'theme-k5', // Bright, playful colors
    68: 'theme-68', // Balanced, engaging colors  
    912: 'theme-912' // Professional, mature colors
  };
  
  return themeMap[theme];
}

/**
 * Get grade-appropriate text size
 */
export function getGradeTextSize(theme: EducationTheme, size: ComponentSize = 'md'): string {
  const gradeTextMap = {
    k5: {
      xs: 'text-sm',
      sm: 'text-base',
      md: 'text-grade-k2',
      lg: 'text-xl',
      xl: 'text-2xl'
    },
    68: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-grade-35',
      lg: 'text-lg',
      xl: 'text-xl'
    },
    912: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-grade-68',
      lg: 'text-base',
      xl: 'text-lg'
    }
  };

  return gradeTextMap[theme][size];
}

/**
 * Accessibility utilities
 */
export const a11y = {
  /**
   * Screen reader only text
   */
  srOnly: 'sr-only',
  
  /**
   * Focus visible ring for keyboard navigation
   */
  focusRing: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  
  /**
   * High contrast mode support
   */
  highContrast: 'forced-colors:border-[ButtonBorder] forced-colors:text-[ButtonText]',
  
  /**
   * Reduced motion support
   */
  reduceMotion: 'motion-reduce:animate-none motion-reduce:transition-none',
};

/**
 * WCAG 2.1 AA compliant color contrast utilities
 */
export function getContrastColor(backgroundColor: string): 'white' | 'black' {
  // Simplified contrast calculation - in production, use a proper color library
  const darkColors = ['primary', 'secondary', 'error', 'success'];
  const isDark = darkColors.some(color => backgroundColor.includes(color));
  return isDark ? 'white' : 'black';
}

/**
 * Animation utilities for educational content
 */
export const animations = {
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  slideInTop: 'animate-slide-in-from-top',
  slideInBottom: 'animate-slide-in-from-bottom',
  slideInLeft: 'animate-slide-in-from-left',
  slideInRight: 'animate-slide-in-from-right',
  bounceGentle: 'animate-bounce-gentle',
  reduceMotion: 'motion-reduce:animate-none',
};

/**
 * Responsive utilities for educational content
 */
export const responsive = {
  mobile: 'block sm:hidden',
  tablet: 'hidden sm:block lg:hidden',
  desktop: 'hidden lg:block',
  mobileUp: 'sm:block',
  tabletUp: 'md:block',
  desktopUp: 'lg:block',
};

/**
 * Educational content spacing utilities
 */
export function getContentSpacing(theme: EducationTheme): {
  section: string;
  component: string;
  element: string;
} {
  const spacingMap = {
    k5: {
      section: 'space-y-8',
      component: 'space-y-6',
      element: 'space-y-4'
    },
    68: {
      section: 'space-y-6',
      component: 'space-y-4',
      element: 'space-y-3'
    },
    912: {
      section: 'space-y-4',
      component: 'space-y-3',
      element: 'space-y-2'
    }
  };

  return spacingMap[theme];
}

/**
 * Form field utilities with accessibility
 */
export const formUtils = {
  field: cn(
    'relative',
    a11y.focusRing,
    'disabled:cursor-not-allowed disabled:opacity-50'
  ),
  label: cn(
    'text-sm font-medium leading-none',
    'peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
  ),
  input: cn(
    'flex w-full rounded-md border border-input bg-background px-3 py-2',
    'text-sm ring-offset-background',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-muted-foreground',
    a11y.focusRing,
    'disabled:cursor-not-allowed disabled:opacity-50'
  ),
  error: 'text-sm font-medium text-error-600',
  helper: 'text-sm text-muted-foreground',
};

/**
 * Loading state utilities
 */
export const loading = {
  spinner: cn(
    'animate-spin rounded-full border-2 border-current border-t-transparent',
    a11y.reduceMotion
  ),
  pulse: cn(
    'animate-pulse bg-muted',
    a11y.reduceMotion
  ),
  skeleton: cn(
    'animate-pulse bg-muted rounded',
    a11y.reduceMotion
  ),
};

/**
 * Educational role-based styling
 */
export function getRoleStyles(role: 'learner' | 'teacher' | 'parent' | 'admin'): string {
  const roleStyles = {
    learner: 'border-l-4 border-l-education-primary-500',
    teacher: 'border-l-4 border-l-education-secondary-500', 
    parent: 'border-l-4 border-l-education-tertiary-500',
    admin: 'border-l-4 border-l-neutral-600'
  };

  return roleStyles[role];
}

/**
 * Accessibility announcement utility for dynamic content
 */
export function announceToScreenReader(message: string): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Focus management utilities
 */
export const focus = {
  /**
   * Trap focus within a container
   */
  trap: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },

  /**
   * Return focus to previous element
   */
  restore: (() => {
    let previousActiveElement: HTMLElement | null = null;
    
    return {
      save: () => {
        previousActiveElement = document.activeElement as HTMLElement;
      },
      restore: () => {
        if (previousActiveElement) {
          previousActiveElement.focus();
          previousActiveElement = null;
        }
      }
    };
  })(),
};