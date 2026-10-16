import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateUser, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Public: List all published albums
router.get('/', async (_req, res: Response) => {
  try {
    const albums = await prisma.album.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        _count: {
          select: { tracks: true },
        },
        tracks: {
          where: { status: 'PUBLISHED' },
          select: {
            id: true,
            titleTelugu: true,
            titleEnglish: true,
            duration: true,
            orderIndex: true,
            isSubscriberOnly: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { releaseYear: 'desc' },
    });

    res.json(albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
});

// Public: Get album by slug with full track list
router.get('/:slug', async (req, res: Response) => {
  try {
    const { slug } = req.params;
    const album = await prisma.album.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        tracks: {
          where: { status: 'PUBLISHED' },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!album) {
      res.status(404).json({ error: 'Album not found' });
      return;
    }

    res.json(album);
  } catch (error) {
    console.error('Error fetching album:', error);
    res.status(500).json({ error: 'Failed to fetch album' });
  }
});

// Admin: Create album
router.post('/', authenticateUser, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { titleTelugu, titleEnglish, slug, coverImage, releaseYear, description, isFeatured, status } = req.body;

    if (!titleTelugu || !titleEnglish || !coverImage) {
      res.status(400).json({ error: 'Telugu title, English title, and Cover Image are required' });
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

    const album = await prisma.album.create({
      data: {
        titleTelugu,
        titleEnglish,
        slug: finalSlug,
        coverImage,
        releaseYear: releaseYear ? Number(releaseYear) : new Date().getFullYear(),
        description: description || null,
        isFeatured: Boolean(isFeatured),
        status: status || 'PUBLISHED',
      },
    });

    res.status(201).json(album);
  } catch (error) {
    console.error('Error creating album:', error);
    res.status(500).json({ error: 'Failed to create album' });
  }
});

// Admin: Update album
router.put('/:id', authenticateUser, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const updateData = { ...req.body };

    if (updateData.releaseYear !== undefined) {
      updateData.releaseYear = Number(updateData.releaseYear);
    }

    const updated = await prisma.album.update({
      where: { id },
      data: updateData,
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating album:', error);
    res.status(500).json({ error: 'Failed to update album' });
  }
});

// Admin: Delete album
router.delete('/:id', authenticateUser, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.album.delete({ where: { id } });
    res.json({ message: 'Album deleted successfully' });
  } catch (error) {
    console.error('Error deleting album:', error);
    res.status(500).json({ error: 'Failed to delete album' });
  }
});

export default router;
