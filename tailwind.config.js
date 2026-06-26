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
          main: '#355CFF',
          dark: '#0F172A',
          light: '#F7F9FC',
          card: '#ffffff',
          'card-dark': '#0f172a',
          border: '#E5E7EB',
          'border-dark': '#1e293b',
          accent: '#FF8A00',
          equipment: '#FF8A00',
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
