import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ChatConversation } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { findUserById } from '../../data/users';
import { useAuth } from '../../context/AuthContext';

interface ChatUserListProps {
  conversations: ChatConversation[];
}

export const ChatUserList: React.FC<ChatUserListProps> = ({ conversations }) => {
  const navigate = useNavigate();
  const { userId: activeUserId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  
  if (!currentUser) return null;
  
  const handleSelectUser = (userId: string) => {
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="bg-surface border-r border-line w-full md:w-64 overflow-y-auto">
      <div className="py-4">
        <h2 className="px-4 text-lg font-semibold text-ink mb-4">Messages</h2>
        
        <div className="space-y-1">
          {conversations.length > 0 ? (
            conversations.map(conversation => {
              // Get the other participant (not the current user)
              const otherParticipantId = conversation.participants.find(id => id !== currentUser.id);
              if (!otherParticipantId) return null;
              
              const otherUser = findUserById(otherParticipantId);
              if (!otherUser) return null;
              
              const lastMessage = conversation.lastMessage;
              const isActive = activeUserId === otherParticipantId;
              
              return (
                <div
                  key={conversation.id}
                  className={`px-4 py-3 flex cursor-pointer transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-500/10 border-l-4 border-primary-600'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-l-4 border-transparent'
                  }`}
                  onClick={() => handleSelectUser(otherUser.id)}
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
                      <h3 className="text-sm font-medium text-ink truncate">
                        {otherUser.name}
                      </h3>
                      
                      {lastMessage && (
                        <span className="text-xs text-muted">
                          {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: false })}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-1">
                      {lastMessage && (
                        <p className="text-xs text-muted truncate">
                          {lastMessage.senderId === currentUser.id ? 'You: ' : ''}
                          {lastMessage.content}
                        </p>
                      )}
                      
                      {lastMessage && !lastMessage.isRead && lastMessage.senderId !== currentUser.id && (
                        <Badge variant="primary" size="sm" rounded>New</Badge>
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