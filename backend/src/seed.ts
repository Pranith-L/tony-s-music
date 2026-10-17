import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Tony Prakash Official database into local MongoDB...');

  // 1. Clear existing seedable collections safely using native MongoDB driver (no replica set transaction requirement)
  const mongoClient = new MongoClient('mongodb://127.0.0.1:27017');
  await mongoClient.connect();
  const db = mongoClient.db('tony_prakash_music');
  const collections = await db.listCollections().toArray();
  for (const c of collections) {
    if (!c.name.startsWith('system.')) {
      await db.collection(c.name).deleteMany({});
    }
  }
  await mongoClient.close();
  console.log('Cleared existing collections cleanly.');

  // 2. Create Official Admin User
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Tonyprakash@admin', salt);
  const memberPasswordHash = await bcrypt.hash('Worship2026!', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'Tonyprakash.l@admin.in',
      passwordHash: adminPasswordHash,
      name: 'Rev. Tony Prakash',
      phone: '+919440000000',
      role: 'ADMIN',
    },
  });

  const member = await prisma.user.create({
    data: {
      email: 'member@tonyprakash.com',
      passwordHash: memberPasswordHash,
      name: 'Grace Worshipper',
      phone: '+919885000000',
      role: 'USER',
    },
  });

  // Active subscription for demo member
  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setDate(now.getDate() + 30);

  await prisma.subscription.create({
    data: {
      userId: member.id,
      planName: "Tony's VIP Pass",
      status: 'ACTIVE',
      amountPaise: 29900,
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth,
      razorpaySubscriptionId: 'sub_demo_active_001',
    },
  });

  // 3. Create Albums
  const albumNeetho = await prisma.album.create({
    data: {
      slug: 'neetho',
      titleTelugu: 'నీతో',
      titleEnglish: 'Neetho (With You)',
      releaseYear: 2023,
      coverImage: '/covers/002_Nee_Prema_Naaku_Chalu.jpg',
      description: 'A deeply personal collection of devotion, prayer, and acoustic praise expressing continuous communion with God.',
      isFeatured: true,
      status: 'PUBLISHED',
    },
  });

  const albumDevaSannidhi = await prisma.album.create({
    data: {
      slug: 'deva-sannidhi',
      titleTelugu: 'దేవ సన్నిధి',
      titleEnglish: 'Deva Sannidhi (In His Presence)',
      releaseYear: 2024,
      coverImage: '/covers/020_Abraham_Devudavu.jpg',
      description: 'Atmospheric worship and sacred Telugu hymns crafted for congregational reflection and intimate adoration.',
      isFeatured: true,
      status: 'PUBLISHED',
    },
  });

  const albumJourneyOfPraise = await prisma.album.create({
    data: {
      slug: 'journey-of-praise',
      titleTelugu: 'కీర్తనల యాత్ర',
      titleEnglish: 'A Journey of Praise',
      releaseYear: 2022,
      coverImage: '/covers/010_Jayashali.jpg',
      description: 'Celebrated songs from decades of ministry, showcasing gratitude, divine healing, and enduring faith.',
      isFeatured: false,
      status: 'PUBLISHED',
    },
  });

  // 4. Create Tracks (All 71 Tracks from Tony Prakash songs folder)
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
      }
    });
  }

  // 5. Create Videos from Official YouTube Channel
  const videosData = [
    {
      youtubeId: '4x9ArLsmHz0',
      title: 'అబ్రహాము దేవుడవు | Tony Prakash | Telugu Christian Song|',
      description: 'Official Telugu Christian devotional worship song composed and sung by Rev. Tony Prakash.',
      thumbnail: 'https://i.ytimg.com/vi/4x9ArLsmHz0/hqdefault.jpg',
      duration: '6:18',
      isFeatured: true,
      orderIndex: 1,
    },
    {
      youtubeId: 'mNQOtzqB8vk',
      title: 'Latest Telugu Christian Song | Nee Preme Naaku Chaalayyaa | Tony Prakash | Flute Suresh | J Shyam',
      description: 'Heartfelt Telugu worship song expressing complete reliance on the boundless grace of Christ.',
      thumbnail: 'https://i.ytimg.com/vi/mNQOtzqB8vk/hqdefault.jpg',
      duration: '5:48',
      isFeatured: true,
      orderIndex: 2,
    },
    {
      youtubeId: 'uPa4ZDhoTic',
      title: 'పావురమా నీ ప్రేమ ఎంత మధురం | Pavurama Nee Prema Entha Madhuram | Tony Prakash',
      description: 'Reverent acoustic adoration reflecting on the tender comfort and sweetness of divine love.',
      thumbnail: 'https://i.ytimg.com/vi/uPa4ZDhoTic/hqdefault.jpg',
      duration: '6:04',
      isFeatured: true,
      orderIndex: 3,
    },
    {
      youtubeId: 'KzUAqJtp6Wk',
      title: 'Palleturi Tammuda | Tony Prakash',
      description: 'Evangelistic gospel message song proclaiming the good news of hope and salvation.',
      thumbnail: 'https://i.ytimg.com/vi/KzUAqJtp6Wk/hqdefault.jpg',
      duration: '5:12',
      isFeatured: false,
      orderIndex: 4,
    },
    {
      youtubeId: 'ZZ3ioz_DC54',
      title: 'Mosapokidi priyuda | Tony Prakash | Telugu Christian song',
      description: 'Solemn devotional exhortation calling believers to walk steadfastly in truth and purity.',
      thumbnail: 'https://i.ytimg.com/vi/ZZ3ioz_DC54/hqdefault.jpg',
      duration: '5:35',
      isFeatured: false,
      orderIndex: 5,
    },
    {
      youtubeId: 'vqe2isvmkI4',
      title: 'నేనెల్లప్పుడు యెహోవాను || Anthaa Naa Meluke || Tony Prakash',
      description: 'Praise anthem of thanksgiving rejoicing that God turns all hardships into blessings.',
      thumbnail: 'https://i.ytimg.com/vi/vqe2isvmkI4/hqdefault.jpg',
      duration: '5:22',
      isFeatured: false,
      orderIndex: 6,
    },
    {
      youtubeId: 'w3P9BhTmNJo',
      title: 'యేసు ప్రేమ చాటేదము రండి || Yesu prema chatedamu randi || Tony Prakash || Telugu Christian song',
      description: 'Joyful congregational call to unite in spreading the love of Jesus across the nation.',
      thumbnail: 'https://i.ytimg.com/vi/w3P9BhTmNJo/hqdefault.jpg',
      duration: '4:56',
      orderIndex: 7,
    },
    {
      youtubeId: 'fi-wPvvoFx0',
      title: 'Manishi brathuku rangula valayam | Tony Prakash',
      description: 'Profound devotional reflection on the fleeting nature of worldly pursuits and resting in the Lord.',
      thumbnail: 'https://i.ytimg.com/vi/fi-wPvvoFx0/hqdefault.jpg',
      duration: '6:10',
      orderIndex: 8,
    },
    {
      youtubeId: 'VCyrxx0K7Go',
      title: 'Latest Telugu Christian Song | Kadavari Dhinamulalo | Tony Prakash | Flute Suresh | Hallaluya Raju',
      description: 'Prophetic worship stirring spiritual awakening and readiness in the latter days.',
      thumbnail: 'https://i.ytimg.com/vi/VCyrxx0K7Go/hqdefault.jpg',
      duration: '5:45',
      isFeatured: true,
      orderIndex: 9,
    },
  ];

  for (const v of videosData) {
    await prisma.video.create({ data: v });
  }

  // 6. Sample Booking Requests for Admin Dashboard
  await prisma.booking.create({
    data: {
      referenceNo: 'TP-BK-2026-001',
      fullName: 'Pastor John Timothy',
      email: 'pastor.john@gracechurchhyd.org',
      phone: '+91 98480 12345',
      eventType: 'Church Worship Event',
      organization: 'Grace Baptist Church, Hyderabad',
      eventDate: '2026-11-15',
      preferredTime: '6:30 PM',
      city: 'Hyderabad',
      venue: 'Grace Auditorium, Secunderabad',
      expectedAudience: '1200 believers',
      message: 'We would be deeply blessed to invite Bro. Tony Prakash to lead the evening worship session for our 25th Annual Gospel Convention.',
      status: 'CONFIRMED',
      internalNotes: 'Confirmed travel schedule and acoustic sound check on the morning of Nov 15.',
      consentGiven: true,
    },
  });

  await prisma.booking.create({
    data: {
      referenceNo: 'TP-BK-2026-002',
      fullName: 'Samuel David',
      email: 'samuel.d@vizagworship.com',
      phone: '+91 99890 54321',
      eventType: 'Christian Conference',
      organization: 'Coastal Andhra Youth Fellowship',
      eventDate: '2026-12-05',
      preferredTime: '10:00 AM',
      city: 'Visakhapatnam',
      venue: 'St. Paul’s Memorial Grounds',
      expectedAudience: '800 youth',
      message: 'Youth revival worship rally. Bro. Tony Prakash’s songs have been a great inspiration to our youth across Andhra Pradesh.',
      status: 'NEW',
      internalNotes: 'Follow up by phone regarding sound team requirements.',
      consentGiven: true,
    },
  });

  // 7. Site Settings
  const defaultSettings = [
    {
      key: 'artist_quote',
      value: '“For over three decades, Tony Prakash has devoted himself to Telugu Christian devotional music. As a singer, lyricist, and composer, he creates songs that express faith and share messages of hope, praise, and devotion.”',
    },
    {
      key: 'whatsapp_number',
      value: '+919440100000',
    },
    {
      key: 'contact_email',
      value: 'ministry@tonyprakash.com',
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

  for (const s of defaultSettings) {
    await prisma.siteSetting.create({ data: s });
  }

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
