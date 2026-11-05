import React, { useState, useEffect } from 'react';
import { MessagesSquare, Search, Eye, Bot, User, Clock } from 'lucide-react';
import { Conversation, Message } from '../../types';
import { api } from '../../services/api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDistanceToNow, format } from 'date-fns';

type AdminConvItem = Conversation & { user_email?: string; full_name?: string };

export const AdminConversationsPage: React.FC = () => {
  const [conversations, setConversations] = useState<AdminConvItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Transcript inspect modal
  const [selectedConv, setSelectedConv] = useState<AdminConvItem | null>(null);
  const [transcriptMessages, setTranscriptMessages] = useState<Message[]>([]);
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const data = await api.admin.getConversations();
        setConversations(data);
      } catch (err) {
        console.warn('Failed to fetch admin conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const handleInspect = async (conv: AdminConvItem) => {
    setSelectedConv(conv);
    try {
      setTranscriptLoading(true);
      const res = await api.chat.getConversation(conv.id);
      setTranscriptMessages(res.messages || []);
    } catch (err) {
      console.warn('Failed to load transcript:', err);
    } finally {
      setTranscriptLoading(false);
    }
  };

  const filtered = conversations.filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.user_email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          AI Customer Support Logs
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Review customer conversations with the AI chatbot to evaluate answer quality and satisfaction
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-md relative">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by topic or customer email..."
          className="pl-9 h-9 text-xs"
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>

      {/* Conversations Table */}
      <div className="bg-card border rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <EmptyState
              icon={MessagesSquare}
              title="No Chat Sessions Found"
              description="No customer AI chat interactions match your current search query."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider border-b">
                <tr>
                  <th className="py-3 px-4">Chat Subject / Title</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Transcript</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((conv) => (
                  <tr key={conv.id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-foreground max-w-sm truncate">
                      {conv.title || 'Support Inquiry'}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-foreground">
                        {conv.full_name || 'Customer'}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground">
                        {conv.user_email || conv.user_id}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInspect(conv)}
                        className="h-7 text-[11px] gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transcript Inspection Dialog */}
      <Dialog
        isOpen={Boolean(selectedConv)}
        onClose={() => setSelectedConv(null)}
        title={`Chat Transcript: ${selectedConv?.title || 'Session'}`}
        description={`Customer: ${selectedConv?.user_email || selectedConv?.user_id}`}
        maxWidth="lg"
      >
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4 pt-2">
          {transcriptLoading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Loading chat transcript...
            </div>
          ) : transcriptMessages.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No messages found in this conversation.
            </div>
          ) : (
            transcriptMessages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 text-xs ${isUser ? 'flex-row' : 'flex-row'}`}
                >
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                      isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                    }`}
                  >
                    {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>

                  <div className="flex-1 bg-card border rounded-xl p-3 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground border-b pb-1">
                      <span className="font-semibold text-foreground">
                        {isUser ? 'Customer' : 'HelpDesk AI Assistant'}
                      </span>
                      <span>{format(new Date(m.created_at), 'h:mm a')}</span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed pt-0.5 text-foreground">
                      {m.content}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Dialog>
    </div>
  );
};

