import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const MAX_RETRIES = 5;

/** Connects to MongoDB with exponential-backoff retry and connection-event logging. */
export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);

  let attempt = 0;
  for (;;) {
    attempt += 1;
    try {
      await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
      logger.info(`MongoDB connected → ${mongoose.connection.host}/${mongoose.connection.name}`);
      break;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error(`MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES}): ${message}`);
      if (attempt >= MAX_RETRIES) {
        logger.error('Exhausted MongoDB connection retries. Is mongod running / is MONGO_URI correct?');
        process.exit(1);
      }
      const delay = Math.min(1000 * 2 ** attempt, 15000);
      logger.warn(`Retrying MongoDB connection in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));
  mongoose.connection.on('error', (e) => logger.error(`MongoDB error: ${e.message}`));
}
