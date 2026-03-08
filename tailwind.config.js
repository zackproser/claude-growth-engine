/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#D97757',
        'dark': '#1A1A2E', 
        'dark-alt': '#191A23',
        'light': '#F5E6D3',
        'text-light': '#FAFAF9',
        'text-dark': '#1A1A2E', 
        'accent': '#E8C547',
      },
      fontFamily: {
        'geist-sans': ['var(--font-geist-sans)', 'Arial', 'sans-serif'],
        'geist-mono': ['var(--font-geist-mono)', 'Courier', 'monospace'],
      },
    },
  },
  plugins: [],
}