import React, { useState } from 'react';
import { Send, Lock } from 'lucide-react';
import { Button } from '../ui/Button';

interface ReplyBoxProps {
  onSubmit: (message: string, isInternal: boolean) => Promise<void>;
  isLoading?: boolean;
  isAdmin?: boolean;
  ticketStatus?: string;
}

export const ReplyBox: React.FC<ReplyBoxProps> = ({
  onSubmit,
  isLoading = false,
  isAdmin = false,
  ticketStatus,
}) => {
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const isClosed = ticketStatus === 'Closed';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    await onSubmit(message.trim(), isInternal);
    setMessage('');
    setIsInternal(false);
  };

  return (
    <div className="bg-card border rounded-xl p-4 sm:p-5 shadow-xs">
      <h4 className="text-sm font-semibold text-foreground mb-3">
        {isAdmin ? 'Add Support Response or Internal Note' : 'Add Follow-Up Reply'}
      </h4>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isLoading}
          placeholder={
            isInternal
              ? 'Enter internal note for staff members (hidden from customer)...'
              : 'Write your reply or additional details here...'
          }
          className={`w-full rounded-xl border bg-background px-4 py-3 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 transition-colors ${
            isInternal
              ? 'border-amber-400 focus-visible:ring-amber-500 bg-amber-50/20'
              : 'border-input focus-visible:ring-primary'
          }`}
        />

        <div className="flex items-center justify-between gap-3 pt-1">
          {/* Admin Internal Note Toggle */}
          {isAdmin ? (
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-foreground">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="flex items-center gap-1 text-muted-foreground">
                <Lock className="h-3 w-3 text-amber-500" />
                <span>Internal Staff Note (Customer cannot see)</span>
              </span>
            </label>
          ) : (
            <div />
          )}

          <Button
            type="submit"
            variant={isInternal ? 'secondary' : 'primary'}
            isLoading={isLoading}
            disabled={!message.trim()}
            className="gap-2 text-xs font-semibold px-5"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isInternal ? 'Save Internal Note' : 'Send Reply'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

