import { Router } from 'express';
import { chatController } from '../controllers/chatController.js';
import { authenticateUser } from '../middleware/auth.js';
import { aiChatLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authenticateUser);

router.get('/conversations', chatController.getConversations);
router.get('/conversations/:id', chatController.getConversation);
router.post('/message', aiChatLimiter, chatController.sendMessage);
router.delete('/conversations/:id', chatController.deleteConversation);

export default router;

