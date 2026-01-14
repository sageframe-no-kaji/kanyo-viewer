/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // HKSV-inspired dark theme
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
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
