const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

// 1. Update index.css
const indexCssPath = path.join(srcDir, 'index.css');
const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: #C41E3A;
  --primary-dark: #8B1524;
  --bg-gray: #F3F4F6;
  --surface: #FFFFFF;
  --text: #111827;
  --accent: #D4AF37;
  --color-gold: #D4AF37;
  --color-gold-light: #F5D77F;
  --color-gold-dark: #9C7A28;
  --color-red: #C41E3A;
  --color-red-dark: #8B1524;
  --color-midnight: #FFFFFF;
  --color-espresso: #FAFAFA;
  --color-ivory: #111827;
  --color-charcoal: #F3F4F6;
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
    color: #111827;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    letter-spacing: -0.01em;
    position: relative;
  }

  h1, h2, h3, .font-heading {
    font-family: 'Cormorant Garamond', 'Georgia', serif;
    letter-spacing: -0.015em;
    color: #111827;
  }

  .font-telugu {
    font-family: 'Noto Serif Telugu', 'Cormorant Garamond', serif;
    line-height: 1.5;
  }
}

/* Custom Refined Light Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 0px;
}

::-webkit-scrollbar-track {
  background: #F3F4F6;
}

::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background: #C41E3A;
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

/* Tactile Editorial Surfaces with Light White & Gold Depth */
.editorial-card {
  background: #FFFFFF;
  border: 1px solid rgba(212, 175, 55, 0.25);
  box-shadow: 0 2px 12px -2px rgba(0, 0, 0, 0.05);
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.editorial-card:hover {
  border-color: #C41E3A;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(196, 30, 58, 0.12), 0 0 12px -2px rgba(212, 175, 55, 0.2);
}

.gold-hairline {
  border-color: rgba(212, 175, 55, 0.35);
}

.gold-gradient-text {
  background: linear-gradient(135deg, #B8860B 0%, #D4AF37 50%, #9C7A28 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.red-gradient-text {
  background: linear-gradient(135deg, #DC2626 0%, #C41E3A 50%, #8B1524 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Atmospheric Stage Glow */
.stage-spotlight {
  background: radial-gradient(ellipse at 50% 15%, rgba(196, 30, 58, 0.06) 0%, rgba(212, 175, 55, 0.05) 45%, rgba(255, 255, 255, 0) 75%);
}

.warm-halo {
  box-shadow: 0 0 40px -10px rgba(212, 175, 55, 0.2);
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
console.log('✅ Updated index.css');

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
`;
fs.writeFileSync(tailwindConfigPath, twConfig.trim(), 'utf8');
console.log('✅ Updated tailwind.config.js');

// 3. Update MainLayout.tsx
const mainLayoutPath = path.join(srcDir, 'components', 'layout', 'MainLayout.tsx');
let mainLayout = fs.readFileSync(mainLayoutPath, 'utf8');
mainLayout = mainLayout.replace(
  'bg-[#0E0305] text-[#FFFFFF] font-sans',
  'bg-[#FAFAFA] text-[#111827] font-sans'
);
mainLayout = mainLayout.replace(
  'bg-black/80 backdrop-blur-md',
  'bg-black/60 backdrop-blur-md'
);
mainLayout = mainLayout.replace(
  'bg-[#0E0305]',
  'bg-white'
);
mainLayout = mainLayout.replace(
  'text-[#FFFFFF]',
  'text-[#111827]'
);
fs.writeFileSync(mainLayoutPath, mainLayout, 'utf8');
console.log('✅ Updated MainLayout.tsx');

// 4. Update Sidebar.tsx
const sidebarPath = path.join(srcDir, 'components', 'layout', 'Sidebar.tsx');
let sidebar = fs.readFileSync(sidebarPath, 'utf8');
sidebar = sidebar.replace(/bg-\[#0E0305\]/g, 'bg-[#FFFFFF]');
sidebar = sidebar.replace(/bg-\[#1A060A\]\/40/g, 'bg-[#F9FAFB]');
sidebar = sidebar.replace(/bg-\[#1A060A\]\/80/g, 'bg-[#F9FAFB]');
sidebar = sidebar.replace(/bg-\[#1A060A\]/g, 'bg-[#F9FAFB]');
sidebar = sidebar.replace(/border-\[#C41E3A\]\/20/g, 'border-gray-200');
sidebar = sidebar.replace(/border-\[#C41E3A\]\/15/g, 'border-gray-200');
sidebar = sidebar.replace(/text-\[#FFFFFF\]/g, 'text-gray-900');
sidebar = sidebar.replace(/text-\[#E2CBD0\]/g, 'text-gray-600');
// Keep active buttons white text
sidebar = sidebar.replace(/bg-\[#C41E3A\] text-gray-900/g, 'bg-[#C41E3A] text-white');
sidebar = sidebar.replace(/bg-gradient-to-tr from-\[#C41E3A\] to-\[#8B1524\] text-gray-900/g, 'bg-gradient-to-tr from-[#C41E3A] to-[#8B1524] text-white');
fs.writeFileSync(sidebarPath, sidebar, 'utf8');
console.log('✅ Updated Sidebar.tsx');

// 5. Update TopBar.tsx
const topBarPath = path.join(srcDir, 'components', 'layout', 'TopBar.tsx');
let topBar = fs.readFileSync(topBarPath, 'utf8');
topBar = topBar.replace(/bg-\[#0E0305\]\/90/g, 'bg-white/95');
topBar = topBar.replace(/bg-\[#0E0305\]/g, 'bg-white');
topBar = topBar.replace(/bg-\[#1A060A\]/g, 'bg-[#F3F4F6]');
topBar = topBar.replace(/bg-\[#26080F\]/g, 'bg-[#FFFFFF]');
topBar = topBar.replace(/bg-\[#340C14\]/g, 'bg-[#FEE2E2]');
topBar = topBar.replace(/border-\[#C41E3A\]\/20/g, 'border-gray-200');
topBar = topBar.replace(/border-\[#C41E3A\]\/30/g, 'border-gray-200');
topBar = topBar.replace(/border-\[#C41E3A\]\/40/g, 'border-gray-300');
topBar = topBar.replace(/text-\[#FFFFFF\]/g, 'text-gray-900');
topBar = topBar.replace(/text-\[#E2CBD0\]/g, 'text-gray-600');
// Restore white text for active red buttons / badges
topBar = topBar.replace(/bg-gradient-to-r from-\[#C41E3A\] to-\[#8B1524\](.*?)text-gray-900/g, 'bg-gradient-to-r from-[#C41E3A] to-[#8B1524]$1text-white');
topBar = topBar.replace(/bg-\[#C41E3A\](.*?)text-gray-900/g, 'bg-[#C41E3A]$1text-white');
fs.writeFileSync(topBarPath, topBar, 'utf8');
console.log('✅ Updated TopBar.tsx');

// 6. Update BottomPlayer.tsx
const playerPath = path.join(srcDir, 'components', 'layout', 'BottomPlayer.tsx');
let player = fs.readFileSync(playerPath, 'utf8');
player = player.replace(/bg-\[#0E0305\]\/95/g, 'bg-white/98');
player = player.replace(/bg-\[#0E0305\]/g, 'bg-white');
player = player.replace(/bg-\[#1A060A\]/g, 'bg-gray-100');
player = player.replace(/bg-\[#26080F\]/g, 'bg-gray-100');
player = player.replace(/border-\[#C41E3A\]\/30/g, 'border-gray-200');
player = player.replace(/border-\[#C41E3A\]\/40/g, 'border-gray-200');
player = player.replace(/text-\[#FFFFFF\]/g, 'text-gray-900');
player = player.replace(/text-\[#E2CBD0\]/g, 'text-gray-500');
player = player.replace(/shadow-\[0_-10px_30px_rgba\(0,0,0,0.85\)\]/g, 'shadow-[0_-4px_25px_rgba(0,0,0,0.08)]');
// Restore play button text color
player = player.replace(/bg-gradient-to-tr from-\[#C41E3A\] to-\[#8B1524\](.*?)text-gray-900/g, 'bg-gradient-to-tr from-[#C41E3A] to-[#8B1524]$1text-white');
fs.writeFileSync(playerPath, player, 'utf8');
console.log('✅ Updated BottomPlayer.tsx');

// 7. Update RightSidebar.tsx
const rightSidebarPath = path.join(srcDir, 'components', 'layout', 'RightSidebar.tsx');
if (fs.existsSync(rightSidebarPath)) {
  let right = fs.readFileSync(rightSidebarPath, 'utf8');
  right = right.replace(/bg-\[#0E0305\]/g, 'bg-white');
  right = right.replace(/bg-\[#1A060A\]/g, 'bg-[#F9FAFB]');
  right = right.replace(/border-\[#C41E3A\]\/20/g, 'border-gray-200');
  right = right.replace(/border-\[#C41E3A\]\/30/g, 'border-gray-200');
  right = right.replace(/text-\[#FFFFFF\]/g, 'text-gray-900');
  right = right.replace(/text-\[#E2CBD0\]/g, 'text-gray-600');
  fs.writeFileSync(rightSidebarPath, right, 'utf8');
  console.log('✅ Updated RightSidebar.tsx');
}

// 8. Update MobileNav.tsx
const mobileNavPath = path.join(srcDir, 'components', 'layout', 'MobileNav.tsx');
if (fs.existsSync(mobileNavPath)) {
  let mobileNav = fs.readFileSync(mobileNavPath, 'utf8');
  mobileNav = mobileNav.replace(/bg-\[#0E0305\]\/95/g, 'bg-white/95');
  mobileNav = mobileNav.replace(/bg-\[#0E0305\]/g, 'bg-white');
  mobileNav = mobileNav.replace(/bg-\[#1A060A\]/g, 'bg-gray-100');
  mobileNav = mobileNav.replace(/border-\[#C41E3A\]\/30/g, 'border-gray-200');
  mobileNav = mobileNav.replace(/text-\[#FFFFFF\]/g, 'text-gray-900');
  mobileNav = mobileNav.replace(/text-\[#E2CBD0\]/g, 'text-gray-500');
  fs.writeFileSync(mobileNavPath, mobileNav, 'utf8');
  console.log('✅ Updated MobileNav.tsx');
}

// 9. Update Pages to replace dark wine backgrounds with crisp white / off-white
const pagesDir = path.join(srcDir, 'pages');
const pages = fs.readdirSync(pagesDir);
for (const p of pages) {
  if (p.endsWith('.tsx') && p !== 'Auth.tsx') { // Auth is already perfected
    const fullPath = path.join(pagesDir, p);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace dark wine backgrounds
    content = content.replace(/bg-\[#0E0305\]/gi, 'bg-white');
    content = content.replace(/bg-\[#1A060A\]/gi, 'bg-[#F9FAFB]');
    content = content.replace(/bg-\[#22070D\]/gi, 'bg-[#F9FAFB]');
    content = content.replace(/bg-\[#26080F\]/gi, 'bg-[#F3F4F6]');
    content = content.replace(/bg-\[#340C14\]/gi, 'bg-[#FEE2E2]');
    content = content.replace(/bg-\[#45101B\]/gi, 'bg-[#F3F4F6]');

    // Replace dark text on light backgrounds
    content = content.replace(/text-\[#E2CBD0\]/gi, 'text-[#4B5563]');
    
    // In headings and titles, replace text-[#FFFFFF] with text-[#111827]
    content = content.replace(/font-heading(.*?)text-\[#FFFFFF\]/gi, 'font-heading$1text-[#111827]');
    content = content.replace(/font-telugu(.*?)text-\[#FFFFFF\]/gi, 'font-telugu$1text-[#111827]');
    content = content.replace(/font-bold(.*?)text-\[#FFFFFF\]/gi, 'font-bold$1text-[#111827]');
    content = content.replace(/font-extrabold(.*?)text-\[#FFFFFF\]/gi, 'font-extrabold$1text-[#111827]');
    content = content.replace(/font-semibold(.*?)text-\[#FFFFFF\]/gi, 'font-semibold$1text-[#111827]');
    
    // Restore text-white on red buttons and red gradients
    content = content.replace(/bg-gradient-to-r from-\[#C41E3A\](.*?)text-\[#111827\]/gi, 'bg-gradient-to-r from-[#C41E3A]$1text-white');
    content = content.replace(/bg-gradient-to-tr from-\[#C41E3A\](.*?)text-\[#111827\]/gi, 'bg-gradient-to-tr from-[#C41E3A]$1text-white');
    content = content.replace(/bg-\[#C41E3A\](.*?)text-\[#111827\]/gi, 'bg-[#C41E3A]$1text-white');
    content = content.replace(/bg-red-600(.*?)text-\[#111827\]/gi, 'bg-red-600$1text-white');
    content = content.replace(/bg-red-700(.*?)text-\[#111827\]/gi, 'bg-red-700$1text-white');

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('✅ Updated page:', p);
  }
}

console.log('🎉 White background theme transition successfully applied!');
