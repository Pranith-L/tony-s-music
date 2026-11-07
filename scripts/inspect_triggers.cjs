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
  const res = await client.query(`
    SELECT event_object_table, trigger_name, action_timing, event_manipulation 
    FROM information_schema.triggers 
    WHERE trigger_schema IN ('auth', 'public') 
    ORDER BY event_object_table;
  `);
  console.log(res.rows);
  await client.end();
}

main().catch(console.error);
