import { Router, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { prisma } from '../prisma.js';
import { optionalAuth, authenticateUser, AuthRequest } from '../middleware/auth.js';
import { cashfreeService } from '../services/cashfree.service.js';
import { instamojoService } from '../services/instamojo.service.js';
import { fulfillmentService } from '../services/fulfillment.service.js';

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

const razorpayClient = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Server-wide payments pause toggle (defaults to false if any gateway is configured)
const PAYMENTS_PAUSED = process.env.PAYMENTS_PAUSED === 'true';

// Fixed official prices (in Paise and Rupees)
const VIP_PASS_AMOUNT_PAISE = 29900; // ₹299
const VIP_PASS_AMOUNT_RUPEES = 299.00;
const TRACK_AMOUNT_PAISE = 9900; // ₹99
const TRACK_AMOUNT_RUPEES = 99.00;

function getClientUrl(): string {
  return process.env.CLIENT_URL || 'https://tony-prakash-music.vercel.app';
}

function getBackendUrl(): string {
  return process.env.BACKEND_URL || 'https://tony-prakash-api.vercel.app';
}

/**
 * Helper to compute and verify Razorpay HMAC-SHA256 signature
 */
function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  if (!orderId || !paymentId || !signature) return false;
  const payload = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest('hex');
  return generatedSignature === signature;
}

// =========================================================================
// 1. CONFIG & STATUS ENDPOINTS
// =========================================================================

/**
 * GET /api/payments/config & GET /api/config
 * Returns active gateway configurations and pricing
 */
router.get('/config', (_req, res: Response) => {
  res.json({
    paymentsPaused: PAYMENTS_PAUSED,
    gateways: {
      cashfree: {
        enabled: cashfreeService.isConfigured,
        environment: cashfreeService.isProduction ? 'PRODUCTION' : 'SANDBOX',
      },
      instamojo: {
        enabled: instamojoService.isConfigured,
        environment: instamojoService.isProduction ? 'PRODUCTION' : 'SANDBOX',
      },
      razorpay: {
        enabled: isRazorpayConfigured,
        environment: 'TEST',
      },
    },
    pricing: {
      vipPassPaise: VIP_PASS_AMOUNT_PAISE,
      vipPassRupees: VIP_PASS_AMOUNT_RUPEES,
      trackPaise: TRACK_AMOUNT_PAISE,
      trackRupees: TRACK_AMOUNT_RUPEES,
    },
  });
});

/**
 * GET /api/payments/status & GET /api/status
 */
router.get('/status', (_req, res: Response) => {
  res.json({
    paymentsPaused: PAYMENTS_PAUSED,
    cashfreeConfigured: cashfreeService.isConfigured,
    instamojoConfigured: instamojoService.isConfigured,
    message: PAYMENTS_PAUSED
      ? 'Online checkout is temporarily paused.'
      : 'Online checkout is active.',
  });
});

// =========================================================================
// 2. UNIFIED ORDER CREATION (CASHFREE + INSTAMOJO)
// =========================================================================

/**
 * POST /api/payments/create-unified-order
 * Body: { itemType: 'VIP_PASS' | 'TRACK', trackId?: string, gateway: 'CASHFREE' | 'INSTAMOJO' }
 * Validates product IDs and prices against trusted server records.
 */
router.post('/create-unified-order', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (PAYMENTS_PAUSED) {
      res.status(503).json({
        error: 'Online checkout is temporarily paused while live payment gateway is being finalized.',
        paymentsPaused: true,
      });
      return;
    }

    const { itemType, trackId, slug, gateway = 'CASHFREE', customerName, customerEmail, customerPhone } = req.body;

    if (itemType !== 'VIP_PASS' && itemType !== 'TRACK') {
      res.status(400).json({ error: 'Invalid itemType. Must be VIP_PASS or TRACK.' });
      return;
    }

    const selectedGateway = (gateway || 'CASHFREE').toUpperCase();
    if (selectedGateway !== 'CASHFREE' && selectedGateway !== 'INSTAMOJO' && selectedGateway !== 'RAZORPAY') {
      res.status(400).json({ error: 'Unsupported gateway. Must be CASHFREE or INSTAMOJO.' });
      return;
    }

    // Resolve or create user in database
    let userId: string | null = null;
    let userEmail = customerEmail;
    let userName = customerName;
    let userPhone = customerPhone;

    if (req.user) {
      userId = await fulfillmentService.ensureUser(req.user);
      userEmail = req.user.email || userEmail;
      userName = req.user.name || userName;
      userPhone = (req.user as any)?.phone || userPhone;
    } else if (userEmail) {
      const guestId = `guest_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      userId = await fulfillmentService.ensureUser({
        id: guestId,
        email: userEmail,
        name: userName || 'Customer',
        phone: userPhone,
      });
    }

    let track: any = null;
    let amountPaise = VIP_PASS_AMOUNT_PAISE;
    let amountRupees = VIP_PASS_AMOUNT_RUPEES;
    let itemTitle = "Tony's One-Time VIP Lifetime Pass";
    let itemDescription = 'Complete Devotional Songs Master Access (100 Years)';

    if (itemType === 'TRACK') {
      amountPaise = TRACK_AMOUNT_PAISE;
      amountRupees = TRACK_AMOUNT_RUPEES;

      if (!trackId && !slug) {
        res.status(400).json({ error: 'trackId or slug is required for track purchase.' });
        return;
      }

      // Validate track ID against database
      track = await prisma.track.findFirst({
        where: {
          OR: [
            ...(trackId ? [{ id: String(trackId) }] : []),
            ...(slug ? [{ slug: String(slug) }] : []),
          ],
        },
      });

      if (!track) {
        res.status(404).json({ error: 'Selected track could not be found.' });
        return;
      }

      itemTitle = `Backing Track: ${track.titleEnglish}`;
      itemDescription = `Minus-One Studio Track (${track.titleTelugu})`;

      // Check if user already owns this track
      if (userId) {
        const existingPurchase = await prisma.purchase.findFirst({
          where: { userId, trackId: track.id, status: 'SUCCESS' },
        });

        if (existingPurchase) {
          res.status(400).json({ error: 'You have already purchased this backing track.' });
          return;
        }
      }
    }

    // Unique order ID
    const orderId = `tp_${itemType.toLowerCase()}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const clientUrl = getClientUrl();
    const backendUrl = getBackendUrl();

    // 1. Create Pending Transaction Record in PostgreSQL
    await prisma.paymentTransaction.create({
      data: {
        orderId,
        gateway: selectedGateway,
        userId,
        itemType,
        trackId: track ? track.id : null,
        amountPaise,
        currency: 'INR',
        status: 'PENDING',
        customerName: userName || 'Customer',
        customerEmail: userEmail || 'guest@tonyprakash.com',
        customerPhone: userPhone || '9999999999',
      },
    });

    // 2. Gateway Order Creation
    if (selectedGateway === 'CASHFREE') {
      const returnUrl = `${clientUrl}/payment-return?order_id=${encodeURIComponent(orderId)}&gateway=cashfree`;
      const notifyUrl = `${backendUrl}/api/payments/cashfree-webhook`;

      const cfOrder = await cashfreeService.createOrder({
        orderId,
        orderAmount: amountRupees,
        orderCurrency: 'INR',
        customerId: userId || `cust_${Date.now()}`,
        customerName: userName || 'Customer',
        customerEmail: userEmail || 'customer@tonyprakash.com',
        customerPhone: userPhone || '9999999999',
        returnUrl,
        notifyUrl,
        orderNote: itemTitle,
      });

      // Update gatewayOrderId
      await prisma.paymentTransaction.update({
        where: { orderId },
        data: { gatewayOrderId: cfOrder.cfOrderId },
      });

      res.json({
        success: true,
        gateway: 'CASHFREE',
        orderId,
        cfOrderId: cfOrder.cfOrderId,
        paymentSessionId: cfOrder.paymentSessionId,
        amountRupees,
        amountPaise,
        itemType,
        itemTitle,
        itemDescription,
      });
      return;
    }

    if (selectedGateway === 'INSTAMOJO') {
      const redirectUrl = `${clientUrl}/payment-return?order_id=${encodeURIComponent(orderId)}&gateway=instamojo`;
      const webhookUrl = `${backendUrl}/api/payments/instamojo-webhook`;

      const imOrder = await instamojoService.createPaymentRequest({
        amount: amountRupees,
        purpose: itemTitle.substring(0, 30),
        buyerName: userName || 'Customer',
        email: userEmail || 'customer@tonyprakash.com',
        phone: userPhone || '9999999999',
        redirectUrl,
        webhookUrl,
      });

      // Update gatewayOrderId
      await prisma.paymentTransaction.update({
        where: { orderId },
        data: { gatewayOrderId: imOrder.paymentRequestId },
      });

      res.json({
        success: true,
        gateway: 'INSTAMOJO',
        orderId,
        paymentRequestId: imOrder.paymentRequestId,
        paymentUrl: imOrder.paymentUrl,
        amountRupees,
        amountPaise,
        itemType,
        itemTitle,
        itemDescription,
      });
      return;
    }

    // Fallback: Razorpay (if requested)
    if (selectedGateway === 'RAZORPAY') {
      const rzpOrder = await razorpayClient.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        notes: { orderId, itemType, ...(track ? { trackId: track.id } : {}) },
      });

      await prisma.paymentTransaction.update({
        where: { orderId },
        data: { gatewayOrderId: rzpOrder.id },
      });

      res.json({
        success: true,
        gateway: 'RAZORPAY',
        orderId,
        rzpOrderId: rzpOrder.id,
        keyId: RAZORPAY_KEY_ID,
        amountRupees,
        amountPaise,
        itemType,
        itemTitle,
      });
      return;
    }
  } catch (error: any) {
    console.error('Error creating unified payment order:', error);
    res.status(500).json({
      error: 'Failed to create payment order',
      details: error?.message || String(error),
    });
  }
});

// =========================================================================
// 3. INDEPENDENT SERVER-TO-SERVER VERIFICATION
// =========================================================================

/**
 * POST /api/payments/verify-unified-payment
 * Queries official gateway APIs directly to verify payment authenticity.
 * Never grants access based on client-side status.
 */
router.post('/verify-unified-payment', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, gateway, paymentId, paymentRequestId } = req.body;

    if (!orderId) {
      res.status(400).json({ error: 'orderId is required for verification.' });
      return;
    }

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { orderId },
      include: { track: true, user: true },
    });

    if (!transaction) {
      res.status(404).json({ error: 'Order not found in transaction ledger.' });
      return;
    }

    // Idempotency: if already SUCCESS, return immediately
    if (transaction.status === 'SUCCESS') {
      res.json({
        success: true,
        status: 'SUCCESS',
        orderId,
        itemType: transaction.itemType,
        message: 'Order already fulfilled.',
        alreadyFulfilled: true,
        track: transaction.track ? { id: transaction.track.id, titleEnglish: transaction.track.titleEnglish } : undefined,
      });
      return;
    }

    const targetGateway = (gateway || transaction.gateway || 'CASHFREE').toUpperCase();

    // 1. Verify Cashfree payment with Cashfree API
    if (targetGateway === 'CASHFREE') {
      const cfOrder = await cashfreeService.getOrder(orderId);
      const cfPayments = await cashfreeService.getOrderPayments(orderId);

      const successfulPayment = cfPayments.find(
        (p: any) => p.payment_status === 'SUCCESS' || p.payment_status === 'CAPTURED'
      );

      const isPaid = cfOrder.order_status === 'PAID' || Boolean(successfulPayment);

      if (isPaid) {
        const result = await fulfillmentService.fulfillOrder({
          orderId,
          gateway: 'CASHFREE',
          gatewayOrderId: String(cfOrder.cf_order_id || transaction.gatewayOrderId || ''),
          gatewayPaymentId: String(successfulPayment?.cf_payment_id || paymentId || 'cf_verified'),
          paymentMethod: successfulPayment?.payment_group || successfulPayment?.payment_method || 'CASHFREE',
          rawResponse: { cfOrder, successfulPayment },
        });

        res.json({
          success: true,
          status: 'SUCCESS',
          orderId,
          itemType: result.itemType,
          message: result.message,
          trackTitle: result.trackTitle,
        });
        return;
      } else {
        await fulfillmentService.failOrder(orderId, `Cashfree order status: ${cfOrder.order_status}`, cfOrder);
        res.status(400).json({
          success: false,
          status: cfOrder.order_status,
          error: `Payment is not completed (status: ${cfOrder.order_status})`,
        });
        return;
      }
    }

    // 2. Verify Instamojo payment with Instamojo API
    if (targetGateway === 'INSTAMOJO') {
      const imReqId = paymentRequestId || transaction.gatewayOrderId;
      if (!imReqId) {
        res.status(400).json({ error: 'Missing Instamojo payment request identifier.' });
        return;
      }

      const imDetails = await instamojoService.getPaymentRequestDetails(imReqId);
      const payments = Array.isArray(imDetails.payments) ? imDetails.payments : [];

      const completedPayment = payments.find(
        (p: any) => p.status === 'Credit' || p.status === 'SUCCESS' || p.status === 'Completed'
      );

      const isCompleted = imDetails.status === 'Completed' || Boolean(completedPayment);

      if (isCompleted) {
        const result = await fulfillmentService.fulfillOrder({
          orderId,
          gateway: 'INSTAMOJO',
          gatewayOrderId: imReqId,
          gatewayPaymentId: String(completedPayment?.payment_id || paymentId || 'im_verified'),
          paymentMethod: completedPayment?.instrument_type || 'INSTAMOJO',
          rawResponse: imDetails,
        });

        res.json({
          success: true,
          status: 'SUCCESS',
          orderId,
          itemType: result.itemType,
          message: result.message,
          trackTitle: result.trackTitle,
        });
        return;
      } else {
        await fulfillmentService.failOrder(orderId, `Instamojo payment status: ${imDetails.status}`, imDetails);
        res.status(400).json({
          success: false,
          status: imDetails.status,
          error: `Payment is not completed (status: ${imDetails.status})`,
        });
        return;
      }
    }

    // 3. Verify Razorpay
    if (targetGateway === 'RAZORPAY') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const isValid = verifyRazorpaySignature(
        razorpay_order_id || transaction.gatewayOrderId || '',
        razorpay_payment_id || paymentId || '',
        razorpay_signature || ''
      );

      if (isValid) {
        const result = await fulfillmentService.fulfillOrder({
          orderId,
          gateway: 'RAZORPAY',
          gatewayOrderId: razorpay_order_id,
          gatewayPaymentId: razorpay_payment_id,
          paymentMethod: 'RAZORPAY',
        });

        res.json({
          success: true,
          status: 'SUCCESS',
          orderId,
          itemType: result.itemType,
          message: result.message,
        });
        return;
      } else {
        res.status(400).json({ success: false, error: 'Invalid Razorpay signature' });
        return;
      }
    }

    res.status(400).json({ error: 'Unknown gateway' });
  } catch (error: any) {
    console.error('Error verifying payment independently:', error);
    res.status(500).json({
      error: 'Payment verification failed',
      details: error?.message || String(error),
    });
  }
});

/**
 * GET /api/payments/order/:orderId
 * Fetches order status from database ledger
 */
router.get('/order/:orderId', async (req, res: Response) => {
  try {
    const orderId = String(req.params.orderId);
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { orderId },
      include: {
        track: { select: { id: true, titleEnglish: true, titleTelugu: true, slug: true } },
      },
    });

    if (!transaction) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({
      orderId: transaction.orderId,
      gateway: transaction.gateway,
      itemType: transaction.itemType,
      amountPaise: transaction.amountPaise,
      amountRupees: transaction.amountPaise / 100,
      status: transaction.status,
      customerName: transaction.customerName,
      customerEmail: transaction.customerEmail,
      track: transaction.track,
      createdAt: transaction.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch order status' });
  }
});

// =========================================================================
// 4. WEBHOOKS (CRYPTOGRAPHIC VERIFICATION + IDEMPOTENCY)
// =========================================================================

/**
 * POST /api/payments/cashfree-webhook
 * Official Cashfree Webhook Handler
 * Verifies x-webhook-signature HMAC-SHA256 with timestamp + rawBody
 */
router.post('/cashfree-webhook', async (req, res: Response) => {
  try {
    const signature = req.headers['x-webhook-signature'] as string;
    const timestamp = req.headers['x-webhook-timestamp'] as string;
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    // Cryptographic verification
    const isValid = cashfreeService.verifyWebhookSignature(signature, timestamp, rawBody);
    if (!isValid) {
      console.warn('Unauthorized Cashfree Webhook Attempt: Signature mismatch');
      res.status(400).json({ error: 'Invalid Cashfree webhook signature' });
      return;
    }

    const payload = req.body || {};
    const eventType = payload.type || 'PAYMENT_WEBHOOK';
    const data = payload.data || {};
    const orderData = data.order || {};
    const paymentData = data.payment || {};
    const orderId = orderData.order_id;
    const paymentId = paymentData.cf_payment_id || `cf_pay_${Date.now()}`;

    const eventId = `cf_evt_${orderId}_${paymentId}_${eventType}`;

    // Idempotency: Ignore duplicate webhook event deliveries
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId },
    });

    if (existingEvent) {
      res.json({ message: 'Event already processed', eventId });
      return;
    }

    // Record webhook event in PostgreSQL
    await prisma.webhookEvent.create({
      data: {
        eventId,
        eventType,
        payload: typeof rawBody === 'string' ? rawBody : JSON.stringify(payload),
        status: 'PROCESSED',
      },
    });

    // Fulfill order if payment succeeded
    const isSuccess =
      eventType === 'PAYMENT_SUCCESS_WEBHOOK' ||
      paymentData.payment_status === 'SUCCESS' ||
      orderData.order_status === 'PAID';

    if (isSuccess && orderId) {
      await fulfillmentService.fulfillOrder({
        orderId,
        gateway: 'CASHFREE',
        gatewayOrderId: String(orderData.cf_order_id || ''),
        gatewayPaymentId: String(paymentId),
        paymentMethod: paymentData.payment_group || paymentData.payment_method || 'CASHFREE',
        rawResponse: payload,
      });
    } else if (orderId && (eventType === 'PAYMENT_FAILED_WEBHOOK' || paymentData.payment_status === 'FAILED')) {
      await fulfillmentService.failOrder(orderId, 'Cashfree payment failed webhook received', payload);
    }

    res.json({ status: 'ok', eventId });
  } catch (error) {
    console.error('Error handling Cashfree webhook:', error);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

/**
 * POST /api/payments/instamojo-webhook
 * Official Instamojo Webhook Handler
 * Verifies MAC signature with INSTAMOJO_SALT
 */
router.post('/instamojo-webhook', async (req, res: Response) => {
  try {
    const postData = req.body || {};

    // Cryptographic MAC verification
    const isValid = instamojoService.verifyWebhookMac(postData);
    if (!isValid) {
      console.warn('Unauthorized Instamojo Webhook Attempt: MAC signature mismatch');
      res.status(403).json({ error: 'Invalid Instamojo MAC signature' });
      return;
    }

    const paymentId = postData.payment_id;
    const paymentRequestId = postData.payment_request_id;
    const status = postData.status; // 'Credit' for successful payment

    const eventId = `im_evt_${paymentId}_${status}`;

    // Idempotency check
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId },
    });

    if (existingEvent) {
      res.json({ message: 'Event already processed', eventId });
      return;
    }

    // Record webhook event in PostgreSQL
    await prisma.webhookEvent.create({
      data: {
        eventId,
        eventType: `INSTAMOJO_${status}`,
        payload: JSON.stringify(postData),
        status: 'PROCESSED',
      },
    });

    // Locate transaction by gatewayOrderId (paymentRequestId)
    const transaction = await prisma.paymentTransaction.findFirst({
      where: {
        OR: [
          { gatewayOrderId: paymentRequestId },
          { orderId: paymentRequestId },
        ],
      },
    });

    if (transaction && status === 'Credit') {
      await fulfillmentService.fulfillOrder({
        orderId: transaction.orderId,
        gateway: 'INSTAMOJO',
        gatewayOrderId: paymentRequestId,
        gatewayPaymentId: paymentId,
        paymentMethod: postData.instrument_type || 'INSTAMOJO',
        rawResponse: postData,
      });
    } else if (transaction && status !== 'Credit') {
      await fulfillmentService.failOrder(transaction.orderId, `Instamojo webhook status: ${status}`, postData);
    }

    res.json({ status: 'ok', eventId });
  } catch (error) {
    console.error('Error handling Instamojo webhook:', error);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

// =========================================================================
// 5. LEGACY RAZORPAY / BACKWARD COMPATIBILITY
// =========================================================================

router.post('/create-order', optionalAuth, async (req: AuthRequest, res: Response) => {
  if (PAYMENTS_PAUSED) {
    res.status(503).json({ error: 'Online checkout paused', paymentsPaused: true });
    return;
  }
  // Redirect internally to unified order creator
  req.body.itemType = 'TRACK';
  req.body.gateway = req.body.gateway || 'CASHFREE';
  return (router as any).handle(req, res);
});

router.post('/create-subscription', authenticateUser, async (req: AuthRequest, res: Response) => {
  if (PAYMENTS_PAUSED) {
    res.status(503).json({ error: 'Online checkout paused', paymentsPaused: true });
    return;
  }
  req.body.itemType = 'VIP_PASS';
  req.body.gateway = req.body.gateway || 'CASHFREE';
  return (router as any).handle(req, res);
});

router.post('/verify-payment', optionalAuth, async (req: AuthRequest, res: Response) => {
  const orderId = req.body.order_id || req.body.razorpay_order_id;
  const paymentId = req.body.payment_id || req.body.razorpay_payment_id;
  const signature = req.body.signature || req.body.razorpay_signature;

  if (orderId && paymentId && signature) {
    const isValid = verifyRazorpaySignature(orderId, paymentId, signature);
    if (!isValid) {
      res.status(400).json({ error: 'Invalid signature', success: false });
      return;
    }
    const result = await fulfillmentService.fulfillOrder({
      orderId,
      gateway: 'RAZORPAY',
      gatewayPaymentId: paymentId,
    });
    res.json(result);
    return;
  }

  res.status(400).json({ error: 'Invalid request' });
});

router.post('/verify-order', authenticateUser, async (req: AuthRequest, res: Response) => {
  const orderId = req.body.razorpay_order_id || req.body.order_id;
  const paymentId = req.body.razorpay_payment_id || req.body.payment_id;
  if (!orderId) {
    res.status(400).json({ error: 'Order ID is required' });
    return;
  }
  const result = await fulfillmentService.fulfillOrder({
    orderId,
    gateway: 'RAZORPAY',
    gatewayPaymentId: paymentId || 'manual_verify',
  });
  res.json(result);
});

router.post('/verify-subscription', authenticateUser, async (req: AuthRequest, res: Response) => {
  const orderId = req.body.subscriptionId || req.body.razorpay_order_id || req.body.order_id;
  const paymentId = req.body.paymentId || req.body.razorpay_payment_id || req.body.payment_id;
  if (!orderId) {
    res.status(400).json({ error: 'Order ID is required' });
    return;
  }
  const result = await fulfillmentService.fulfillOrder({
    orderId,
    gateway: 'RAZORPAY',
    gatewayPaymentId: paymentId || 'manual_verify',
  });
  res.json(result);
});

export default router;
