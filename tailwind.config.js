/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'healthcare-blue': '#0F6BFF',
        'healthcare-green': '#22C55E',
        'healthcare-amber': '#F59E0B',
        'healthcare-red': '#EF4444',
        'healthcare-gray': '#F3F4F6',
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        spin: 'spin 1s linear infinite',
      }
    },
  },
  plugins: [],
}
