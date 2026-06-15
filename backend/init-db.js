const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Reads the DATABASE_URL environment variable injected by your hosting config
if (!process.env.DATABASE_URL) {
  console.log("ℹ️ No DATABASE_URL found. Skipping database auto-initialization (mock database fallback will be used).");
  process.exit(0);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1')
    ? false
    : { rejectUnauthorized: false } // Required for secure cloud hosting connections
});

async function initializeDatabase() {
  try {
    console.log("Checking database connection and initializing UGC schema...");
    // Path to the Stage 1 SQL schema script we saved in the root directory
    const sqlPath = path.join(__dirname, '../schema.sql');
    const schemaSql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL schema script directly on your cloud database instance
    await pool.query(schemaSql);
    console.log("PostgreSQL schema initialized successfully! ");
  } catch (err) {
    console.error("Database initialization skipped or already configured:", err.message);
  } finally {
    await pool.end();
  }
}

initializeDatabase();
