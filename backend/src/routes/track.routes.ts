import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateUser, requireAdmin, optionalAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Public: List all published tracks (or filter for admin)
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      search,
      category,
      featured,
      popular,
      albumId,
      subscriberOnly,
      includeDrafts,
    } = req.query;

    const isAdmin = req.user?.role === 'ADMIN';
    const where: any = {};

    // Unless admin explicitly asks for drafts, show only published tracks
    if (!(isAdmin && includeDrafts === 'true')) {
      where.status = 'PUBLISHED';
    }

    // Fetch matching tracks
    let tracks = await prisma.track.findMany({
      where,
      include: {
        album: {
          select: {
            id: true,
            slug: true,
            titleTelugu: true,
            titleEnglish: true,
            coverImage: true,
          },
        },
      },
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
    });

    // In-memory case-insensitive search across English, Telugu, Singer, and Lyrics
    if (search && typeof search === 'string') {
      const q = search.trim().toLowerCase();
      tracks = tracks.filter((t) => {
        const en = (t.titleEnglish || '').toLowerCase();
        const te = (t.titleTelugu || '').toLowerCase();
        const singer = (t.singer || '').toLowerCase();
        const composer = (t.composer || '').toLowerCase();
        const lyricsEn = (t.lyricsEnglish || '').toLowerCase();
        const lyricsTe = (t.lyricsTelugu || '').toLowerCase();
        return (
          en.includes(q) ||
          te.includes(q) ||
          singer.includes(q) ||
          composer.includes(q) ||
          lyricsEn.includes(q) ||
          lyricsTe.includes(q)
        );
      });
    }

    res.json(tracks);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

// Public: Get track by slug or ID
router.get('/:slug', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const slug = String(req.params.slug);
    const track = await prisma.track.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        album: true,
      },
    });

    if (!track) {
      res.status(404).json({ error: 'Track not found' });
      return;
    }

    // Check user entitlements if signed in
    let hasAccess = !track.isSubscriberOnly;
    let hasPurchased = false;

    if (req.user) {
      // Check individual purchase
      const purchase = await prisma.purchase.findFirst({
        where: {
          userId: req.user.id,
          trackId: track.id,
          status: 'SUCCESS',
        },
      });

      if (purchase) {
        hasPurchased = true;
        hasAccess = true;
      }

      // Check active subscription
      const sub = await prisma.subscription.findFirst({
        where: {
          userId: req.user.id,
          status: 'ACTIVE',
          currentPeriodEnd: { gt: new Date() },
        },
      });

      if (sub) {
        hasAccess = true;
      }
    }

    res.json({
      track,
      entitlement: {
        hasAccess,
        hasPurchased,
      },
    });
  } catch (error) {
    console.error('Error fetching track:', error);
    res.status(500).json({ error: 'Failed to fetch track' });
  }
});

// Admin: Create track
router.post('/', authenticateUser, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const {
      titleTelugu,
      titleEnglish,
      slug,
      albumId,
      duration,
      category,
      isFeatured,
      isPopular,
      isSubscriberOnly,
      isDownloadable,
      downloadPricePaise,
      rightsConfirmed,
      audioUrl,
      privateStorageKey,
      coverImage,
      lyricsTelugu,
      lyricsEnglish,
      composer,
      lyricist,
      singer,
      releaseYear,
      status,
    } = req.body;

    if (!titleTelugu || !titleEnglish || !audioUrl) {
      res.status(400).json({ error: 'Telugu title, English title, and Audio URL are required' });
      return;
    }

    const finalSlug =
      slug ||
      titleEnglish
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') +
        '-' +
        Date.now().toString().slice(-4);

    const track = await prisma.track.create({
      data: {
        titleTelugu,
        titleEnglish,
        slug: finalSlug,
        albumId: albumId || null,
        duration: duration || '5:00',
        category: category || 'Worship',
        isFeatured: Boolean(isFeatured),
        isPopular: Boolean(isPopular),
        isSubscriberOnly: Boolean(isSubscriberOnly),
        isDownloadable: isDownloadable !== false,
        downloadPricePaise: downloadPricePaise ? Number(downloadPricePaise) : 9900,
        rightsConfirmed: Boolean(rightsConfirmed),
        audioUrl,
        privateStorageKey: privateStorageKey || null,
        coverImage: coverImage || null,
        lyricsTelugu: lyricsTelugu || null,
        lyricsEnglish: lyricsEnglish || null,
        composer: composer || 'Tony Prakash',
        lyricist: lyricist || 'Tony Prakash',
        singer: singer || 'Tony Prakash',
        releaseYear: releaseYear ? Number(releaseYear) : new Date().getFullYear(),
        status: status || 'PUBLISHED',
      },
    });

    res.status(201).json(track);
  } catch (error) {
    console.error('Error creating track:', error);
    res.status(500).json({ error: 'Failed to create track' });
  }
});

// Admin: Update track
router.put('/:id', authenticateUser, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const updateData = { ...req.body };

    // Format numbers if present
    if (updateData.downloadPricePaise !== undefined) {
      updateData.downloadPricePaise = Number(updateData.downloadPricePaise);
    }
    if (updateData.releaseYear !== undefined) {
      updateData.releaseYear = Number(updateData.releaseYear);
    }
    if (updateData.orderIndex !== undefined) {
      updateData.orderIndex = Number(updateData.orderIndex);
    }

    const updated = await prisma.track.update({
      where: { id },
      data: updateData,
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating track:', error);
    res.status(500).json({ error: 'Failed to update track' });
  }
});

// Admin: Delete track
router.delete('/:id', authenticateUser, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.track.delete({ where: { id } });
    res.json({ message: 'Track deleted successfully' });
  } catch (error) {
    console.error('Error deleting track:', error);
    res.status(500).json({ error: 'Failed to delete track' });
  }
});

export default router;
