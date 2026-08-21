/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
           DEFAULT: '#E30046',
           50: '#FFF1F4',
           100: '#FFE0E8',
           200: '#FFC6D5',
           300: '#FF9DB5',
           400: '#FF6490',
           500: '#E30046',
           600: '#C7003D',
           700: '#A50033',
           800: '#8A002A',
           900: '#6E0022',
         },
        simplon: {
          dark: '#01313E',
          teal: '#01313E',
          red: '#E30046',
          'dark-hover': '#01222B',
          white: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}


// Fin de tailwind
