'use strict';

const app = require('./app');
const connectDB = require('./config/database');
const config = require('./config');
const logger = require('./utils/logger');

const startServer = async () => {
  try {
    // Connect to MongoDB before accepting requests
    await connectDB();

    const server = app.listen(config.port, () => {
      logger.info(`Eats N Bites API running on port ${config.port} [${config.env}]`);
      logger.info(`Frontend origin: ${config.cors.origin}`);
    });

    // Graceful shutdown — finish in-flight requests before exiting
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force exit after 10s if server doesn't close
      setTimeout(() => {
        logger.error('Forceful shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections — log and exit
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled promise rejection:', reason);
      process.exit(1);
    });

  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
