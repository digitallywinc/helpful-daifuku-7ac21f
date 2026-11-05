import { Router } from 'express';
import authRoutes from './authRoutes.js';
import chatRoutes from './chatRoutes.js';
import ticketRoutes from './ticketRoutes.js';
import adminRoutes from './adminRoutes.js';
import faqRoutes from './faqRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'HelpDesk AI Backend',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/tickets', ticketRoutes);
router.use('/admin', adminRoutes);
router.use('/faqs', faqRoutes);
router.use('/notifications', notificationRoutes);

export default router;

