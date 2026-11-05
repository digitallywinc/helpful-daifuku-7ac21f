import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, RefreshCw, AlertCircle, Trash2 } from 'lucide-react';
import { Message } from '../../types';
import { ChatMessage } from './ChatMessage';
import { Button } from '../ui/Button';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string) => Promise<void>;
  onClearChat?: () => void;
  suggestedAction?: 'create_ticket' | 'view_faq' | 'none';
}

const STARTER_PROMPTS = [
  'How do I reset my account password?',
  'What is your refund policy on subscriptions?',
  'How do I submit a new technical support ticket?',
  'What are your customer support operating hours?',
];

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onClearChat,
  suggestedAction,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageToSend = input.trim();
    setInput('');
    await onSendMessage(messageToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-xl border shadow-xs overflow-hidden">
      {/* Chat Header */}
      <div className="h-14 px-4 sm:px-6 border-b bg-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-blue-500 text-white flex items-center justify-center shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">HelpDesk AI Assistant</h2>
              <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded-full">
                Online
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Powered by OpenAI & Knowledge Base Grounding
            </p>
          </div>
        </div>

        {onClearChat && messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearChat}
            className="text-muted-foreground hover:text-destructive text-xs gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </Button>
        )}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-inner">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-base font-bold text-foreground tracking-tight mb-1">
              How can I assist you today?
            </h3>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Ask anything about our platform, account settings, billing policies, or troubleshooting.
              If an issue requires engineering support, I can help you create a ticket directly!
            </p>

            {/* Quick Prompt Suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full text-left">
              {STARTER_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(prompt)}
                  className="p-3 text-xs rounded-xl border bg-card hover:bg-accent/60 hover:border-primary/40 text-foreground transition-all duration-200 text-left shadow-2xs font-medium cursor-pointer"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <ChatMessage
                key={msg.id || index}
                message={msg}
                suggestedAction={index === messages.length - 1 ? suggestedAction : undefined}
              />
            ))}

            {/* Loading / Typing indicator */}
            {isLoading && (
              <div className="flex gap-3 my-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-card border rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs">
                  <div className="flex items-center gap-1.5 py-1">
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t bg-card">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask HelpDesk AI a question... (Press Enter to send)"
              className="w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary max-h-32 transition-colors"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!input.trim() || isLoading}
            className="h-10 px-4 rounded-xl gap-1.5 shadow-xs shrink-0"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          HelpDesk AI may produce responses based on current documentation. Verify critical billing and account details.
        </p>
      </div>
    </div>
  );
};

