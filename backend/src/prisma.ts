import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

// Check MongoDB connection asynchronously
prisma
  .$connect()
  .then(() => {
    console.log('🍃 MongoDB connected successfully via Prisma');
  })
  .catch((err: any) => {
    console.warn('⚠️ MongoDB connection notice: Check DATABASE_URL in .env if running offline:', err.message);
  });
