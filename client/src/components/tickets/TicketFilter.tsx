import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface TicketFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  priority: string;
  onPriorityChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  onReset: () => void;
  isAdmin?: boolean;
}

const CATEGORIES = [
  'All',
  'Technical Support',
  'Account Issues',
  'Billing',
  'General Questions',
  'Other',
];

const PRIORITIES = ['All', 'Low', 'Medium', 'High', 'Urgent'];

const STATUSES = [
  'All',
  'Open',
  'In Progress',
  'Waiting for Customer',
  'Resolved',
  'Closed',
];

export const TicketFilter: React.FC<TicketFilterProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  category,
  onCategoryChange,
  onReset,
}) => {
  const isFiltered =
    search !== '' || status !== 'All' || priority !== 'All' || category !== 'All';

  return (
    <div className="bg-card border rounded-xl p-4 shadow-xs space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search ticket # or subject..."
            className="pl-9 h-9 text-xs"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>

        {/* Status Filter */}
        <Select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-9 text-xs"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              Status: {s}
            </option>
          ))}
        </Select>

        {/* Priority Filter */}
        <Select
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="h-9 text-xs"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              Priority: {p}
            </option>
          ))}
        </Select>

        {/* Category Filter */}
        <Select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="h-9 text-xs"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              Category: {c}
            </option>
          ))}
        </Select>
      </div>

      {/* Active Filter Indicator & Reset */}
      {isFiltered && (
        <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
          <span>Filtering active</span>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
          >
            <X className="h-3.5 w-3.5" />
            <span>Clear filters</span>
          </button>
        </div>
      )}
    </div>
  );
};

