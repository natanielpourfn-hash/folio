/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAFAF8',
        surface: '#F4F3F0',
        border: 'rgba(0,0,0,0.08)',
        primary: '#0A0A0A',
        secondary: '#6B6B6B',
        muted: '#A0A0A0',
        accent: '#C17A3F',
        'accent-hover': '#A8672F',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '6px',
        lg: '10px',
      },
      transitionTimingFunction: {
        'out-smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(-2deg)' },
          '50%': { transform: 'translateY(-6px) rotate(-2deg)' },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        pulseOpacity: {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 0.7 },
        },
        drawCheck: {
          from: { strokeDashoffset: 50 },
          to: { strokeDashoffset: 0 },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: 0, transform: 'translateX(20px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        fadeUp: 'fadeUp 0.4s ease-out forwards',
        pulseOpacity: 'pulseOpacity 2s ease-in-out infinite',
        slideUp: 'slideUp 0.3s ease-out forwards',
        slideIn: 'slideIn 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
}
