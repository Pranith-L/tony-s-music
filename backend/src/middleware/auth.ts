import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { supabase } from '../supabase.js';

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
    { expiresIn: '14d' }
  );
}

/**
 * Universal token resolver supporting both local HMAC JWTs and Supabase Auth ES256 tokens.
 */
export async function resolveUserFromToken(token: string): Promise<AuthenticatedUser | null> {
  if (!token) return null;

  // 1. Try local JWT verification
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded && (decoded.id || decoded.email)) {
      try {
        const pUser = await prisma.user.findFirst({
          where: {
            OR: [
              ...(decoded.id ? [{ id: decoded.id }] : []),
              ...(decoded.email ? [{ email: decoded.email.toLowerCase().trim() }] : []),
            ],
          },
          select: { id: true, email: true, name: true, role: true, avatar: true },
        });
        if (pUser) return pUser;
      } catch {}

      return {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name || 'User',
        role: decoded.role || 'USER',
      };
    }
  } catch {
    // Local JWT verification failed; fall through to Supabase Auth token verification
  }

  // 2. Try Supabase Auth verification
  try {
    const { data: supaAuth, error: supaErr } = await supabase.auth.getUser(token);
    if (!supaErr && supaAuth?.user) {
      const supaUser = supaAuth.user;
      const email = supaUser.email?.toLowerCase().trim() || '';
      try {
        const pUser = await prisma.user.findFirst({
          where: {
            OR: [
              { id: supaUser.id },
              ...(email ? [{ email }] : []),
            ],
          },
          select: { id: true, email: true, name: true, role: true, avatar: true },
        });
        if (pUser) return pUser;
      } catch {}

      const role = (supaUser.user_metadata?.role || 'USER').toUpperCase();
      const name = supaUser.user_metadata?.name || supaUser.user_metadata?.full_name || email.split('@')[0] || 'User';
      return {
        id: supaUser.id,
        email,
        name,
        role,
        avatar: supaUser.user_metadata?.avatar_url || null,
      };
    }
  } catch {}

  return null;
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

  const user = await resolveUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  req.user = user;
  next();
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
    const user = await resolveUserFromToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
}

