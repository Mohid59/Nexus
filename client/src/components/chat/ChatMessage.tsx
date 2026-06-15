import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Message } from '../../types';
import { Avatar } from '../ui/Avatar';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  avatarUrl?: string;
  name?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isCurrentUser, avatarUrl, name }) => {
  return (
    <div
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}
    >
      {!isCurrentUser && (
        <Avatar src={avatarUrl ?? ''} alt={name ?? 'User'} size="sm" className="mr-2 self-end" />
      )}

      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg ${
            isCurrentUser
              ? 'bg-primary-600 text-white rounded-br-none'
              : 'bg-gray-100 dark:bg-gray-800 text-ink rounded-bl-none'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        <span className="text-xs text-muted mt-1">
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </span>
      </div>

      {isCurrentUser && (
        <Avatar src={avatarUrl ?? ''} alt={name ?? 'You'} size="sm" className="ml-2 self-end" />
      )}
    </div>
  );
};
