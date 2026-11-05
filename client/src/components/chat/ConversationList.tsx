import React, { useState } from 'react';
import { Conversation } from '../../types';
import { MessageSquare, Plus, Trash2, Bot } from 'lucide-react';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="w-full h-full flex flex-col bg-card border-r">
        {/* Top Header & New Chat button */}
        <div className="p-3.5 border-b">
          <Button
            onClick={onNew}
            variant="primary"
            size="md"
            className="w-full gap-2 text-xs font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>New Support Chat</span>
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8 px-4 text-muted-foreground">
              <Bot className="h-8 w-8 mx-auto mb-2 opacity-30 text-primary" />
              <p className="text-xs font-medium">No past conversations</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Start a new chat to get instant support.
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeId;
              return (
                <div
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-6">
                    <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-xs text-foreground font-medium">
                        {conv.title || 'Support Chat'}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Delete conversation icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
                    title="Delete chat"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Delete Conversation"
        description="Are you sure you want to permanently delete this chat history? This action cannot be undone."
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Dialog>
    </>
  );
};

