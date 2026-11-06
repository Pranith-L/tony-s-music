const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const u = new URL(process.env.DIRECT_URL || process.env.DATABASE_URL);
const client = new Client({
  host: u.hostname,
  port: parseInt(u.port || '5432', 10),
  user: decodeURIComponent(u.username),
  password: decodeURIComponent(u.password),
  database: u.pathname.replace(/^\//, ''),
  ssl: { rejectUnauthorized: false },
});

async function clean() {
  await client.connect();
  const res1 = await client.query("DELETE FROM auth.users WHERE email LIKE 'test.listener%' RETURNING email;");
  console.log('Cleaned from auth.users:', res1.rows.map(r => r.email));
  const res2 = await client.query('DELETE FROM public."User" WHERE email LIKE \'test.listener%\' RETURNING email;');
  console.log('Cleaned from public.User:', res2.rows.map(r => r.email));
  await client.end();
}

clean().catch(console.error);

