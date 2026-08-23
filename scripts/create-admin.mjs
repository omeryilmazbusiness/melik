/**
 * One-off: create/update admin user
 * Usage: DATABASE_URL=... node scripts/create-admin.mjs
 */
import bcrypt from 'bcryptjs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../backend/.env', import.meta.url).pathname });

const { Client } = pg;

const username = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME || 'Şirin Kids Admin';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL gerekli');
  process.exit(1);
}
if (!password || password.length < 8) {
  console.error('ADMIN_PASSWORD en az 8 karakter olmalı');
  process.exit(1);
}

const ssl =
  process.env.DATABASE_URL.includes('railway') || process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : undefined;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl,
});

await client.connect();

await client.query(`
  CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(150) DEFAULT 'Admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )
`);

const hash = await bcrypt.hash(password, 12);

const { rows } = await client.query(
  `INSERT INTO admins (username, password_hash, name)
   VALUES ($1, $2, $3)
   ON CONFLICT (username) DO UPDATE SET
     password_hash = EXCLUDED.password_hash,
     name = EXCLUDED.name,
     is_active = TRUE,
     updated_at = NOW()
   RETURNING id, username, name`,
  [username, hash, name]
);

console.log('✓ Admin hazır');
console.log(JSON.stringify(rows[0], null, 2));
await client.end();
