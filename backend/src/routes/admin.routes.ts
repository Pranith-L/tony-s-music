import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { prisma } from '../prisma.js';
import { getMongoDb } from '../db.js';
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

// 3. Payment and subscription history audit (Handled 100% by Supabase PostgreSQL Database)
router.get('/payments', authenticateUser, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        track: { select: { id: true, titleEnglish: true, titleTelugu: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ purchases, subscriptions });
  } catch (error) {
    console.error('Error fetching payments from Supabase:', error);
    res.status(500).json({ error: 'Failed to fetch payment records from Supabase database' });
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

// 5. Approve pending UPI payment (Purchase or Subscription)
router.post('/approve-payment', authenticateUser, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { type, id } = req.body;

    if (!id || !['PURCHASE', 'SUBSCRIPTION'].includes(type)) {
      res.status(400).json({ error: 'Valid payment type (PURCHASE or SUBSCRIPTION) and record ID are required.' });
      return;
    }

    if (type === 'PURCHASE') {
      const purchase = await prisma.purchase.findUnique({
        where: { id },
        include: { track: true, user: true },
      });

      if (!purchase) {
        res.status(404).json({ error: 'Purchase record not found in Supabase database' });
        return;
      }

      // Update purchase status to SUCCESS in Supabase
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { status: 'SUCCESS' },
      });

      // Unlock Entitlement in Supabase PostgreSQL
      await prisma.entitlement.upsert({
        where: {
          userId_trackId_entitlementType: {
            userId: purchase.userId,
            trackId: purchase.trackId,
            entitlementType: 'PURCHASE',
          },
        },
        update: {},
        create: {
          userId: purchase.userId,
          trackId: purchase.trackId,
          entitlementType: 'PURCHASE',
        },
      });

      res.json({
        success: true,
        message: `Approved track purchase of "${purchase.track?.titleEnglish || 'Studio Track'}" for ${purchase.user?.name || purchase.user?.email || 'customer'}.`,
      });
      return;
    }

    if (type === 'SUBSCRIPTION') {
      const subscription = await prisma.subscription.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!subscription) {
        res.status(404).json({ error: 'Subscription record not found in Supabase database' });
        return;
      }

      // Update subscription status to ACTIVE in Supabase PostgreSQL
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'ACTIVE' },
      });

      res.json({
        success: true,
        message: `Approved Tony's VIP Lifetime Pass for ${subscription.user?.name || subscription.user?.email || 'member'}.`,
      });
      return;
    }
  } catch (error) {
    console.error('Error approving payment in Supabase:', error);
    res.status(500).json({ error: 'Failed to approve payment in Supabase database' });
  }
});

// 6. Reject pending UPI payment (Handled fully by Supabase Database)
router.post('/reject-payment', authenticateUser, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { type, id } = req.body;

    if (!id || !['PURCHASE', 'SUBSCRIPTION'].includes(type)) {
      res.status(400).json({ error: 'Valid payment type and record ID are required.' });
      return;
    }

    if (type === 'PURCHASE') {
      const purchase = await prisma.purchase.findUnique({ where: { id } });
      if (purchase) {
        await prisma.purchase.update({
          where: { id },
          data: { status: 'FAILED' },
        });
        await prisma.entitlement.deleteMany({
          where: {
            userId: purchase.userId,
            trackId: purchase.trackId,
            entitlementType: 'PURCHASE',
          },
        });
      }

      res.json({ success: true, message: 'Track purchase verification rejected in Supabase database.' });
      return;
    }

    if (type === 'SUBSCRIPTION') {
      await prisma.subscription.update({
        where: { id },
        data: { status: 'REJECTED' },
      });

      res.json({ success: true, message: 'Lifetime Pass subscription verification rejected in Supabase database.' });
      return;
    }
  } catch (error) {
    console.error('Error rejecting payment:', error);
    res.status(500).json({ error: 'Failed to reject payment' });
  }
});

export default router;
