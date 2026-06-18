/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '2rem',
    },
    extend: {
      colors: {
        'deep-navy': '#0A1628',
        'navy-light': '#122442',
        'navy-medium': '#1A3258',
        'vibrant-orange': '#FF6B35',
        'orange-hover': '#FF8555',
        'mint-green': '#4ECDC4',
        'soft-yellow': '#FFE66D',
        'text-primary': '#FFFFFF',
        'text-secondary': '#94A3B8',
        'text-muted': '#64748B',
      },
      fontSize: {
        'tv-xs': '0.875rem',
        'tv-sm': '1rem',
        'tv-base': '1.125rem',
        'tv-lg': '1.25rem',
        'tv-xl': '1.5rem',
        'tv-2xl': '2rem',
        'tv-3xl': '2.5rem',
        'tv-4xl': '3.5rem',
        'tv-5xl': '4.5rem',
        'tv-6xl': '6rem',
        'tv-7xl': '8rem',
      },
      boxShadow: {
        'focus': '0 0 0 3px rgba(255, 107, 53, 0.8), 0 0 30px rgba(255, 107, 53, 0.5)',
        'focus-soft': '0 0 20px rgba(255, 107, 53, 0.4)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 40px rgba(255, 107, 53, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'countdown': 'countdown 1s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' },
        },
        countdown: {
          '0%': { transform: 'scale(1.5)', opacity: '0' },
          '50%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.8)', opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
