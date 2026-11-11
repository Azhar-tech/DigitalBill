/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Tinos', '"Times New Roman"', 'serif'],
        mono: ['"Courier Prime"', 'ui-monospace', 'monospace'],
        black: ['"Archivo Black"', '"Arial Black"', 'Arial', 'sans-serif'],
      },
      colors: { brand: '#1243A2', ink: '#002B66', paper: '#f8faff' },
    },
  },
  plugins: [],
};
