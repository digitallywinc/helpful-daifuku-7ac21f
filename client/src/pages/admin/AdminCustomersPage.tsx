import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Calendar, LifeBuoy } from 'lucide-react';
import { UserProfile } from '../../types';
import { api } from '../../services/api';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { format } from 'date-fns';

type CustomerWithCount = UserProfile & { ticket_count: number };

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await api.admin.getCustomers();
        setCustomers(data);
      } catch (err) {
        console.warn('Failed to load customers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Customer Directory
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          View registered customer accounts, roles, and ticket submission metrics
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-md relative">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name or email..."
          className="pl-9 h-9 text-xs"
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>

      {/* Customers Table */}
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
              icon={Users}
              title="No Customers Found"
              description="No registered user accounts match your search query."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider border-b">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Tickets Created</th>
                  <th className="py-3 px-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.full_name || c.email} src={c.avatar_url} size="sm" />
                        <span className="font-semibold text-foreground">
                          {c.full_name || 'Customer'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-muted-foreground">{c.email}</td>

                    <td className="py-3 px-4">
                      <Badge
                        variant={c.role === 'admin' ? 'urgent' : 'secondary'}
                        className="text-[10px] uppercase py-0"
                      >
                        {c.role}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 font-semibold text-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <LifeBuoy className="h-3.5 w-3.5 text-primary" />
                        <span>{c.ticket_count || 0} tickets</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-muted-foreground">
                      {c.created_at
                        ? format(new Date(c.created_at), 'MMM d, yyyy')
                        : 'Recent'}
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

