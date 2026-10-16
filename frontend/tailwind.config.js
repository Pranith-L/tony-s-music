/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sacred: {
          midnight: '#FFFFFF',   // Pure White background
          espresso: '#FAFAFA',   // Off-white surface
          charcoal: '#F3F4F6',   // Soft light gray card background
          surface: '#FFFFFF',    // Crisp white card surface
          surfaceLight: '#F9FAFB', // Light hover surface
          red: '#C41E3A',        // Sacred vibrant red
          redDark: '#8B1524',    // Deep royal crimson
          teal: '#C41E3A',       // Backward compatibility mapping to vibrant red
          tealDark: '#8B1524',   // Backward compatibility mapping to deep red
          gold: '#D4AF37',       // Radiant pure gold
          goldLight: '#F5D77F',  // Shimmering light gold
          goldDark: '#9C7A28',   // Antique deep gold
          ivory: '#111827',      // Primary dark text on white backgrounds
          ivoryMuted: '#4B5563', // Secondary text
          gray: '#6B7280',       // Muted text
          tan: '#D4AF37',        // Gold accent
          dark: '#111827',       // Dark text
          border: 'rgba(212, 175, 55, 0.25)',
          borderHover: 'rgba(196, 30, 58, 0.4)',
        },
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        telugu: ['"Noto Serif Telugu"', '"Cormorant Garamond"', 'serif'],
      },
      backgroundImage: {
        'sacred-radial': 'radial-gradient(circle at 50% 0%, rgba(196, 30, 58, 0.06) 0%, rgba(255, 255, 255, 0) 70%)',
        'gold-gradient': 'linear-gradient(135deg, #F5D77F 0%, #D4AF37 50%, #9C7A28 100%)',
        'red-gradient': 'linear-gradient(135deg, #C41E3A 0%, #8B1524 100%)',
        'teal-gradient': 'linear-gradient(135deg, #C41E3A 0%, #8B1524 100%)',
        'circle-gradient': 'linear-gradient(135deg, #F9FAFB 0%, #FEE2E2 50%, #C41E3A 100%)',
        'card-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}