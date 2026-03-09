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
        'dark': '#1A1A1A',
        'dark-alt': '#2A2A2A',
        'light': '#FAF7F2',
        'light-alt': '#F0EBE3',
        'text-light': '#FAFAF9',
        'text-dark': '#1A1A1A',
        'text-muted': '#6B6560',
        'accent': '#E8C547',
        'cream': '#FAF7F2',
        'warm-gray': '#E8E2D9',
        'anthropic-bg': '#FAF7F2',
        'anthropic-card': '#FFFFFF',
        'anthropic-border': '#E8E2D9',
      },
      fontFamily: {
        'geist-sans': ['var(--font-geist-sans)', 'Arial', 'sans-serif'],
        'geist-mono': ['var(--font-geist-mono)', 'Courier', 'monospace'],
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}