import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, RotateCcw, AlertTriangle, UserCheck } from 'lucide-react';
import { Ticket, TicketReply } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Badge, getStatusBadgeVariant, getPriorityBadgeVariant } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { TicketTimeline } from '../../components/tickets/TicketTimeline';
import { ReplyBox } from '../../components/tickets/ReplyBox';
import { Skeleton } from '../../components/ui/Skeleton';
import { Dialog } from '../../components/ui/Dialog';
import { format } from 'date-fns';

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyLoading, setReplyLoading] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);

  const { success, error } = useToast();

  const loadTicketData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.tickets.getTicket(id);
      setTicket(data.ticket);
      setReplies(data.replies);
    } catch (err: any) {
      error('Failed to load ticket', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicketData();
  }, [id]);

  const handleAddReply = async (message: string) => {
    if (!id) return;
    try {
      setReplyLoading(true);
      const newReply = await api.tickets.addReply(id, { message });
      setReplies((prev) => [...prev, newReply]);
      success('Reply posted', 'Your response has been added to the ticket thread.');
      // Refresh status
      if (ticket) {
        setTicket({ ...ticket, status: 'Open' });
      }
    } catch (err: any) {
      error('Failed to send reply', err.message);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!ticket) return;
    const newStatus = ticket.status === 'Closed' ? 'Open' : 'Closed';
    try {
      const updated = await api.tickets.updateStatus(ticket.id, newStatus);
      setTicket(updated);
      setConfirmCloseOpen(false);
      success(
        'Ticket Status Updated',
        `Ticket has been marked as ${newStatus}.`
      );
    } catch (err: any) {
      error('Failed to update status', err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
        <h3 className="text-lg font-bold text-foreground">Ticket Not Found</h3>
        <p className="text-xs text-muted-foreground">
          The requested ticket does not exist or you do not have permission to view it.
        </p>
        <Button variant="primary" onClick={() => navigate('/tickets')}>
          Return to My Tickets
        </Button>
      </div>
    );
  }

  const isClosed = ticket.status === 'Closed';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation & Status Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/tickets')}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-primary">
                {ticket.ticket_number}
              </span>
              <Badge variant={getStatusBadgeVariant(ticket.status)}>
                {ticket.status}
              </Badge>
              <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                {ticket.priority} Priority
              </Badge>
              <Badge variant="secondary">{ticket.category}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Created {format(new Date(ticket.created_at), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
        </div>

        {/* Customer Status Action Button */}
        <div>
          {isClosed ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleStatus}
              className="gap-1.5 text-xs font-semibold"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reopen Ticket</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmCloseOpen(true)}
              className="gap-1.5 text-xs font-semibold hover:border-destructive hover:text-destructive"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Mark as Resolved / Close</span>
            </Button>
          )}
        </div>
      </div>

      {/* Assigned Staff Notice */}
      {ticket.assigned_admin && (
        <div className="p-3.5 rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-foreground">
              Assigned Specialist:{' '}
              <strong className="text-emerald-700 dark:text-emerald-300">
                {ticket.assigned_admin.full_name}
              </strong>
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">Active Case Review</span>
        </div>
      )}

      {/* Ticket Timeline and Messages */}
      <TicketTimeline ticket={ticket} replies={replies} isAdmin={false} />

      {/* Reply Box */}
      <div className="pt-2">
        {isClosed ? (
          <div className="p-4 rounded-xl border bg-muted/40 text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              This ticket has been marked as <strong>Closed</strong>.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleStatus}
              className="text-xs gap-1.5"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reopen to Post Follow-Up</span>
            </Button>
          </div>
        ) : (
          <ReplyBox
            onSubmit={(msg) => handleAddReply(msg)}
            isLoading={replyLoading}
            isAdmin={false}
            ticketStatus={ticket.status}
          />
        )}
      </div>

      {/* Confirm Close Modal */}
      <Dialog
        isOpen={confirmCloseOpen}
        onClose={() => setConfirmCloseOpen(false)}
        title="Close Support Ticket"
        description="Are you satisfied with the resolution and wish to mark this ticket as Closed? You can reopen it at any time if you require further assistance."
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmCloseOpen(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleToggleStatus}>
            Confirm Close
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

