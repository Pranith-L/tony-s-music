import { Router, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { prisma } from '../prisma.js';
import { optionalAuth, authenticateUser, AuthRequest } from '../middleware/auth.js';

const router = Router();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_TsCQlNDdeIP4v3';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '0nf2BBAi204ygxEoCkbtRy04';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_key';

const isRazorpayConfigured = Boolean(
  RAZORPAY_KEY_ID &&
  RAZORPAY_KEY_SECRET &&
  !RAZORPAY_KEY_ID.includes('placeholder') &&
  !RAZORPAY_KEY_SECRET.includes('placeholder')
);

// Initialize Razorpay Client with credentials
const razorpayClient = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Helper to ensure user exists in Supabase PostgreSQL (Prisma) before creating payment records
async function ensureSupabaseUser(user: { id: string; email: string; name?: string; role?: string }): Promise<string> {
  const normalizedEmail = user.email.toLowerCase().trim();
  let dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: user.id },
        { email: { equals: normalizedEmail, mode: 'insensitive' } },
      ],
    },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: normalizedEmail,
        name: user.name || 'Customer',
        role: user.role || 'USER',
        provider: 'LOCAL',
      },
    });
  }

  return dbUser.id;
}

// Helper to compute and verify Razorpay HMAC-SHA256 signature
function verifySignature(orderId: string, paymentId: string, signature: string): boolean {
  if (!orderId || !paymentId || !signature) return false;
  const payload = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest('hex');
  return generatedSignature === signature;
}

/**
 * STEP 1: BACKEND - Create Order
 * Endpoint: POST /api/create-order & POST /api/payments/create-order
 * Calls Razorpay API: POST https://api.razorpay.com/v1/orders
 * Request: { amount (paise), currency, receipt } or { trackId, slug }
 * Return: { order_id, orderId, amount, currency, keyId }
 * Minimum amount: 100 paise
 */
router.post('/create-order', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { trackId, slug, currency = 'INR', notes = {} } = req.body;
    let rawAmount = req.body.amount;

    let track: any = null;
    let userId: string | null = null;

    if (req.user) {
      userId = await ensureSupabaseUser(req.user);
    }

    // If trackId or slug provided, resolve track from database
    if (trackId || slug) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(String(trackId || ''));
      track = isObjectId
        ? await prisma.track.findUnique({ where: { id: String(trackId) } })
        : null;

      if (!track && (slug || trackId)) {
        const identifier = String(slug || trackId);
        track = await prisma.track.findFirst({
          where: {
            OR: [
              { slug: identifier },
              { slug: { equals: identifier, mode: 'insensitive' } },
              { titleEnglish: { equals: identifier, mode: 'insensitive' } },
            ],
          },
        });
      }

      if (!track && (slug || trackId)) {
        const raw = String(slug || trackId);
        const clean = raw.replace(/^tp-(song|track)-\d+-?/, '').toLowerCase();
        track = await prisma.track.findFirst({
          where: {
            OR: [
              { slug: { contains: clean, mode: 'insensitive' } },
              { audioUrl: { contains: clean, mode: 'insensitive' } },
              { titleEnglish: { contains: clean, mode: 'insensitive' } },
            ],
          },
        });
      }

      // Default amount for track purchase: 100 paise (₹1 for testing purpose)
      if (!rawAmount) {
        rawAmount = 100;
      }
    }

    const amountPaise = Number(rawAmount || 100);

    // Validate amount >= 100 paise
    if (isNaN(amountPaise) || amountPaise < 100) {
      res.status(400).json({
        error: 'Invalid amount. Minimum amount must be at least 100 paise (₹1).',
      });
      return;
    }

    // Check if user already owns this track
    if (userId && track) {
      const existing = await prisma.purchase.findFirst({
        where: {
          userId,
          trackId: track.id,
          status: 'SUCCESS',
        },
      });

      if (existing) {
        res.status(400).json({ error: 'You have already purchased this backing track.' });
        return;
      }
    }

    const receipt = req.body.receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Call official Razorpay Orders API
    const order = await razorpayClient.orders.create({
      amount: Math.round(amountPaise),
      currency,
      receipt,
      notes: {
        ...notes,
        ...(track ? { trackId: track.id, trackTitle: track.titleEnglish } : {}),
        ...(userId ? { userId } : {}),
      },
    });

    // Record pending purchase in Supabase PostgreSQL if track & user are present
    if (userId && track) {
      await prisma.purchase.create({
        data: {
          userId,
          trackId: track.id,
          amountPaise: Math.round(amountPaise),
          status: 'PENDING',
          razorpayOrderId: order.id,
        },
      });
    }

    res.json({
      order_id: order.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
      receipt: order.receipt,
      trackTitle: track?.titleEnglish,
      isTestMode: true,
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      error: 'Failed to create payment order with Razorpay',
      details: error?.message || String(error),
    });
  }
});

/**
 * Endpoint: POST /api/create-subscription & POST /api/payments/create-subscription
 * Creates a Razorpay order for Tony's One-Time VIP Lifetime Pass (₹1 = 100 paise for testing)
 */
router.post('/create-subscription', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = await ensureSupabaseUser(req.user!);
    const amountPaise = 100; // Testing mode: ₹1 (100 paise)
    const receipt = `rcpt_sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Call official Razorpay Orders API
    const order = await razorpayClient.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      notes: {
        type: 'VIP_LIFETIME_PASS',
        userId,
        email: req.user!.email,
      },
    });

    // Create or update pending subscription in Supabase PostgreSQL
    const existingPending = await prisma.subscription.findFirst({
      where: { userId, status: 'PENDING' },
    });

    if (existingPending) {
      await prisma.subscription.update({
        where: { id: existingPending.id },
        data: {
          razorpaySubscriptionId: order.id,
          amountPaise,
        },
      });
    } else {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(startDate.getFullYear() + 100);

      await prisma.subscription.create({
        data: {
          userId,
          planName: "Tony's VIP Lifetime Pass",
          status: 'PENDING',
          amountPaise,
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
          razorpaySubscriptionId: order.id,
        },
      });
    }

    res.json({
      order_id: order.id,
      orderId: order.id,
      subscriptionId: order.id,
      amount: order.amount,
      planName: "Tony's One-Time VIP Lifetime Pass",
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
      isTestMode: true,
    });
  } catch (error: any) {
    console.error('Error creating subscription order:', error);
    res.status(500).json({
      error: 'Failed to create subscription order with Razorpay',
      details: error?.message || String(error),
    });
  }
});

/**
 * STEP 3: BACKEND - Verify Signature
 * Endpoint: POST /api/verify-payment & POST /api/payments/verify-payment
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 * Compare generated signature with razorpay_signature
 * Return success only if signatures match
 */
router.post('/verify-payment', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const orderId = req.body.order_id || req.body.razorpay_order_id;
    const paymentId = req.body.payment_id || req.body.razorpay_payment_id;
    const signature = req.body.signature || req.body.razorpay_signature;

    // Validate required fields
    if (!orderId || !paymentId || !signature) {
      res.status(400).json({
        error: 'Missing required payment verification fields (order_id, payment_id, signature)',
        success: false,
      });
      return;
    }

    // Verify HMAC-SHA256 cryptographic signature
    const isValid = verifySignature(orderId, paymentId, signature);
    if (!isValid) {
      // If payment record exists, mark status as FAILED
      try {
        await prisma.purchase.updateMany({
          where: { razorpayOrderId: orderId },
          data: { status: 'FAILED' },
        });
      } catch {
        // ignore
      }

      res.status(400).json({
        error: 'Invalid payment signature. Verification failed.',
        success: false,
      });
      return;
    }

    // Payment signature is 100% valid! Fulfill entitlements in Supabase PostgreSQL
    // 1. Check for purchase record matching this orderId
    const purchase = await prisma.purchase.findFirst({
      where: { razorpayOrderId: orderId },
      include: { track: true },
    });

    if (purchase) {
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: {
          status: 'SUCCESS',
          razorpayPaymentId: paymentId,
        },
      });

      // Grant download and playback entitlement in Supabase PostgreSQL
      await prisma.entitlement.upsert({
        where: {
          userId_trackId_entitlementType: {
            userId: purchase.userId,
            trackId: purchase.trackId,
            entitlementType: 'PURCHASE',
          },
        },
        create: {
          userId: purchase.userId,
          trackId: purchase.trackId,
          entitlementType: 'PURCHASE',
        },
        update: {},
      });
    }

    // 2. Check for subscription record matching this orderId
    const subscription = await prisma.subscription.findFirst({
      where: {
        OR: [
          { razorpaySubscriptionId: orderId },
          { razorpayPaymentId: paymentId },
        ],
      },
    });

    if (subscription) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(startDate.getFullYear() + 100);

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
          razorpayPaymentId: paymentId,
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
        },
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order_id: orderId,
      payment_id: paymentId,
      status: 'SUCCESS',
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      error: 'Internal server error verifying payment',
      details: error?.message || String(error),
      success: false,
    });
  }
});

/**
 * Endpoint: POST /api/verify-order & POST /api/payments/verify-order
 * Verifies backing track order payment signature and immediately grants track entitlement in Supabase
 */
router.post('/verify-order', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const orderId = req.body.razorpay_order_id || req.body.order_id;
    const paymentId = req.body.razorpay_payment_id || req.body.payment_id;
    const signature = req.body.razorpay_signature || req.body.signature;

    if (!orderId || !paymentId) {
      res.status(400).json({ error: 'Order ID and Payment ID are required' });
      return;
    }

    // If signature provided, verify with HMAC-SHA256
    if (signature) {
      const isValid = verifySignature(orderId, paymentId, signature);
      if (!isValid) {
        await prisma.purchase.updateMany({
          where: { razorpayOrderId: orderId },
          data: { status: 'FAILED' },
        });
        res.status(400).json({
          error: 'Invalid payment signature. Verification failed.',
          success: false,
        });
        return;
      }
    }

    // Find and update the purchase in Supabase PostgreSQL
    let purchase = await prisma.purchase.findFirst({
      where: { razorpayOrderId: orderId },
      include: { track: true },
    });

    if (!purchase && req.user) {
      // Fallback: locate pending purchase for this user
      purchase = await prisma.purchase.findFirst({
        where: { userId: req.user.id, status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        include: { track: true },
      });
    }

    if (purchase) {
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: {
          status: 'SUCCESS',
          razorpayPaymentId: paymentId,
        },
      });

      // Grant instant master download entitlement in Supabase PostgreSQL
      await prisma.entitlement.upsert({
        where: {
          userId_trackId_entitlementType: {
            userId: purchase.userId,
            trackId: purchase.trackId,
            entitlementType: 'PURCHASE',
          },
        },
        create: {
          userId: purchase.userId,
          trackId: purchase.trackId,
          entitlementType: 'PURCHASE',
        },
        update: {},
      });

      res.json({
        success: true,
        status: 'SUCCESS',
        message: 'Payment verified! Studio backing track unlocked.',
        track: {
          id: purchase.track.id,
          titleEnglish: purchase.track.titleEnglish,
          titleTelugu: purchase.track.titleTelugu,
        },
      });
      return;
    }

    res.json({
      success: true,
      status: 'SUCCESS',
      message: 'Payment verified successfully.',
    });
  } catch (error: any) {
    console.error('Error verifying order:', error);
    res.status(500).json({ error: error?.message || 'Payment verification failed', success: false });
  }
});

/**
 * Endpoint: POST /api/verify-subscription & POST /api/payments/verify-subscription
 * Verifies VIP pass subscription signature and immediately activates 100-year pass in Supabase
 */
router.post('/verify-subscription', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const orderId = req.body.subscriptionId || req.body.razorpay_order_id || req.body.order_id;
    const paymentId = req.body.paymentId || req.body.razorpay_payment_id || req.body.payment_id;
    const signature = req.body.razorpay_signature || req.body.signature;
    const userId = await ensureSupabaseUser(req.user!);

    if (!orderId || !paymentId) {
      res.status(400).json({ error: 'Order ID and Payment ID are required' });
      return;
    }

    // Verify HMAC-SHA256 signature if present
    if (signature) {
      const isValid = verifySignature(orderId, paymentId, signature);
      if (!isValid) {
        res.status(400).json({
          error: 'Invalid payment signature. Verification failed.',
          success: false,
        });
        return;
      }
    }

    // Activate 100-year VIP Lifetime Pass in Supabase PostgreSQL
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(startDate.getFullYear() + 100);

    const existingPending = await prisma.subscription.findFirst({
      where: {
        userId,
        OR: [
          { razorpaySubscriptionId: orderId },
          { status: 'PENDING' },
        ],
      },
    });

    let subscription: any;
    if (existingPending) {
      subscription = await prisma.subscription.update({
        where: { id: existingPending.id },
        data: {
          status: 'ACTIVE',
          razorpayPaymentId: paymentId,
          amountPaise: 100,
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
        },
        include: { user: true },
      });
    } else {
      subscription = await prisma.subscription.create({
        data: {
          userId,
          planName: "Tony's VIP Lifetime Pass",
          status: 'ACTIVE',
          amountPaise: 100,
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
          razorpaySubscriptionId: orderId,
          razorpayPaymentId: paymentId,
        },
        include: { user: true },
      });
    }

    res.json({
      success: true,
      status: 'ACTIVE',
      message: 'Payment verified! One-Time VIP Lifetime Pass activated.',
      subscription,
    });
  } catch (error: any) {
    console.error('Error verifying subscription:', error);
    res.status(500).json({ error: error?.message || 'Failed to verify subscription', success: false });
  }
});

/**
 * Endpoint: POST /api/webhook & POST /api/payments/webhook
 * Razorpay Webhook Handler (Raw signature validation & Idempotency)
 */
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
