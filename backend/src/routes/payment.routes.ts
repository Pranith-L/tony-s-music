import { Router, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { prisma } from '../prisma.js';
import { authenticateUser, AuthRequest } from '../middleware/auth.js';

const router = Router();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_key';

const isRazorpayConfigured =
  RAZORPAY_KEY_ID &&
  RAZORPAY_KEY_SECRET &&
  !RAZORPAY_KEY_ID.includes('placeholder') &&
  !RAZORPAY_KEY_SECRET.includes('placeholder');

let razorpayClient: Razorpay | null = null;
if (isRazorpayConfigured) {
  razorpayClient = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}

// 1. Create order for individual song purchase (₹99 = 9900 paise)
router.post('/create-order', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const { trackId } = req.body;
    const userId = req.user!.id;

    if (!trackId) {
      res.status(400).json({ error: 'Track ID is required' });
      return;
    }

    const track = await prisma.track.findUnique({ where: { id: trackId } });
    if (!track) {
      res.status(404).json({ error: 'Track not found' });
      return;
    }

    if (!track.isDownloadable) {
      res.status(400).json({ error: 'This song is not available for individual purchase.' });
      return;
    }

    if (!track.rightsConfirmed) {
      res.status(400).json({ error: 'This song is awaiting rights confirmation before distribution.' });
      return;
    }

    // Check if user already owns it
    const existing = await prisma.purchase.findFirst({
      where: {
        userId,
        trackId,
        status: 'SUCCESS',
      },
    });

    if (existing) {
      res.status(400).json({ error: 'You have already purchased this song.' });
      return;
    }

    const amountPaise = track.downloadPricePaise || 9900;
    const receipt = `tp_trk_${Date.now()}_${track.id.slice(0, 6)}`;

    let orderId = `order_test_${Date.now()}`;

    if (razorpayClient) {
      const order = await razorpayClient.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt,
        notes: {
          userId,
          trackId: track.id,
          trackTitle: track.titleEnglish,
        },
      });
      orderId = order.id;
    }

    // Record pending purchase in DB
    await prisma.purchase.create({
      data: {
        userId,
        trackId: track.id,
        amountPaise,
        status: 'PENDING',
        razorpayOrderId: orderId,
      },
    });

    res.json({
      orderId,
      amount: amountPaise,
      currency: 'INR',
      keyId: isRazorpayConfigured ? RAZORPAY_KEY_ID : 'rzp_test_mock_key',
      trackTitle: track.titleEnglish,
      isTestMode: !isRazorpayConfigured,
    });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// 2. Verify individual purchase payment signature & grant entitlement
router.post('/verify-order', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isTestConfirm } = req.body;
    const userId = req.user!.id;

    const purchase = await prisma.purchase.findFirst({
      where: { razorpayOrderId: razorpay_order_id },
      include: { track: true },
    });

    if (!purchase) {
      res.status(404).json({ error: 'Order record not found' });
      return;
    }

    if (purchase.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized order verification' });
      return;
    }

    if (isRazorpayConfigured) {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: { status: 'FAILED' },
        });
        res.status(400).json({ error: 'Invalid payment signature. Verification failed.' });
        return;
      }
    } else {
      // In development / test mode with placeholder keys
      if (!isTestConfirm) {
        res.status(400).json({
          error: 'Razorpay keys not configured. Test confirmation token missing.',
          testModeNotice: 'Configure live RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env to enable production payments.',
        });
        return;
      }
    }

    // Update purchase to SUCCESS
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        status: 'SUCCESS',
        razorpayPaymentId: razorpay_payment_id || `pay_sim_${Date.now()}`,
      },
    });

    // Create or update entitlement
    await prisma.entitlement.upsert({
      where: {
        userId_trackId_entitlementType: {
          userId,
          trackId: purchase.trackId,
          entitlementType: 'PURCHASE',
        },
      },
      update: {},
      create: {
        userId,
        trackId: purchase.trackId,
        entitlementType: 'PURCHASE',
      },
    });

    res.json({
      success: true,
      message: 'Payment verified and download entitlement unlocked successfully!',
      track: {
        id: purchase.track.id,
        titleEnglish: purchase.track.titleEnglish,
        titleTelugu: purchase.track.titleTelugu,
      },
    });
  } catch (error) {
    console.error('Error verifying order:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// 3. Create One-Time Pass order (₹299 = 29900 paise)
router.post('/create-subscription', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const amountPaise = 29900;
    const receipt = `tp_sub_${Date.now()}`;
    let orderId = `order_sub_${Date.now()}`;

    if (razorpayClient) {
      const order = await razorpayClient.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt,
        notes: {
          userId,
          planName: "Tony's One-Time Lifetime Pass",
        },
      });
      orderId = order.id;
    }

    res.json({
      orderId,
      subscriptionId: orderId,
      amount: amountPaise,
      planName: "Tony's One-Time VIP Pass",
      currency: 'INR',
      keyId: isRazorpayConfigured ? RAZORPAY_KEY_ID : 'rzp_test_mock_key',
      isTestMode: !isRazorpayConfigured,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to initiate subscription' });
  }
});

// 4. Verify monthly subscription
router.post('/verify-subscription', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const { subscriptionId, paymentId } = req.body;
    const userId = req.user!.id;

    // One-Time Lifetime Membership: 100-year access
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(startDate.getFullYear() + 100);

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planName: "Tony's VIP Lifetime Pass",
        status: 'ACTIVE',
        amountPaise: 29900,
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
        razorpaySubscriptionId: subscriptionId || `sub_${Date.now()}`,
        razorpayPaymentId: paymentId || `pay_sub_${Date.now()}`,
      },
    });

    res.json({
      success: true,
      message: "Tony's VIP Lifetime Pass activated! You now have permanent unlimited access.",
      subscription,
    });
  } catch (error) {
    console.error('Error activating subscription:', error);
    res.status(500).json({ error: 'Failed to activate subscription' });
  }
});

// 5. Razorpay Webhook Handler (Raw signature validation & Idempotency)
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    if (isRazorpayConfigured && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        res.status(400).json({ error: 'Invalid webhook signature' });
        return;
      }
    }

    const event = req.body;
    const eventId = event?.id || `evt_${Date.now()}_${Math.random()}`;

    // Idempotent duplicate check
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId },
    });

    if (existingEvent) {
      res.json({ message: 'Event already processed' });
      return;
    }

    await prisma.webhookEvent.create({
      data: {
        eventId,
        eventType: event?.event || 'payment.captured',
        payload: JSON.stringify(event),
        status: 'PROCESSED',
      },
    });

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

export default router;
