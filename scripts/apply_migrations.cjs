const fs = require('fs');
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

const migrationFiles = [
  '20261106100001_auth_user_sync_trigger.sql',
  '20261106100002_enable_rls_policies.sql',
  '20261106100003_payment_transaction_constraints.sql',
  '20261106100004_atomic_fulfillment_rpc.sql',
];

async function applyMigrations() {
  console.log('--- STARTING SUPABASE MIGRATION RUNNER (PG CLIENT) ---');
  console.log(`Connecting to ${parsed.hostname}:${parsed.port}...`);

  await client.connect();
  console.log('Connected successfully!');

  for (const filename of migrationFiles) {
    const filePath = path.resolve(__dirname, '../supabase/migrations', filename);
    console.log(`\nExecuting migration: ${filename}`);
    const sql = fs.readFileSync(filePath, 'utf8');

    const startTime = Date.now();
    await client.query(sql);
    const elapsed = Date.now() - startTime;
    console.log(`✅ ${filename} APPLIED in ${elapsed}ms!`);
  }

  console.log('\n--- ALL MIGRATIONS APPLIED SUCCESSFULLY! ---');
  await client.end();
}

applyMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
