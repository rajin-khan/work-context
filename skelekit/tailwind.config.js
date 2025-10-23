// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      colors: {
        'neutral': {
          '950': '#111111',
          '900': '#171717',
          '800': '#262626',
          '700': '#404040',
          '600': '#525252',
          '500': '#737373',
          '400': '#a3a3a3',
          '300': '#d4d4d4',
          '200': '#e5e5e5',
          '100': '#f5f5f5',
        },
        'brand': {
          'DEFAULT': '#3b82f6',
          'light': '#60a5fa',
          'dark': '#2563eb',
        }
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at top, rgba(255, 255, 255, 0.05), transparent 40%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar'), // <-- ADD THIS LINE
  ],
}