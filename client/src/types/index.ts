export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export type TicketCategory =
  | 'Technical Support'
  | 'Account Issues'
  | 'Billing'
  | 'General Questions'
  | 'Other';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type TicketStatus =
  | 'Open'
  | 'In Progress'
  | 'Waiting for Customer'
  | 'Resolved'
  | 'Closed';

export interface Ticket {
  id: string;
  ticket_number: string;
  user_id: string;
  assigned_admin_id?: string | null;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
  assigned_admin?: UserProfile | null;
}

export interface TicketReply {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_internal?: boolean;
  created_at: string;
  user?: UserProfile;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_published: boolean;
  helpful_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  link?: string | null;
  created_at: string;
}

export interface DashboardMetrics {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  waitingTickets: number;
  resolvedTickets: number;
  totalCustomers: number;
}

