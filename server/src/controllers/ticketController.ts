import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { ticketService } from '../services/ticketService.js';

export const ticketController = {
  async getTickets(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;
      const { status, priority, category, search, assignedToMe } = req.query;

      const tickets = await ticketService.getTickets(userId, role, {
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

  async getTicket(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;
      const { id } = req.params;

      const result = await ticketService.getTicketById(id, userId, role);
      if (!result) {
        res.status(404).json({ success: false, message: 'Ticket not found' });
        return;
      }

      res.json({
        success: true,
        ticket: result.ticket,
        replies: result.replies,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async createTicket(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { subject, description, category, priority } = req.body;

      if (!subject || !description || !category) {
        res.status(400).json({
          success: false,
          message: 'Subject, description, and category are required.',
        });
        return;
      }

      const ticket = await ticketService.createTicket(userId, {
        subject,
        description,
        category,
        priority: priority || 'Medium',
      });

      res.status(201).json({ success: true, ticket });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async addReply(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;
      const { id } = req.params;
      const { message, is_internal } = req.body;

      if (!message || !message.trim()) {
        res.status(400).json({ success: false, message: 'Reply message cannot be empty.' });
        return;
      }

      // Customers cannot post internal notes
      const internalFlag = role === 'admin' ? Boolean(is_internal) : false;

      const reply = await ticketService.addReply(id, userId, message.trim(), internalFlag);
      if (!reply) {
        res.status(404).json({ success: false, message: 'Ticket not found.' });
        return;
      }

      res.status(201).json({ success: true, reply });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateTicketStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({ success: false, message: 'Status is required.' });
        return;
      }

      // Check if ticket exists and belongs to user
      const existing = await ticketService.getTicketById(id, userId, role);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Ticket not found.' });
        return;
      }

      // Customers can only mark their own tickets as 'Closed' or reopen as 'Open'
      if (role !== 'admin' && status !== 'Closed' && status !== 'Open') {
        res.status(403).json({
          success: false,
          message: 'Customers can only set ticket status to Closed or Open.',
        });
        return;
      }

      const updated = await ticketService.updateTicket(id, { status });
      res.json({ success: true, ticket: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

