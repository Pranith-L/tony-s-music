import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  // 1. Clear existing tables safely using Prisma
  await prisma.webhookEvent.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.purchase.deleteMany({});
  await prisma.entitlement.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.track.deleteMany({});
  await prisma.album.deleteMany({});
  await prisma.video.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.siteSetting.deleteMany({});
  console.log('Cleared existing PostgreSQL tables cleanly.');

  // 2. Create Official Admin User
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Tonyprakash@admin', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'Tonyprakash.l@admin.in',
      passwordHash: adminPasswordHash,
      name: 'Rev. Tony Prakash',
      phone: '+919841345007',
      role: 'ADMIN',
    },
  });

  // 3. Create Albums (Only the 2 authentic albums from Rev. Tony Prakash)
  const albumNaAsha = await prisma.album.create({
    data: {
      id: 'album-na-asha',
      slug: 'na-asha',
      titleTelugu: 'నా ఆశ',
      titleEnglish: 'Naa Aasha (My Desire)',
      releaseYear: 2023,
      coverImage: '/covers/track_5_Asha_asha_track.jpg',
      description: "Rev. Tony Prakash's acclaimed devotional album featuring soul-stirring Telugu worship and adoration hymns.",
      isFeatured: true,
      status: 'PUBLISHED',
    },
  });

  const albumNeeSannidhi = await prisma.album.create({
    data: {
      id: 'album-nee-sannidhi',
      slug: 'nee-sannidhi',
      titleTelugu: 'నీ సన్నిధి',
      titleEnglish: 'Nee Sannidhi (In His Presence)',
      releaseYear: 2024,
      coverImage: '/covers/album_nee_sannidhi.jpg',
      description: 'Atmospheric worship and sacred Telugu hymns crafted for congregational reflection and intimate adoration.',
      isFeatured: true,
      status: 'PUBLISHED',
    },
  });

  const albumNeetho = await prisma.album.create({
    data: {
      id: 'album-neetho',
      slug: 'neetho',
      titleTelugu: 'నీతో',
      titleEnglish: 'Neetho (With You)',
      releaseYear: 2024,
      coverImage: '/covers/album_neetho.jpg',
      description: 'Soul-stirring worship and intimate communion hymns by Rev. Tony Prakash — “I will sing to the Lord all my life” (Psalm 104:33).',
      isFeatured: true,
      status: 'PUBLISHED',
    },
  });

  // 4. Create Tracks (All Tracks from Tony Prakash songs folder)
  const tracksJsonPath = path.resolve(__dirname, '../../frontend/src/services/generatedTracks.json');
  const tracksData = JSON.parse(fs.readFileSync(tracksJsonPath, 'utf8'));

  const validAlbumIds = new Set([albumNaAsha.id, albumNeeSannidhi.id, albumNeetho.id]);

  const tracksToInsert = tracksData.map((track: any) => ({
    id: track.id,
    slug: track.slug,
    titleTelugu: track.titleTelugu,
    titleEnglish: track.titleEnglish,
    albumId: (track.albumId && validAlbumIds.has(track.albumId)) ? track.albumId : null,
    duration: track.duration,
    category: track.category,
    isTrack: track.isTrack ?? false,
    isFeatured: track.isFeatured ?? false,
    isPopular: track.isPopular ?? false,
    isSubscriberOnly: track.isSubscriberOnly ?? false,
    isDownloadable: true,
    downloadPricePaise: track.isTrack ? 9900 : 0,
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
  }));

  await prisma.track.createMany({ data: tracksToInsert });
  console.log(`Inserted ${tracksToInsert.length} tracks into Supabase!`);

  // 5. Create Videos from Official YouTube Channel (All 30 Videos)
  const videosJsonPath = path.resolve(__dirname, 'tonyVideos.json');
  const rawVideos = JSON.parse(fs.readFileSync(videosJsonPath, 'utf8'));

  const videosData = rawVideos.map((v: any, index: number) => ({
    youtubeId: v.youtubeId,
    title: v.title,
    description: v.description || '',
    thumbnail: v.thumbnail || `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`,
    duration: v.duration || '6:00',
    isFeatured: v.isFeatured ?? (index < 6),
    orderIndex: v.orderIndex ?? (index + 1),
    status: v.status || 'PUBLISHED',
  }));

  await prisma.video.createMany({ data: videosData });
  console.log(`Inserted all ${videosData.length} videos into Supabase!`);

  // 6. Site Settings
  const defaultSettings = [
    {
      key: 'artist_quote',
      value: '“For over three decades, Tony Prakash has devoted himself to Telugu Christian devotional music. As a singer, lyricist, and composer, he creates songs that express faith and share messages of hope, praise, and devotion.”',
    },
    {
      key: 'whatsapp_number',
      value: '+919841345007',
    },
    {
      key: 'contact_email',
      value: 'tonyprakash.l@gmail.com',
    },
    {
      key: 'subscription_price_paise',
      value: '29900',
    },
    {
      key: 'download_price_paise',
      value: '9900',
    },
    {
      key: 'hero_eyebrow',
      value: 'TONY PRAKASH OFFICIAL',
    },
    {
      key: 'hero_headline',
      value: 'A Voice of Worship. A Heart for His Glory.',
    },
    {
      key: 'hero_subheading',
      value: 'Discover Telugu Christian devotional songs created to inspire faith, praise, and hope.',
    },
  ];

  await prisma.siteSetting.createMany({ data: defaultSettings });
  console.log('Inserted site settings into Supabase!');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
