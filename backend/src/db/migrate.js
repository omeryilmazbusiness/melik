import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const alterPath = path.join(__dirname, 'alter.sql');
  const adminSchemaPath = path.join(__dirname, 'admin_schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  const alter = fs.readFileSync(alterPath, 'utf-8');
  const adminSchema = fs.readFileSync(adminSchemaPath, 'utf-8');

  const client = await pool.connect();
  try {
    await client.query(schema);
    await client.query(alter);
    await client.query(adminSchema);
    console.log('✓ Database schema migrated successfully');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
