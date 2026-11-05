import React from 'react';
import { Ticket, TicketReply } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Lock, ShieldAlert, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface TicketTimelineProps {
  ticket: Ticket;
  replies: TicketReply[];
  isAdmin?: boolean;
}

export const TicketTimeline: React.FC<TicketTimelineProps> = ({
  ticket,
  replies,
  isAdmin = false,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Original Customer Problem Description */}
      <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-start justify-between gap-3 pb-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar
              name={ticket.user?.full_name || ticket.user?.email || 'Customer'}
              src={ticket.user?.avatar_url}
              size="md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">
                  {ticket.user?.full_name || 'Customer'}
                </span>
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                  Original Poster
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {ticket.user?.email}
              </span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(new Date(ticket.created_at), 'MMM d, yyyy h:mm a')}
          </span>
        </div>

        <div className="mt-4">
          <h4 className="text-base font-bold text-foreground mb-2">
            {ticket.subject}
          </h4>
          <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {ticket.description}
          </p>
        </div>
      </div>

      {/* 2. Chronological Replies */}
      {replies.map((reply, idx) => {
        const isStaff = reply.user?.role === 'admin';
        const isInternal = Boolean(reply.is_internal);

        return (
          <div
            key={reply.id || idx}
            className={`rounded-xl border p-5 sm:p-6 shadow-xs transition-all ${
              isInternal
                ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60'
                : isStaff
                ? 'bg-primary/5 dark:bg-primary/10 border-primary/20'
                : 'bg-card border-border'
            }`}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
              <div className="flex items-center gap-3">
                <Avatar
                  name={reply.user?.full_name || reply.user?.email || 'User'}
                  src={reply.user?.avatar_url}
                  size="md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {reply.user?.full_name || 'User'}
                    </span>
                    {isStaff ? (
                      <Badge variant="default" className="text-[10px] py-0 px-1.5">
                        Support Staff
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                        Customer
                      </Badge>
                    )}
                    {isInternal && (
                      <Badge variant="warning" className="text-[10px] py-0 px-1.5 gap-1">
                        <Lock className="h-2.5 w-2.5" />
                        <span>Internal Note</span>
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {reply.user?.email}
                  </span>
                </div>
              </div>

              <span className="text-xs text-muted-foreground">
                {format(new Date(reply.created_at), 'MMM d, h:mm a')}
              </span>
            </div>

            <div className="mt-3">
              <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {reply.message}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

