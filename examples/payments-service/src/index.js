const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const promClient = require('prom-client');
const logger = require('./logger');
const { connectDB, disconnectDB } = require('./database');
const { connectRedis, disconnectRedis } = require('./cache');

const app = express();
const PORT = process.env.PORT || 3000;

// Prometheus metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging and metrics
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration);
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration.toFixed(3)}s`
    });
  });
  next();
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'payments-service' });
});

app.get('/ready', async (req, res) => {
  try {
    // Check database connection
    const dbHealthy = await checkDatabaseHealth();
    // Check Redis connection
    const cacheHealthy = await checkCacheHealth();
    
    if (dbHealthy && cacheHealthy) {
      res.json({ 
        status: 'ready',
        checks: {
          database: 'healthy',
          cache: 'healthy'
        }
      });
    } else {
      res.status(503).json({ 
        status: 'not ready',
        checks: {
          database: dbHealthy ? 'healthy' : 'unhealthy',
          cache: cacheHealthy ? 'healthy' : 'unhealthy'
        }
      });
    }
  } catch (error) {
    logger.error('Readiness check failed', { error: error.message });
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Payment endpoints
app.post('/api/v1/payments', async (req, res) => {
  try {
    const { amount, currency, source, description } = req.body;
    
    logger.info('Processing payment', { amount, currency });
    
    // TODO: Implement Stripe payment processing
    const payment = {
      id: `pay_${Date.now()}`,
      amount,
      currency,
      status: 'succeeded',
      created: new Date().toISOString()
    };
    
    res.json(payment);
  } catch (error) {
    logger.error('Payment processing failed', { error: error.message });
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

app.get('/api/v1/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info('Retrieving payment', { paymentId: id });
    
    // TODO: Implement payment retrieval from database
    const payment = {
      id,
      amount: 1000,
      currency: 'usd',
      status: 'succeeded',
      created: new Date().toISOString()
    };
    
    res.json(payment);
  } catch (error) {
    logger.error('Payment retrieval failed', { error: error.message });
    res.status(500).json({ error: 'Payment retrieval failed' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// Helper functions
async function checkDatabaseHealth() {
  try {
    // TODO: Implement actual database health check
    return true;
  } catch (error) {
    return false;
  }
}

async function checkCacheHealth() {
  try {
    // TODO: Implement actual Redis health check
    return true;
  } catch (error) {
    return false;
  }
}

// Graceful shutdown
async function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully`);
  
  server.close(async () => {
    logger.info('HTTP server closed');
    
    try {
      await disconnectDB();
      await disconnectRedis();
      logger.info('Connections closed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', { error: error.message });
      process.exit(1);
    }
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

// Start server
const server = app.listen(PORT, async () => {
  logger.info(`payments-service listening on port ${PORT}`);
  
  try {
    await connectDB();
    await connectRedis();
    logger.info('All connections established');
  } catch (error) {
    logger.error('Failed to establish connections', { error: error.message });
    process.exit(1);
  }
});

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
