// Core utilities and theme system
export * from './lib/utils';
export * from './lib/theme';

// Components
export { VirtualBrainCreationProgress } from './components/VirtualBrainCreationProgress';

// For now, export main utilities to avoid dependency issues during build
export { 
  cn, 
  getThemeClasses, 
  getGradeTextSize, 
  getContentSpacing,
  getRoleStyles 
} from './lib/utils';

export { 
  ThemeProvider, 
  useTheme, 
  detectGradeLevel, 
  themePresets 
} from './lib/theme';

// Export types
export type {
  EducationTheme,
  ComponentSize, 
  ComponentVariant,
} from './lib/utils';

export type {
  ThemeContextType,
  ThemeProviderProps,
} from './lib/theme';

export type {
  VirtualBrainCreationStage,
  VirtualBrainCreationProgressProps
} from './components/VirtualBrainCreationProgress';