import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Phone, Video, Info, Smile, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ChatMessage } from '../../components/chat/ChatMessage';
import { ChatUserList } from '../../components/chat/ChatUserList';
import { useAuth } from '../../context/AuthContext';
import { Message, User } from '../../types';
import { apiErrorMessage } from '../../lib/api';
import { getConversations, getThread, sendMessage, Conversation } from '../../lib/messages';
import { getUser } from '../../lib/users';
import { getSocket } from '../../lib/socket';

export const ChatPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convLoading, setConvLoading] = useState(true);
  const [chatPartner, setChatPartner] = useState<User | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const startCall = () => {
    if (currentUser && userId) {
      navigate(`/call/chat-${[currentUser.id, userId].sort().join('-')}`);
    }
  };

  const refreshConversations = useCallback(async () => {
    try {
      setConversations(await getConversations());
    } catch {
      /* non-fatal — list just stays as-is */
    } finally {
      setConvLoading(false);
    }
  }, []);

  // Conversation list.
  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // Chat partner profile.
  useEffect(() => {
    if (!userId) {
      setChatPartner(null);
      return;
    }
    let active = true;
    getUser(userId)
      .then((u) => active && setChatPartner(u))
      .catch(() => active && setChatPartner(null));
    return () => {
      active = false;
    };
  }, [userId]);

  // Message thread.
  useEffect(() => {
    if (!userId) return;
    let active = true;
    getThread(userId)
      .then((msgs) => {
        if (active) setMessages(msgs);
      })
      .catch((err) => toast.error(apiErrorMessage(err, 'Could not load messages')));
    return () => {
      active = false;
    };
  }, [userId]);

  // Real-time: append incoming messages from the open partner; refresh the list either way.
  useEffect(() => {
    if (!currentUser) return;
    const socket = getSocket();
    const onNew = (msg: Message) => {
      if (msg.senderId === userId) {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      }
      refreshConversations();
    };
    socket.on('message:new', onNew);
    return () => {
      socket.off('message:new', onNew);
    };
  }, [currentUser, userId, refreshConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || !currentUser || !userId || sending) return;
    setSending(true);
    setNewMessage('');
    try {
      const msg = await sendMessage(userId, content);
      setMessages((prev) => [...prev, msg]);
      refreshConversations();
    } catch (err) {
      setNewMessage(content);
      toast.error(apiErrorMessage(err, 'Could not send message'));
    } finally {
      setSending(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-surface border border-line rounded-lg overflow-hidden animate-fade-in">
      {/* Conversations sidebar */}
      <div className="hidden md:block w-1/3 lg:w-1/4 border-r border-line">
        <ChatUserList conversations={conversations} loading={convLoading} />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {chatPartner ? (
          <>
            <div className="border-b border-line p-4 flex justify-between items-center">
              <div className="flex items-center">
                <Avatar
                  src={chatPartner.avatarUrl}
                  alt={chatPartner.name}
                  size="md"
                  status={chatPartner.isOnline ? 'online' : 'offline'}
                  className="mr-3"
                />
                <div>
                  <h2 className="text-lg font-medium text-ink">{chatPartner.name}</h2>
                  <p className="text-sm text-muted">
                    {chatPartner.isOnline ? 'Online' : 'Last seen recently'}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" className="rounded-full p-2" aria-label="Voice call">
                  <Phone size={18} />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full p-2" aria-label="Video call" onClick={startCall}>
                  <Video size={18} />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full p-2" aria-label="Info">
                  <Info size={18} />
                </Button>
              </div>
            </div>

            {/* Messages container */}
            <div className="flex-1 p-4 overflow-y-auto bg-paper">
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const mine = message.senderId === currentUser.id;
                    return (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        isCurrentUser={mine}
                        avatarUrl={mine ? currentUser.avatarUrl : chatPartner.avatarUrl}
                        name={mine ? currentUser.name : chatPartner.name}
                      />
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                    <MessageCircle size={32} className="text-muted" />
                  </div>
                  <h3 className="text-lg font-medium text-ink">No messages yet</h3>
                  <p className="text-muted mt-1">Send a message to start the conversation</p>
                </div>
              )}
            </div>

            {/* Message input */}
            <div className="border-t border-line p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Button type="button" variant="ghost" size="sm" className="rounded-full p-2" aria-label="Add emoji">
                  <Smile size={20} />
                </Button>
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  fullWidth
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="sm"
                  isLoading={sending}
                  disabled={!newMessage.trim()}
                  className="rounded-full p-2 w-10 h-10 flex items-center justify-center"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
              <MessageCircle size={48} className="text-muted" />
            </div>
            <h2 className="text-xl font-medium text-ink">Select a conversation</h2>
            <p className="text-muted mt-2 text-center">Choose a contact from the list to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};
