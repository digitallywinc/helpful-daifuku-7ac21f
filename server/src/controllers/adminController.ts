import { Response } from 'express';
import { AuthenticatedRequest, Ticket } from '../types/index.js';
import { ticketService } from '../services/ticketService.js';
import { chatService } from '../services/chatService.js';
import { getSupabaseAdmin, getSupabase } from '../config/supabase.js';
import { memoryStore } from '../services/store.js';

export const adminController = {
  async getDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const allTickets = await ticketService.getTickets(req.user!.id, 'admin');

      const totalTickets = allTickets.length;
      const openTickets = allTickets.filter((t) => t.status === 'Open').length;
      const inProgressTickets = allTickets.filter((t) => t.status === 'In Progress').length;
      const waitingTickets = allTickets.filter((t) => t.status === 'Waiting for Customer').length;
      const resolvedTickets = allTickets.filter(
        (t) => t.status === 'Resolved' || t.status === 'Closed'
      ).length;

      // Category breakdown
      const categoryCounts: Record<string, number> = {
        'Technical Support': 0,
        'Account Issues': 0,
        Billing: 0,
        'General Questions': 0,
        Other: 0,
      };
      allTickets.forEach((t) => {
        if (categoryCounts[t.category] !== undefined) {
          categoryCounts[t.category]++;
        } else {
          categoryCounts[t.category] = 1;
        }
      });

      // Priority breakdown
      const priorityCounts: Record<string, number> = {
        Low: 0,
        Medium: 0,
        High: 0,
        Urgent: 0,
      };
      allTickets.forEach((t) => {
        if (priorityCounts[t.priority] !== undefined) {
          priorityCounts[t.priority]++;
        }
      });

      // Customer count
      let totalCustomers = 0;
      const supabase = getSupabaseAdmin() || getSupabase();
      if (supabase) {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'customer');
        totalCustomers = count || 0;
      }
      if (totalCustomers === 0) {
        totalCustomers = Array.from(memoryStore.profiles.values()).filter(
          (p) => p.role === 'customer'
        ).length;
      }

      // Recent 5 tickets
      const recentTickets = allTickets.slice(0, 5);

      res.json({
        success: true,
        metrics: {
          totalTickets,
          openTickets,
          inProgressTickets,
          waitingTickets,
          resolvedTickets,
          totalCustomers,
        },
        categoryBreakdown: categoryCounts,
        priorityBreakdown: priorityCounts,
        recentTickets,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getTickets(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { status, priority, category, search, assignedToMe } = req.query;
      const tickets = await ticketService.getTickets(req.user!.id, 'admin', {
        status: status as string,
        priority: priority as string,
        category: category as string,
        search: search as string,
        assignedToMe: assignedToMe === 'true',
      });

      res.json({ success: true, count: tickets.length, tickets });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateTicket(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, priority, assigned_admin_id, category } = req.body;

      const updates: any = {};
      if (status !== undefined) updates.status = status;
      if (priority !== undefined) updates.priority = priority;
      if (assigned_admin_id !== undefined) updates.assigned_admin_id = assigned_admin_id;
      if (category !== undefined) updates.category = category;

      const updated = await ticketService.updateTicket(id, updates, req.user!.id);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Ticket not found' });
        return;
      }

      res.json({ success: true, ticket: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getCustomers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const supabase = getSupabaseAdmin() || getSupabase();

      if (supabase) {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && profiles) {
          // Count tickets per customer
          const { data: tickets } = await supabase.from('tickets').select('user_id');
          const ticketCounts: Record<string, number> = {};
          (tickets || []).forEach((t: any) => {
            ticketCounts[t.user_id] = (ticketCounts[t.user_id] || 0) + 1;
          });

          const enriched = profiles.map((p: any) => ({
            ...p,
            ticket_count: ticketCounts[p.id] || 0,
          }));

          res.json({ success: true, customers: enriched });
          return;
        }
      }

      // Fallback store
      const customers = Array.from(memoryStore.profiles.values()).map((p) => {
        const count = Array.from(memoryStore.tickets.values()).filter(
          (t) => t.user_id === p.id
        ).length;
        return {
          ...p,
          ticket_count: count,
        };
      });

      res.json({ success: true, customers });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversations = await chatService.getAllConversationsForAdmin();
      res.json({ success: true, conversations });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

