import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bot, Mail, Lock, Sparkles, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, loginAsDemo } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Missing credentials', 'Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      await signIn(email, password);
      success('Welcome back!', 'You have successfully signed in.');
      navigate(from, { replace: true });
    } catch (err: any) {
      error('Sign in failed', err.message || 'Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'customer' | 'admin') => {
    try {
      setIsLoading(true);
      await loginAsDemo(role);
      success(
        'Demo Mode Activated',
        `Logged in as ${role === 'admin' ? 'Lead Administrator' : 'Demo Customer'}.`
      );
      navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err: any) {
      error('Demo login failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md bg-card border rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-blue-500 text-white flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Sign in to HelpDesk AI
          </h1>
          <p className="text-xs text-muted-foreground">
            Enter your email and password to access your support portal
          </p>
        </div>

        {/* Demo Login Quick Shortcuts */}
        <div className="p-3.5 rounded-xl border border-dashed border-primary/30 bg-primary/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-primary">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>One-Click Portfolio Demo</span>
            </span>
            <span className="text-[10px] bg-primary/10 px-1.5 py-0.5 rounded uppercase">Instant</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('customer')}
              className="text-xs gap-1.5 bg-background shadow-xs hover:border-primary"
            >
              <User className="h-3.5 w-3.5 text-blue-500" />
              <span>Customer Demo</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('admin')}
              className="text-xs gap-1.5 bg-background shadow-xs hover:border-primary"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
              <span>Admin Demo</span>
            </Button>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground tracking-wide uppercase">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full text-sm font-semibold mt-2 shadow-sm"
          >
            Sign In
          </Button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-muted-foreground pt-2 border-t">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

