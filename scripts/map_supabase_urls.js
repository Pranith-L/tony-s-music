const fs = require('fs');

const uploaded = JSON.parse(fs.readFileSync('H:/new project/scripts/uploaded_songs.json', 'utf8').replace(/^\uFEFF/, ''));
const tracks = JSON.parse(fs.readFileSync('H:/new project/frontend/src/services/generatedTracks.json', 'utf8').replace(/^\uFEFF/, ''));

const BASE_URL = 'https://mrehomunxqccvcwpkwxd.supabase.co/storage/v1/object/public/songs/';

// Helper to sanitize/normalize for comparison
function clean(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const mapped = [];
const unmapped = [];

for (const t of tracks) {
  let matchedName = null;

  // 1. Studio Minus One Backing Tracks
  if (t.category === 'Track') {
    // Match by track number or name in 'tracks/'
    const origBase = t.audioUrl.split('/').pop().replace(/\.(mp3|wav)$/i, '');
    const num = origBase.match(/^(\d+)/)?.[1];
    
    // Direct or number match in tracks/
    matchedName = uploaded.find(u => {
      if (!u.name.startsWith('tracks/')) return false;
      const uBase = u.name.split('/').pop().replace(/\.mp3$/i, '');
      if (clean(uBase) === clean(origBase)) return true;
      if (num && uBase.startsWith(num + '_')) return true;
      return false;
    })?.name;
  }
  // 2. Albums
  else if (t.albumId) {
    if (t.albumId === 'album-na-asha') {
      // Find in albums/naa-aasha/ by track orderIndex or title
      // orderIndex ranges from 1 to 10
      const orderMatch = t.id.match(/na-asha-(\d+)/)?.[1];
      if (orderMatch) {
        const padNum = orderMatch.padStart(2, '0');
        matchedName = uploaded.find(u => u.name.startsWith('albums/naa-aasha/' + padNum) || u.name.startsWith('albums/naa-aasha/' + orderMatch + ' '))?.name;
      }
    } else if (t.albumId === 'album-nee-sannidhi') {
      const orderMatch = t.id.match(/nee-sannidhi-(\d+)/)?.[1];
      if (orderMatch) {
        const padNum = orderMatch.padStart(2, '0');
        matchedName = uploaded.find(u => u.name.startsWith('albums/nee-sannidhi/' + padNum) || u.name.startsWith('albums/nee-sannidhi/' + orderMatch + ' '))?.name;
      }
    } else if (t.albumId === 'album-neetho') {
      const orderMatch = t.id.match(/neetho-(\d+)/)?.[1];
      if (orderMatch) {
        const padNum = orderMatch.padStart(2, '0');
        matchedName = uploaded.find(u => u.name.startsWith('albums/neetho/' + padNum) || u.name.startsWith('albums/neetho/' + orderMatch + '.'))?.name;
      }
    }
  }
  // 3. Devotional Songs
  else {
    const hitsMap = {
      'tp-hit-song-1': 'devotional/064 yesuva naa kristh.mp3',
      'tp-hit-song-4': 'devotional/072. prayer.mp3',
      'tp-hit-song-5': 'devotional/073. sthuthulaku.mp3',
      'tp-hit-song-11': 'devotional/079.krotha patta.mp3',
      'tp-hit-song-12': 'devotional/080.nee krupa.mp3',
      'tp-hit-song-13': 'devotional/081.rende rende.mp3',
      'tp-hit-song-14': 'devotional/082.naa pattaku.mp3',
    };
    if (hitsMap[t.id]) {
      matchedName = hitsMap[t.id];
    } else {
      const origBase = t.audioUrl.split('/').pop().replace(/\.(mp3|wav)$/i, '');
      const num = origBase.match(/^(\d+)/)?.[1]; // e.g. "001", "002"

      matchedName = uploaded.find(u => {
        if (!u.name.startsWith('devotional/')) return false;
        const uBase = u.name.split('/').pop().replace(/\.mp3$/i, '');
        const uNum = uBase.match(/^(\d+)/)?.[1];
        if (num && uNum && parseInt(num, 10) === parseInt(uNum, 10)) return true;
        if (clean(uBase).includes(clean(t.titleEnglish.split('(')[0]))) return true;
        return false;
      })?.name;
    }
  }

  if (matchedName) {
    // Generate valid safe public URL
    // Encode components to preserve slashes but escape spaces
    const safeUrl = BASE_URL + matchedName.split('/').map(encodeURIComponent).join('/');
    mapped.push({ id: t.id, title: t.titleEnglish, matchedName, safeUrl });
    t.audioUrl = safeUrl;
    t.supabaseStoragePath = matchedName;
  } else {
    unmapped.push({ id: t.id, title: t.titleEnglish, orig: t.audioUrl });
  }
}

console.log(`Total Tracks: ${tracks.length}`);
console.log(`Successfully Mapped: ${mapped.length}`);
console.log(`Unmapped: ${unmapped.length}`);

if (unmapped.length > 0) {
  console.log('Unmapped details:');
  console.log(JSON.stringify(unmapped, null, 2));
}

// Save verified tracks
fs.writeFileSync('H:/new project/frontend/src/services/generatedTracks.json', JSON.stringify(tracks, null, 2), 'utf8');
console.log('Updated generatedTracks.json with live Supabase URLs!');
