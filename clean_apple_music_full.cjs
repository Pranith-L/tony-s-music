const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

// Replacements dictionary for Apple Music Design System
const replacements = [
  // Old wine backgrounds -> Apple light surfaces
  [/bg-\[#0E0305\]\/95/g, 'bg-white/95'],
  [/bg-\[#0E0305\]\/90/g, 'bg-white/90'],
  [/bg-\[#0E0305\]\/80/g, 'bg-white/80'],
  [/bg-\[#0E0305\]/g, 'bg-white'],
  [/bg-\[#1A060A\]\/80/g, 'bg-[#F5F5F7]'],
  [/bg-\[#1A060A\]\/40/g, 'bg-[#F5F5F7]'],
  [/bg-\[#1A060A\]/g, 'bg-[#F5F5F7]'],
  [/bg-\[#22070D\]/g, 'bg-[#F5F5F7]'],
  [/bg-\[#26080F\]/g, 'bg-white'],
  [/bg-\[#340C14\]\/50/g, 'bg-[#F2F2F7]'],
  [/bg-\[#340C14\]/g, 'bg-[#F2F2F7]'],
  [/bg-\[#45101B\]/g, 'bg-[#F2F2F7]'],
  [/bg-\[#030B10\]\/98/g, 'bg-black/60'],
  [/bg-\[#030B10\]/g, 'bg-white'],
  [/bg-\[#041117\]/g, 'bg-[#F5F5F7]'],
  [/bg-\[#12222D\]\/90/g, 'bg-[#F5F5F7]'],
  [/bg-\[#12222D\]/g, 'bg-[#F5F5F7]'],
  [/bg-\[#1C2630\]/g, 'bg-[#FA243C]'],
  [/bg-\[#253340\]/g, 'bg-[#D71A30]'],

  // Hover dark backgrounds -> Apple hover light gray
  [/hover:bg-\[#340C14\]/g, 'hover:bg-[#EBEBEF]'],
  [/hover:bg-\[#26080F\]/g, 'hover:bg-white'],
  [/hover:bg-\[#1A060A\]/g, 'hover:bg-[#EBEBEF]'],
  [/hover:bg-\[#162A38\]/g, 'hover:bg-white'],

  // Borders -> Apple hairline border #E5E5EA
  [/border-\[#C41E3A\]\/40/g, 'border-[#E5E5EA]'],
  [/border-\[#C41E3A\]\/30/g, 'border-[#E5E5EA]'],
  [/border-\[#C41E3A\]\/20/g, 'border-[#E5E5EA]'],
  [/border-\[#C41E3A\]\/15/g, 'border-[#E5E5EA]'],
  [/border-\[#C41E3A\]\/50/g, 'border-[#FA243C]/40'],
  [/border-\[#C41E3A\]/g, 'border-[#FA243C]'],
  [/border-\[#FA243C\]\/40/g, 'border-[#E5E5EA]'],
  [/border-\[#FA243C\]\/30/g, 'border-[#E5E5EA]'],
  [/border-\[#FA243C\]\/20/g, 'border-[#E5E5EA]'],
  [/border-\[#FA243C\]\/15/g, 'border-[#E5E5EA]'],
  [/border-\[#D4AF37\]\/40/g, 'border-[#E5E5EA]'],
  [/border-\[#D4AF37\]\/30/g, 'border-[#E5E5EA]'],
  [/border-\[#D4AF37\]\/35/g, 'border-[#E5E5EA]'],
  [/border-\[#D4AF37\]\/50/g, 'border-[#D4A017]/40'],
  [/border-\[#D4A017\]\/50/g, 'border-[#D4A017]/40'],
  [/border-\[#D4A017\]\/70/g, 'border-[#D4A017]/50'],

  // Old text colors -> Apple Typography
  [/text-\[#E2CBD0\]\/60/g, 'text-[#86868B]'],
  [/text-\[#E2CBD0\]/g, 'text-[#86868B]'],
  [/text-\[#E8DCB8\]/g, 'text-[#D4A017]'],
  [/text-\[#8CE2FF\]/g, 'text-[#FA243C]'],

  // Red gradients -> Apple Music Red gradient
  [/from-\[#C41E3A\] to-\[#8B1524\]/g, 'from-[#FC3C44] to-[#FA243C]'],
  [/from-\[#FA243C\] to-\[#D71A30\]/g, 'from-[#FC3C44] to-[#FA243C]'],
  [/from-\[#FA243C\] via-\[#D71A30\] to-\[#FA243C\]/g, 'from-[#FC3C44] to-[#FA243C]'],
  [/from-\[#22070D\] via-\[#8B1524\] to-\[#C41E3A\]/g, 'from-[#FC3C44] to-[#FA243C]'],
  [/from-\[#8B1524\]\/40 via-\[#1A060A\] to-\[#0E0305\]/g, 'from-[#FFF0F2] via-white to-white'],
  [/from-\[#8B1524\]\/40 via-\[#F5F5F7\] to-white/g, 'from-[#FFF0F2] via-white to-white'],

  // Old glow / cyan / turquoise remnants
  [/rgba\(27,124,157,0\.2\)/g, 'rgba(250,36,60,0.15)'],
  [/rgba\(27,124,157,0\.4\)/g, 'rgba(250,36,60,0.2)'],
  [/rgba\(27,124,157,0\.5\)/g, 'rgba(250,36,60,0.25)'],
  [/rgba\(201,178,124,0\.15\)/g, 'rgba(212,160,23,0.15)'],
  [/rgba\(201,178,124,0\.25\)/g, 'rgba(212,160,23,0.15)'],
  [/rgba\(201,178,124,0\.3\)/g, 'rgba(212,160,23,0.2)'],
];

function processDirectory(d) {
  const files = fs.readdirSync(d);
  for (const f of files) {
    const full = path.join(d, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      processDirectory(full);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      let content = fs.readFileSync(full, 'utf8');
      let changed = false;
      for (const [pattern, repl] of replacements) {
        if (pattern.test(content)) {
          content = content.replace(pattern, repl);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(full, content, 'utf8');
        console.log('Processed:', path.relative(__dirname, full));
      }
    }
  }
}

processDirectory(srcDir);

// Specifically refine Sidebar.tsx to match Apple Music macOS/iPadOS sidebar
const sidebarPath = path.join(srcDir, 'components', 'layout', 'Sidebar.tsx');
let sidebar = fs.readFileSync(sidebarPath, 'utf8');
// Give sidebar Apple's signature light gray background
sidebar = sidebar.replace(/className={`hidden md:flex flex-col h-full pb-\[86px\] bg-\[#FFFFFF\]/g, 'className={`hidden md:flex flex-col h-full pb-[86px] bg-[#F5F5F7]');
// Make active nav item pop with Apple Music Red
sidebar = sidebar.replace(
  /isActive\s*\?\s*'bg-gradient-to-r from-\[#FA243C\]\/30 to-\[#D71A30\]\/20 text-\[#1D1D1F\] border border-\[#FA243C\]\/40 shadow-\[0_0_15px_rgba\(27,124,157,0\.2\)\]'\s*:\s*'text-\[#86868B\] hover:text-\[#1D1D1F\] hover:bg-\[#F5F5F7\]'/g,
  "isActive ? 'bg-[#FA243C] text-white shadow-sm shadow-[#FA243C]/25' : 'text-[#1D1D1F] hover:bg-[#EBEBEF]'"
);
sidebar = sidebar.replace(
  /isActive \? 'text-\[#FA243C\]' : 'text-\[#86868B\]'/g,
  "isActive ? 'text-white' : 'text-[#FA243C]'"
);
// Library card white container
sidebar = sidebar.replace(/bg-\[#F5F5F7\] backdrop-blur-md rounded-2xl border border-\[#E5E5EA\]/g, 'bg-white rounded-2xl border border-[#E5E5EA] shadow-sm');
fs.writeFileSync(sidebarPath, sidebar, 'utf8');
console.log('✅ Apple Music sidebar perfected');

// Specifically refine TopBar.tsx search & buttons
const topBarPath = path.join(srcDir, 'components', 'layout', 'TopBar.tsx');
let topBar = fs.readFileSync(topBarPath, 'utf8');
topBar = topBar.replace(/bg-\[#F2F2F7\] hover:bg-\[#FFFFFF\] focus:bg-\[#FFFFFF\] text-xs sm:text-sm text-\[#1D1D1F\] placeholder-\[#86868B\]/g, 'bg-[#E5E5EA]/70 hover:bg-[#E5E5EA] focus:bg-white text-xs sm:text-sm text-[#1D1D1F] placeholder-[#86868B]');
fs.writeFileSync(topBarPath, topBar, 'utf8');
console.log('✅ Apple Music topbar perfected');

// Specifically refine BottomPlayer.tsx scrubber & controls
const playerPath = path.join(srcDir, 'components', 'layout', 'BottomPlayer.tsx');
let player = fs.readFileSync(playerPath, 'utf8');
player = player.replace(/bg-gradient-to-r from-\[#FA243C\] to-\[#D4A017\]/g, 'bg-[#FA243C]');
player = player.replace(/text-gray-900 flex items-center justify-center/g, 'text-white flex items-center justify-center');
player = player.replace(/bg-white\/98 backdrop-blur-2xl/g, 'bg-white/92 backdrop-blur-2xl');
player = player.replace(/shadow-\[0_-4px_25px_rgba\(0,0,0,0\.08\)\]/g, 'shadow-[0_-4px_20px_rgba(0,0,0,0.04)]');
fs.writeFileSync(playerPath, player, 'utf8');
console.log('✅ Apple Music bottom player perfected');

// Specifically refine VideoModal.tsx for light backdrop and card
const videoModalPath = path.join(srcDir, 'components', 'VideoModal.tsx');
let videoModal = fs.readFileSync(videoModalPath, 'utf8');
videoModal = videoModal.replace(/bg-gradient-to-b from-\[#FFF0F2\] via-white to-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-\[#E5E5EA\] shadow-2xl/g, 'bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#E5E5EA] shadow-2xl');
videoModal = videoModal.replace(/text-\[#FFFFFF\]/g, 'text-[#1D1D1F]');
videoModal = videoModal.replace(/bg-black\/60 hover:bg-\[#FA243C\] text-\[#86868B\] hover:text-white/g, 'bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1D1D1F] hover:text-[#FA243C]');
fs.writeFileSync(videoModalPath, videoModal, 'utf8');
console.log('✅ Apple Music video modal perfected');

console.log('🌟 Complete Apple Music design system overhaul finished!');
