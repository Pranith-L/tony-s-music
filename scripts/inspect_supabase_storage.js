const { PrismaClient } = require('H:/new project/backend/node_modules/@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.mrehomunxqccvcwpkwxd:Tonyprakash.l%40123@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
    }
  }
});

async function main() {
  try {
    const objects = await prisma.$queryRawUnsafe(
      'SELECT name, metadata FROM storage.objects WHERE bucket_id = $1 ORDER BY name ASC',
      'songs'
    );
    console.log(`Found ${objects.length} objects in 'songs' bucket.`);

    const formatted = objects.map(o => ({
      name: o.name,
      size: o.metadata ? o.metadata.size : null,
      mimetype: o.metadata ? o.metadata.mimetype : null
    }));

    fs.writeFileSync('H:/new project/scripts/uploaded_songs.json', JSON.stringify(formatted, null, 2));
    console.log('Saved to H:/new project/scripts/uploaded_songs.json');
  } catch (err) {
    console.error('Error querying Supabase storage:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
