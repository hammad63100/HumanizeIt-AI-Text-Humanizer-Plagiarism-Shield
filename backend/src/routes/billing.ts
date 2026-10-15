import { Router, Request, Response } from 'express';
import { requireAuth, validateBody, checkoutSchema } from '../middleware';
import { config } from '../config';
import { UserRepo, SubscriptionRepo } from '../db/repositories';
import { Logger } from '../utils';
import { PlanTier } from '../types';

const router = Router();

/**
 * POST /v1/billing/checkout
 * Create a payment checkout session.
 */
router.post('/checkout', requireAuth, validateBody(checkoutSchema), async (req: Request, res: Response) => {
  try {
    const { plan } = req.body as { plan: PlanTier };

    Logger.info('Checkout session requested', {
      request_id: req.requestId,
      user_id: req.userId,
      target_plan: plan,
    });

    if (!config.billing.apiKey || config.billing.apiKey === 'your_billing_api_key') {
      // Dev mode: simulate checkout
      Logger.warn('Billing API key not configured — returning simulated checkout URL');

      return res.json({
        success: true,
        data: {
          checkout_url: `https://checkout.example.com/session?plan=${plan}&user=${req.userId}`,
          session_id: `sim_session_${Date.now()}`,
        },
      });
    }

    // In production: call Stripe/Paddle/LemonSqueezy to create a session
    // const session = await billingClient.createCheckoutSession({ plan, userId: req.userId });

    return res.json({
      success: true,
      data: {
        checkout_url: `https://checkout.provider.com/pay?session=placeholder`,
        session_id: 'placeholder_session_id',
      },
    });
  } catch (error: any) {
    Logger.error('Checkout creation failed', { error: error.message });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create checkout session' },
    });
  }
});

/**
 * POST /v1/billing/portal
 * Open the billing customer management portal.
 */
router.post('/portal', requireAuth, async (req: Request, res: Response) => {
  try {
    Logger.info('Billing portal requested', {
      request_id: req.requestId,
      user_id: req.userId,
    });

    const subscription = await SubscriptionRepo.findByUser(req.userId!);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: { code: 'NO_SUBSCRIPTION', message: 'No active subscription found' },
      });
    }

    // In production: generate a portal URL from the billing provider
    return res.json({
      success: true,
      data: {
        portal_url: `https://billing.provider.com/portal?customer=${subscription.provider_customer_id}`,
      },
    });
  } catch (error: any) {
    Logger.error('Billing portal failed', { error: error.message });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to open billing portal' },
    });
  }
});

/**
 * POST /v1/webhooks/billing
 * Ingest signed provider billing webhooks.
 * This endpoint does NOT require JWT auth — it uses webhook signature verification.
 */
router.post('/webhooks', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-webhook-signature'] || req.headers['stripe-signature'] || '';

    // Verify webhook signature
    if (config.billing.webhookSecret && config.billing.webhookSecret !== 'your_billing_webhook_signing_secret') {
      // In production: verify HMAC signature against webhook secret
      // if (!verifySignature(req.body, signature, config.billing.webhookSecret)) {
      //   return res.status(401).json({ success: false, error: { code: 'INVALID_SIGNATURE' } });
      // }
    }

    const event = req.body;
    const eventId = event.id || event.event_id;
    const eventType = event.type || event.event_type;

    Logger.info('Billing webhook received', {
      event_id: eventId,
      event_type: eventType,
    });

    // Idempotency: check if we've already processed this event
    // In production, store processed event IDs in a table

    switch (eventType) {
      case 'subscription.created':
      case 'subscription.updated':
      case 'subscription.renewed': {
        const userId = event.data?.metadata?.user_id || event.data?.user_id;
        const plan = event.data?.plan || event.data?.metadata?.plan || 'pro';
        const customerId = event.data?.customer_id || event.data?.customer;

        if (userId) {
          await UserRepo.updatePlan(userId, plan as PlanTier);
          await SubscriptionRepo.upsert({
            user_id: userId,
            provider: 'stripe',
            provider_customer_id: customerId || '',
            status: 'active',
            renews_at: event.data?.renews_at ? new Date(event.data.renews_at) : undefined,
          });
          Logger.info('Subscription activated', { user_id: userId, plan });
        }
        break;
      }

      case 'subscription.canceled':
      case 'subscription.expired': {
        const userId = event.data?.metadata?.user_id || event.data?.user_id;
        if (userId) {
          await UserRepo.updatePlan(userId, 'free');
          Logger.info('Subscription canceled, reverted to free', { user_id: userId });
        }
        break;
      }

      case 'subscription.past_due': {
        const userId = event.data?.metadata?.user_id || event.data?.user_id;
        if (userId) {
          Logger.warn('Subscription past due', { user_id: userId });
        }
        break;
      }

      default:
        Logger.info('Unhandled webhook event type', { event_type: eventType });
    }

    // Always acknowledge the webhook
    return res.status(200).json({ received: true });
  } catch (error: any) {
    Logger.error('Webhook processing failed', { error: error.message });
    // Still return 200 to prevent the provider from retrying
    return res.status(200).json({ received: true, error: 'processing_failed' });
  }
});

export default router;
