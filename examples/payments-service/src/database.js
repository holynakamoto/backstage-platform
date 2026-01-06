const { Pool } = require('pg');
const logger = require('./logger');

let pool;

async function connectDB() {
  try {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'payments',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    const client = await pool.connect();
    logger.info('Database connected successfully');
    client.release();
    
    return pool;
  } catch (error) {
    logger.error('Database connection failed', { error: error.message });
    throw error;
  }
}

async function disconnectDB() {
  if (pool) {
    await pool.end();
    logger.info('Database connection closed');
  }
}

async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Query executed', { duration: `${duration}ms`, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Query failed', { error: error.message, query: text });
    throw error;
  }
}

module.exports = {
  connectDB,
  disconnectDB,
  query
};

