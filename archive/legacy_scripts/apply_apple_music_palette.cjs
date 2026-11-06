const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

// 1. Update index.css with Apple Music Design System tokens
const indexCssPath = path.join(srcDir, 'index.css');
const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Apple Music Design System Tokens */
:root {
  --apple-red: #FA243C;
  --apple-red-hover: #D71A30;
  --apple-red-light: #FFF0F2;
  --apple-canvas: #FFFFFF;
  --apple-subtle: #F5F5F7;
  --apple-surface: #FFFFFF;
  --apple-surface-hover: #F2F2F7;
  --apple-border: #E5E5EA;
  --apple-border-light: rgba(0, 0, 0, 0.05);
  --apple-text-primary: #1D1D1F;
  --apple-text-secondary: #86868B;
  --apple-text-tertiary: #6E6E73;
  --apple-accent-gold: #D4A017;

  /* Backward-compatible variables */
  --primary: #FA243C;
  --primary-dark: #D71A30;
  --bg-gray: #F5F5F7;
  --surface: #FFFFFF;
  --text: #1D1D1F;
  --accent: #D4A017;
  --color-gold: #D4A017;
  --color-gold-light: #F5D77F;
  --color-gold-dark: #9C7A28;
  --color-red: #FA243C;
  --color-red-dark: #D71A30;
  --color-midnight: #FFFFFF;
  --color-espresso: #F5F5F7;
  --color-ivory: #1D1D1F;
  --color-charcoal: #F2F2F7;
}

@layer base {
  html, body, #root {
    height: 100%;
    height: 100dvh;
    margin: 0;
    padding: 0;
    overflow: hidden;
    overscroll-behavior: none;
    -webkit-overflow-scrolling: touch;
  }

  html {
    scroll-behavior: smooth;
    color-scheme: light;
  }

  body {
    background-color: #FFFFFF;
    color: #1D1D1F;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", 'Inter', system-ui, sans-serif;
    letter-spacing: -0.012em;
    position: relative;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, .font-heading {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", 'Cormorant Garamond', 'Georgia', serif;
    letter-spacing: -0.02em;
    color: #1D1D1F;
    font-weight: 700;
  }

  .font-telugu {
    font-family: 'Noto Serif Telugu', -apple-system, BlinkMacSystemFont, serif;
    line-height: 1.5;
  }
}

/* Apple Smooth Refined Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 0px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #D1D1D6;
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background: #FA243C;
}

/* Hide scrollbar for mobile carousels & chip strips */
.no-scrollbar::-webkit-scrollbar,
.scrollbar-none::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.no-scrollbar,
.scrollbar-none {
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
  -webkit-overflow-scrolling: touch;
}

/* Apple Music Soft Tactile Cards */
.editorial-card {
  background: #FFFFFF;
  border: 1px solid #E5E5EA;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.editorial-card:hover {
  border-color: rgba(250, 36, 60, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 12px 28px -4px rgba(0, 0, 0, 0.08), 0 0 1px rgba(250, 36, 60, 0.2);
}

.gold-hairline {
  border-color: rgba(212, 160, 23, 0.35);
}

.gold-gradient-text {
  background: linear-gradient(135deg, #B8860B 0%, #D4A017 50%, #9C7A28 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Apple Music Signature Red Gradient Text */
.red-gradient-text {
  background: linear-gradient(135deg, #FC3C44 0%, #FA243C 50%, #D71A30 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Apple Music Atmospheric Stage Glow */
.stage-spotlight {
  background: radial-gradient(ellipse at 50% 15%, rgba(250, 36, 60, 0.05) 0%, rgba(245, 245, 247, 0.4) 45%, rgba(255, 255, 255, 0) 75%);
}

.warm-halo {
  box-shadow: 0 0 40px -10px rgba(250, 36, 60, 0.15);
}

/* Audio Wave Visualizer */
@keyframes soundPulse {
  0%, 100% { height: 3px; }
  50% { height: 16px; }
}

.wave-bar-1 { animation: soundPulse 0.9s ease-in-out infinite; }
.wave-bar-2 { animation: soundPulse 1.2s ease-in-out infinite 0.15s; }
.wave-bar-3 { animation: soundPulse 0.75s ease-in-out infinite 0.35s; }
.wave-bar-4 { animation: soundPulse 1.05s ease-in-out infinite 0.1s; }
`;

fs.writeFileSync(indexCssPath, indexCss.trim(), 'utf8');
console.log('✅ Updated index.css with Apple Music design system');

// 2. Update tailwind.config.js
const tailwindConfigPath = path.join(__dirname, 'frontend', 'tailwind.config.js');
const twConfig = `/** @type {import('tailwindcss').Config} */
export default {
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
`;
fs.writeFileSync(tailwindConfigPath, twConfig.trim(), 'utf8');
console.log('✅ Updated tailwind.config.js for Apple Music');

// 3. Define color replacement mappings for all frontend TSX/TS files
const colorReplacements = [
  // Primary reds to Apple Music Red
  [new RegExp('#C41E3A', 'gi'), '#FA243C'],
  [new RegExp('#8B1524', 'gi'), '#D71A30'],
  [new RegExp('bg-red-600', 'g'), 'bg-[#FA243C]'],
  [new RegExp('hover:bg-red-500', 'g'), 'hover:bg-[#D71A30]'],
  [new RegExp('hover:bg-red-700', 'g'), 'hover:bg-[#D71A30]'],

  // Primary text to Apple Music dark charcoal
  [new RegExp('#111827', 'gi'), '#1D1D1F'],
  [new RegExp('text-gray-900', 'g'), 'text-[#1D1D1F]'],

  // Secondary text to Apple Music gray
  [new RegExp('#4B5563', 'gi'), '#86868B'],
  [new RegExp('text-gray-500', 'g'), 'text-[#86868B]'],
  [new RegExp('text-gray-600', 'g'), 'text-[#86868B]'],
  [new RegExp('text-gray-400', 'g'), 'text-[#86868B]'],

  // Backgrounds to Apple Music light surfaces
  [new RegExp('#FAFAFA', 'gi'), '#F5F5F7'],
  [new RegExp('#F9FAFB', 'gi'), '#F5F5F7'],
  [new RegExp('#F3F4F6', 'gi'), '#F2F2F7'],

  // Borders to Apple Music hairline separator
  [new RegExp('border-gray-200', 'g'), 'border-[#E5E5EA]'],
  [new RegExp('border-gray-300', 'g'), 'border-[#E5E5EA]'],
  [new RegExp('border-gray-100', 'g'), 'border-[#E5E5EA]'],

  // Gold tone to Apple warm champagne gold
  [new RegExp('#C9B27C', 'gi'), '#D4A017'],
  [new RegExp('#B8860B', 'gi'), '#D4A017'],
];

function processDir(d) {
  const files = fs.readdirSync(d);
  for (const f of files) {
    const full = path.join(d, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      processDir(full);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      let content = fs.readFileSync(full, 'utf8');
      let changed = false;
      for (const [pattern, repl] of colorReplacements) {
        if (pattern.test(content)) {
          content = content.replace(pattern, repl);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(full, content, 'utf8');
        console.log('✅ Apple palette applied to:', path.relative(__dirname, full));
      }
    }
  }
}

processDir(srcDir);

// 4. Update index.html
const indexHtmlPath = path.join(__dirname, 'frontend', 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
indexHtml = indexHtml.replace(/fill='%23C41E3A'/g, "fill='%23FA243C'");
indexHtml = indexHtml.replace(/fill='%230E0305'/g, "fill='%23FA243C'");
indexHtml = indexHtml.replace(/content="#0E0305"/g, 'content="#FFFFFF"');
indexHtml = indexHtml.replace(/content="#C41E3A"/g, 'content="#FFFFFF"');
fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
console.log('✅ Updated index.html for Apple Music theme');

console.log('🎉 Apple Music color palette fully applied across frontend!');
