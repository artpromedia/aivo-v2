import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AccessibilitySettings } from '../types';
import { applyTheme } from '../utils/theme';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  updateUserPreferences: (preferences: Partial<User['preferences']>) => void;
  updateAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => void;
  updateProgress: (progress: Partial<User['progress']>) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
        applyTheme(user.preferences.theme);
        applyAccessibilitySettings(user.preferences.accessibility);
      },

      updateUserPreferences: (preferences) => {
        const { user } = get();
        if (!user) return;

        const updatedUser = {
          ...user,
          preferences: { ...user.preferences, ...preferences }
        };

        set({ user: updatedUser });
        
        if (preferences.theme) {
          applyTheme(preferences.theme);
        }
        
        if (preferences.accessibility) {
          applyAccessibilitySettings(preferences.accessibility);
        }
      },

      updateAccessibilitySettings: (settings) => {
        const { user } = get();
        if (!user) return;

        const updatedAccessibility = { ...user.preferences.accessibility, ...settings };
        const updatedUser = {
          ...user,
          preferences: {
            ...user.preferences,
            accessibility: updatedAccessibility
          }
        };

        set({ user: updatedUser });
        applyAccessibilitySettings(updatedAccessibility);
      },

      updateProgress: (progress) => {
        const { user } = get();
        if (!user) return;

        const updatedUser = {
          ...user,
          progress: { ...user.progress, ...progress }
        };

        set({ user: updatedUser });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
        // Reset to default theme
        applyTheme('middle');
        applyAccessibilitySettings({
          fontSize: 'medium',
          highContrast: false,
          reducedMotion: false,
          screenReader: false,
          keyboardNavigation: false,
          focusVisible: true,
          colorBlindnessSupport: 'none'
        });
      }
    }),
    {
      name: 'aivo-user-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// Apply accessibility settings to the DOM
function applyAccessibilitySettings(settings: AccessibilitySettings) {
  const root = document.documentElement;
  
  // Font size
  const fontSizeMap: Record<AccessibilitySettings['fontSize'], string> = {
    small: '0.875rem',
    medium: '1rem',
    large: '1.125rem',
    'extra-large': '1.25rem'
  };
  root.style.setProperty('--accessibility-font-size', fontSizeMap[settings.fontSize]);
  
  // High contrast
  if (settings.highContrast) {
    document.body.classList.add('high-contrast');
  } else {
    document.body.classList.remove('high-contrast');
  }
  
  // Reduced motion
  if (settings.reducedMotion) {
    root.style.setProperty('--animation-duration', '0s');
    root.style.setProperty('--transition-duration', '0s');
    document.body.classList.add('reduced-motion');
  } else {
    root.style.removeProperty('--animation-duration');
    root.style.removeProperty('--transition-duration');
    document.body.classList.remove('reduced-motion');
  }
  
  // Focus visible
  if (settings.focusVisible) {
    document.body.classList.add('focus-visible');
  } else {
    document.body.classList.remove('focus-visible');
  }
  
  // Color blindness support
  document.body.classList.remove('deuteranopia', 'protanopia', 'tritanopia');
  if (settings.colorBlindnessSupport !== 'none') {
    document.body.classList.add(settings.colorBlindnessSupport);
  }
}