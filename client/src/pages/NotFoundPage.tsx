import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center bg-background">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        <Bot className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-foreground mb-2">404</h1>
      <h2 className="text-lg font-semibold text-foreground mb-2">Page Not Found</h2>
      <p className="text-xs text-muted-foreground max-w-sm mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Button
        variant="primary"
        size="md"
        onClick={() => navigate('/dashboard')}
        className="gap-2 font-semibold"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Dashboard</span>
      </Button>
    </div>
  );
};

