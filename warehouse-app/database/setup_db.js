const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/warehouse'
})

async function run() {
  const args = process.argv.slice(2)
  const fullReset = args.includes('--reset')

  try {
    const client = await pool.connect()

    if (fullReset) {
      console.log('Running full reset...')
      const schema = fs.readFileSync(path.join(__dirname, 'sql', '001_schema.sql'), 'utf8')
      const seed = fs.readFileSync(path.join(__dirname, 'sql', '003_seed.sql'), 'utf8')
      await client.query(schema)
      console.log('Schema created.')
      await client.query(seed)
      console.log('Seed data inserted.')
    } else {
      console.log('Running schema only...')
      const schema = fs.readFileSync(path.join(__dirname, 'sql', '001_schema.sql'), 'utf8')
      await client.query(schema)
      console.log('Schema created.')

      // Check if data exists, seed only if empty
      const check = await client.query('SELECT COUNT(*) FROM product_type')
      if (parseInt(check.rows[0].count) === 0) {
        const seed = fs.readFileSync(path.join(__dirname, 'sql', '003_seed.sql'), 'utf8')
        await client.query(seed)
        console.log('Seed data inserted.')
      } else {
        console.log('Data already exists, skipping seed.')
      }
    }

    client.release()
    console.log('Done.')
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

run()
