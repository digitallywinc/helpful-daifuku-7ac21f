import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '../ui/Card';

interface StatsCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'amber' | 'emerald' | 'purple' | 'rose' | 'default';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  variant = 'default',
}) => {
  const iconColors = {
    default: 'bg-primary/10 text-primary',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  };

  return (
    <Card className="p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          {title}
        </p>
        <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
        {description && (
          <p className="text-[11px] text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${iconColors[variant]}`}>
        <Icon className="h-6 w-6" />
      </div>
    </Card>
  );
};

