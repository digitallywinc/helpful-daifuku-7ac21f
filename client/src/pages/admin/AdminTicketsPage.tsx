import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket as TicketIcon,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  UserCheck,
  ArrowUpDown,
} from 'lucide-react';
import { Ticket, TicketStatus, TicketPriority } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Badge, getStatusBadgeVariant, getPriorityBadgeVariant } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { format } from 'date-fns';

const STATUS_OPTIONS: TicketStatus[] = [
  'Open',
  'In Progress',
  'Waiting for Customer',
  'Resolved',
  'Closed',
];

const PRIORITY_OPTIONS: TicketPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

export const AdminTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [category, setCategory] = useState('All');
  const [assignedToMe, setAssignedToMe] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getTickets({
        search: search || undefined,
        status: status !== 'All' ? status : undefined,
        priority: priority !== 'All' ? priority : undefined,
        category: category !== 'All' ? category : undefined,
        assignedToMe,
      });
      setTickets(data);
    } catch (err: any) {
      error('Failed to load tickets', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [status, priority, category, assignedToMe]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleInlineStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      await api.admin.updateTicket(ticketId, { status: newStatus });
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
      );
      success('Ticket Status Updated', `Status changed to ${newStatus}.`);
    } catch (err: any) {
      error('Failed to update status', err.message);
    }
  };

  const sortedTickets = [...tickets].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === 'priority') {
      const pWeights: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
      return (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0);
    }
    if (sortBy === 'status') {
      return a.status.localeCompare(b.status);
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            All Support Tickets
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Search, triage, update status, and assign support engineers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 p-2 rounded-lg border bg-card text-xs font-semibold cursor-pointer select-none">
            <input
              type="checkbox"
              checked={assignedToMe}
              onChange={(e) => setAssignedToMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary"
            />
            <span>Assigned to Me</span>
          </label>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-card border rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="relative md:col-span-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket #, customer, or subject..."
              className="pl-9 h-9 text-xs"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 text-xs"
          >
            <option value="All">Status: All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>

          <Select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="h-9 text-xs"
          >
            <option value="All">Priority: All</option>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-9 text-xs"
          >
            <option value="date">Sort: Newest First</option>
            <option value="priority">Sort: Highest Priority</option>
            <option value="status">Sort: By Status</option>
          </Select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-card border rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : sortedTickets.length === 0 ? (
          <div className="py-16 text-center">
            <EmptyState
              icon={TicketIcon}
              title="No Support Tickets Found"
              description="No tickets currently match the selected search and filter criteria."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearch('');
                setStatus('All');
                setPriority('All');
                setCategory('All');
                setAssignedToMe(false);
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider border-b">
                <tr>
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status Quick Action</th>
                  <th className="py-3 px-4">Assigned Admin</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sortedTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-accent/40 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-primary whitespace-nowrap">
                      {ticket.ticket_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">
                        {ticket.user?.full_name || 'Customer'}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {ticket.user?.email}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-foreground max-w-xs truncate">
                      {ticket.subject}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">{ticket.category}</td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </td>

                    <td
                      className="py-3.5 px-4 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={ticket.status}
                        onChange={(e) =>
                          handleInlineStatusChange(ticket.id, e.target.value as TicketStatus)
                        }
                        className="h-7 rounded border border-input bg-background px-2 text-[11px] font-semibold cursor-pointer focus:ring-1 focus:ring-primary"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {ticket.assigned_admin ? (
                        <span className="inline-flex items-center gap-1 font-medium text-foreground">
                          <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                          <span>{ticket.assigned_admin.full_name}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                      {format(new Date(ticket.created_at), 'MMM d, h:mm a')}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/tickets/${ticket.id}`);
                        }}
                        className="h-7 text-[11px]"
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

