import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

// Check PostgreSQL connection asynchronously
prisma
  .$connect()
  .then(() => {
    console.log('⚡ Supabase PostgreSQL connected successfully via Prisma');
  })
  .catch((err: any) => {
    console.warn('⚠️ Supabase PostgreSQL connection notice:', err.message);
  });
