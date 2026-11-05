import axios from 'axios';
import {
  Ticket,
  TicketReply,
  Conversation,
  Message,
  FAQ,
  Notification,
  UserProfile,
  DashboardMetrics,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Supabase JWT or Demo Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('helpdesk_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for unified error message handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred while communicating with the server.';
    return Promise.reject(new Error(message));
  }
);

export const api = {
  // Auth
  auth: {
    getProfile: async () => {
      const res = await apiClient.get<{ success: boolean; profile: UserProfile }>('/auth/profile');
      return res.data.profile;
    },
    updateProfile: async (data: { full_name?: string; avatar_url?: string }) => {
      const res = await apiClient.put<{ success: boolean; profile: UserProfile }>('/auth/profile', data);
      return res.data.profile;
    },
  },

  // AI Chat
  chat: {
    getConversations: async () => {
      const res = await apiClient.get<{ success: boolean; conversations: Conversation[] }>(
        '/chat/conversations'
      );
      return res.data.conversations;
    },
    getConversation: async (id: string) => {
      const res = await apiClient.get<{
        success: boolean;
        conversation: Conversation;
        messages: Message[];
      }>(`/chat/conversations/${id}`);
      return res.data;
    },
    sendMessage: async (data: { conversationId?: string; content: string }) => {
      const res = await apiClient.post<{
        success: boolean;
        conversationId: string;
        userMessage: Message;
        assistantMessage: Message;
        suggestedAction?: 'create_ticket' | 'view_faq' | 'none';
      }>('/chat/message', data);
      return res.data;
    },
    deleteConversation: async (id: string) => {
      const res = await apiClient.delete<{ success: boolean; message: string }>(
        `/chat/conversations/${id}`
      );
      return res.data;
    },
  },

  // Tickets
  tickets: {
    getTickets: async (filters: {
      status?: string;
      priority?: string;
      category?: string;
      search?: string;
      assignedToMe?: boolean;
    } = {}) => {
      const res = await apiClient.get<{ success: boolean; count: number; tickets: Ticket[] }>(
        '/tickets',
        { params: filters }
      );
      return res.data.tickets;
    },
    getTicket: async (id: string) => {
      const res = await apiClient.get<{
        success: boolean;
        ticket: Ticket;
        replies: TicketReply[];
      }>(`/tickets/${id}`);
      return res.data;
    },
    createTicket: async (data: {
      subject: string;
      description: string;
      category: TicketCategory;
      priority: TicketPriority;
    }) => {
      const res = await apiClient.post<{ success: boolean; ticket: Ticket }>('/tickets', data);
      return res.data.ticket;
    },
    addReply: async (ticketId: string, data: { message: string; is_internal?: boolean }) => {
      const res = await apiClient.post<{ success: boolean; reply: TicketReply }>(
        `/tickets/${ticketId}/replies`,
        data
      );
      return res.data.reply;
    },
    updateStatus: async (ticketId: string, status: TicketStatus) => {
      const res = await apiClient.patch<{ success: boolean; ticket: Ticket }>(
        `/tickets/${ticketId}/status`,
        { status }
      );
      return res.data.ticket;
    },
  },

  // Admin
  admin: {
    getDashboard: async () => {
      const res = await apiClient.get<{
        success: boolean;
        metrics: DashboardMetrics;
        categoryBreakdown: Record<string, number>;
        priorityBreakdown: Record<string, number>;
        recentTickets: Ticket[];
      }>('/admin/dashboard');
      return res.data;
    },
    getTickets: async (filters: {
      status?: string;
      priority?: string;
      category?: string;
      search?: string;
      assignedToMe?: boolean;
    } = {}) => {
      const res = await apiClient.get<{ success: boolean; count: number; tickets: Ticket[] }>(
        '/admin/tickets',
        { params: filters }
      );
      return res.data.tickets;
    },
    updateTicket: async (
      ticketId: string,
      data: Partial<{
        status: TicketStatus;
        priority: TicketPriority;
        assigned_admin_id: string | null;
        category: TicketCategory;
      }>
    ) => {
      const res = await apiClient.patch<{ success: boolean; ticket: Ticket }>(
        `/admin/tickets/${ticketId}`,
        data
      );
      return res.data.ticket;
    },
    getCustomers: async () => {
      const res = await apiClient.get<{
        success: boolean;
        customers: (UserProfile & { ticket_count: number })[];
      }>('/admin/customers');
      return res.data.customers;
    },
    getConversations: async () => {
      const res = await apiClient.get<{
        success: boolean;
        conversations: (Conversation & { user_email?: string; full_name?: string })[];
      }>('/admin/conversations');
      return res.data.conversations;
    },
  },

  // FAQs
  faqs: {
    getFaqs: async (params?: { category?: string; search?: string; all?: boolean }) => {
      const res = await apiClient.get<{ success: boolean; count: number; faqs: FAQ[] }>('/faqs', {
        params,
      });
      return res.data.faqs;
    },
    createFaq: async (data: {
      question: string;
      answer: string;
      category: string;
      is_published?: boolean;
    }) => {
      const res = await apiClient.post<{ success: boolean; faq: FAQ }>('/admin/faqs', data);
      return res.data.faq;
    },
    updateFaq: async (id: string, data: Partial<FAQ>) => {
      const res = await apiClient.patch<{ success: boolean; faq: FAQ }>(`/admin/faqs/${id}`, data);
      return res.data.faq;
    },
    deleteFaq: async (id: string) => {
      const res = await apiClient.delete<{ success: boolean; message: string }>(
        `/admin/faqs/${id}`
      );
      return res.data;
    },
  },

  // Notifications
  notifications: {
    getNotifications: async () => {
      const res = await apiClient.get<{
        success: boolean;
        count: number;
        notifications: Notification[];
      }>('/notifications');
      return res.data.notifications;
    },
    markAsRead: async (id: string) => {
      const res = await apiClient.patch<{ success: boolean }>(`/notifications/${id}/read`);
      return res.data;
    },
    markAllAsRead: async () => {
      const res = await apiClient.patch<{ success: boolean }>('/notifications/read-all');
      return res.data;
    },
  },
};

