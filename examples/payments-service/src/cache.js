const redis = require('redis');
const logger = require('./logger');

let client;

async function connectRedis() {
  try {
    client = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      },
      password: process.env.REDIS_PASSWORD
    });

    client.on('error', (err) => {
      logger.error('Redis client error', { error: err.message });
    });

    client.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    await client.connect();
    return client;
  } catch (error) {
    logger.error('Redis connection failed', { error: error.message });
    throw error;
  }
}

async function disconnectRedis() {
  if (client) {
    await client.quit();
    logger.info('Redis connection closed');
  }
}

async function get(key) {
  try {
    return await client.get(key);
  } catch (error) {
    logger.error('Redis GET failed', { error: error.message, key });
    throw error;
  }
}

async function set(key, value, expiry = 3600) {
  try {
    await client.set(key, value, { EX: expiry });
  } catch (error) {
    logger.error('Redis SET failed', { error: error.message, key });
    throw error;
  }
}

async function del(key) {
  try {
    await client.del(key);
  } catch (error) {
    logger.error('Redis DEL failed', { error: error.message, key });
    throw error;
  }
}

module.exports = {
  connectRedis,
  disconnectRedis,
  get,
  set,
  del
};

