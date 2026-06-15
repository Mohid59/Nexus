import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { Conversation } from '../../lib/messages';

interface ChatUserListProps {
  conversations: Conversation[];
  loading?: boolean;
}

export const ChatUserList: React.FC<ChatUserListProps> = ({ conversations, loading }) => {
  const navigate = useNavigate();
  const { userId: activeUserId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();

  if (!currentUser) return null;

  return (
    <div className="bg-surface w-full overflow-y-auto h-full">
      <div className="py-4">
        <h2 className="px-4 text-lg font-semibold text-ink mb-4">Messages</h2>

        <div className="space-y-1">
          {loading ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted">Loading…</p>
            </div>
          ) : conversations.length > 0 ? (
            conversations.map((conversation) => {
              const otherUser = conversation.user;
              const lastMessage = conversation.lastMessage;
              const isActive = activeUserId === otherUser.id;

              return (
                <div
                  key={otherUser.id}
                  className={`px-4 py-3 flex cursor-pointer transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-500/10 border-l-4 border-primary-600'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-l-4 border-transparent'
                  }`}
                  onClick={() => navigate(`/chat/${otherUser.id}`)}
                >
                  <Avatar
                    src={otherUser.avatarUrl}
                    alt={otherUser.name}
                    size="md"
                    status={otherUser.isOnline ? 'online' : 'offline'}
                    className="mr-3 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-medium text-ink truncate">{otherUser.name}</h3>
                      {lastMessage && (
                        <span className="text-xs text-muted flex-shrink-0 ml-2">
                          {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: false })}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-1 gap-2">
                      {lastMessage && (
                        <p className="text-xs text-muted truncate">
                          {lastMessage.senderId === currentUser.id ? 'You: ' : ''}
                          {lastMessage.content}
                        </p>
                      )}
                      {conversation.unread > 0 && (
                        <Badge variant="primary" size="sm" rounded>
                          {conversation.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted">No conversations yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
