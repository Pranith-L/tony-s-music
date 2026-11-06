import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function syncAllMongoData() {
  console.log('🔄 Checking and syncing all data into MongoDB...');
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  await client.connect();
  const db = client.db('tony_prakash_music');

  // 1. Sync all 26 real YouTube Videos into MongoDB Video collection
  const videosPath = path.resolve(__dirname, 'tonyVideos.json');
  if (fs.existsSync(videosPath)) {
    const rawVideos = JSON.parse(fs.readFileSync(videosPath, 'utf-8'));
    console.log(`Found ${rawVideos.length} authentic videos in tonyVideos.json.`);

    // Clear old/dummy videos
    await db.collection('Video').deleteMany({});

    const now = new Date();
    const formattedVideos = rawVideos.map((v: any, idx: number) => ({
      _id: new ObjectId(),
      youtubeId: v.youtubeId,
      title: v.title,
      category: v.category || 'Devotional Release',
      description: v.description || 'Official video release by Rev. Tony Prakash.',
      thumbnail: v.thumbnail || `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`,
      duration: v.duration || '5:30',
      published: v.published || 'Recently published',
      views: v.views || '1K+ views',
      isFeatured: idx < 3,
      orderIndex: idx + 1,
      status: 'PUBLISHED',
      createdAt: now,
      updatedAt: now,
    }));

    await db.collection('Video').insertMany(formattedVideos);
    console.log(`✅ Successfully synced ${formattedVideos.length} videos into MongoDB.`);
  }

  // 2. Ensure Bookings exist in MongoDB
  const bookingCount = await db.collection('Booking').countDocuments();
  if (bookingCount === 0) {
    const now = new Date();
    const sampleBookings = [
      {
        _id: new ObjectId(),
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
      },
    ];
    await db.collection('Booking').insertMany(sampleBookings);
    console.log('✅ Successfully synced sample Bookings into MongoDB.');
  }

  // 3. Log updated counts
  console.log('\n📊 Updated MongoDB Collections Summary:');
  const collections = await db.listCollections().toArray();
  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`- ${c.name}: ${count} documents`);
  }

  await client.close();
  console.log('✨ MongoDB update completed successfully.');
}

syncAllMongoData().catch(console.error);
