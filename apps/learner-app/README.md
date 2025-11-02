# Aivo Learner App

A comprehensive, accessible learning platform for K-12 students with dynamic theming and adaptive features.

## Features

### 🎨 Dynamic Themes
- **K-5 Theme**: Playful colors, large buttons, gamification elements
- **6-8 Theme**: Modern, engaging design with achievement tracking
- **9-12 Theme**: Professional, focused design with career planning

### ♿ Accessibility Features
- Font size adjustment (small, medium, large, extra-large)
- High contrast mode
- Reduced motion support
- Screen reader optimization
- Keyboard navigation
- Focus indicators
- Color blindness support

### 📚 Core Features
- Adaptive lesson viewer with multi-modal content
- Interactive assessments
- Progress dashboard with analytics
- Offline mode with sync
- Voice input support
- PWA with offline functionality

### 🏗️ Technical Stack
- **Framework**: React 19 with Vite 7+
- **Routing**: React Router v7
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Offline Storage**: IndexedDB
- **Styling**: Tailwind CSS with custom theme system
- **PWA**: Vite PWA plugin with Workbox

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Development Scripts

```bash
# Development
pnpm dev          # Start dev server on http://localhost:3000

# Building
pnpm build        # Build for production
pnpm preview      # Preview production build

# Code Quality
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript compiler check
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ErrorBoundary.tsx
│   ├── LoadingSpinner.tsx
│   ├── Navigation.tsx
│   └── SkipLink.tsx
├── hooks/              # Custom React hooks
│   ├── useAccessibility.ts
│   └── useVoice.ts
├── pages/              # Route components
│   ├── Dashboard.tsx
│   ├── Lessons.tsx
│   ├── LessonViewer.tsx
│   ├── Assessments.tsx
│   ├── Progress.tsx
│   ├── Profile.tsx
│   ├── Settings.tsx
│   ├── Login.tsx
│   └── Welcome.tsx
├── stores/             # Zustand state stores
│   ├── userStore.ts
│   ├── contentStore.ts
│   └── offlineStore.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   ├── theme.ts
│   ├── indexedDB.ts
│   └── index.ts
├── App.tsx            # Main app component
├── main.tsx          # App entry point
└── index.css         # Global styles
```

## Theme System

The app uses a dynamic theme system that adapts to different age groups:

### K-5 Theme (Elementary)
- Playful colors (bright red, teal, yellow)
- Comic Neue font family
- Large touch targets (44px minimum)
- Rounded corners (16px)
- Gamification elements (stars, badges)
- Fun animations and mascot

### 6-8 Theme (Middle School)
- Modern colors (purple gradients)
- Inter font family
- Medium touch targets (40px)
- Moderate rounded corners (12px)
- Achievement tracking
- Balanced animations

### 9-12 Theme (High School)
- Professional colors (blue, navy, cyan)
- Inter font family
- Standard touch targets (36px)
- Minimal rounded corners (8px)
- Clean, focused design
- Reduced animations

## Accessibility Features

### Font Size Control
```css
:root {
  --accessibility-font-size: 1rem; /* Adjustable */
}
```

### High Contrast Mode
```css
.high-contrast {
  --color-primary: #000000;
  --color-background: #ffffff;
  /* Enhanced contrast ratios */
}
```

### Reduced Motion
```css
.reduced-motion * {
  animation-duration: 0s !important;
  transition-duration: 0s !important;
}
```

### Keyboard Navigation
- Focus visible indicators
- Skip links
- Focus trapping in modals
- ARIA labels and descriptions

### Screen Reader Support
- Semantic HTML structure
- ARIA live regions for announcements
- Proper heading hierarchy
- Alt text for images

## PWA Features

### Manifest Configuration
- App name and icons
- Display mode: standalone
- Theme colors
- Shortcuts for quick access

### Service Worker
- Offline caching with Workbox
- Background sync
- Push notifications (planned)
- Update prompts

### Offline Storage
- IndexedDB for lesson content
- Progress synchronization
- Offline action queue
- Cache management

## State Management

### User Store (Zustand)
- User authentication state
- Preferences and settings
- Accessibility configuration
- Progress tracking

### Content Store
- Lessons and assessments
- Progress tracking
- Loading states
- Error handling

### Offline Store
- Network status
- Pending sync actions
- Offline data management
- Sync queue

## Development Guidelines

### Accessibility Standards
- WCAG 2.1 AA compliance
- Minimum contrast ratios
- Touch target sizes
- Keyboard navigation
- Screen reader compatibility

### Performance
- Code splitting with React.lazy()
- Image optimization
- Bundle analysis
- Service worker caching

### Testing
- Unit tests with Vitest
- Accessibility testing
- Cross-browser compatibility
- Performance testing

## API Integration

The app is designed to work with the Aivo platform API:

```typescript
// Example API calls
const lessons = await fetch('/api/lessons');
const progress = await fetch('/api/progress');
const assessments = await fetch('/api/assessments');
```

## Deployment

### Build Configuration
```bash
# Production build
pnpm build

# Analyze bundle
pnpm build --analyze

# Build with source maps
pnpm build --sourcemap
```

### Environment Variables
```env
VITE_API_URL=https://api.aivo.com
VITE_APP_VERSION=1.0.0
VITE_ENABLE_PWA=true
```

## Contributing

1. Follow the existing code style
2. Ensure accessibility compliance
3. Add appropriate TypeScript types
4. Test across different themes
5. Verify offline functionality

## License

Private - Aivo Platform v2

## Support

For technical support, contact the development team or refer to the main Aivo platform documentation.