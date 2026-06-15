import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getConversations, Conversation } from '../../lib/messages';
import { ChatUserList } from '../../components/chat/ChatUserList';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getConversations()
      .then((c) => active && setConversations(c))
      .catch(() => active && setConversations([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-8rem)] bg-surface rounded-lg shadow-sm border border-line overflow-hidden animate-fade-in">
      {loading || conversations.length > 0 ? (
        <ChatUserList conversations={conversations} loading={loading} />
      ) : (
        <div className="h-full flex flex-col items-center justify-center p-8">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
            <MessageCircle size={32} className="text-muted" />
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
