import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { generateToken, authenticateUser, AuthRequest } from '../middleware/auth.js';
import passport from '../passport.js';
import { findOrCreateGoogleUser, createLocalUser } from '../db.js';

const router = Router();

// Register new user
router.post('/register', async (req, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await createLocalUser({
      email,
      passwordHash,
      name,
      phone,
    });

    const token = generateToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'Account created successfully',
      user,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Direct official admin login check
    const normalizedEmail = email.toLowerCase().trim();
    if (
      normalizedEmail === 'tonyprakash.l@admin.in' &&
      password === 'Tonyprakash@admin'
    ) {
      let adminUser = await prisma.user.findFirst({
        where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
      });

      if (!adminUser) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('Tonyprakash@admin', salt);
        adminUser = await prisma.user.create({
          data: {
            email: 'Tonyprakash.l@admin.in',
            passwordHash,
            name: 'Rev. Tony Prakash (Official Admin)',
            role: 'ADMIN',
          },
        });
      }

      const safeUser = {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      };

      const token = generateToken(safeUser);
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.json({
        message: 'Logged in successfully as Admin',
        user: safeUser,
        token,
      });
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash || '');
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = generateToken(safeUser);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Logged in successfully',
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Admin login
router.post('/admin-login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Direct official admin authentication check
    if (
      normalizedEmail === 'tonyprakash.l@admin.in' &&
      password === 'Tonyprakash@admin'
    ) {
      let adminUser = await prisma.user.findFirst({
        where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
      });

      if (!adminUser) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('Tonyprakash@admin', salt);
        adminUser = await prisma.user.create({
          data: {
            email: 'Tonyprakash.l@admin.in',
            passwordHash,
            name: 'Rev. Tony Prakash (Official Admin)',
            role: 'ADMIN',
          },
        });
      }

      const safeUser = {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      };

      const token = generateToken(safeUser);
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.json({
        message: 'Admin access granted',
        user: safeUser,
        token,
      });
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });

    if (!user || user.role !== 'ADMIN') {
      res.status(401).json({ error: 'Invalid credentials or unauthorized admin access' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash || '');
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials or unauthorized admin access' });
      return;
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = generateToken(safeUser);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Admin access granted',
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error during admin login' });
  }
});

// Get current user profile with active subscriptions & purchases
router.get('/me', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        purchases: {
          include: {
            track: {
              select: {
                id: true,
                slug: true,
                titleTelugu: true,
                titleEnglish: true,
                coverImage: true,
                duration: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const activeSub = user.subscriptions[0];
    const isSubscriberActive =
      activeSub &&
      activeSub.status === 'ACTIVE' &&
      new Date(activeSub.currentPeriodEnd) > new Date();

    res.json({
      user: {
        ...user,
        isSubscriberActive,
        activeSubscription: isSubscriberActive ? activeSub : null,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Traditional Passport Google OAuth redirect endpoint
router.get('/google', (req, res, next) => {
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })(req, res, next);
});

// Google OAuth callback endpoint
router.get(
  '/google/callback',
  (req, res, next) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    passport.authenticate('google', (err: any, user: any) => {
      if (err || !user) {
        console.error('Google OAuth callback error:', err);
        return res.redirect(`${clientUrl}/auth?error=google_failed`);
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error('Passport login error:', loginErr);
          return res.redirect(`${clientUrl}/auth?error=login_failed`);
        }

        const safeUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        };

        const token = generateToken(safeUser);
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.redirect(`${clientUrl}/auth?oauth=success&token=${token}`);
      });
    })(req, res, next);
  }
);

// Exchange Google Authorization Code (Supports frontend redirect callback)
router.post('/google/code', async (req, res: Response) => {
  try {
    const { code, redirectUri } = req.body;
    if (!code) {
      res.status(400).json({ error: 'Authorization code is required' });
      return;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callback =
      redirectUri || process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: callback,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData: any = await tokenResponse.json();
    if (tokenData.error) {
      console.error('Google token exchange error:', tokenData);
      res.status(400).json({ error: tokenData.error_description || tokenData.error });
      return;
    }

    let email: string | undefined;
    let name: string | undefined;
    let avatar: string | undefined;
    let googleId: string | undefined;

    if (tokenData.id_token) {
      const decoded: any = jwt.decode(tokenData.id_token);
      if (decoded && decoded.email) {
        email = decoded.email;
        name = decoded.name || decoded.given_name || 'Google User';
        avatar = decoded.picture;
        googleId = decoded.sub;
      }
    }

    if (!email && tokenData.access_token) {
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userInfo: any = await userInfoRes.json();
      email = userInfo.email;
      name = userInfo.name || userInfo.given_name || 'Google User';
      avatar = userInfo.picture;
      googleId = userInfo.sub;
    }

    if (!email) {
      res.status(400).json({ error: 'Failed to retrieve email from Google' });
      return;
    }

    const safeUser = await findOrCreateGoogleUser({
      email,
      name: name || 'Google User',
      avatar,
      googleId,
    });

    const token = generateToken(safeUser);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Signed in with Google successfully',
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error('Google authorization code exchange exception:', error);
    res.status(500).json({ error: 'Internal server error during Google code exchange' });
  }
});

// Google OAuth verification & sign-in (credential or token)
router.post('/google', async (req, res: Response) => {
  try {
    const { credential, userInfo } = req.body;
    let email: string | undefined;
    let name: string | undefined;
    let avatar: string | undefined;
    let googleId: string | undefined;

    if (credential) {
      // Decode the Google ID token
      const decoded: any = jwt.decode(credential);
      if (decoded && decoded.email) {
        email = decoded.email;
        name = decoded.name || decoded.given_name || 'Google User';
        avatar = decoded.picture;
        googleId = decoded.sub;
      }
    } else if (userInfo) {
      email = userInfo.email;
      name = userInfo.name || 'Google User';
      avatar = userInfo.picture;
      googleId = userInfo.id || userInfo.sub;
    }

    if (!email) {
      res.status(400).json({ error: 'Valid Google credential or email is required' });
      return;
    }

    const safeUser = await findOrCreateGoogleUser({
      email,
      name: name || 'Google User',
      avatar,
      googleId,
    });

    const token = generateToken(safeUser);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Signed in with Google successfully',
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: 'Internal server error during Google authentication' });
  }
});

// Logout
router.post('/logout', (_req, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

export default router;
