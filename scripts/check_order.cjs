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

async function main() {
  await client.connect();
  const tx = await client.query('SELECT * FROM "PaymentTransaction" ORDER BY "createdAt" DESC LIMIT 5');
  console.log('Recent Transactions:', tx.rows);
  const sub = await client.query('SELECT * FROM "Subscription" ORDER BY "createdAt" DESC LIMIT 5');
  console.log('Recent Subscriptions:', sub.rows);
  await client.end();
}

main().catch(console.error);
