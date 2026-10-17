/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          red: '#FA243C',         // Apple Music Red
          redHover: '#D71A30',    // Apple Music Red Hover
          redLight: '#FFF0F2',    // Apple Music Red Tint
          canvas: '#FFFFFF',      // Apple Pure White
          subtle: '#F5F5F7',      // Apple System Gray 6
          surface: '#FFFFFF',     // Apple Card White
          surfaceHover: '#F2F2F7',// Apple Hover Surface
          border: '#E5E5EA',      // Apple Hairline Border
          dark: '#1D1D1F',        // Apple Primary Dark
          secondary: '#86868B',   // Apple Secondary Gray
          tertiary: '#6E6E73',    // Apple Tertiary Gray
          gold: '#D4A017',        // Apple Champagne Gold
        },
        sacred: {
          midnight: '#FFFFFF',
          espresso: '#F5F5F7',
          charcoal: '#F2F2F7',
          surface: '#FFFFFF',
          surfaceLight: '#F5F5F7',
          red: '#FA243C',         // Mapped to Apple Music Red
          redDark: '#D71A30',     // Mapped to Apple Music Dark Red
          teal: '#FA243C',
          tealDark: '#D71A30',
          gold: '#D4A017',
          goldLight: '#F5D77F',
          goldDark: '#9C7A28',
          ivory: '#1D1D1F',       // Apple Primary Dark Text
          ivoryMuted: '#86868B',  // Apple Secondary Gray
          gray: '#86868B',
          tan: '#D4A017',
          dark: '#1D1D1F',
          border: '#E5E5EA',
          borderHover: 'rgba(250, 36, 60, 0.4)',
        },
      },
      fontFamily: {
        heading: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Inter"', 'system-ui', 'sans-serif'],
        telugu: ['"Noto Serif Telugu"', '-apple-system', 'BlinkMacSystemFont', 'serif'],
      },
      backgroundImage: {
        'sacred-radial': 'radial-gradient(circle at 50% 0%, rgba(250, 36, 60, 0.05) 0%, rgba(255, 255, 255, 0) 70%)',
        'gold-gradient': 'linear-gradient(135deg, #F5D77F 0%, #D4A017 50%, #9C7A28 100%)',
        'red-gradient': 'linear-gradient(135deg, #FC3C44 0%, #FA243C 50%, #D71A30 100%)',
        'teal-gradient': 'linear-gradient(135deg, #FC3C44 0%, #FA243C 50%, #D71A30 100%)',
        'circle-gradient': 'linear-gradient(135deg, #F5F5F7 0%, #FFF0F2 50%, #FA243C 100%)',
        'card-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)',
      },
      boxShadow: {
        'apple-card': '0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'apple-hover': '0 12px 28px -4px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03)',
        'apple-player': '0 -4px 20px rgba(0, 0, 0, 0.04)',
        'apple-button': '0 2px 8px rgba(250, 36, 60, 0.25)',
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