import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  Bot,
  Plus,
  LifeBuoy,
  Sparkles,
} from 'lucide-react';
import { FAQ } from '../../types';
import { api } from '../../services/api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

const CATEGORIES = [
  'All',
  'General Questions',
  'Technical Support',
  'Account Issues',
  'Billing',
  'Other',
];

export const FaqPage: React.FC = () => {
  const navigate = useNavigate();

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>({});

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const data = await api.faqs.getFaqs({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: search || undefined,
      });
      setFaqs(data);
      if (data.length > 0 && !expandedId) {
        setExpandedId(data[0].id);
      }
    } catch (err) {
      console.warn('Failed to load FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, [selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFaqs();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const toggleAccordion = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleVoteHelpful = (id: string) => {
    if (votedMap[id]) return;
    setVotedMap((prev) => ({ ...prev, [id]: true }));
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, helpful_count: (f.helpful_count || 0) + 1 } : f))
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Knowledge Base Header */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Knowledge Base</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
          Find instant answers to common questions regarding account management, technical configuration, billing, and platform security.
        </p>

        {/* Big Search Bar */}
        <div className="max-w-xl mx-auto pt-2 relative">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by keyword or topic..."
            className="pl-10 h-11 text-sm shadow-sm rounded-xl"
          />
          <Search className="absolute left-3.5 top-5 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-card border text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : faqs.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No FAQs Found"
            description="We couldn't find any articles matching your search criteria. You can ask our AI Assistant or submit a support ticket."
            actionLabel="Reset Search"
            onAction={() => {
              setSearch('');
              setSelectedCategory('All');
            }}
          />
        ) : (
          faqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            const hasVoted = votedMap[faq.id];

            return (
              <div
                key={faq.id}
                className="rounded-xl border bg-card shadow-2xs overflow-hidden transition-all duration-200"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-accent/40 transition-colors cursor-pointer"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                      {faq.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-semibold text-foreground">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="p-1 rounded-full bg-muted text-muted-foreground shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-foreground/90 leading-relaxed border-t bg-muted/10 space-y-4 animate-accordion-down">
                    <p className="whitespace-pre-wrap">{faq.answer}</p>

                    <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs text-muted-foreground">
                      <span>Was this article helpful?</span>
                      <button
                        onClick={() => handleVoteHelpful(faq.id)}
                        disabled={hasVoted}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${
                          hasVoted
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                            : 'hover:bg-accent text-foreground'
                        }`}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span>{hasVoted ? 'Thank you!' : 'Yes, helpful'}</span>
                        <span className="text-muted-foreground ml-1">
                          ({faq.helpful_count || 0})
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still need help CTA Banner */}
      <div className="rounded-2xl border bg-gradient-to-r from-card to-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            Still need more assistance?
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
            Our 24/7 AI chatbot can provide contextual guidance, or you can submit a ticket to our engineering team.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/chat')}
            className="gap-2 font-semibold text-xs"
          >
            <Bot className="h-4 w-4 text-primary" />
            <span>Chat with AI</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/tickets/new')}
            className="gap-2 font-semibold text-xs shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Submit a Ticket</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

