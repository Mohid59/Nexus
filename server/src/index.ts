import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { env, CLIENT_ORIGINS } from './config/env';
import { connectDB } from './db/connect';
import { createApp } from './app';
import { setupSocket } from './socket';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  // Socket.IO — WebRTC signaling for video calls.
  const io = new SocketServer(server, {
    cors: { origin: CLIENT_ORIGINS, credentials: true },
  });
  setupSocket(io);

  server.listen(env.PORT, () => {
    logger.info(`Nexus API listening on http://localhost:${env.PORT}`);
    logger.info(`API docs at http://localhost:${env.PORT}/api/docs`);
  });

  const shutdown = (signal: string): void => {
    logger.warn(`${signal} received — shutting down gracefully...`);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  logger.error(`Fatal startup error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
