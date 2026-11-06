const { PrismaClient } = require('H:/new project/backend/node_modules/@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.mrehomunxqccvcwpkwxd:Tonyprakash.l%40123@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true'
    }
  }
});

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('Total users in DB:', users.length);
    for (const u of users) {
      console.log('User:', u.email, 'Role:', u.role, 'Name:', u.name);
    }
  } catch (e) {
    console.error('DB query error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();

