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
  const res = await client.query("SELECT id, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data FROM auth.users;");
  console.log('auth.users:');
  console.log(res.rows);

  const res2 = await client.query("SELECT id, email, name, role FROM public.\"User\";");
  console.log('public.User:');
  console.log(res2.rows);

  await client.end();
}

main().catch(console.error);
