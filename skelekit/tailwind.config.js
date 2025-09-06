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
      },
      colors: {
        // A new, more sophisticated neutral palette based on black/white opacities
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
        // A vibrant, modern purple for primary actions and accents
        'brand': {
          'DEFAULT': '#9333ea', // purple-600
          'light': '#a855f7',   // purple-500
          'dark': '#7e22ce',    // purple-700
        }
      },
      backgroundImage: {
        // The subtle gradient for our main content area
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
  plugins: [],
}