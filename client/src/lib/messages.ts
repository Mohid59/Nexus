import { api } from './api';
import { Message, User } from '../types';

export type ConversationUser = Pick<User, 'id' | 'name' | 'avatarUrl' | 'role' | 'isOnline'>;

export interface Conversation {
  user: ConversationUser;
  lastMessage: Message;
  unread: number;
}

/** Current user's conversations: one per other party, with last message + unread count. */
export async function getConversations(): Promise<Conversation[]> {
  const { data } = await api.get('/messages/conversations');
  return data.data as Conversation[];
}

/** Full message thread between the current user and `userId` (ascending); marks received ones read. */
export async function getThread(userId: string): Promise<Message[]> {
  const { data } = await api.get(`/messages/${userId}`);
  return data.data as Message[];
}

export async function sendMessage(to: string, content: string): Promise<Message> {
  const { data } = await api.post('/messages', { to, content });
  return data.message as Message;
}
