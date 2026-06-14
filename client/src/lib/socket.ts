import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './api';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) {
    socket.auth = { token: getAccessToken() ?? '' };
    if (!socket.connected) socket.connect();
    return socket;
  }
  socket = io(SOCKET_URL, {
    auth: { token: getAccessToken() ?? '' },
    transports: ['websocket'],
    autoConnect: true,
  });
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
