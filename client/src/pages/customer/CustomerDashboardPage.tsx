import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Plus,
  Ticket as TicketIcon,
  Clock,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Sparkles,
  LifeBuoy,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Ticket, FAQ } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { TicketCard } from '../../components/tickets/TicketCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ticketData, faqData] = await Promise.all([
          api.tickets.getTickets(),
          api.faqs.getFaqs(),
        ]);
        setTickets(ticketData);
        setFaqs(faqData.slice(0, 4));
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openTickets = tickets.filter((t) => t.status === 'Open').length;
  const inProgressTickets = tickets.filter(
    (t) => t.status === 'In Progress' || t.status === 'Waiting for Customer'
  ).length;
  const resolvedTickets = tickets.filter(
    (t) => t.status === 'Resolved' || t.status === 'Closed'
  ).length;

  return (
    <div className="space-y-6">
      {/* 1. Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/95 via-primary to-blue-600 p-6 sm:p-8 text-primary-foreground shadow-lg shadow-primary/10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>AI-Driven Customer Experience</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0] || 'there'}!
          </h2>
          <p className="text-xs sm:text-sm text-primary-foreground/90 leading-relaxed">
            Need assistance? Our AI Support Assistant is online 24/7 to resolve inquiries instantly,
            or you can create a support ticket with our engineering team.
          </p>
          <div className="pt-2 flex items-center gap-3 flex-wrap">
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/chat')}
              className="gap-2 font-semibold shadow-xs"
            >
              <Bot className="h-4 w-4 text-primary" />
              <span>Ask AI Assistant</span>
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/tickets/new')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-2 font-semibold"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Ticket</span>
            </Button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Open Tickets
            </p>
            <h3 className="text-2xl font-bold text-foreground">{openTickets}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Awaiting assignment</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <TicketIcon className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              In Progress
            </p>
            <h3 className="text-2xl font-bold text-foreground">{inProgressTickets}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Being worked on by support</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Resolved & Closed
            </p>
            <h3 className="text-2xl font-bold text-foreground">{resolvedTickets}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Successfully concluded</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* 3. Main Dashboard Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Tickets */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Recent Support Tickets</h3>
              <p className="text-xs text-muted-foreground">
                Track progress and updates on your recent submissions
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/tickets')}
              className="text-xs gap-1 text-primary hover:text-primary"
            >
              <span>View all</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <EmptyState
              icon={LifeBuoy}
              title="No Support Tickets Yet"
              description="You haven't submitted any support requests. If you have an inquiry, ask our AI assistant or open a ticket."
              actionLabel="Create Support Ticket"
              onAction={() => navigate('/tickets/new')}
            />
          ) : (
            <div className="space-y-3">
              {tickets.slice(0, 3).map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): FAQs Knowledge Base Widget */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Helpful FAQs</h3>
              <p className="text-xs text-muted-foreground">Instant answers to top questions</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/faqs')}
              className="text-xs gap-1 text-primary hover:text-primary"
            >
              <span>Browse</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                onClick={() => navigate('/faqs')}
                className="p-4 rounded-xl border bg-card hover:border-primary/50 transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {faq.category}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {faq.question}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          {/* AI Banner Card */}
          <div className="p-4 rounded-xl border bg-gradient-to-br from-card to-primary/5 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs">
              <Bot className="h-4 w-4" />
              <span>Can't find your answer?</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Our AI chatbot has read all knowledge base articles and can generate tailored step-by-step guidance immediately.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/chat')}
              className="w-full text-xs font-semibold mt-1"
            >
              Start AI Conversation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

