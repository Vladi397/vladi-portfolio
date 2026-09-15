/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <--- IMPORTANT: Enables the dark mode toggle
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light theme: warm off-white page, teal accent (see index.css).
        paper: '#FAF9F6',
        lagoon: {
          50: '#EFF7F7',
          100: '#D7EDEE',
          200: '#AEDBDD',
          300: '#7CC2C6',
          400: '#3E9FA6',
          500: '#0A7A85',
          600: '#0A6770',
          700: '#0B545C',
          800: '#0C454C',
          900: '#0D3A40',
          950: '#062226',
        },
        // Colours shared by both themes. Each resolves to a CSS variable whose
        // dark value is the original sky/indigo/gray, so dark mode is unchanged
        // while light mode picks up the teal and warm-neutral equivalents.
        accent: 'rgb(var(--accent) / <alpha-value>)',
        brand: {
          200: 'rgb(var(--brand-200) / <alpha-value>)',
          300: 'rgb(var(--brand-300) / <alpha-value>)',
          400: 'rgb(var(--brand-400) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)',
          600: 'rgb(var(--brand-600) / <alpha-value>)',
          700: 'rgb(var(--brand-700) / <alpha-value>)',
        },
        brand2: {
          600: 'rgb(var(--brand2-600) / <alpha-value>)',
        },
        ngray: {
          300: 'rgb(var(--ngray-300) / <alpha-value>)',
          400: 'rgb(var(--ngray-400) / <alpha-value>)',
        },
        nslate: {
          900: 'rgb(var(--nslate-900) / <alpha-value>)',
        },
      },
      // Both fonts are bundled (see main.jsx) and include Cyrillic, so the
      // EN, NL and BG versions render identically.
      fontFamily: {
        sans: ['"Onest Variable"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        display: ['"Unbounded Variable"', '"Onest Variable"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      }
    },
  },
  plugins: [],
}