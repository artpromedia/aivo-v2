/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brain: {
          active: '#10b981',
          idle: '#6b7280',
          processing: '#3b82f6',
          alert: '#ef4444',
        },
        focus: {
          high: '#10b981',
          medium: '#fbbf24',
          low: '#ef4444',
        }
      },
      animation: {
        'pulse-soft': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'brain-pulse': 'brainPulse 2s ease-in-out infinite',
      },
      keyframes: {
        brainPulse: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.7, transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
