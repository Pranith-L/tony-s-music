import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateUser, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedTonyVideos: any[] = [];
try {
  const possiblePaths = [
    path.resolve(__dirname, '../tonyVideos.json'),
    path.resolve(__dirname, '../../frontend/src/services/tonyVideos.json'),
    path.resolve(process.cwd(), 'frontend/src/services/tonyVideos.json'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      cachedTonyVideos = JSON.parse(fs.readFileSync(p, 'utf-8'));
      break;
    }
  }
} catch (e) {
  console.warn('Could not load tonyVideos.json:', e);
}

// Public: List videos
router.get('/', async (_req, res: Response) => {
  try {
    if (cachedTonyVideos.length > 0) {
      res.json(cachedTonyVideos);
      return;
    }

    const videos = await prisma.video.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ isFeatured: 'desc' }, { orderIndex: 'asc' }, { createdAt: 'desc' }],
    });
    res.json(videos);
  } catch (error) {
    if (cachedTonyVideos.length > 0) {
      res.json(cachedTonyVideos);
      return;
    }
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Admin: Add video
router.post('/', authenticateUser, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { youtubeId, title, description, thumbnail, duration, isFeatured, orderIndex } = req.body;

    if (!youtubeId || !title) {
      res.status(400).json({ error: 'YouTube ID and Title are required' });
      return;
    }

    const cleanYoutubeId = youtubeId.includes('v=')
      ? youtubeId.split('v=')[1].split('&')[0]
      : youtubeId.includes('youtu.be/')
      ? youtubeId.split('youtu.be/')[1].split('?')[0]
      : youtubeId.trim();

    const video = await prisma.video.create({
      data: {
        youtubeId: cleanYoutubeId,
        title,
        description: description || null,
        thumbnail: thumbnail || `https://img.youtube.com/vi/${cleanYoutubeId}/hqdefault.jpg`,
        duration: duration || '5:00',
        isFeatured: Boolean(isFeatured),
        orderIndex: orderIndex ? Number(orderIndex) : 0,
      },
    });

    res.status(201).json(video);
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ error: 'Failed to add video' });
  }
});

// Admin: Update video
router.put('/:id', authenticateUser, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const updateData = { ...req.body };

    if (updateData.orderIndex !== undefined) {
      updateData.orderIndex = Number(updateData.orderIndex);
    }

    const updated = await prisma.video.update({
      where: { id },
      data: updateData,
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// Admin: Delete video
router.delete('/:id', authenticateUser, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.video.delete({ where: { id } });
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

export default router;
