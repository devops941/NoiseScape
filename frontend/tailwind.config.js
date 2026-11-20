/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          surface: 'rgba(15, 23, 42, 0.65)',
          'surface-light': 'rgba(30, 41, 59, 0.55)',
          'surface-hover': 'rgba(51, 65, 85, 0.45)',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-hover': 'rgba(255, 255, 255, 0.18)',
        },
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        noise: {
          safe: '#10b981',
          warning: '#f59e0b',
          critical: '#ef4444',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-glow-blue': '0 0 25px -5px rgba(14, 165, 233, 0.3)',
        'glass-glow-red': '0 0 25px -5px rgba(239, 68, 68, 0.35)',
        'glass-glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
      },
      backdropBlur: {
        'xs': '2px',
        '2xl': '40px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
