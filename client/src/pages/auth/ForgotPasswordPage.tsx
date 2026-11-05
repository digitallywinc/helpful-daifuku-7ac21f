import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { resetPassword } = useAuth();
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      error('Email required', 'Please provide your account email address.');
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(email);
      setIsSubmitted(true);
      success('Reset email sent', 'Check your inbox for password recovery instructions.');
    } catch (err: any) {
      error('Reset failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md bg-card border rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-blue-500 text-white flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Reset Password
          </h1>
          <p className="text-xs text-muted-foreground">
            Enter your registered email and we'll send you instructions to reset your password
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-foreground">Password Reset Email Dispatched</h3>
            <p className="text-xs text-muted-foreground">
              If an account exists for <span className="font-semibold text-foreground">{email}</span>, you will receive a secure password recovery link shortly.
            </p>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSubmitted(false)}
                className="text-xs"
              >
                Send to different email
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full text-sm font-semibold shadow-sm"
            >
              Send Reset Instructions
            </Button>
          </form>
        )}

        <div className="text-center pt-2 border-t">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

