import { Request, Response } from 'express';
import { faqService } from '../services/faqService.js';
import { AuthenticatedRequest } from '../types/index.js';

export const faqController = {
  async getFaqs(req: Request, res: Response): Promise<void> {
    try {
      const { category, search, all } = req.query;
      const onlyPublished = all !== 'true';

      const faqs = await faqService.getAllFaqs(
        onlyPublished,
        category as string,
        search as string
      );

      res.json({ success: true, count: faqs.length, faqs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async createFaq(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { question, answer, category, is_published } = req.body;

      if (!question || !answer || !category) {
        res.status(400).json({
          success: false,
          message: 'Question, answer, and category are required.',
        });
        return;
      }

      const created = await faqService.createFaq({
        question,
        answer,
        category,
        is_published,
      });

      res.status(201).json({ success: true, faq: created });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateFaq(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updated = await faqService.updateFaq(id, updates);
      if (!updated) {
        res.status(404).json({ success: false, message: 'FAQ not found' });
        return;
      }

      res.json({ success: true, faq: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async deleteFaq(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await faqService.deleteFaq(id);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'FAQ not found' });
        return;
      }

      res.json({ success: true, message: 'FAQ deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

