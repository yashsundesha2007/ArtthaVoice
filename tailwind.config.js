/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        'surface-subtle': '#F1F5F9',
        text: '#0F172A',
        'text-muted': '#475569',
        primary: {
          DEFAULT: '#059669', // Emerald
          hover: '#047857',
          light: '#D1FAE5',
        },
        warning: {
          DEFAULT: '#D97706', // Amber warning
          light: '#FEF3C7',
          dark: '#B45309',
        },
        danger: {
          DEFAULT: '#DC2626', // Critical budget alert
          light: '#FEE2E2',
          dark: '#991B1B',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          '"Noto Sans Devanagari"',
          '"Noto Sans Gujarati"',
          'sans-serif'
        ],
      },
      fontSize: {
        // Accessibility-first minimum sizes
        'elder-base': '1.125rem', // 18px min body
        'elder-lg': '1.25rem',    // 20px
        'elder-xl': '1.5rem',     // 24px
        'elder-2xl': '1.875rem',  // 30px
        'elder-currency': '2.25rem', // 36px
        'elder-giant': '3.25rem', // 52px
      },
      boxShadow: {
        'elder-focus': '0 0 0 4px rgba(5, 150, 105, 0.4)',
        'warning-glow': '0 0 20px rgba(217, 119, 6, 0.35)',
        'danger-glow': '0 0 20px rgba(220, 38, 38, 0.35)',
        'mic-glow': '0 0 35px rgba(5, 150, 105, 0.45)',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '50%': { transform: 'scale(1.15)', opacity: '0.4' },
          '100%': { transform: 'scale(0.95)', opacity: '0.8' },
        },
        wave: {
          '0%, 100%': { height: '12px' },
          '50%': { height: '48px' },
        }
      },
      animation: {
        'pulse-ring': 'pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave-bar': 'wave 1.2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
