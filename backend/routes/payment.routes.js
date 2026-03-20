import express from 'express';
const router = express.Router();
import * as paymentController from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

router.get('/plans', paymentController.getPlans);
router.post('/create-order', authenticate, paymentController.createOrder);
router.post('/verify', authenticate, paymentController.verifyPayment);
router.get('/subscription', authenticate, paymentController.getSubscription);
router.post('/cancel-subscription', authenticate, paymentController.cancelSubscription);
router.post('/webhook', paymentController.handleWebhook);

export default router;
