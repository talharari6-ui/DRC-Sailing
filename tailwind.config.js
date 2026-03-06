/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Original DRC Sailing color scheme
        'drc-bg': '#0a1628',
        'drc-bg2': '#0d2444',
        'drc-bg3': '#0e3060',
        'drc-blue': '#3b82f6',
        'drc-blue-light': '#7dd3fc',
        'drc-green': '#34d399',
        'drc-red': '#f87171',
        'drc-yellow': '#fbbf24',
        'drc-purple': '#a78bfa',
        'drc-text': '#e0f2fe',
        'drc-muted': '#64748b',
      },
      borderRadius: {
        'drc': '16px',
      },
      backdropBlur: {
        'drc': '20px',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
