import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.resolve(__dirname, 'src/seed.ts');
let content = fs.readFileSync(seedPath, 'utf8');

const pattern = /\/\/ 4\. Create Tracks[\s\S]*?for \(const track of tracksData\) \{[\s\S]*?await prisma\.track\.create\(\{ data: track \}\);[\s\S]*?\}/;

const replacement = `// 4. Create Tracks (All 71 Tracks from Tony Prakash songs folder)
  const tracksJsonPath = path.resolve(__dirname, '../../frontend/src/services/generatedTracks.json');
  const tracksData = JSON.parse(fs.readFileSync(tracksJsonPath, 'utf8'));

  for (const track of tracksData) {
    await prisma.track.create({
      data: {
        id: track.id,
        slug: track.slug,
        titleTelugu: track.titleTelugu,
        titleEnglish: track.titleEnglish,
        albumId: null,
        duration: track.duration,
        category: track.category,
        isFeatured: track.isFeatured ?? false,
        isPopular: track.isPopular ?? false,
        isSubscriberOnly: false,
        isDownloadable: true,
        downloadPricePaise: 9900,
        rightsConfirmed: true,
        audioUrl: track.audioUrl,
        coverImage: track.coverImage,
        composer: track.composer,
        lyricist: track.lyricist,
        singer: track.singer,
        releaseYear: track.releaseYear,
        status: track.status,
        lyricsTelugu: track.lyricsTelugu,
        lyricsEnglish: track.lyricsEnglish,
        orderIndex: track.orderIndex,
      }
    });
  }`;

if (!content.includes("import fs from 'fs';")) {
  content = "import fs from 'fs';\nimport path from 'path';\n" + content;
}

if (pattern.test(content)) {
  content = content.replace(pattern, replacement);
  fs.writeFileSync(seedPath, content, 'utf8');
  console.log('Successfully updated seed.ts');
} else {
  console.log('Pattern did not match');
}
