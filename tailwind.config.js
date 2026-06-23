/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          taupe: '#8C7A6B',
          gold: '#C4A882',
          dark: '#1A1A1A',
          warm: '#FAF9F7',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
