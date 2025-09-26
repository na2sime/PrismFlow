/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple System Colors
        'system-blue': '#007AFF',
        'system-blue-light': '#5AC8FA',
        'system-green': '#34C759',
        'system-orange': '#FF9500',
        'system-red': '#FF3B30',
        'system-purple': '#AF52DE',
        'system-pink': '#FF2D92',
        'system-yellow': '#FFCC00',
        'system-gray': '#8E8E93',
        'system-gray-2': '#AEAEB2',
        'system-gray-3': '#C7C7CC',
        'system-gray-4': '#D1D1D6',
        'system-gray-5': '#E5E5EA',
        'system-gray-6': '#F2F2F7',
      },
      fontFamily: {
        'sf': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'dock-bounce': 'dock-bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      keyframes: {
        'dock-bounce': {
          '0%': { transform: 'scale(1) translateY(0px)' },
          '50%': { transform: 'scale(1.1) translateY(-8px)' },
          '100%': { transform: 'scale(1) translateY(0px)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}