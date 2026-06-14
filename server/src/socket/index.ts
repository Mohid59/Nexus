import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/tokens';
import { UserRole } from '../types';
import { logger } from '../utils/logger';

interface SocketUser {
  id: string;
  role: UserRole;
}

interface SocketData {
  user: SocketUser;
  roomId?: string;
}

/** WebRTC signaling: JWT-authed rooms that relay simple-peer signal data between participants. */
export function setupSocket(io: Server): void {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Unauthorized'));
    try {
      const payload = verifyAccessToken(token);
      (socket.data as SocketData).user = { id: payload.sub, role: payload.role };
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const data = socket.data as SocketData;
    logger.debug(`Socket connected: ${socket.id} (user ${data.user.id})`);

    socket.on('call:join', (roomId: string) => {
      const room = io.sockets.adapter.rooms.get(roomId);
      const existing = room ? [...room] : [];
      socket.join(roomId);
      data.roomId = roomId;

      // Tell the joiner which peers are already in the room (joiner initiates to them).
      socket.emit('call:peers', { peers: existing });
      // Tell existing peers that someone new joined.
      socket.to(roomId).emit('call:peer-joined', { socketId: socket.id, user: data.user });
    });

    socket.on('call:signal', ({ to, data: signal }: { to: string; data: unknown }) => {
      io.to(to).emit('call:signal', { from: socket.id, data: signal });
    });

    const leave = () => {
      if (data.roomId) {
        socket.to(data.roomId).emit('call:peer-left', { socketId: socket.id });
        socket.leave(data.roomId);
        data.roomId = undefined;
      }
    };

    socket.on('call:leave', leave);
    socket.on('disconnect', () => {
      leave();
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });
}
