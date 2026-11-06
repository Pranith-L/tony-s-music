const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://mrehomunxqccvcwpkwxd.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_o_zU6hleiM1JacijRPTTRA_aIJI7k_9';
const prisma = new PrismaClient();

// Unauthenticated (anon) client
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

async function runDatabaseRlsE2ETests() {
  console.log('====================================================');
  console.log('PROMPT 09: DATABASE, RLS & CONCURRENCY E2E SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function record(name, condition, details = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✅ PASS: [${totalTests}] ${name} ${details ? `(${details})` : ''}`);
    } else {
      console.error(`❌ FAIL: [${totalTests}] ${name} ${details ? `(${details})` : ''}`);
    }
  }

  try {
    // ----------------------------------------------------
    // TEST SECTION 1: PUBLIC / ANON RLS RESTRICTIONS
    // ----------------------------------------------------
    console.log('--- 1. Testing Public / Anon RLS Boundaries ---');

    // 1.1 Public read on Tracks
    const { data: publicTracks, error: trackReadErr } = await anonClient
      .from('Track')
      .select('id, titleTelugu, titleEnglish')
      .limit(3);
    record('Public read on Track table', !trackReadErr && publicTracks?.length > 0, `fetched ${publicTracks?.length} tracks`);

    // 1.2 Public write on Tracks (Must be denied)
    const { error: trackWriteErr } = await anonClient
      .from('Track')
      .insert({ id: 'illegal_track_id', slug: 'hacked-song', titleTelugu: 'హ్యాక్', titleEnglish: 'Hacked Song' });
    record('Public write on Track table denied by RLS', !!trackWriteErr, trackWriteErr?.message || 'Access denied');

    // 1.3 Public read on User profiles (Must return empty or be denied)
    const { data: publicUsers, error: userReadErr } = await anonClient
      .from('User')
      .select('id, email');
    record('Public read on User table blocked by RLS', userReadErr || (!userReadErr && publicUsers?.length === 0), `Users returned: ${publicUsers?.length || 0}`);

    // 1.4 Public read on PaymentTransaction (Must return empty or be denied)
    const { data: publicTx, error: txReadErr } = await anonClient
      .from('PaymentTransaction')
      .select('id, orderId');
    record('Public read on PaymentTransaction table blocked by RLS', txReadErr || (!txReadErr && publicTx?.length === 0), `Transactions returned: ${publicTx?.length || 0}`);

    // 1.5 Public read on Entitlement (Must return empty or be denied)
    const { data: publicEnt, error: entReadErr } = await anonClient
      .from('Entitlement')
      .select('id, type');
    record('Public read on Entitlement table blocked by RLS', entReadErr || (!entReadErr && publicEnt?.length === 0), `Entitlements returned: ${publicEnt?.length || 0}`);

    // ----------------------------------------------------
    // TEST SECTION 2: AUTHENTICATED USER ISOLATION
    // ----------------------------------------------------
    console.log('\n--- 2. Testing Authenticated User Session & Isolation ---');

    const adminEmail = 'Tonyprakash.l@admin.in';
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Tonyprakash@admin';

    // Sign in as admin to get an authenticated client
    const { data: authData, error: authErr } = await anonClient.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });
    record('Authenticated session established', !authErr && !!authData?.session, `User ID: ${authData?.user?.id}`);

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${authData?.session?.access_token}`,
        },
      },
    });

    // 2.1 Authenticated self profile read
    const { data: myProfile, error: profileErr } = await userClient
      .from('User')
      .select('id, email, role')
      .eq('id', authData.user.id)
      .single();
    record('Authenticated user can read own profile', !profileErr && myProfile?.id === authData.user.id, `Role: ${myProfile?.role}`);

    // 2.2 Direct payment transaction forging blocked by RLS
    const { error: forgeErr } = await userClient
      .from('PaymentTransaction')
      .insert({
        id: 'forged_tx_' + Date.now(),
        orderId: 'forged_order_' + Date.now(),
        userId: authData.user.id,
        amountPaise: 29900,
        currency: 'INR',
        gateway: 'CASHFREE',
        status: 'SUCCESS', // Attempt to self-grant SUCCESS
        itemType: 'VIP_PASS',
      });
    record('Direct client insertion into PaymentTransaction blocked by RLS', !!forgeErr, forgeErr?.message || 'Access denied');

    // ----------------------------------------------------
    // TEST SECTION 3: CONCURRENCY & RACE CONDITIONS
    // ----------------------------------------------------
    console.log('\n--- 3. Testing Concurrent Webhook / Fulfillment Race Conditions ---');

    const testOrderId = `test_race_${Date.now()}`;
    const testUserId = authData.user.id;

    // Insert a pending transaction ledger record using Prisma (simulating backend order creation)
    await prisma.paymentTransaction.create({
      data: {
        orderId: testOrderId,
        user: { connect: { id: testUserId } },
        amountPaise: 29900,
        currency: 'INR',
        gateway: 'CASHFREE',
        status: 'PENDING',
        itemType: 'VIP_PASS',
        customerName: 'E2E Concurrency Test',
      },
    });
    console.log(`   Created test pending transaction: ${testOrderId}`);

    // Dispatch 5 concurrent fulfill_order_atomic RPC calls simultaneously
    console.log('   Dispatching 5 simultaneous fulfillment requests to Supabase RPC...');
    const concurrentRequests = Array.from({ length: 5 }).map((_, i) =>
      anonClient.rpc('fulfill_order_atomic', {
        p_order_id: testOrderId,
        p_gateway: 'CASHFREE',
        p_gateway_order_id: `cf_ord_${testOrderId}_${i}`,
        p_gateway_payment_id: `pay_mock_${testOrderId}_${i}`,
        p_payment_method: 'UPI',
      })
    );

    const results = await Promise.all(concurrentRequests);

    let successCount = 0;
    let alreadyFulfilledCount = 0;
    let failedCount = 0;

    for (const res of results) {
      if (res.data?.success) {
        if (res.data?.alreadyFulfilled) {
          alreadyFulfilledCount++;
        } else {
          successCount++;
        }
      } else {
        console.error('RPC Error details:', res.error || res.data);
        failedCount++;
      }
    }

    console.log(`   RPC Concurrency Results:
      - Initial Fulfillments: ${successCount}
      - Idempotent Duplicates: ${alreadyFulfilledCount}
      - Execution Errors: ${failedCount}`);

    record('Exactly 1 concurrent request executed initial fulfillment', successCount === 1, `Count: ${successCount}`);
    record('Remaining 4 concurrent requests handled idempotently', alreadyFulfilledCount === 4, `Count: ${alreadyFulfilledCount}`);
    record('Zero concurrent execution errors', failedCount === 0);

    // Verify database record integrity
    const updatedTx = await prisma.paymentTransaction.findUnique({
      where: { orderId: testOrderId },
    });
    record('PaymentTransaction status is SUCCESS in database', updatedTx?.status === 'SUCCESS');

    // Verify Subscription uniqueness: ensure subscriptions exist and are active
    const subs = await prisma.subscription.findMany({
      where: { userId: testUserId, status: 'ACTIVE' },
    });
    record('Active Subscription exists in database', subs.length > 0, `Active Subscriptions: ${subs.length}`);

    // Clean up test transaction
    await prisma.paymentTransaction.deleteMany({
      where: { orderId: testOrderId },
    });
    console.log('   Cleaned up concurrency test transaction.');

    // ----------------------------------------------------
    // TEST SECTION 4: DATA INTEGRITY CONSTRAINTS
    // ----------------------------------------------------
    console.log('\n--- 4. Testing Database Integrity Constraints ---');

    // 4.1 Unique orderId constraint
    let duplicateOrderCaught = false;
    try {
      const dupId = `dup_${Date.now()}`;
      await prisma.paymentTransaction.create({
        data: {
          orderId: dupId,
          user: { connect: { id: testUserId } },
          amountPaise: 9900,
          currency: 'INR',
          gateway: 'INSTAMOJO',
          status: 'PENDING',
          itemType: 'STUDIO_TRACK',
        },
      });
      // Try to create identical orderId
      await prisma.paymentTransaction.create({
        data: {
          orderId: dupId,
          user: { connect: { id: testUserId } },
          amountPaise: 9900,
          currency: 'INR',
          gateway: 'INSTAMOJO',
          status: 'PENDING',
          itemType: 'STUDIO_TRACK',
        },
      });
    } catch (e) {
      duplicateOrderCaught = true;
    } finally {
      await prisma.paymentTransaction.deleteMany({
        where: { orderId: { startsWith: 'dup_' } },
      });
    }
    record('Unique constraint prevents duplicate orderId', duplicateOrderCaught);

    // Log-out admin session
    await anonClient.auth.signOut();

    console.log('\n====================================================');
    console.log(`DATABASE & RLS E2E AUDIT: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log('====================================================\n');

    if (passedTests === totalTests) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during Database E2E test:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runDatabaseRlsE2ETests();
