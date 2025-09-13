/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // McGill University Brand Colors
      colors: {
        'mcgill': {
          'red': '#ED1B2F',
          'grey': '#5D6770',
          'lightgrey': '#F5F5F5',
          'darkblue': '#003F5C',
          'forest': '#2D5016',
          'white': '#FFFFFF',
        },
        
        // Professor Arti Graph Colors
        'graph-node': '#3B82F6',
        'graph-link': '#6B7280',
        'graph-hover': '#1D4ED8',
        
        // UI Colors
        'chat-bg': '#F8FAFC',
        'calendar-green': '#10B981',
        'calendar-blue': '#3B82F6',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { 
            transform: 'translateY(-5%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
          },
          '50%': { 
            transform: 'none',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
          },
        },
      },
    },
  },
  plugins: [],
}