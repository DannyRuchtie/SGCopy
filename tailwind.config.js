module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#563F8E',
        blue: {
          500: '#563F8E',
          600: '#563F8E',
          700: '#47326e',
        },
      },
      keyframes: {
        'chat-pop-in': {
          '0%': { transform: 'translateY(40px) scale(0.95)', opacity: '0' },
          '80%': { transform: 'translateY(-6px) scale(1.03)', opacity: '1' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
      },
      animation: {
        'chat-pop-in': 'chat-pop-in 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}; 