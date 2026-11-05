import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'destructive'
    | 'success'
    | 'warning'
    | 'info'
    | 'open'
    | 'in_progress'
    | 'waiting'
    | 'resolved'
    | 'closed'
    | 'low'
    | 'medium'
    | 'high'
    | 'urgent';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary text-secondary-foreground border-transparent',
    outline: 'text-foreground border-border',
    destructive: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',

    // Status variants
    open: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-medium',
    in_progress: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium',
    waiting: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 font-medium',
    resolved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium',
    closed: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 font-medium',

    // Priority variants
    low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    medium: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    high: 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border-orange-200 dark:border-orange-800 font-semibold',
    urgent: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-bold animate-pulse',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const getStatusBadgeVariant = (status: string): BadgeProps['variant'] => {
  switch (status.toLowerCase()) {
    case 'open':
      return 'open';
    case 'in progress':
      return 'in_progress';
    case 'waiting for customer':
      return 'waiting';
    case 'resolved':
      return 'resolved';
    case 'closed':
      return 'closed';
    default:
      return 'default';
  }
};

export const getPriorityBadgeVariant = (priority: string): BadgeProps['variant'] => {
  switch (priority.toLowerCase()) {
    case 'urgent':
      return 'urgent';
    case 'high':
      return 'high';
    case 'medium':
      return 'medium';
    case 'low':
      return 'low';
    default:
      return 'default';
  }
};

