/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        surface: {
          base: '#f8fafc',
          card: '#ffffff',
          hover: '#f1f5f9',
          subtle: '#f8fafc',
        },
        border: {
          subtle: '#e8edf2',
          default: '#dde3ea',
          strong: '#c4cdd6',
        },
        ink: {
          primary: '#0f172a',
          secondary: '#475569',
          muted: '#94a3b8',
          faint: '#cbd5e1',
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.07), 0 12px 32px rgba(0,0,0,0.06)',
        dropdown: '0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
        green: '0 4px 14px rgba(22,163,74,0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.18s ease-out',
        'slide-in': 'slideUp 0.22s ease-out',
        'slide-left': 'slideInLeft 0.2s ease-out',
      },
    },
  },
  plugins: [],
}

