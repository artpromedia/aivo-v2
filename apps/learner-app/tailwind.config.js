/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // K-5 Theme Colors (Playful)
        k5: {
          primary: '#ff6b6b',
          secondary: '#4ecdc4',
          accent: '#ffe66d',
          background: '#fff8f0',
          surface: '#ffffff',
          text: '#2c3e50',
          muted: '#7f8c8d'
        },
        // 6-8 Theme Colors (Engaging)
        middle: {
          primary: '#667eea',
          secondary: '#764ba2',
          accent: '#f093fb',
          background: '#f8faff',
          surface: '#ffffff',
          text: '#2d3748',
          muted: '#718096'
        },
        // 9-12 Theme Colors (Professional)
        high: {
          primary: '#2563eb',
          secondary: '#0f172a',
          accent: '#06b6d4',
          background: '#f8fafc',
          surface: '#ffffff',
          text: '#0f172a',
          muted: '#64748b'
        }
      },
      fontFamily: {
        'k5': ['Comic Neue', 'cursive'],
        'middle': ['Inter', 'sans-serif'],
        'high': ['Inter', 'sans-serif']
      },
      fontSize: {
        'xs-accessible': ['0.75rem', { lineHeight: '1.5' }],
        'sm-accessible': ['0.875rem', { lineHeight: '1.6' }],
        'base-accessible': ['1rem', { lineHeight: '1.7' }],
        'lg-accessible': ['1.125rem', { lineHeight: '1.8' }],
        'xl-accessible': ['1.25rem', { lineHeight: '1.8' }],
        '2xl-accessible': ['1.5rem', { lineHeight: '1.8' }],
        '3xl-accessible': ['1.875rem', { lineHeight: '1.8' }],
        'k5-base': ['1.125rem', { lineHeight: '1.8' }],
        'k5-lg': ['1.5rem', { lineHeight: '1.8' }],
        'k5-xl': ['2rem', { lineHeight: '1.8' }]
      },
      spacing: {
        'k5-touch': '44px', // Minimum touch target for K-5
        'middle-touch': '40px', // Touch target for 6-8
        'high-touch': '36px' // Touch target for 9-12
      },
      borderRadius: {
        'k5': '16px',
        'middle': '12px',
        'high': '8px'
      },
      boxShadow: {
        'k5': '0 8px 32px rgba(255, 107, 107, 0.2)',
        'middle': '0 4px 24px rgba(102, 126, 234, 0.15)',
        'high': '0 2px 16px rgba(37, 99, 235, 0.1)',
        'accessible': '0 0 0 3px rgba(59, 130, 246, 0.5)'
      },
      animation: {
        'bounce-gentle': 'bounce-gentle 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'celebration': 'celebration 0.6s ease-out'
      },
      keyframes: {
        'bounce-gentle': {
          '0%, 100%': {
            transform: 'translateY(-5%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
          }
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        },
        celebration: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' }
        }
      }
    }
  },
  plugins: [],
  darkMode: 'class'
}