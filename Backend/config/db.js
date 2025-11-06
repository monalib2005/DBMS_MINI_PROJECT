const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // NeonDB requires SSL
  keepAlive: true,               // <— Keeps the TCP connection alive
  connectionTimeoutMillis: 20000
});

module.exports = pool;
