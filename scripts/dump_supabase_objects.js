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
    const objects = await prisma.$queryRawUnsafe('SELECT id, bucket_id, name, metadata FROM storage.objects WHERE bucket_id = $1 ORDER BY name ASC', 'songs');
    console.log(`Found ${objects.length} objects in 'songs' bucket.`);

    // Write all uploaded objects to a JSON file
    fs.writeFileSync('H:/new project/scripts/supabase_uploaded_objects.json', JSON.stringify(objects, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    , 2));

    console.log('Saved to H:/new project/scripts/supabase_uploaded_objects.json');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

