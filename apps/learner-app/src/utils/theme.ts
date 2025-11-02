import { AgeGroup, ThemeConfig } from '../types';

export const themeConfigs: Record<AgeGroup, ThemeConfig> = {
  k5: {
    id: 'k5',
    name: 'Elementary Explorer',
    description: 'Playful and engaging design for young learners',
    ageRange: 'K-5 (Ages 5-11)',
    colors: {
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
      accent: '#ffe66d',
      background: '#fff8f0',
      surface: '#ffffff',
      text: '#2c3e50',
      muted: '#7f8c8d'
    },
    typography: {
      fontFamily: 'Comic Neue',
      baseSize: '1.125rem',
      headingSize: '2rem',
      buttonSize: '1.25rem'
    },
    spacing: {
      touchTarget: '44px',
      padding: '1.5rem',
      margin: '1rem'
    },
    borderRadius: '16px',
    shadow: '0 8px 32px rgba(255, 107, 107, 0.2)',
    animations: true
  },
  middle: {
    id: 'middle',
    name: 'Middle School Modern',
    description: 'Balanced and engaging design for tweens',
    ageRange: '6-8 (Ages 11-14)',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f093fb',
      background: '#f8faff',
      surface: '#ffffff',
      text: '#2d3748',
      muted: '#718096'
    },
    typography: {
      fontFamily: 'Inter',
      baseSize: '1rem',
      headingSize: '1.75rem',
      buttonSize: '1rem'
    },
    spacing: {
      touchTarget: '40px',
      padding: '1.25rem',
      margin: '0.875rem'
    },
    borderRadius: '12px',
    shadow: '0 4px 24px rgba(102, 126, 234, 0.15)',
    animations: true
  },
  high: {
    id: 'high',
    name: 'High School Professional',
    description: 'Clean and focused design for teens',
    ageRange: '9-12 (Ages 14-18)',
    colors: {
      primary: '#2563eb',
      secondary: '#0f172a',
      accent: '#06b6d4',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#0f172a',
      muted: '#64748b'
    },
    typography: {
      fontFamily: 'Inter',
      baseSize: '0.875rem',
      headingSize: '1.5rem',
      buttonSize: '0.875rem'
    },
    spacing: {
      touchTarget: '36px',
      padding: '1rem',
      margin: '0.75rem'
    },
    borderRadius: '8px',
    shadow: '0 2px 16px rgba(37, 99, 235, 0.1)',
    animations: false
  }
};

export const getThemeConfig = (ageGroup: AgeGroup): ThemeConfig => {
  return themeConfigs[ageGroup];
};

export const applyTheme = (ageGroup: AgeGroup) => {
  const config = getThemeConfig(ageGroup);
  const root = document.documentElement;
  
  // Apply CSS custom properties
  root.style.setProperty('--color-primary', config.colors.primary);
  root.style.setProperty('--color-secondary', config.colors.secondary);
  root.style.setProperty('--color-accent', config.colors.accent);
  root.style.setProperty('--color-background', config.colors.background);
  root.style.setProperty('--color-surface', config.colors.surface);
  root.style.setProperty('--color-text', config.colors.text);
  root.style.setProperty('--color-muted', config.colors.muted);
  
  root.style.setProperty('--font-family', config.typography.fontFamily);
  root.style.setProperty('--font-size-base', config.typography.baseSize);
  root.style.setProperty('--font-size-heading', config.typography.headingSize);
  root.style.setProperty('--font-size-button', config.typography.buttonSize);
  
  root.style.setProperty('--spacing-touch-target', config.spacing.touchTarget);
  root.style.setProperty('--spacing-padding', config.spacing.padding);
  root.style.setProperty('--spacing-margin', config.spacing.margin);
  
  root.style.setProperty('--border-radius', config.borderRadius);
  root.style.setProperty('--shadow', config.shadow);
  
  // Apply theme class to body
  document.body.className = document.body.className
    .replace(/theme-(k5|middle|high)/g, '')
    .concat(` theme-${ageGroup}`)
    .trim();
    
  // Handle animations preference
  if (!config.animations) {
    root.style.setProperty('--animation-duration', '0s');
    root.style.setProperty('--transition-duration', '0s');
  } else {
    root.style.removeProperty('--animation-duration');
    root.style.removeProperty('--transition-duration');
  }
};

export const getAgeGroupFromGrade = (grade: number): AgeGroup => {
  if (grade <= 5) return 'k5';
  if (grade <= 8) return 'middle';
  return 'high';
};

export const getThemeClasses = (ageGroup: AgeGroup) => {
  const config = getThemeConfig(ageGroup);
  
  return {
    container: `font-${ageGroup === 'k5' ? 'k5' : ageGroup} theme-${ageGroup}`,
    background: ageGroup === 'k5' ? 'bg-k5-background' : 
                ageGroup === 'middle' ? 'bg-middle-background' : 'bg-high-background',
    surface: ageGroup === 'k5' ? 'bg-k5-surface' : 
             ageGroup === 'middle' ? 'bg-middle-surface' : 'bg-high-surface',
    text: ageGroup === 'k5' ? 'text-k5-text' : 
          ageGroup === 'middle' ? 'text-middle-text' : 'text-high-text',
    primary: ageGroup === 'k5' ? 'bg-k5-primary text-white' : 
             ageGroup === 'middle' ? 'bg-middle-primary text-white' : 'bg-high-primary text-white',
    secondary: ageGroup === 'k5' ? 'bg-k5-secondary text-white' : 
               ageGroup === 'middle' ? 'bg-middle-secondary text-white' : 'bg-high-secondary text-white',
    accent: ageGroup === 'k5' ? 'bg-k5-accent text-k5-text' : 
            ageGroup === 'middle' ? 'bg-middle-accent text-middle-text' : 'bg-high-accent text-high-text',
    button: `min-h-${ageGroup === 'k5' ? 'k5' : ageGroup === 'middle' ? 'middle' : 'high'}-touch 
             rounded-${ageGroup} shadow-${ageGroup} 
             ${config.animations ? 'transition-all duration-200 hover:scale-105 active:scale-95' : ''}`,
    card: `rounded-${ageGroup} shadow-${ageGroup} ${config.animations ? 'transition-all duration-200' : ''}`,
    input: `rounded-${ageGroup} min-h-${ageGroup === 'k5' ? 'k5' : ageGroup === 'middle' ? 'middle' : 'high'}-touch`,
    heading: ageGroup === 'k5' ? 'text-k5-lg font-bold' : 
             ageGroup === 'middle' ? 'text-xl font-semibold' : 'text-lg font-medium'
  };
};