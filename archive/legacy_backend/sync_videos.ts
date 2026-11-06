import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prisma } from './src/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const jsonPath = path.resolve(__dirname, '../frontend/src/services/tonyVideos.json');
  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const videos = JSON.parse(raw);

  console.log(`Syncing ${videos.length} YouTube videos from Dad's channel to database...`);

  for (const v of videos) {
    await prisma.video.upsert({
      where: { youtubeId: v.youtubeId },
      update: {
        title: v.title,
        description: v.description || null,
        thumbnail: v.thumbnail,
        duration: v.duration,
        isFeatured: Boolean(v.isFeatured),
        orderIndex: Number(v.orderIndex) || 0,
        status: v.status || 'PUBLISHED',
      },
      create: {
        youtubeId: v.youtubeId,
        title: v.title,
        description: v.description || null,
        thumbnail: v.thumbnail,
        duration: v.duration,
        isFeatured: Boolean(v.isFeatured),
        orderIndex: Number(v.orderIndex) || 0,
        status: v.status || 'PUBLISHED',
      },
    });
  }

  const count = await prisma.video.count();
  console.log(`Successfully synced! Total videos in database: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
