const fs = require('fs');

const uploaded = JSON.parse(fs.readFileSync('H:/new project/scripts/uploaded_songs.json', 'utf8').replace(/^\uFEFF/, ''));
const tracks = JSON.parse(fs.readFileSync('H:/new project/frontend/src/services/generatedTracks.json', 'utf8').replace(/^\uFEFF/, ''));

console.log(`Uploaded in Supabase: ${uploaded.length}`);
console.log(`Tracks in frontend: ${tracks.length}`);

// Test matching
const uploadedNames = uploaded.map(u => u.name);

// Check tracks
const tracksMatching = [];
const tracksNotMatching = [];

for (const t of tracks) {
  // Let's see if we can find matching uploaded file
  // Try exact match or base name match or number match
  const origAudioUrl = t.audioUrl;
  const fileName = origAudioUrl.split('/').pop().replace(/\.wav$/, '.mp3');
  
  // Try to find in uploaded
  let match = uploadedNames.find(u => u.endsWith('/' + fileName) || u === fileName);

  if (!match) {
    // Try matching by track number or title
    const numMatch = fileName.match(/^(\d+)/);
    if (numMatch) {
      const num = parseInt(numMatch[1], 10);
      match = uploadedNames.find(u => {
        const uBase = u.split('/').pop();
        const uNumMatch = uBase.match(/^(\d+)/);
        if (uNumMatch && parseInt(uNumMatch[1], 10) === num) {
          // Check folder category
          if (t.category === 'Track' && u.startsWith('tracks/')) return true;
          if (t.albumId && u.startsWith('albums/')) return true;
          if (!t.albumId && t.category !== 'Track' && u.startsWith('devotional/')) return true;
        }
        return false;
      });
    }
  }

  if (match) {
    tracksMatching.push({ id: t.id, title: t.titleEnglish, match });
  } else {
    tracksNotMatching.push({ id: t.id, title: t.titleEnglish, fileName, category: t.category, albumId: t.albumId });
  }
}

console.log(`Matched: ${tracksMatching.length}`);
console.log(`Unmatched: ${tracksNotMatching.length}`);

if (tracksNotMatching.length > 0) {
  console.log('Unmatched samples:');
  console.log(JSON.stringify(tracksNotMatching.slice(0, 15), null, 2));
}
