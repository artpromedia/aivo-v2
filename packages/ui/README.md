# @aivo/ui

Educational design system and accessible UI components for the AIVO platform, featuring grade-level theming, WCAG 2.1 AA compliance, and React 19 support.

## Features

### Design System
- 🎨 **Grade-Level Theming**: K-5, 6-8, and 9-12 specific themes
- 🌗 **Dark Mode Support**: System preference detection and manual toggle
- 📱 **Responsive Design**: Mobile-first with tablet and desktop variants
- ♿ **WCAG 2.1 AA Compliance**: Full accessibility support built-in
- 🎯 **Touch-Friendly**: Appropriate sizing for tablets and young users

### Component Library
- ✅ **Button**: Grade-aware with loading states and icons
- ✅ **Card**: Educational content containers with activity variants
- ✅ **Input & Textarea**: Form controls with validation states
- ✅ **Theme Provider**: Context-based theming system
- ✅ **Utilities**: Comprehensive helper functions and classes

### Educational Context
- 👶 **K-5 Elementary**: Larger targets, playful colors, simpler layouts
- 🎒 **6-8 Middle School**: Balanced approach with engaging design
- 🎓 **9-12 High School**: Professional interface with information density
- 📚 **Role-Based Styling**: Different appearances for students, teachers, parents

## Installation

```bash
npm install @aivo/ui
# or
pnpm add @aivo/ui
```

### Peer Dependencies
```bash
npm install react react-dom tailwindcss
```

### Required Dependencies
```bash
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge
```

## Setup

### 1. Import Styles

```tsx
// In your main CSS file or App component
import '@aivo/ui/styles';
```

### 2. Configure Tailwind CSS

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@aivo/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [
    require('@aivo/ui/tailwind'),
  ],
  // Your custom config...
};
```

### 3. Setup Theme Provider

```tsx
import { ThemeProvider } from '@aivo/ui';

function App() {
  return (
    <ThemeProvider defaultTheme="k5" enableSystem>
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

## Usage Examples

### Basic Components

```tsx
import { Button, Card, Input, useTheme } from '@aivo/ui';

function Example() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      {/* Grade-level themed button */}
      <Button variant="elementary" size="touch" gradeLevel="k5">
        Start Learning!
      </Button>

      {/* Educational activity card */}
      <Card variant="lesson" gradeLevel={theme}>
        <CardHeader>
          <CardTitle>Math Practice</CardTitle>
          <CardDescription>Addition and subtraction exercises</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Complete 10 problems to earn a star!</p>
        </CardContent>
      </Card>

      {/* Accessible form input */}
      <Input
        label="Student Name"
        placeholder="Enter your name"
        gradeLevel="k5"
        required
        helperText="This will appear on your certificates"
      />
    </div>
  );
}
```

### Grade-Level Theming

```tsx
import { ThemeProvider, detectGradeLevel, Button } from '@aivo/ui';

function StudentApp({ student }) {
  // Auto-detect theme based on student age/grade
  const theme = detectGradeLevel(student.age, student.grade);

  return (
    <ThemeProvider defaultTheme={theme}>
      <div className={`theme-${theme}`}>
        {/* Automatically styled for grade level */}
        <Button gradeLevel={theme}>
          {theme === 'k5' ? 'Let\'s Play!' : 
           theme === '68' ? 'Start Activity' : 'Begin Assignment'}
        </Button>
      </div>
    </ThemeProvider>
  );
}
```

### Activity Card with Progress

```tsx
import { ActivityCard } from '@aivo/ui';

function LessonGrid({ lessons }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lessons.map((lesson) => (
        <ActivityCard
          key={lesson.id}
          title={lesson.title}
          description={lesson.description}
          duration={lesson.estimatedTime}
          difficulty={lesson.difficulty}
          completed={lesson.progress === 100}
          locked={!lesson.isUnlocked}
          gradeLevel="k5"
          onClick={() => startLesson(lesson.id)}
        />
      ))}
    </div>
  );
}
```

### Form with Validation

```tsx
import { Input, Button, Card } from '@aivo/ui';
import { useState } from 'react';

function StudentRegistration() {
  const [errors, setErrors] = useState({});
  
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle gradeLevel="k5">Join Our Classroom!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          label="Your Name"
          placeholder="What should we call you?"
          gradeLevel="k5"
          required
          state={errors.name ? 'error' : 'default'}
          errorMessage={errors.name}
          leftIcon={<UserIcon />}
        />
        
        <Input
          label="Class Code"
          placeholder="Ask your teacher"
          gradeLevel="k5"
          required
          state={errors.code ? 'error' : 'default'}
          errorMessage={errors.code}
        />
        
        <Button 
          size="touch" 
          gradeLevel="k5" 
          className="w-full"
          variant="elementary"
        >
          Join Class
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Dark Mode Toggle

```tsx
import { useTheme, Button } from '@aivo/ui';
import { MoonIcon, SunIcon } from 'lucide-react';

function ThemeToggle() {
  const { isDark, toggleDark } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
```

## Grade Level Themes

### K-5 Elementary (`theme-k5`)
- **Colors**: Bright primary blue (#3b82f6)
- **Typography**: Larger text (1.125rem base)
- **Spacing**: Generous padding and margins
- **Touch targets**: Minimum 44px for easy interaction
- **Radius**: More rounded corners (0.75rem)

### 6-8 Middle School (`theme-68`)
- **Colors**: Engaging green (#22c55e)
- **Typography**: Standard reading size (1rem base)
- **Spacing**: Moderate density
- **Touch targets**: Standard sizes with hover states
- **Radius**: Balanced corners (0.5rem)

### 9-12 High School (`theme-912`)
- **Colors**: Professional purple (#d946ef)
- **Typography**: Information-dense (0.875rem base)
- **Spacing**: Compact layouts
- **Touch targets**: Desktop-focused interactions
- **Radius**: Subtle corners (0.375rem)

## Accessibility Features

### WCAG 2.1 AA Compliance
- ✅ **Color Contrast**: All text meets 4.5:1 ratio minimum
- ✅ **Focus Management**: Visible focus indicators and logical tab order
- ✅ **Screen Reader Support**: Semantic HTML and ARIA labels
- ✅ **Keyboard Navigation**: All interactive elements accessible via keyboard
- ✅ **Touch Targets**: Minimum 44px touch targets for mobile users

### Educational Accessibility
- **Age-Appropriate Sizing**: Larger targets for younger students
- **Clear Visual Hierarchy**: Consistent heading levels and structure
- **Error Messages**: Clear, helpful error text with suggestions
- **Loading States**: Visual feedback for all async operations
- **Reduced Motion**: Respects user's motion preferences

### Implementation Example

```tsx
// Automatic accessibility features
<Button
  aria-label="Submit your answer"
  disabled={isLoading}
  loading={isLoading}
>
  {isLoading ? 'Checking...' : 'Submit'}
</Button>

// Screen reader announcements
<div role="alert" aria-live="polite">
  Great job! You got 8 out of 10 questions correct.
</div>

// Focus management
<Input
  aria-describedby="name-help name-error"
  aria-invalid={hasError}
  helperText="This is how your teacher will know you"
  errorMessage={errors.name}
/>
```

## Responsive Design

The design system includes comprehensive responsive utilities:

```tsx
// Responsive component sizing
<Button 
  size={{ base: 'touch', md: 'default', lg: 'lg' }}
  className="w-full md:w-auto"
>
  Responsive Button
</Button>

// Grade-aware responsive layouts
<div className="content-k5 md:content-68 lg:content-912">
  {/* Content adapts to screen size AND grade level */}
</div>
```

## Component API Reference

### Button Props
```tsx
interface ButtonProps {
  variant?: 'default' | 'elementary' | 'middle' | 'high' | 'success' | 'warning' | 'error'
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl' | 'touch' | 'touch-lg' | 'icon'
  gradeLevel?: 'k5' | '68' | '912'
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  asChild?: boolean
}
```

### Card Props
```tsx
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'lesson' | 'assessment' | 'progress'
  size?: 'sm' | 'default' | 'lg' | 'k5' | 'middle' | 'high'
  interactive?: 'none' | 'hover' | 'clickable'
  gradeLevel?: 'k5' | '68' | '912'
  selected?: boolean
}
```

### Input Props
```tsx
interface InputProps {
  variant?: 'default' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'default' | 'lg' | 'k5' | 'middle' | 'high'
  gradeLevel?: 'k5' | '68' | '912'
  state?: 'default' | 'success' | 'warning' | 'error'
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  label?: string
  helperText?: string
  errorMessage?: string
  required?: boolean
}
```

## Utility Functions

### Theme Utilities
```tsx
import { 
  cn,                    // Class name merging
  getThemeClasses,       // Get theme-specific classes
  getGradeTextSize,      // Grade-appropriate text sizing
  getContentSpacing,     // Educational content spacing
  getRoleStyles,         // Role-based styling
  detectGradeLevel,      // Auto-detect grade from age/grade
} from '@aivo/ui';
```

### Accessibility Utilities
```tsx
import {
  announceToScreenReader,  // Announce dynamic content
  focus,                  // Focus management utilities
  a11y,                   // Accessibility class constants
} from '@aivo/ui';

// Usage
announceToScreenReader('Assignment submitted successfully!');

// Focus trapping in modals
const cleanup = focus.trap(modalElement);
// Later...
cleanup();
```

## Storybook Development

The package includes comprehensive Storybook documentation:

```bash
cd packages/ui
npm run storybook
```

Stories cover:
- All component variations
- Accessibility testing with a11y addon
- Interactive examples
- Grade-level theming examples
- Responsive behavior

## Testing

```bash
# Unit tests
npm run test

# Visual regression tests
npm run test:visual

# Accessibility tests
npm run test:a11y
```

## Contributing

### Adding New Components

1. Create component in `src/components/`
2. Add Storybook story
3. Include accessibility tests
4. Document grade-level variations
5. Export from main index

### Design Tokens

All design tokens are defined in:
- `tailwind.config.js` - Color, spacing, typography scales
- `src/styles.css` - CSS custom properties and utility classes
- `src/lib/utils.ts` - TypeScript utilities and constants

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- React 18+ and React 19
- Touch devices and tablets
- High contrast and reduced motion support

## License

Proprietary - AIVO Educational Platform