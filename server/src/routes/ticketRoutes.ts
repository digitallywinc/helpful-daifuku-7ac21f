import { Router } from 'express';
import { ticketController } from '../controllers/ticketController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

router.use(authenticateUser);

router.get('/', ticketController.getTickets);
router.post('/', ticketController.createTicket);
router.get('/:id', ticketController.getTicket);
router.post('/:id/replies', ticketController.addReply);
router.patch('/:id/status', ticketController.updateTicketStatus);

export default router;

