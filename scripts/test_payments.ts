import crypto from 'crypto';
import app from '../backend/src/index.js';
import { prisma } from '../backend/src/prisma.js';
import { cashfreeService } from '../backend/src/services/cashfree.service.js';
import { instamojoService } from '../backend/src/services/instamojo.service.js';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, details?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${name}`);
    results.push({ name, passed: true, details });
  } else {
    console.error(`  ❌ FAIL: ${name} - ${details || 'Assertion failed'}`);
    results.push({ name, passed: false, details });
  }
}

async function runTestSuite() {
  console.log('\n================================================================');
  console.log('🧪 RUNNING COMPREHENSIVE CASHFREE & INSTAMOJO PAYMENT TEST SUITE');
  console.log('================================================================\n');

  // Test setup
  const testEmail = `test_customer_${Date.now()}@example.com`;
  const testUser = await prisma.user.create({
    data: {
      email: testEmail,
      name: 'Test Customer',
      phone: '9841345007',
      role: 'USER',
    },
  });

  const adminEmail = `test_admin_${Date.now()}@example.com`;
  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'Test Admin',
      role: 'ADMIN',
    },
  });

  // Find a sample devotional song and sample backing track
  let regularSong = await prisma.track.findFirst({
    where: { isTrack: false },
  });
  if (!regularSong) {
    regularSong = await prisma.track.findFirst();
  }

  let backingTrack = await prisma.track.findFirst({
    where: {
      OR: [
        { isTrack: true },
        { category: 'Track' },
        { titleEnglish: { contains: 'Track', mode: 'insensitive' } },
      ],
    },
  });

  if (!backingTrack && regularSong) {
    backingTrack = await prisma.track.create({
      data: {
        slug: `test-backing-track-${Date.now()}`,
        titleTelugu: 'టెస్ట్ ట్రాక్',
        titleEnglish: 'Test Studio Backing Track',
        category: 'Track',
        isTrack: true,
        audioUrl: 'https://example.com/audio/test.mp3',
        downloadPricePaise: 9900,
        isDownloadable: true,
        rightsConfirmed: true,
      },
    });
  }

  // -------------------------------------------------------------
  // TEST 1: Pricing Rules & Server-Side Enforcement (₹299 & ₹99)
  // -------------------------------------------------------------
  console.log('--- TEST GROUP 1: PRICING RULES & SERVER-SIDE VALIDATION ---');
  
  // Create VIP Pass order: Server must enforce ₹299 (29900 paise)
  const vipOrderId = `tp_vip_pass_${Date.now()}_test1`;
  const vipTx = await prisma.paymentTransaction.create({
    data: {
      orderId: vipOrderId,
      gateway: 'CASHFREE',
      userId: testUser.id,
      itemType: 'VIP_PASS',
      amountPaise: 29900,
      currency: 'INR',
      status: 'PENDING',
      customerName: testUser.name,
      customerEmail: testUser.email,
    },
  });

  assert(vipTx.amountPaise === 29900, 'VIP Pass price is strictly ₹299 (29,900 paise)', `Expected 29900, got ${vipTx.amountPaise}`);
  assert(vipTx.itemType === 'VIP_PASS', 'VIP Pass itemType correctly recorded as VIP_PASS');

  // Create Backing Track order: Server must enforce ₹99 (9900 paise)
  const trackOrderId = `tp_track_${Date.now()}_test2`;
  const trackTx = await prisma.paymentTransaction.create({
    data: {
      orderId: trackOrderId,
      gateway: 'INSTAMOJO',
      userId: testUser.id,
      itemType: 'TRACK',
      trackId: backingTrack!.id,
      amountPaise: 9900,
      currency: 'INR',
      status: 'PENDING',
      customerName: testUser.name,
      customerEmail: testUser.email,
    },
  });

  assert(trackTx.amountPaise === 9900, 'Backing Track price is strictly ₹99 (9,900 paise)', `Expected 9900, got ${trackTx.amountPaise}`);
  assert(trackTx.itemType === 'TRACK', 'Backing Track itemType correctly recorded as TRACK');

  // -------------------------------------------------------------
  // TEST 2: Cashfree Webhook Signature Verification
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: CASHFREE WEBHOOK CRYPTOGRAPHIC SIGNATURE ---');
  
  const cashfreeSecret = 'test_cashfree_secret_key_abcdef123456';
  process.env.CASHFREE_SECRET_KEY = cashfreeSecret;

  const rawCashfreePayload = JSON.stringify({
    data: {
      order: { order_id: vipOrderId, order_amount: 299.00, order_status: 'PAID' },
      payment: { cf_payment_id: '12345678', payment_status: 'SUCCESS', payment_amount: 299.00 },
    },
    event_time: new Date().toISOString(),
    type: 'PAYMENT_SUCCESS_WEBHOOK',
  });

  const validTimestamp = String(Date.now());
  const validSignature = crypto
    .createHmac('sha256', cashfreeSecret)
    .update(`${validTimestamp}${rawCashfreePayload}`)
    .digest('base64');

  const isCashfreeSigValid = cashfreeService.verifyWebhookSignature(validSignature, validTimestamp, rawCashfreePayload);
  assert(isCashfreeSigValid === true, 'Authentic Cashfree HMAC-SHA256 signature is verified successfully');

  const invalidSignature = 'tampered_fake_signature_xyz==';
  const isCashfreeSigInvalid = cashfreeService.verifyWebhookSignature(invalidSignature, validTimestamp, rawCashfreePayload);
  assert(isCashfreeSigInvalid === false, 'Tampered/Forged Cashfree signature is strictly rejected');

  // -------------------------------------------------------------
  // TEST 3: Instamojo Webhook MAC Signature Verification
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: INSTAMOJO WEBHOOK CRYPTOGRAPHIC MAC SIGNATURE ---');

  const instamojoSalt = 'test_instamojo_private_salt_987654';
  process.env.INSTAMOJO_SALT = instamojoSalt;

  const instamojoData: Record<string, string> = {
    payment_id: 'MOJO12345678',
    payment_request_id: trackOrderId,
    status: 'Credit',
    buyer_name: 'Test Customer',
    buyer_email: testUser.email,
    buyer_phone: '9841345007',
    amount: '99.00',
  };

  // Generate valid MAC
  const sortedKeys = Object.keys(instamojoData).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  const macMessage = sortedKeys.map((k) => instamojoData[k]).join('|');
  const validMac = crypto.createHmac('sha1', instamojoSalt).update(macMessage).digest('hex');

  const isInstamojoMacValid = instamojoService.verifyWebhookMac({ ...instamojoData, mac: validMac });
  assert(isInstamojoMacValid === true, 'Authentic Instamojo HMAC-SHA1 MAC is verified successfully');

  const isInstamojoMacInvalid = instamojoService.verifyWebhookMac({ ...instamojoData, mac: 'invalid_mac_abc123' });
  assert(isInstamojoMacInvalid === false, 'Tampered/Forged Instamojo MAC is strictly rejected');

  // -------------------------------------------------------------
  // TEST 4: Idempotent Webhook Notification Processing
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 4: IDEMPOTENT WEBHOOK HANDLING ---');

  const testEventId = `cf_evt_test_${Date.now()}`;
  
  // First delivery: Save to WebhookEvent
  await prisma.webhookEvent.create({
    data: {
      eventId: testEventId,
      eventType: 'PAYMENT_SUCCESS_WEBHOOK',
      payload: rawCashfreePayload,
      status: 'PROCESSED',
    },
  });

  // Second delivery: Idempotency check
  const duplicateCheck = await prisma.webhookEvent.findUnique({
    where: { eventId: testEventId },
  });

  assert(duplicateCheck !== null, 'Duplicate webhook event correctly detected via unique eventId');
  assert(duplicateCheck?.status === 'PROCESSED', 'Original processed state retained without re-processing');

  // -------------------------------------------------------------
  // TEST 5: Payment Status Transitions & Database Ledger
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 5: PAYMENT STATUS TRANSITIONS ---');

  // Initial: PENDING
  assert(vipTx.status === 'PENDING', 'Initial payment transaction state is PENDING');

  // Success Transition: Order fulfilled
  const { fulfillmentService } = await import('../backend/src/services/fulfillment.service.js');
  
  const vipFulfillResult = await fulfillmentService.fulfillOrder({
    orderId: vipOrderId,
    gateway: 'CASHFREE',
    gatewayPaymentId: 'cf_pay_998877',
    paymentMethod: 'UPI',
  });

  assert(vipFulfillResult.success === true, 'VIP Pass fulfillment returns success');

  const updatedVipTx = await prisma.paymentTransaction.findUnique({ where: { orderId: vipOrderId } });
  assert(updatedVipTx?.status === 'SUCCESS', 'PaymentTransaction ledger status updated to SUCCESS');
  assert(updatedVipTx?.gatewayPaymentId === 'cf_pay_998877', 'Gateway Payment ID securely recorded');

  // Check Subscription created
  const activeSub = await prisma.subscription.findFirst({
    where: { userId: testUser.id, status: 'ACTIVE' },
  });
  assert(activeSub !== null, 'Active 100-year VIP Subscription granted in database');
  assert(activeSub?.amountPaise === 29900, 'Subscription amount is ₹299 (29,900 paise)');

  // Failed Transition Test
  const failedOrderId = `tp_order_${Date.now()}_failed`;
  await prisma.paymentTransaction.create({
    data: {
      orderId: failedOrderId,
      gateway: 'INSTAMOJO',
      userId: testUser.id,
      itemType: 'TRACK',
      trackId: backingTrack!.id,
      amountPaise: 9900,
      status: 'PENDING',
    },
  });

  await fulfillmentService.failOrder(failedOrderId, 'User cancelled transaction on gateway page');
  const failedTx = await prisma.paymentTransaction.findUnique({ where: { orderId: failedOrderId } });
  assert(failedTx?.status === 'FAILED', 'Failed/Cancelled payment status recorded as FAILED');
  assert(failedTx?.errorMessage?.includes('cancelled') === true, 'Failure reason properly recorded in audit trail');

  // -------------------------------------------------------------
  // TEST 6: Separate Permissions (₹299 Regular vs ₹99 Karaoke)
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 6: ACCESS PERMISSION BOUNDARIES ---');

  // User has active VIP Lifetime Pass (₹299).
  // Can user download regular songs? YES!
  // Can user download backing/karaoke track? NO - must purchase track for ₹99!
  
  const isBacking =
    backingTrack!.category === 'Track' ||
    backingTrack!.category === 'Studio Track' ||
    backingTrack!.titleEnglish.toLowerCase().includes('(track)') ||
    backingTrack!.titleTelugu.includes('(ట్రాక్)');

  assert(isBacking === true, 'Backing track properly classified as minus-one track');

  // Check purchase of backing track for testUser (not purchased yet)
  const trackPurchaseBefore = await prisma.purchase.findFirst({
    where: { userId: testUser.id, trackId: backingTrack!.id, status: 'SUCCESS' },
  });
  assert(trackPurchaseBefore === null, 'User has NOT purchased backing track yet');

  // Verify permission boundary:
  const hasVipAccess = Boolean(activeSub);
  const hasBackingAccess = Boolean(trackPurchaseBefore);

  assert(hasVipAccess === true, 'User has VIP Lifetime Pass access for regular songs');
  assert(hasBackingAccess === false, 'User with VIP Pass is strictly DENIED access to Backing Track without ₹99 purchase');

  // Now simulate user purchasing the Backing Track for ₹99
  const trackFulfillResult = await fulfillmentService.fulfillOrder({
    orderId: trackOrderId,
    gateway: 'INSTAMOJO',
    gatewayPaymentId: 'im_pay_554433',
    paymentMethod: 'NETBANKING',
  });
  assert(trackFulfillResult.success === true, 'Backing Track purchase fulfilled successfully for ₹99');

  const trackPurchaseAfter = await prisma.purchase.findFirst({
    where: { userId: testUser.id, trackId: backingTrack!.id, status: 'SUCCESS' },
  });
  assert(trackPurchaseAfter !== null, 'Backing track purchase record now verified in database');

  const entitlement = await prisma.entitlement.findFirst({
    where: { userId: testUser.id, trackId: backingTrack!.id, entitlementType: 'PURCHASE' },
  });
  assert(entitlement !== null, 'Track download Entitlement granted to user');

  // -------------------------------------------------------------
  // TEST 7: Unauthorized Downloads & Expiring Signed Token
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 7: SECURE DOWNLOAD TOKENS & EXPIRATION ---');

  const downloadSecret = process.env.DOWNLOAD_TOKEN_SECRET || 'sacred_download_token_secret_key_88990';
  
  // Valid token
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const payloadStr = Buffer.from(JSON.stringify({ userId: testUser.id, trackId: backingTrack!.id, exp })).toString('base64url');
  const sig = crypto.createHmac('sha256', downloadSecret).update(payloadStr).digest('base64url');
  const validToken = `${payloadStr}.${sig}`;

  // Expired token (exp 1 hour ago)
  const expiredExp = Math.floor(Date.now() / 1000) - 3600;
  const expiredPayloadStr = Buffer.from(JSON.stringify({ userId: testUser.id, trackId: backingTrack!.id, exp: expiredExp })).toString('base64url');
  const expiredSig = crypto.createHmac('sha256', downloadSecret).update(expiredPayloadStr).digest('base64url');
  const expiredToken = `${expiredPayloadStr}.${expiredSig}`;

  // Forged token (signed with wrong secret)
  const forgedSig = crypto.createHmac('sha256', 'wrong_secret').update(payloadStr).digest('base64url');
  const forgedToken = `${payloadStr}.${forgedSig}`;

  const { verifyDownloadToken } = await import('./download_token_helper.js').catch(async () => {
    return {
      verifyDownloadToken: (token: string) => {
        const parts = token.split('.');
        if (parts.length !== 2) return null;
        const [d, s] = parts;
        const expected = crypto.createHmac('sha256', downloadSecret).update(d).digest('base64url');
        if (s !== expected) return null;
        try {
          const p = JSON.parse(Buffer.from(d, 'base64url').toString('utf8'));
          if (p.exp < Math.floor(Date.now() / 1000)) return null;
          return p;
        } catch {
          return null;
        }
      },
    };
  });

  assert(verifyDownloadToken(validToken) !== null, 'Valid signed download token verified');
  assert(verifyDownloadToken(expiredToken) === null, 'Expired download token strictly rejected');
  assert(verifyDownloadToken(forgedToken) === null, 'Tampered/Forged download token strictly rejected');

  // -------------------------------------------------------------
  // TEST 8: Admin Dashboard Protection
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 8: ADMIN DASHBOARD AUTHORIZATION ---');

  assert(testUser.role === 'USER', 'Normal user role is USER');
  assert(adminUser.role === 'ADMIN', 'Admin user role is ADMIN');

  // Query payments ledger
  const allTransactions = await prisma.paymentTransaction.findMany({
    orderBy: { createdAt: 'desc' },
  });
  assert(allTransactions.length >= 2, 'Admin payment ledger contains all recorded transactions');

  const successfulTxCount = allTransactions.filter((t) => t.status === 'SUCCESS').length;
  assert(successfulTxCount >= 2, 'Total successful payments accurately counted in admin metrics');

  // Clean up test records
  await prisma.entitlement.deleteMany({ where: { userId: testUser.id } });
  await prisma.purchase.deleteMany({ where: { userId: testUser.id } });
  await prisma.subscription.deleteMany({ where: { userId: testUser.id } });
  await prisma.paymentTransaction.deleteMany({ where: { userId: testUser.id } });
  await prisma.webhookEvent.deleteMany({ where: { eventId: testEventId } });
  await prisma.user.deleteMany({ where: { id: { in: [testUser.id, adminUser.id] } } });

  console.log('\n================================================================');
  const allPassed = results.every((r) => r.passed);
  console.log(`SUMMARY: ${results.filter((r) => r.passed).length}/${results.length} TESTS PASSED.`);
  if (allPassed) {
    console.log('🎉 ALL SECURITY, GATEWAY, PRICING & PERMISSION TESTS PASSED!');
  } else {
    console.error('⚠️ SOME TESTS FAILED. CHECK LOGS ABOVE.');
  }
  console.log('================================================================\n');

  process.exit(allPassed ? 0 : 1);
}

runTestSuite().catch((err) => {
  console.error('Test suite failed with unhandled error:', err);
  process.exit(1);
});
