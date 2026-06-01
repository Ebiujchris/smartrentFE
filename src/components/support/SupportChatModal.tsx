'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import api from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  createdAt: string;
  isOwn: boolean;
}

interface SupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportChatModal({ isOpen, onClose }: SupportChatModalProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      // Poll for new messages every 10 seconds
      const interval = setInterval(fetchMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/support/messages');
      setMessages(response.data);
    } catch (error: any) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      return;
    }

    try {
      setIsSending(true);
      const response = await api.post('/support/messages', {
        content: newMessage.trim(),
      });

      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');
      toast.success('Message sent');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-2 rounded-lg">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Customer Support
                </h2>
                <p className="text-sm text-slate-500">
                  Chat with our support team
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {isLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No messages yet
                </h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  Start a conversation with our support team. We're here to help!
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.isOwn
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white text-slate-900 border border-slate-200'
                      }`}
                    >
                      {!message.isOwn && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold">
                            {message.senderName}
                          </span>
                          <span className="text-xs opacity-70 bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            {message.senderRole}
                          </span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <span
                        className={`text-xs mt-1 block ${
                          message.isOwn ? 'text-emerald-100' : 'text-slate-400'
                        }`}
                      >
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-slate-200 bg-white"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={isSending || !newMessage.trim()}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span className="hidden sm:inline">Send</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
