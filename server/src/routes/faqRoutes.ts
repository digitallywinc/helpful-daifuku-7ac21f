import { Router } from 'express';
import { faqController } from '../controllers/faqController.js';

const router = Router();

// Publicly readable FAQs
router.get('/', faqController.getFaqs);

export default router;

