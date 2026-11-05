import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket } from '../../types';
import { Badge, getStatusBadgeVariant, getPriorityBadgeVariant } from '../ui/Badge';
import { Calendar, Tag, UserCheck, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TicketCardProps {
  ticket: Ticket;
  isAdminView?: boolean;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, isAdminView = false }) => {
  const navigate = useNavigate();
  const targetUrl = isAdminView ? `/admin/tickets/${ticket.id}` : `/tickets/${ticket.id}`;

  return (
    <div
      onClick={() => navigate(targetUrl)}
      className="p-5 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Ticket Number & Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="font-mono text-xs font-bold text-primary group-hover:underline">
            {ticket.ticket_number}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant={getStatusBadgeVariant(ticket.status)}>
              {ticket.status}
            </Badge>
            <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
              {ticket.priority}
            </Badge>
          </div>
        </div>

        {/* Subject */}
        <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1.5">
          {ticket.subject}
        </h3>

        {/* Description snippet */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
          {ticket.description}
        </p>
      </div>

      {/* Footer Info: Category, Author / Assigned Admin, Date */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-[11px] font-medium text-foreground">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {ticket.category}
          </span>

          {ticket.assigned_admin && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <UserCheck className="h-3 w-3 text-emerald-500" />
              <span>{ticket.assigned_admin.full_name}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px]">
          <Calendar className="h-3 w-3" />
          <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  );
};

