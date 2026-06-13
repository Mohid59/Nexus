import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { getConversationsForUser } from '../../data/messages';
import { ChatUserList } from '../../components/chat/ChatUserList';
// import { MessageCircle } from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;
  
  const conversations = getConversationsForUser(user.id);
  
  return (
    <div className="h-[calc(100vh-8rem)] bg-surface rounded-lg shadow-sm border border-line overflow-hidden animate-fade-in">
      {conversations.length > 0 ? (
        <ChatUserList conversations={conversations} />
      ) : (
        <div className="h-full flex flex-col items-center justify-center p-8">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
            {/* <MessageCircle size={32} className="text-muted" /> */}
          </div>
          <h2 className="text-xl font-medium text-ink">No messages yet</h2>
          <p className="text-muted text-center mt-2">
            Start connecting with entrepreneurs and investors to begin conversations
          </p>
        </div>
      )}
    </div>
  );
};