import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket as TicketIcon,
  Clock,
  CheckCircle2,
  Users,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../services/api';
import { DashboardMetrics, Ticket } from '../../types';
import { StatsCard } from '../../components/admin/StatsCard';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge, getStatusBadgeVariant, getPriorityBadgeVariant } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatDistanceToNow } from 'date-fns';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [categories, setCategories] = useState<Record<string, number>>({});
  const [priorities, setPriorities] = useState<Record<string, number>>({});
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await api.admin.getDashboard();
        setMetrics(data.metrics);
        setCategories(data.categoryBreakdown);
        setPriorities(data.priorityBreakdown);
        setRecentTickets(data.recentTickets);
      } catch (err) {
        console.warn('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Operations Dashboard</span>
            <Badge variant="default" className="text-xs">
              Staff Portal
            </Badge>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            System overview, queue statistics, and support workload metrics
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/admin/tickets')}
          className="gap-2 font-semibold shadow-xs self-start sm:self-auto"
        >
          <TicketIcon className="h-4 w-4" />
          <span>Manage All Tickets</span>
        </Button>
      </div>

      {/* 1. Statistics Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard
            title="Total Tickets"
            value={metrics?.totalTickets || 0}
            description="Lifetime inquiries"
            icon={TicketIcon}
            variant="blue"
          />
          <StatsCard
            title="Open Queue"
            value={metrics?.openTickets || 0}
            description="Awaiting response"
            icon={AlertCircle}
            variant="rose"
          />
          <StatsCard
            title="In Progress"
            value={metrics?.inProgressTickets || 0}
            description="Active investigations"
            icon={Clock}
            variant="amber"
          />
          <StatsCard
            title="Resolved"
            value={metrics?.resolvedTickets || 0}
            description="Successfully closed"
            icon={CheckCircle2}
            variant="emerald"
          />
          <StatsCard
            title="Customers"
            value={metrics?.totalCustomers || 0}
            description="Registered accounts"
            icon={Users}
            variant="purple"
          />
        </div>
      )}

      {/* 2. Breakdowns Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Tickets by Category</span>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(categories).map(([category, count]) => {
              const total = metrics?.totalTickets || 1;
              const percent = Math.round((count / total) * 100);

              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-foreground">{category}</span>
                    <span className="text-muted-foreground">
                      {count} ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Tickets by Priority</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {['Urgent', 'High', 'Medium', 'Low'].map((p) => {
              const count = priorities[p] || 0;
              const total = metrics?.totalTickets || 1;
              const percent = Math.round((count / total) * 100);

              const colorMap: Record<string, string> = {
                Urgent: 'bg-rose-500',
                High: 'bg-orange-500',
                Medium: 'bg-blue-500',
                Low: 'bg-slate-400',
              };

              return (
                <div key={p} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-foreground font-semibold flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${colorMap[p]}`} />
                      <span>{p}</span>
                    </span>
                    <span className="text-muted-foreground">
                      {count} ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colorMap[p]} rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* 3. Recent Tickets Table */}
      <Card className="shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Recent Support Tickets</CardTitle>
            <p className="text-xs text-muted-foreground">
              Newly submitted customer requests awaiting action
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/tickets')}
            className="text-xs gap-1 text-primary hover:text-primary"
          >
            <span>View All Tickets</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentTickets.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No tickets currently found in the system.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider border-b">
                  <tr>
                    <th className="py-2.5 px-3">Ticket #</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Created</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {recentTickets.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-accent/40 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/tickets/${t.id}`)}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-primary">
                        {t.ticket_number}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-foreground">
                          {t.user?.full_name || 'Customer'}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {t.user?.email}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-foreground max-w-xs truncate">
                        {t.subject}
                      </td>
                      <td className="py-3 px-3">{t.category}</td>
                      <td className="py-3 px-3">
                        <Badge variant={getPriorityBadgeVariant(t.priority)}>
                          {t.priority}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={getStatusBadgeVariant(t.status)}>
                          {t.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/tickets/${t.id}`);
                          }}
                          className="h-7 text-[11px]"
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

