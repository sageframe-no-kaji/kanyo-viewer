/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme (default)
        'kanyo-bg': '#000000',
        'kanyo-card': '#1c1c1e',
        'kanyo-orange': '#ff9500',
        'kanyo-blue': '#0a84ff',
        'kanyo-red': '#ff453a',
        'kanyo-green': '#30d158',
        'kanyo-gray': {
          100: '#8e8e93',
          200: '#636366',
          300: '#48484a',
          400: '#3a3a3c',
          500: '#2c2c2e',
          600: '#1c1c1e',
        },
        // Light mode overrides
        'kanyo-light-bg': '#ffffff',
        'kanyo-light-card': '#f5f5f7',
        'kanyo-light-text': '#1d1d1f',
        'kanyo-light-gray': {
          100: '#6e6e73',
          200: '#86868b',
          300: '#d2d2d7',
          400: '#e8e8ed',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
