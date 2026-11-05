import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UserCheck,
  Shield,
  Clock,
  Tag,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Ticket, TicketReply, TicketStatus, TicketPriority } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Badge, getStatusBadgeVariant, getPriorityBadgeVariant } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { TicketTimeline } from '../../components/tickets/TicketTimeline';
import { ReplyBox } from '../../components/tickets/ReplyBox';
import { Skeleton } from '../../components/ui/Skeleton';
import { format } from 'date-fns';

const STATUSES: TicketStatus[] = [
  'Open',
  'In Progress',
  'Waiting for Customer',
  'Resolved',
  'Closed',
];

const PRIORITIES: TicketPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

export const AdminTicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyLoading, setReplyLoading] = useState(false);

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

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket) return;
    try {
      const updated = await api.admin.updateTicket(ticket.id, { status: newStatus });
      setTicket(updated);
      success('Status Updated', `Ticket marked as ${newStatus}`);
    } catch (err: any) {
      error('Update failed', err.message);
    }
  };

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    if (!ticket) return;
    try {
      const updated = await api.admin.updateTicket(ticket.id, { priority: newPriority });
      setTicket(updated);
      success('Priority Updated', `Priority set to ${newPriority}`);
    } catch (err: any) {
      error('Update failed', err.message);
    }
  };

  const handleAssignToMe = async () => {
    if (!ticket || !user) return;
    try {
      const updated = await api.admin.updateTicket(ticket.id, { assigned_admin_id: user.id });
      setTicket({ ...updated, assigned_admin: user });
      success('Ticket Assigned', 'You are now assigned to this ticket.');
    } catch (err: any) {
      error('Assignment failed', err.message);
    }
  };

  const handleAddReply = async (message: string, isInternal: boolean) => {
    if (!id) return;
    try {
      setReplyLoading(true);
      const reply = await api.tickets.addReply(id, { message, is_internal: isInternal });
      setReplies((prev) => [...prev, reply]);
      success(
        isInternal ? 'Internal note added' : 'Response dispatched',
        isInternal
          ? 'Internal note saved for staff members.'
          : 'Customer notified of support reply.'
      );
      if (ticket && !isInternal) {
        setTicket({ ...ticket, status: 'Waiting for Customer' });
      }
    } catch (err: any) {
      error('Failed to submit reply', err.message);
    } finally {
      setReplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive font-semibold">Ticket not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/tickets')}>
          Return to All Tickets
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Title Bar */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/tickets')}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-base font-bold text-primary">
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
              Customer: <strong>{ticket.user?.full_name}</strong> ({ticket.user?.email}) • Created{' '}
              {format(new Date(ticket.created_at), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Timeline (2 Cols), Right Admin Controls (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline & Reply Box */}
        <div className="lg:col-span-2 space-y-6">
          <TicketTimeline ticket={ticket} replies={replies} isAdmin={true} />

          <ReplyBox
            onSubmit={handleAddReply}
            isLoading={replyLoading}
            isAdmin={true}
            ticketStatus={ticket.status}
          />
        </div>

        {/* Right Sidebar Controls */}
        <div className="space-y-5">
          {/* Status & Priority Modifier Card */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Ticket Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">
                  Change Status
                </label>
                <Select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">
                  Change Priority
                </label>
                <Select
                  value={ticket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                >
                  {PRIORITIES.map((pr) => (
                    <option key={pr} value={pr}>
                      {pr}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="pt-2 border-t">
                <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1.5">
                  Assigned Specialist
                </label>
                {ticket.assigned_admin ? (
                  <div className="p-2.5 rounded-lg border bg-muted/30 flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-foreground">
                      {ticket.assigned_admin.full_name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Assigned</span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic mb-2">
                    Not currently assigned to any specialist.
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAssignToMe}
                  className="w-full text-xs font-semibold gap-1.5"
                >
                  <UserCheck className="h-3.5 w-3.5 text-primary" />
                  <span>Assign to Myself</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Customer Metadata Card */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span>Customer Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground block">Full Name</span>
                <span className="font-semibold text-foreground text-sm">
                  {ticket.user?.full_name || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Email Address</span>
                <span className="font-mono text-foreground">{ticket.user?.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Customer ID</span>
                <span className="font-mono text-[11px] text-muted-foreground break-all">
                  {ticket.user_id}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

