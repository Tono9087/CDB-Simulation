/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apex: {
          red: '#DA292E',
          dark: '#0a0e27',
          darker: '#1C1C1E',
          gold: '#FFD700',
          green: '#00ff88',
          purple: '#b026ff',
        }
      },
      fontFamily: {
        'apex': ['Inter', 'Montserrat', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glitch': 'glitch 0.5s infinite',
        'glitch-intense': 'glitch-intense 0.3s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        'glitch-intense': {
          '0%, 100%': { transform: 'translate(0)', opacity: '1' },
          '33%': { transform: 'translate(-5px, 5px)', opacity: '0.8' },
          '66%': { transform: 'translate(5px, -5px)', opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
}
