import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL || 'postgres://stocker:stocker@localhost:5432/stocker'
});

await client.connect();

if (process.argv.includes('--reset')) {
  await client.query(readFileSync(join('sql', 'sql_run.sql'), 'utf8'));
  await client.query(readFileSync(join('sql', '001_schema.sql'), 'utf8'));
}

await client.query(readFileSync(join('sql', '003_seed.sql'), 'utf8'));
await client.end();

console.log(`Database ${process.argv.includes('--reset') ? 'reset' : 'seed'} complete.`);
