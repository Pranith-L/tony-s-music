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
          midnight: '#07151D',   // Deep nocturnal teal/slate background
          espresso: '#0B222E',   // Dark teal surface
          charcoal: '#0F2B38',   // Rich dark teal charcoal
          surface: '#12303E',    // Card surface
          surfaceLight: '#183D4E',
          teal: '#1B7C9D',       // Primary teal blue (shirt)
          tealDark: '#0E5671',   // Deep teal (shadows)
          gold: '#C9B27C',       // Accent soft gold (watch)
          goldLight: '#E8DCB8',  // Light champagne gold
          goldDark: '#9C8550',   // Deep antique gold
          ivory: '#EDF5F8',      // Surface / light cool white (blazer)
          ivoryMuted: '#A5C1CC', // Soft muted teal-white
          gray: '#9C9C9C',       // Neutral backdrop gray
          tan: '#C7926E',        // Warm skin tone neutral
          dark: '#2A2120',       // Near-black brown (hair)
          border: 'rgba(27, 124, 157, 0.25)',
          borderHover: 'rgba(201, 178, 124, 0.5)',
        },
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        telugu: ['"Noto Serif Telugu"', '"Cormorant Garamond"', 'serif'],
      },
      backgroundImage: {
        'sacred-radial': 'radial-gradient(circle at 50% 0%, rgba(27, 124, 157, 0.25) 0%, rgba(7, 21, 29, 0) 70%)',
        'gold-gradient': 'linear-gradient(135deg, #1B7C9D 0%, #0E5671 100%)',
        'teal-gradient': 'linear-gradient(135deg, #1B7C9D 0%, #0E5671 100%)',
        'circle-gradient': 'linear-gradient(135deg, #09212C 0%, #0E5671 50%, #1B7C9D 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(18, 48, 62, 0.85) 0%, rgba(7, 21, 29, 0.95) 100%)',
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
