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
          midnight: '#0E0305',   // Deep nocturnal ruby-black background
          espresso: '#1A060A',   // Dark burgundy surface
          charcoal: '#26080F',   // Rich garnet surface
          surface: '#340C14',    // Wine card surface
          surfaceLight: '#45101B', // Wine hover surface
          red: '#C41E3A',        // Sacred vibrant red
          redDark: '#8B1524',    // Deep royal crimson
          teal: '#C41E3A',       // Backward compatibility mapping to vibrant red
          tealDark: '#8B1524',   // Backward compatibility mapping to deep red
          gold: '#D4AF37',       // Radiant pure gold
          goldLight: '#F5D77F',  // Shimmering light gold
          goldDark: '#9C7A28',   // Antique deep gold
          ivory: '#FFFFFF',      // Crisp sacred white
          ivoryMuted: '#E2CBD0', // Soft rosy-white text
          gray: '#A89295',       // Neutral backdrop
          tan: '#D4AF37',        // Gold accent
          dark: '#150406',       // Near-black
          border: 'rgba(212, 175, 55, 0.25)',
          borderHover: 'rgba(212, 175, 55, 0.6)',
        },
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        telugu: ['"Noto Serif Telugu"', '"Cormorant Garamond"', 'serif'],
      },
      backgroundImage: {
        'sacred-radial': 'radial-gradient(circle at 50% 0%, rgba(196, 30, 58, 0.35) 0%, rgba(14, 3, 5, 0) 70%)',
        'gold-gradient': 'linear-gradient(135deg, #F5D77F 0%, #D4AF37 50%, #9C7A28 100%)',
        'red-gradient': 'linear-gradient(135deg, #C41E3A 0%, #8B1524 100%)',
        'teal-gradient': 'linear-gradient(135deg, #C41E3A 0%, #8B1524 100%)',
        'circle-gradient': 'linear-gradient(135deg, #22070D 0%, #8B1524 50%, #C41E3A 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(52, 12, 20, 0.85) 0%, rgba(14, 3, 5, 0.95) 100%)',
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
