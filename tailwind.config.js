/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        theme_color: '#E8600A',
        background: '#FAFBFC',
        sidebar: '#FFF',
        dark: {
          theme_color: '#E8600A',
          background: '#1E1E1E',
          sidebar: '#111827',
        },
      }
    },
  },
  plugins: [],
}
