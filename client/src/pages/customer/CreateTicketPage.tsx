import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, AlertCircle, Bot } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { TicketCategory, TicketPriority } from '../../types';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

const CATEGORIES: TicketCategory[] = [
  'Technical Support',
  'Account Issues',
  'Billing',
  'General Questions',
  'Other',
];

const PRIORITIES: TicketPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

export const CreateTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialSubject = (location.state as any)?.initialSubject || '';

  const [subject, setSubject] = useState(initialSubject);
  const [category, setCategory] = useState<TicketCategory>('Technical Support');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      error('Subject required', 'Please provide a clear summary for your ticket.');
      return;
    }

    if (!description.trim()) {
      error('Description required', 'Please describe your inquiry or issue in detail.');
      return;
    }

    try {
      setIsLoading(true);
      const ticket = await api.tickets.createTicket({
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
      });

      success('Ticket Created!', `Reference code ${ticket.ticket_number} assigned.`);
      navigate(`/tickets/${ticket.id}`);
    } catch (err: any) {
      error('Failed to create ticket', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button & Title */}
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
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Submit a Support Ticket
          </h2>
          <p className="text-xs text-muted-foreground">
            Our engineering and customer support specialists review submissions promptly
          </p>
        </div>
      </div>

      {/* Helpful AI Advice Alert */}
      <div className="p-4 rounded-xl border bg-primary/5 border-primary/20 flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Bot className="h-4 w-4" />
        </div>
        <div className="text-xs leading-relaxed">
          <p className="font-semibold text-foreground">Need instant answers?</p>
          <p className="text-muted-foreground mt-0.5">
            You can also ask our{' '}
            <button
              onClick={() => navigate('/chat')}
              className="text-primary font-semibold hover:underline"
            >
              24/7 AI Customer Assistant
            </button>{' '}
            for immediate answers to common setup, billing, and technical questions without waiting for support queue review.
          </p>
        </div>
      </div>

      {/* Ticket Creation Form */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Subject */}
            <Input
              label="Subject / Issue Summary"
              placeholder="e.g., Cannot configure webhook callback on custom domain"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              helperText="Be specific so our specialists can route your request accurately."
              required
            />

            {/* Category & Priority Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Ticket Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>

              <Select
                label="Priority Level"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                helperText="Reserve 'Urgent' for complete system outages or production blockers."
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>

            {/* Description */}
            <Textarea
              label="Detailed Description"
              placeholder="Please provide full details, including steps to reproduce, expected vs actual behavior, and any relevant error codes..."
              rows={7}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => navigate('/tickets')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="gap-2 font-semibold px-6 shadow-sm"
              >
                <Send className="h-4 w-4" />
                <span>Submit Ticket</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

