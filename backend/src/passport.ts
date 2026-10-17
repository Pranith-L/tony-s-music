import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from './prisma.js';
import { findOrCreateGoogleUser } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/auth/google/callback';

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        proxy: true,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase().trim();
          if (!email) {
            return done(new Error('No email found in Google profile'), undefined);
          }

          const name = profile.displayName || profile.name?.givenName || 'Google User';
          const avatar = profile.photos?.[0]?.value;
          const googleId = profile.id;

          const safeUser = await findOrCreateGoogleUser({
            email,
            name,
            avatar,
            googleId,
          });

          return done(null, safeUser);
        } catch (error) {
          console.error('Passport Google Strategy error:', error);
          return done(error as Error, undefined);
        }
      }
    )
  );
} else {
  console.warn('⚠️ Google OAuth Client ID or Secret not configured in backend/.env');
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
      },
    });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
