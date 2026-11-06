import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  console.log('Connecting directly to MongoDB at mongodb://127.0.0.1:27017/ ...');
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  await client.connect();
  const db = client.db('tony_prakash_music');
  console.log('Connected to database: tony_prakash_music');

  // 1. Clean existing collections
  const collections = ['User', 'Subscription', 'Purchase', 'Track', 'Album', 'Video', 'Booking', 'Entitlement', 'WebhookEvent', 'SiteSetting'];
  for (const name of collections) {
    try {
      await db.collection(name).deleteMany({});
    } catch (e) {
      // Collection may not exist yet
    }
  }
  console.log('Cleaned collections.');

  // 2. Insert Admin User & Demo Member
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('Tonyprakash@admin', salt);
  const memberHash = await bcrypt.hash('Worship2026!', salt);

  const adminId = new ObjectId();
  const memberId = new ObjectId();

  await db.collection('User').insertMany([
    {
      _id: adminId,
      email: 'Tonyprakash.l@admin.in',
      passwordHash: adminHash,
      name: 'Rev. Tony Prakash',
      phone: '+919440000000',
      role: 'ADMIN',
      provider: 'LOCAL',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: memberId,
      email: 'member@tonyprakash.com',
      passwordHash: memberHash,
      name: 'Grace Worshipper',
      phone: '+919885000000',
      role: 'USER',
      provider: 'LOCAL',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);

  // 3. Insert Subscription for demo member
  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setDate(now.getDate() + 30);

  await db.collection('Subscription').insertOne({
    _id: new ObjectId(),
    userId: memberId,
    planName: "Tony's VIP Pass",
    status: 'ACTIVE',
    amountPaise: 29900,
    currentPeriodStart: now,
    currentPeriodEnd: nextMonth,
    razorpaySubscriptionId: 'sub_demo_active_001',
    createdAt: now,
    updatedAt: now,
  });

  // 4. Insert Albums
  const albumNeethoId = new ObjectId();
  const albumDevaSannidhiId = new ObjectId();
  const albumJourneyOfPraiseId = new ObjectId();

  await db.collection('Album').insertMany([
    {
      _id: albumNeethoId,
      slug: 'neetho',
      titleTelugu: 'నీతో',
      titleEnglish: 'Neetho (With You)',
      releaseYear: 2023,
      coverImage: '/covers/002_Nee_Prema_Naaku_Chalu.jpg',
      description: 'A deeply personal collection of devotion, prayer, and acoustic praise expressing continuous communion with God.',
      isFeatured: true,
      status: 'PUBLISHED',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: albumDevaSannidhiId,
      slug: 'deva-sannidhi',
      titleTelugu: 'దేవ సన్నిధి',
      titleEnglish: 'Deva Sannidhi (In His Presence)',
      releaseYear: 2024,
      coverImage: '/covers/020_Abraham_Devudavu.jpg',
      description: 'Atmospheric worship and sacred Telugu hymns crafted for congregational reflection and intimate adoration.',
      isFeatured: true,
      status: 'PUBLISHED',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: albumJourneyOfPraiseId,
      slug: 'journey-of-praise',
      titleTelugu: 'కీర్తనల యాత్ర',
      titleEnglish: 'A Journey of Praise',
      releaseYear: 2022,
      coverImage: '/covers/010_Jayashali.jpg',
      description: 'Celebrated songs from decades of ministry, showcasing gratitude, divine healing, and enduring faith.',
      isFeatured: false,
      status: 'PUBLISHED',
      createdAt: now,
      updatedAt: now,
    }
  ]);

  // 5. Insert Tracks
  const tracksJsonPath = path.resolve(__dirname, '../../frontend/src/services/generatedTracks.json');
  const tracksData = JSON.parse(fs.readFileSync(tracksJsonPath, 'utf8'));

  const trackDocs = tracksData.map((t: any) => ({
    _id: ObjectId.isValid(t.id) ? new ObjectId(t.id) : new ObjectId(),
    slug: t.slug,
    titleTelugu: t.titleTelugu,
    titleEnglish: t.titleEnglish,
    albumId: null,
    duration: t.duration || '5:30',
    category: t.category || 'Worship',
    isTrack: t.isTrack ?? false,
    isFeatured: t.isFeatured ?? false,
    isPopular: t.isPopular ?? false,
    isSubscriberOnly: t.isSubscriberOnly ?? false,
    isDownloadable: true,
    downloadPricePaise: t.isTrack ? 9900 : 0,
    rightsConfirmed: true,
    audioUrl: t.audioUrl,
    coverImage: t.coverImage,
    composer: t.composer || 'Tony Prakash',
    lyricist: t.lyricist || 'Tony Prakash',
    singer: t.singer || 'Tony Prakash',
    releaseYear: t.releaseYear || 2024,
    status: t.status || 'PUBLISHED',
    lyricsTelugu: t.lyricsTelugu,
    lyricsEnglish: t.lyricsEnglish,
    orderIndex: t.orderIndex || 0,
    createdAt: now,
    updatedAt: now,
  }));

  if (trackDocs.length > 0) {
    await db.collection('Track').insertMany(trackDocs);
    console.log(`Inserted ${trackDocs.length} tracks.`);
  }

  // 6. Insert Videos
  const videosData = [
    {
      _id: new ObjectId(),
      youtubeId: '4x9ArLsmHz0',
      title: 'అబ్రహాము దేవుడవు | Tony Prakash | Telugu Christian Song|',
      description: 'Official Telugu Christian devotional worship song composed and sung by Rev. Tony Prakash.',
      thumbnail: 'https://i.ytimg.com/vi/4x9ArLsmHz0/hqdefault.jpg',
      duration: '6:18',
      isFeatured: true,
      orderIndex: 1,
      status: 'PUBLISHED',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      youtubeId: 'mNQOtzqB8vk',
      title: 'Latest Telugu Christian Song | Nee Preme Naaku Chaalayyaa | Tony Prakash | Flute Suresh | J Shyam',
      description: 'Heartfelt Telugu worship song expressing complete reliance on the boundless grace of Christ.',
      thumbnail: 'https://i.ytimg.com/vi/mNQOtzqB8vk/hqdefault.jpg',
      duration: '5:48',
      isFeatured: true,
      orderIndex: 2,
      status: 'PUBLISHED',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      youtubeId: 'uPa4ZDhoTic',
      title: 'పావురమా నీ ప్రేమ ఎంత మధురం | Pavurama Nee Prema Entha Madhuram | Tony Prakash',
      description: 'Reverent acoustic adoration reflecting on the tender comfort and sweetness of divine love.',
      thumbnail: 'https://i.ytimg.com/vi/uPa4ZDhoTic/hqdefault.jpg',
      duration: '6:04',
      isFeatured: true,
      orderIndex: 3,
      status: 'PUBLISHED',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      youtubeId: 'KzUAqJtp6Wk',
      title: 'Palleturi Tammuda | Tony Prakash',
      description: 'Evangelistic gospel message song proclaiming the good news of hope and salvation.',
      thumbnail: 'https://i.ytimg.com/vi/KzUAqJtp6Wk/hqdefault.jpg',
      duration: '5:12',
      isFeatured: false,
      orderIndex: 4,
      status: 'PUBLISHED',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      youtubeId: 'x6d3q9v89X4',
      title: 'Naa Hrudayamulo | Live Worship | Rev. Tony Prakash',
      description: 'An anointed evening of continuous congregational prayer, praise, and live communion.',
      thumbnail: 'https://i.ytimg.com/vi/x6d3q9v89X4/hqdefault.jpg',
      duration: '7:45',
      isFeatured: false,
      orderIndex: 5,
      status: 'PUBLISHED',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      youtubeId: '8p_3yv6R9eM',
      title: 'Siluvaye Naa Aashrayamu | Tony Prakash Ministries',
      description: 'Meditative Passion Week reflection on the ultimate sacrifice and eternal mercy of the Cross.',
      thumbnail: 'https://i.ytimg.com/vi/8p_3yv6R9eM/hqdefault.jpg',
      duration: '5:32',
      isFeatured: false,
      orderIndex: 6,
      status: 'PUBLISHED',
      createdAt: now,
      updatedAt: now,
    }
  ];
  await db.collection('Video').insertMany(videosData);
  console.log(`Inserted ${videosData.length} videos.`);

  // 7. Insert Bookings
  await db.collection('Booking').insertMany([
    {
      _id: new ObjectId(),
      referenceNo: 'TP-BK-2026-001',
      fullName: 'Pastor K. Emmanuel',
      email: 'emmanuel.k@bethelhyd.org',
      phone: '+91 98490 12345',
      eventType: 'Church Worship Event',
      organization: 'Bethel Christian Assembly',
      eventDate: '2026-11-15',
      preferredTime: '6:30 PM',
      city: 'Hyderabad',
      venue: 'Bethel Main Sanctuary, Secunderabad',
      expectedAudience: '1200+ attendees',
      message: 'We are organizing our Annual Thanksgiving & Worship Festival and would be blessed to have Rev. Tony Prakash lead our congregation in sacred Telugu devotion.',
      status: 'CONTACTED',
      internalNotes: 'Initial contact made. Date confirmed on church calendar. Waiting for coordinator final schedule.',
      consentGiven: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
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
      createdAt: now,
      updatedAt: now,
    }
  ]);

  // 8. Insert Site Settings
  const settings = [
    {
      _id: new ObjectId(),
      key: 'artist_quote',
      value: '“For over three decades, Tony Prakash has devoted himself to Telugu Christian devotional music. As a singer, lyricist, and composer, he creates songs that express faith and share messages of hope, praise, and devotion.”',
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      key: 'whatsapp_number',
      value: '+919440100000',
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      key: 'contact_email',
      value: 'ministry@tonyprakash.com',
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      key: 'subscription_price_paise',
      value: '29900',
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      key: 'download_price_paise',
      value: '9900',
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      key: 'hero_eyebrow',
      value: 'TONY PRAKASH OFFICIAL',
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      key: 'hero_headline',
      value: 'A Voice of Worship. A Heart for His Glory.',
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      key: 'hero_subheading',
      value: 'Discover Telugu Christian devotional songs created to inspire faith, praise, and hope.',
      updatedAt: now,
    },
  ];
  await db.collection('SiteSetting').insertMany(settings);

  await client.close();
  console.log('✅ Local MongoDB seeding complete!');
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
