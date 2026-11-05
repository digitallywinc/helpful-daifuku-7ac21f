import React from 'react';
import { Bot, User, TicketPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Message } from '../../types';
import { format } from 'date-fns';
import { Button } from '../ui/Button';

interface ChatMessageProps {
  message: Message;
  suggestedAction?: 'create_ticket' | 'view_faq' | 'none';
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, suggestedAction }) => {
  const isUser = message.sender === 'user';
  const navigate = useNavigate();

  // Basic formatted markdown rendering (bullet points, bolding, paragraphs)
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Bold text replacement
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li
            key={idx}
            className="ml-4 list-disc text-sm"
            dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[-*]\s+/, '') }}
          />
        );
      }
      if (/^\d+\.\s+/.test(line.trim())) {
        return (
          <p
            key={idx}
            className="text-sm my-1 font-medium"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p
          key={idx}
          className="text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  const showTicketButton =
    !isUser &&
    (suggestedAction === 'create_ticket' ||
      message.content.toLowerCase().includes('create a support ticket') ||
      message.content.toLowerCase().includes('open a support ticket') ||
      message.content.toLowerCase().includes('support ticket'));

  return (
    <div className={`flex gap-3 my-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Sender Avatar */}
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Bubble Container */}
      <div className={`flex flex-col max-w-[80%] sm:max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 shadow-xs ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-xs'
              : 'bg-card border border-border text-foreground rounded-tl-xs'
          }`}
        >
          <div className="space-y-1">{renderFormattedText(message.content)}</div>

          {/* Quick CTA if AI suggests opening a ticket */}
          {showTicketButton && (
            <div className="mt-3 pt-2.5 border-t border-border/60">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  navigate('/tickets/new', {
                    state: { initialSubject: 'Inquiry from AI Chat Assistant' },
                  })
                }
                className="bg-primary/5 hover:bg-primary/10 text-primary border-primary/30 text-xs font-semibold gap-1.5 shadow-none"
              >
                <TicketPlus className="h-3.5 w-3.5" />
                <span>Create Support Ticket</span>
              </Button>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground mt-1 px-1">
          {message.created_at
            ? format(new Date(message.created_at), 'h:mm a')
            : 'Just now'}
        </span>
      </div>
    </div>
  );
};

