/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Archivo', 'sans-serif'],
      },
      colors: {
        theme: {
          gold: '#FFD102',
          'gold-dim': '#D4AE00',
          base: '#26241E',
          dark: '#1D1B17',
          light: '#38352E',
          text: '#F5F5F5',
          muted: '#A19F9A',
        }
      }
    },
  },
  plugins: [],
}