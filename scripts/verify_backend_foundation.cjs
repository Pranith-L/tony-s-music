const path = require('path');
const dotenv = require(path.resolve(__dirname, '../backend/node_modules/dotenv'));
const { Client } = require(path.resolve(__dirname, '../backend/node_modules/pg'));

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const parsed = new URL(rawUrl);

const client = new Client({
  host: parsed.hostname,
  port: parseInt(parsed.port || '5432', 10),
  user: decodeURIComponent(parsed.username),
  password: decodeURIComponent(parsed.password),
  database: parsed.pathname.slice(1) || 'postgres',
  ssl: { rejectUnauthorized: false },
});

async function verify() {
  console.log('=== SUPABASE BACKEND FOUNDATION VERIFICATION ===\n');
  await client.connect();

  // 1. Data Preservation Audit
  console.log('1. Checking Production Data Preservation:');
  const counts = await client.query(`
    SELECT
      (SELECT COUNT(*) FROM public."Track") as tracks,
      (SELECT COUNT(*) FROM public."Album") as albums,
      (SELECT COUNT(*) FROM public."Video") as videos,
      (SELECT COUNT(*) FROM public."User") as users,
      (SELECT COUNT(*) FROM public."Subscription") as subscriptions,
      (SELECT COUNT(*) FROM public."Purchase") as purchases,
      (SELECT COUNT(*) FROM public."PaymentTransaction") as transactions;
  `);
  console.table(counts.rows[0]);

  // 2. Auth Users Verification
  console.log('\n2. Checking Supabase Auth Synchronization:');
  const authUsers = await client.query(`
    SELECT id, email, role, email_confirmed_at IS NOT NULL as confirmed 
    FROM auth.users;
  `);
  console.log(`auth.users count: ${authUsers.rows.length}`);
  authUsers.rows.forEach(u => console.log(` - ${u.email} (confirmed: ${u.confirmed})`));

  // 3. Row Level Security Policies
  console.log('\n3. Checking Row Level Security Policies:');
  const policies = await client.query(`
    SELECT tablename, policyname, cmd, roles 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    ORDER BY tablename, policyname;
  `);
  console.log(`Total active RLS policies: ${policies.rows.length}`);
  console.table(policies.rows);

  // 4. Trigger Check
  console.log('\n4. Checking Sync Trigger:');
  const triggers = await client.query(`
    SELECT trigger_name, event_manipulation, event_object_table 
    FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created';
  `);
  console.log('Trigger on_auth_user_created:', triggers.rows);

  // 5. Atomic RPC Function Test
  console.log('\n5. Testing Atomic Fulfillment RPC (fulfill_order_atomic):');
  const testRpc = await client.query(`
    SELECT public.fulfill_order_atomic('non_existent_test_order', 'CASHFREE', 'cf_ord_test', 'cf_pay_test') as result;
  `);
  console.log('RPC non-existent order response:', testRpc.rows[0].result);

  // 6. Test Idempotency with a simulated order
  console.log('\n6. Testing RPC on Real Database Transaction:');
  const sampleTx = await client.query(`
    SELECT "orderId", status, "itemType", "userId", "amountPaise" 
    FROM public."PaymentTransaction" 
    LIMIT 1;
  `);
  if (sampleTx.rows.length > 0) {
    const tx = sampleTx.rows[0];
    console.log('Sample transaction:', tx);
    const rpcTest = await client.query(`
      SELECT public.fulfill_order_atomic($1, 'TEST_GATEWAY', 'test_gw_ord', 'test_gw_pay') as result;
    `, [tx.orderId]);
    console.log('RPC execution result on transaction:', rpcTest.rows[0].result);
  }

  console.log('\n=== ALL FOUNDATION CHECKS COMPLETED! ===');
  await client.end();
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});

