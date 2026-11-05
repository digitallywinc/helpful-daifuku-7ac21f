import React, { useState, useEffect } from 'react';
import { Conversation, Message } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { ConversationList } from '../../components/chat/ConversationList';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { MessageSquare, Menu, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AiChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedAction, setSuggestedAction] = useState<'create_ticket' | 'view_faq' | 'none'>('none');
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  const { error, success } = useToast();

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const convs = await api.chat.getConversations();
        setConversations(convs);
        if (convs.length > 0) {
          // Select most recent conversation by default
          selectConversation(convs[0].id);
        }
      } catch (err: any) {
        console.warn('Failed to fetch conversations:', err);
      }
    };

    loadConversations();
  }, []);

  const selectConversation = async (id: string) => {
    try {
      setActiveConvId(id);
      setIsLoading(true);
      const data = await api.chat.getConversation(id);
      setMessages(data.messages || []);
      setMobileHistoryOpen(false);
    } catch (err: any) {
      error('Failed to load chat history', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setActiveConvId(null);
    setMessages([]);
    setSuggestedAction('none');
    setMobileHistoryOpen(false);
  };

  const handleSendMessage = async (content: string) => {
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConvId || '',
      sender: 'user',
      content,
      created_at: new Date().toISOString(),
    };

    // Optimistic user message render
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const res = await api.chat.sendMessage({
        conversationId: activeConvId || undefined,
        content,
      });

      // Update active conversation
      if (!activeConvId) {
        setActiveConvId(res.conversationId);
      }

      setSuggestedAction(res.suggestedAction || 'none');

      // Refresh messages with verified server records
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        res.userMessage,
        res.assistantMessage,
      ]);

      // Refresh conversation list to get latest titles
      const updatedConvs = await api.chat.getConversations();
      setConversations(updatedConvs);
    } catch (err: any) {
      error('AI Service Error', err.message || 'Unable to retrieve assistant response.');
      // Remove optimistic message if failure
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await api.chat.deleteConversation(id);
      success('Conversation deleted');
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvId === id) {
        handleNewConversation();
      }
    } catch (err: any) {
      error('Failed to delete', err.message);
    }
  };

  const handleClearCurrentChat = () => {
    setMessages([]);
    setSuggestedAction('none');
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col md:flex-row gap-4 overflow-hidden">
      {/* Mobile History Toggle Bar */}
      <div className="md:hidden flex items-center justify-between pb-2 border-b">
        <button
          onClick={() => setMobileHistoryOpen(true)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-primary p-1.5 rounded-lg bg-primary/10"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Past Conversations ({conversations.length})</span>
        </button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNewConversation}
          className="text-xs"
        >
          New Chat
        </Button>
      </div>

      {/* Desktop Conversation Sidebar (w-72) */}
      <div className="hidden md:block w-72 shrink-0 h-full rounded-xl overflow-hidden border">
        <ConversationList
          conversations={conversations}
          activeId={activeConvId}
          onSelect={selectConversation}
          onNew={handleNewConversation}
          onDelete={handleDeleteConversation}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileHistoryOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs"
            onClick={() => setMobileHistoryOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-card shadow-xl">
            <div className="p-3 border-b flex items-center justify-between">
              <span className="font-bold text-sm text-foreground">Chat History</span>
              <button
                onClick={() => setMobileHistoryOpen(false)}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ConversationList
              conversations={conversations}
              activeId={activeConvId}
              onSelect={selectConversation}
              onNew={handleNewConversation}
              onDelete={handleDeleteConversation}
            />
          </div>
        </div>
      )}

      {/* Main Interactive Chat Area */}
      <div className="flex-1 h-full min-w-0">
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onClearChat={messages.length > 0 ? handleClearCurrentChat : undefined}
          suggestedAction={suggestedAction}
        />
      </div>
    </div>
  );
};

