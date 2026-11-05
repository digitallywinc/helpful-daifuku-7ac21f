import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LifeBuoy, AlertCircle } from 'lucide-react';
import { Ticket } from '../../types';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { TicketCard } from '../../components/tickets/TicketCard';
import { TicketFilter } from '../../components/tickets/TicketFilter';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const TicketsPage: React.FC = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [category, setCategory] = useState('All');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await api.tickets.getTickets({
        search: search || undefined,
        status: status !== 'All' ? status : undefined,
        priority: priority !== 'All' ? priority : undefined,
        category: category !== 'All' ? category : undefined,
      });
      setTickets(data);
    } catch (err) {
      console.warn('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [status, priority, category]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('All');
    setPriority('All');
    setCategory('All');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            My Support Tickets
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Track inquiries, view administrator replies, and add follow-up details
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/tickets/new')}
          className="gap-2 font-semibold shadow-xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Support Ticket</span>
        </Button>
      </div>

      {/* Filter Component */}
      <TicketFilter
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        priority={priority}
        onPriorityChange={setPriority}
        category={category}
        onCategoryChange={setCategory}
        onReset={handleResetFilters}
      />

      {/* Tickets Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="No Tickets Found"
          description={
            search || status !== 'All' || priority !== 'All' || category !== 'All'
              ? 'No tickets matched your current filter criteria. Try resetting your search filters.'
              : 'You have not submitted any support tickets yet. Click below to submit your first request.'
          }
          actionLabel={
            search || status !== 'All' ? 'Reset Filters' : 'Create Support Ticket'
          }
          onAction={
            search || status !== 'All'
              ? handleResetFilters
              : () => navigate('/tickets/new')
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
};

