import Razorpay from 'razorpay';
import crypto from 'crypto';
import Subscription from '../models/Subscription.model.js';
import User from '../models/User.model.js';
import logger from '../utils/logger.js';
import dotenv from "dotenv";
dotenv.config();
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Pricing plans
const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    duration: 365, // days
    features: {
      maxCredentials: 10,
      maxSkills: 20,
      aiRecommendations: false,
      prioritySupport: false,
      customBranding: false,
      apiAccess: false,
      analytics: false,
    },
  },
  pro: {
    name: 'Pro',
    price: 999, // INR per month
    duration: 30,
    features: {
      maxCredentials: 100,
      maxSkills: 100,
      aiRecommendations: true,
      prioritySupport: true,
      customBranding: false,
      apiAccess: true,
      analytics: true,
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 4999, // INR per month
    duration: 30,
    features: {
      maxCredentials: -1, // unlimited
      maxSkills: -1, // unlimited
      aiRecommendations: true,
      prioritySupport: true,
      customBranding: true,
      apiAccess: true,
      analytics: true,
    },
  },
};

// GET /payment/plans
export const getPlans = async (req, res, next) => {
  try {
    res.json({ plans: PLANS });
  } catch (error) {
    next(error);
  }
};

// POST /payment/create-order
export const createOrder = async (req, res, next) => {
  try {
    const { plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    if (plan === 'free') {
      return res.status(400).json({ error: 'Free plan does not require payment' });
    }

    const planDetails = PLANS[plan];
    const amount = planDetails.price * 100; // Convert to paise

    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user.userId,
        plan,
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    logger.error('Create order error:', error);
    next(error);
  }
};

// POST /payment/verify
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Cancel existing active subscriptions
    await Subscription.updateMany(
      { userId: req.user.userId, status: 'active' },
      { status: 'cancelled' }
    );

    // Create new subscription
    const planDetails = PLANS[plan];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + planDetails.duration);

    const subscription = await Subscription.create({
      userId: req.user.userId,
      plan,
      status: 'active',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      amount: planDetails.price,
      currency: 'INR',
      startDate: new Date(),
      endDate,
      features: planDetails.features,
    });

    // Update user subscription reference
    await User.findByIdAndUpdate(req.user.userId, {
      currentSubscription: subscription._id,
    });

    res.json({
      success: true,
      message: 'Payment verified and subscription activated',
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        endDate: subscription.endDate,
      },
    });
  } catch (error) {
    logger.error('Verify payment error:', error);
    next(error);
  }
};

// GET /payment/subscription
export const getSubscription = async (req, res, next) => {
  try {
    let subscription = await Subscription.findOne({
      userId: req.user.userId,
      status: 'active',
    }).sort({ createdAt: -1 });

    // If no active subscription, create free plan
    if (!subscription) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 365);

      subscription = await Subscription.create({
        userId: req.user.userId,
        plan: 'free',
        status: 'active',
        amount: 0,
        endDate,
        features: PLANS.free.features,
      });
    }

    // Check if expired
    if (subscription.endDate < new Date()) {
      subscription.status = 'expired';
      await subscription.save();
    }

    // Get usage stats
    const Credential = (await import('../models/Credential.model.js')).default;
    const credentialCount = await Credential.countDocuments({ userId: req.user.userId });

    res.json({ 
      subscription,
      usage: {
        credentials: credentialCount,
        maxCredentials: subscription.features.maxCredentials,
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /payment/cancel-subscription
export const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user.userId,
      status: 'active',
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

// POST /payment/webhook (Razorpay webhook)
export const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    logger.info('Razorpay webhook received:', event);

    // Handle different events
    switch (event) {
      case 'payment.captured':
        // Payment successful
        logger.info('Payment captured:', payload.payment.entity.id);
        break;

      case 'payment.failed':
        // Payment failed
        logger.warn('Payment failed:', payload.payment.entity.id);
        break;

      case 'subscription.cancelled':
        // Subscription cancelled
        const subId = payload.subscription.entity.id;
        await Subscription.updateOne(
          { razorpaySubscriptionId: subId },
          { status: 'cancelled' }
        );
        break;

      default:
        logger.info('Unhandled webhook event:', event);
    }

    res.json({ status: 'ok' });
  } catch (error) {
    logger.error('Webhook error:', error);
    next(error);
  }
};

export default {
  getPlans,
  createOrder,
  verifyPayment,
  getSubscription,
  cancelSubscription,
  handleWebhook,
};
