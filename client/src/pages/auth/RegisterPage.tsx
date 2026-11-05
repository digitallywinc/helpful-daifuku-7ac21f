import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, User, Mail, Lock, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { UserRole } from '../../types';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [isLoading, setIsLoading] = useState(false);

  const { signUp } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      error('Incomplete form', 'Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      error('Password too short', 'Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      await signUp(email, password, fullName, role);
      success('Account created!', 'Welcome to HelpDesk AI. You can now use all platform features.');
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      error('Registration failed', err.message);
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
            Create an Account
          </h1>
          <p className="text-xs text-muted-foreground">
            Join HelpDesk AI to access 24/7 AI customer assistance and support ticketing
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Alex Morgan"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="alex@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Select
            label="Account Role (Portfolio Demo)"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            helperText="Select 'Administrator' to preview admin management capabilities."
          >
            <option value="customer">Customer (Standard Support User)</option>
            <option value="admin">Administrator (Support Operations Lead)</option>
          </Select>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full text-sm font-semibold mt-2 shadow-sm"
          >
            Complete Registration
          </Button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-muted-foreground pt-2 border-t">
          <span>Already have an account? </span>
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

