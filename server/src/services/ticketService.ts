import { getSupabaseAdmin, getSupabase } from '../config/supabase.js';
import {
  Ticket,
  TicketReply,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  UserProfile,
} from '../types/index.js';
import { memoryStore } from './store.js';
import { notificationService } from './notificationService.js';

let ticketCounter = 1004;

export const ticketService = {
  async getTickets(
    userId: string,
    role: 'customer' | 'admin',
    filters: {
      status?: string;
      priority?: string;
      category?: string;
      search?: string;
      assignedToMe?: boolean;
    } = {}
  ): Promise<Ticket[]> {
    const supabase = getSupabaseAdmin() || getSupabase();

    if (supabase) {
      try {
        let query = supabase.from('tickets').select(`
          *,
          user:profiles!tickets_user_id_fkey(id, full_name, email, role, avatar_url),
          assigned_admin:profiles!tickets_assigned_admin_id_fkey(id, full_name, email, role, avatar_url)
        `);

        if (role !== 'admin') {
          query = query.eq('user_id', userId);
        } else if (filters.assignedToMe) {
          query = query.eq('assigned_admin_id', userId);
        }

        if (filters.status && filters.status !== 'All') {
          query = query.eq('status', filters.status);
        }

        if (filters.priority && filters.priority !== 'All') {
          query = query.eq('priority', filters.priority);
        }

        if (filters.category && filters.category !== 'All') {
          query = query.eq('category', filters.category);
        }

        if (filters.search) {
          query = query.or(
            `ticket_number.ilike.%${filters.search}%,subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
          );
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;
        if (!error && data) {
          return data as Ticket[];
        }
      } catch (err) {
        console.warn('Supabase get tickets error, using fallback:', err);
      }
    }

    // Fallback store
    let list = Array.from(memoryStore.tickets.values());

    if (role !== 'admin') {
      list = list.filter((t) => t.user_id === userId);
    } else if (filters.assignedToMe) {
      list = list.filter((t) => t.assigned_admin_id === userId);
    }

    if (filters.status && filters.status !== 'All') {
      list = list.filter((t) => t.status === filters.status);
    }

    if (filters.priority && filters.priority !== 'All') {
      list = list.filter((t) => t.priority === filters.priority);
    }

    if (filters.category && filters.category !== 'All') {
      list = list.filter((t) => t.category === filters.category);
    }

    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.ticket_number.toLowerCase().includes(s) ||
          t.subject.toLowerCase().includes(s) ||
          t.description.toLowerCase().includes(s)
      );
    }

    return list
      .map((t) => ({
        ...t,
        user: memoryStore.profiles.get(t.user_id),
        assigned_admin: t.assigned_admin_id
          ? memoryStore.profiles.get(t.assigned_admin_id) || null
          : null,
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getTicketById(
    ticketId: string,
    userId: string,
    role: 'customer' | 'admin'
  ): Promise<{ ticket: Ticket; replies: TicketReply[] } | null> {
    const supabase = getSupabaseAdmin() || getSupabase();

    if (supabase) {
      try {
        let query = supabase
          .from('tickets')
          .select(`
            *,
            user:profiles!tickets_user_id_fkey(id, full_name, email, role, avatar_url),
            assigned_admin:profiles!tickets_assigned_admin_id_fkey(id, full_name, email, role, avatar_url)
          `)
          .eq('id', ticketId);

        if (role !== 'admin') {
          query = query.eq('user_id', userId);
        }

        const { data: ticket, error: ticketError } = await query.single();

        if (!ticketError && ticket) {
          let replyQuery = supabase
            .from('ticket_replies')
            .select(`
              *,
              user:profiles!ticket_replies_user_id_fkey(id, full_name, email, role, avatar_url)
            `)
            .eq('ticket_id', ticketId);

          if (role !== 'admin') {
            replyQuery = replyQuery.eq('is_internal', false);
          }

          replyQuery = replyQuery.order('created_at', { ascending: true });

          const { data: replies } = await replyQuery;

          return {
            ticket: ticket as Ticket,
            replies: (replies || []) as TicketReply[],
          };
        }
      } catch (err) {
        console.warn('Supabase get ticket by id error, using fallback:', err);
      }
    }

    const ticket = memoryStore.tickets.get(ticketId);
    if (!ticket || (role !== 'admin' && ticket.user_id !== userId)) {
      return null;
    }

    const replies = memoryStore.ticketReplies.get(ticketId) || [];
    const filteredReplies = replies
      .filter((r) => role === 'admin' || !r.is_internal)
      .map((r) => ({
        ...r,
        user: memoryStore.profiles.get(r.user_id),
      }))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return {
      ticket: {
        ...ticket,
        user: memoryStore.profiles.get(ticket.user_id),
        assigned_admin: ticket.assigned_admin_id
          ? memoryStore.profiles.get(ticket.assigned_admin_id) || null
          : null,
      },
      replies: filteredReplies,
    };
  },

  async createTicket(
    userId: string,
    data: {
      subject: string;
      description: string;
      category: TicketCategory;
      priority: TicketPriority;
    }
  ): Promise<Ticket> {
    const supabase = getSupabaseAdmin() || getSupabase();

    if (supabase) {
      try {
        const { data: created, error } = await supabase
          .from('tickets')
          .insert({
            user_id: userId,
            subject: data.subject,
            description: data.description,
            category: data.category,
            priority: data.priority,
            status: 'Open',
          })
          .select(`
            *,
            user:profiles!tickets_user_id_fkey(id, full_name, email, role, avatar_url)
          `)
          .single();

        if (!error && created) {
          // Notify admins of new ticket
          await notificationService.notifyAdmins(
            `New Ticket ${created.ticket_number}`,
            `A customer created: "${data.subject}"`,
            `/admin/tickets/${created.id}`
          );

          return created as Ticket;
        }
      } catch (err) {
        console.warn('Supabase create ticket error, using fallback:', err);
      }
    }

    const ticketNumber = `TICK-${ticketCounter++}`;
    const newTicket: Ticket = {
      id: `ticket-${Date.now()}`,
      ticket_number: ticketNumber,
      user_id: userId,
      assigned_admin_id: null,
      subject: data.subject,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: 'Open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: memoryStore.profiles.get(userId),
    };

    memoryStore.tickets.set(newTicket.id, newTicket);
    memoryStore.ticketReplies.set(newTicket.id, []);

    // Create system notification for admins
    await notificationService.notifyAdmins(
      `New Ticket ${newTicket.ticket_number}`,
      `A customer created: "${data.subject}"`,
      `/admin/tickets/${newTicket.id}`
    );

    return newTicket;
  },

  async updateTicket(
    ticketId: string,
    updates: Partial<{
      status: TicketStatus;
      priority: TicketPriority;
      assigned_admin_id: string | null;
      category: TicketCategory;
    }>,
    adminId?: string
  ): Promise<Ticket | null> {
    const supabase = getSupabaseAdmin() || getSupabase();

    if (supabase) {
      try {
        const { data: updated, error } = await supabase
          .from('tickets')
          .update(updates)
          .eq('id', ticketId)
          .select(`
            *,
            user:profiles!tickets_user_id_fkey(id, full_name, email, role, avatar_url),
            assigned_admin:profiles!tickets_assigned_admin_id_fkey(id, full_name, email, role, avatar_url)
          `)
          .single();

        if (!error && updated) {
          if (updates.status) {
            await notificationService.createNotification(
              updated.user_id,
              `Ticket ${updated.ticket_number} Status Updated`,
              `Your ticket status was changed to: ${updates.status}`,
              `/tickets/${updated.id}`
            );
          }
          return updated as Ticket;
        }
      } catch (err) {
        console.warn('Supabase update ticket error, using fallback:', err);
      }
    }

    const ticket = memoryStore.tickets.get(ticketId);
    if (!ticket) return null;

    const modified = {
      ...ticket,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    memoryStore.tickets.set(ticketId, modified);

    if (updates.status) {
      await notificationService.createNotification(
        modified.user_id,
        `Ticket ${modified.ticket_number} Status Updated`,
        `Your ticket status was changed to: ${updates.status}`,
        `/tickets/${modified.id}`
      );
    }

    return {
      ...modified,
      user: memoryStore.profiles.get(modified.user_id),
      assigned_admin: modified.assigned_admin_id
        ? memoryStore.profiles.get(modified.assigned_admin_id) || null
        : null,
    };
  },

  async addReply(
    ticketId: string,
    userId: string,
    message: string,
    isInternal = false
  ): Promise<TicketReply | null> {
    const supabase = getSupabaseAdmin() || getSupabase();

    if (supabase) {
      try {
        const { data: reply, error } = await supabase
          .from('ticket_replies')
          .insert({
            ticket_id: ticketId,
            user_id: userId,
            message,
            is_internal: isInternal,
          })
          .select(`
            *,
            user:profiles!ticket_replies_user_id_fkey(id, full_name, email, role, avatar_url)
          `)
          .single();

        if (!error && reply) {
          // Fetch ticket to update timestamp and status
          const { data: ticket } = await supabase
            .from('tickets')
            .select('user_id, ticket_number, status')
            .eq('id', ticketId)
            .single();

          if (ticket) {
            const isUserOwner = ticket.user_id === userId;
            const newStatus = isUserOwner ? 'Open' : 'Waiting for Customer';

            await supabase
              .from('tickets')
              .update({
                updated_at: new Date().toISOString(),
                ...(ticket.status === 'Resolved' || ticket.status === 'Closed'
                  ? { status: 'In Progress' }
                  : { status: newStatus }),
              })
              .eq('id', ticketId);

            // Notify customer if admin replied, or notify admin if customer replied
            if (!isInternal) {
              if (!isUserOwner) {
                await notificationService.createNotification(
                  ticket.user_id,
                  `New Reply on ${ticket.ticket_number}`,
                  `A support specialist replied to your ticket.`,
                  `/tickets/${ticketId}`
                );
              } else {
                await notificationService.notifyAdmins(
                  `Customer Reply on ${ticket.ticket_number}`,
                  `Customer submitted a follow-up response.`,
                  `/admin/tickets/${ticketId}`
                );
              }
            }
          }

          return reply as TicketReply;
        }
      } catch (err) {
        console.warn('Supabase add reply error, using fallback:', err);
      }
    }

    const ticket = memoryStore.tickets.get(ticketId);
    if (!ticket) return null;

    const userProfile = memoryStore.profiles.get(userId);
    const isUserOwner = ticket.user_id === userId;

    const newReply: TicketReply = {
      id: `reply-${Date.now()}`,
      ticket_id: ticketId,
      user_id: userId,
      message,
      is_internal: isInternal,
      created_at: new Date().toISOString(),
      user: userProfile,
    };

    const currentReplies = memoryStore.ticketReplies.get(ticketId) || [];
    currentReplies.push(newReply);
    memoryStore.ticketReplies.set(ticketId, currentReplies);

    ticket.updated_at = new Date().toISOString();
    if (!isUserOwner) {
      ticket.status = 'Waiting for Customer';
      if (!isInternal) {
        await notificationService.createNotification(
          ticket.user_id,
          `New Reply on ${ticket.ticket_number}`,
          `Support specialist replied to your ticket.`,
          `/tickets/${ticketId}`
        );
      }
    } else {
      ticket.status = 'Open';
      await notificationService.notifyAdmins(
        `Customer Reply on ${ticket.ticket_number}`,
        `Customer submitted a follow-up response.`,
        `/admin/tickets/${ticketId}`
      );
    }

    return newReply;
  },
};

