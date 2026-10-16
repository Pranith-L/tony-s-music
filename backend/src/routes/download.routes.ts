import { Router, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../prisma.js';
import { authenticateUser, AuthRequest } from '../middleware/auth.js';

const router = Router();
const DOWNLOAD_SECRET = process.env.DOWNLOAD_TOKEN_SECRET || 'sacred_download_token_secret_key_88990';
const TOKEN_EXPIRY_SECONDS = Number(process.env.DOWNLOAD_EXPIRY_SECONDS) || 3600;

// Helper to sign download payload
function signDownloadToken(payload: { userId: string; trackId: string; exp: number }): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', DOWNLOAD_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

// Helper to verify download payload
function verifyDownloadToken(token: string): { userId: string; trackId: string; exp: number } | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', DOWNLOAD_SECRET).update(data).digest('base64url');
  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// 1. Request a short-lived download token (Server-side entitlement check)
router.get('/:trackId/request-token', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const trackId = String(req.params.trackId);
    const userId = req.user!.id;

    const track = await prisma.track.findUnique({
      where: { id: trackId },
    });

    if (!track) {
      res.status(404).json({ error: 'Track not found' });
      return;
    }

    if (!track.isDownloadable) {
      res.status(403).json({ error: 'This track is not available for download.' });
      return;
    }

    if (!track.rightsConfirmed) {
      res.status(403).json({
        error: 'Song distribution rights are awaiting official confirmation before download access is permitted.',
      });
      return;
    }

    // Entitlement Check:
    // (a) User purchased the track
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId,
        trackId: track.id,
        status: 'SUCCESS',
      },
    });

    // (b) Active Tony's VIP Pass subscriber (if track allows subscriber downloads)
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        currentPeriodEnd: { gt: new Date() },
      },
    });

    const isBackingTrack =
      track.category === 'Track' ||
      track.category === 'Studio Track' ||
      track.titleEnglish.toLowerCase().includes('(track)') ||
      track.titleTelugu.includes('(ట్రాక్)');

    let hasAccess = false;
    if (req.user!.role === 'ADMIN') {
      // Official Admin has full administrative testing access
      hasAccess = true;
    } else if (isBackingTrack) {
      // Studio Backing Tracks require individual ₹99 purchase verification in database
      hasAccess = Boolean(purchase);
    } else {
      // Devotional songs can be downloaded with individual purchase or One-Time Pass
      hasAccess = Boolean(purchase) || Boolean(activeSubscription);
    }

    if (!hasAccess) {
      res.status(403).json({
        error: isBackingTrack
          ? 'Individual studio backing track purchase (₹99) is required to download this karaoke track.'
          : 'Songs One-Time Pass (₹299) or track purchase is required to download this devotional song.',
        requiresPurchase: true,
        pricePaise: track.downloadPricePaise || 9900,
      });
      return;
    }

    // Generate short-lived token valid for 1 hour
    const exp = Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS;
    const token = signDownloadToken({ userId, trackId: track.id, exp });

    res.json({
      downloadUrl: `/api/downloads/serve/${token}`,
      expiresIn: TOKEN_EXPIRY_SECONDS,
      trackTitle: track.titleEnglish,
    });
  } catch (error) {
    console.error('Error generating download token:', error);
    res.status(500).json({ error: 'Failed to authorize download request' });
  }
});

// 2. Serve the protected audio file using short-lived signed token
router.get('/serve/:token', async (req, res: Response) => {
  try {
    const { token } = req.params;
    const verified = verifyDownloadToken(token);

    if (!verified) {
      res.status(401).send('Download link is invalid or has expired. Please generate a new download link.');
      return;
    }

    const track = await prisma.track.findUnique({
      where: { id: verified.trackId },
    });

    if (!track) {
      res.status(404).send('Audio file not found.');
      return;
    }

    // Sanitize filename for Telugu and English titles
    const safeTitle = track.titleEnglish.replace(/[^a-zA-Z0-9_-]/g, '_');
    const isWav = track.audioUrl.toLowerCase().endsWith('.wav');
    const filename = `Tony_Prakash_${safeTitle}.${isWav ? 'wav' : 'mp3'}`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', isWav ? 'audio/wav' : 'audio/mpeg');

    // In production with object storage, redirect to signed S3/GCS URL or stream file
    // Here we redirect to authorized audio source or stream
    res.redirect(track.audioUrl);
  } catch (error) {
    console.error('Download stream error:', error);
    res.status(500).send('Error delivering audio file.');
  }
});

export default router;
