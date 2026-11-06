import { prisma } from './prisma.js';
import dotenv from 'dotenv';

dotenv.config();

export async function findOrCreateGoogleUser(data: {
  email: string;
  name: string;
  avatar?: string | null;
  googleId?: string | null;
}) {
  const normalizedEmail = data.email.toLowerCase().trim();

  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: normalizedEmail },
        ...(data.googleId ? [{ googleId: data.googleId }] : []),
      ],
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: data.name || 'Google User',
        avatar: data.avatar || null,
        googleId: data.googleId || null,
        provider: 'GOOGLE',
        role: 'USER',
      },
    });
  } else {
    const updateData: any = {};
    if (data.googleId && !user.googleId) updateData.googleId = data.googleId;
    if (data.avatar && !user.avatar) updateData.avatar = data.avatar;
    if (Object.keys(updateData).length > 0) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
  };
}

export async function createLocalUser(data: {
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
}) {
  const normalizedEmail = data.email.toLowerCase().trim();
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash: data.passwordHash,
      name: data.name.trim(),
      phone: data.phone?.trim() || null,
      provider: 'LOCAL',
      role: 'USER',
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };
}
