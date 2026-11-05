import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

router.get('/profile', authenticateUser, authController.getProfile);
router.put('/profile', authenticateUser, authController.updateProfile);

export default router;

