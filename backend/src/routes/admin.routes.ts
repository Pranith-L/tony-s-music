import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateUser, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// 1. Database-backed real overview stats
router.get('/stats', authenticateUser, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const totalPublishedTracks = await prisma.track.count({ where: { status: 'PUBLISHED' } });
    const totalAlbums = await prisma.album.count({ where: { status: 'PUBLISHED' } });
    const totalUsers = await prisma.user.count();
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        currentPeriodEnd: { gt: new Date() },
      },
    });

    // Calculate revenue from verified subscriptions and successful purchases
    const purchases = await prisma.purchase.findMany({
      where: { status: 'SUCCESS' },
      select: { amountPaise: true },
    });
    const subscriptions = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      select: { amountPaise: true },
    });

    const purchaseRevenuePaise = purchases.reduce((acc, p) => acc + p.amountPaise, 0);
    const subscriptionRevenuePaise = subscriptions.reduce((acc, s) => acc + s.amountPaise, 0);
    const totalRevenuePaise = purchaseRevenuePaise + subscriptionRevenuePaise;

    const newBookings = await prisma.booking.count({ where: { status: 'NEW' } });
    const confirmedBookings = await prisma.booking.count({ where: { status: 'CONFIRMED' } });
    const totalVideos = await prisma.video.count({ where: { status: 'PUBLISHED' } });

    res.json({
      totalPublishedTracks,
      totalAlbums,
      totalUsers,
      activeSubscriptions,
      individualPurchases: purchases.length,
      revenue: {
        totalPaise: totalRevenuePaise,
        totalRupees: Math.floor(totalRevenuePaise / 100),
        subscriptionPaise: subscriptionRevenuePaise,
        purchasePaise: purchaseRevenuePaise,
      },
      newBookings,
      confirmedBookings,
      totalVideos,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// 2. User management list
router.get('/users', authenticateUser, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { purchases: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = users.map((u) => {
      const activeSub = u.subscriptions[0];
      const isSubscriberActive =
        activeSub &&
        activeSub.status === 'ACTIVE' &&
        new Date(activeSub.currentPeriodEnd) > new Date();

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        createdAt: u.createdAt,
        isSubscriberActive,
        purchasesCount: u._count.purchases,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// 3. Payment and subscription history audit
router.get('/payments', authenticateUser, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        user: { select: { name: true, email: true } },
        track: { select: { titleEnglish: true, titleTelugu: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ purchases, subscriptions });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payment records' });
  }
});

// 4. Site Settings (GET and PUT)
router.get('/settings', async (_req, res: Response) => {
  try {
    const settings = await prisma.siteSetting.findMany();
    const map: Record<string, string> = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });
    res.json(map);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch site settings' });
  }
});

router.put('/settings', authenticateUser, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const updates: Record<string, string> = req.body;

    for (const [key, value] of Object.entries(updates)) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    res.json({ message: 'Site settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
