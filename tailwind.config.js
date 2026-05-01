/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          main: '#6366f1',
          dark: '#020617',
          light: '#f8fafc',
          card: '#ffffff',
          'card-dark': '#0f172a',
          border: '#e2e8f0',
          'border-dark': '#1e293b',
          accent: '#6366f1',
          equipment: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    }
  },
  safelist: [
    { pattern: /^bg-(amber|indigo|blue|emerald|red|slate)-(500|600|900)(\/\d+)?$/ },
    { pattern: /^text-(amber|indigo|blue|emerald|red|slate)-(400|500|600)$/ },
    { pattern: /^hover:bg-(amber|indigo|blue|emerald|red|slate)-(500|600)(\/\d+)?$/ },
    { pattern: /^border-(amber|indigo|blue|emerald|red|slate)-(500|600|700|800)$/ },
  ],
  plugins: [],
}
