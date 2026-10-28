import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { prisma } from '../prisma.js';
import { getMongoDb } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sacred_light_jwt_secret_tony_prakash_2026_super_secure';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
}

declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
  }
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function generateToken(user: AuthenticatedUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function authenticateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    let user: AuthenticatedUser | null = null;

    // 1. Try Prisma first
    try {
      const pUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true, role: true, avatar: true },
      });
      if (pUser) {
        user = pUser;
      }
    } catch {
      // Prisma error, fallback to MongoDB
    }

    // 2. Try MongoDB fallback
    if (!user) {
      try {
        const db = await getMongoDb();
        const uObj = /^[0-9a-fA-F]{24}$/.test(decoded.id) ? new ObjectId(decoded.id) : null;
        const mongoUser = await db.collection('User').findOne({
          $or: [
            ...(uObj ? [{ _id: uObj }] : []),
            { id: decoded.id },
            { email: decoded.email?.toLowerCase().trim() },
          ],
        });
        if (mongoUser) {
          user = {
            id: mongoUser._id ? mongoUser._id.toString() : (mongoUser.id || decoded.id),
            email: mongoUser.email,
            name: mongoUser.name || 'User',
            role: mongoUser.role || 'USER',
            avatar: mongoUser.avatar || null,
          };
        }
      } catch {
        // Mongo query error
      }
    }

    // 3. Resilient fallback: if token is verified by JWT_SECRET and has valid id/email
    if (!user && decoded.id && decoded.email) {
      user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name || 'User',
        role: decoded.role || 'USER',
      };
    }

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    return;
  }
  next();
}

export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : req.cookies?.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
      let user: AuthenticatedUser | null = null;
      try {
        const pUser = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, email: true, name: true, role: true, avatar: true },
        });
        if (pUser) user = pUser;
      } catch {
        // ignore
      }

      if (!user) {
        try {
          const db = await getMongoDb();
          const uObj = /^[0-9a-fA-F]{24}$/.test(decoded.id) ? new ObjectId(decoded.id) : null;
          const mongoUser = await db.collection('User').findOne({
            $or: [
              ...(uObj ? [{ _id: uObj }] : []),
              { id: decoded.id },
              { email: decoded.email?.toLowerCase().trim() },
            ],
          });
          if (mongoUser) {
            user = {
              id: mongoUser._id ? mongoUser._id.toString() : (mongoUser.id || decoded.id),
              email: mongoUser.email,
              name: mongoUser.name || 'User',
              role: mongoUser.role || 'USER',
              avatar: mongoUser.avatar || null,
            };
          }
        } catch {
          // ignore
        }
      }

      if (!user && decoded.id && decoded.email) {
        user = {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name || 'User',
          role: decoded.role || 'USER',
        };
      }

      if (user) {
        req.user = user;
      }
    } catch {
      // Ignore token failure for optional auth
    }
  }
  next();
}

