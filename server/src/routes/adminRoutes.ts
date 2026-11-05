import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { faqController } from '../controllers/faqController.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes
router.use(authenticateUser);
router.use(requireAdmin);

// Admin dashboard & ticket operations
router.get('/dashboard', adminController.getDashboard);
router.get('/tickets', adminController.getTickets);
router.patch('/tickets/:id', adminController.updateTicket);
router.get('/customers', adminController.getCustomers);
router.get('/conversations', adminController.getConversations);

// Admin FAQ management
router.post('/faqs', faqController.createFaq);
router.patch('/faqs/:id', faqController.updateFaq);
router.delete('/faqs/:id', faqController.deleteFaq);

export default router;

