import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@16.0.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

Deno.serve(async (req) => {
  try {
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    // Verify webhook signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return Response.json({ error: "Invalid signature" }, { status: 403 });
    }

    const base44 = createClientFromRequest(req);

    // Handle subscription events
    const handled = {
      "customer.subscription.created": async (evt) => {
        const subscription = evt.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        
        await base44.asServiceRole.entities.UserSubscription.create({
          user_email: customer.email,
          stripe_customer_id: subscription.customer,
          stripe_subscription_id: subscription.id,
          plan_name: subscription.items.data[0]?.price?.metadata?.plan_name || "pro",
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          last_synced: new Date().toISOString()
        });
        console.log(`Subscription created for ${customer.email}`);
      },

      "customer.subscription.updated": async (evt) => {
        const subscription = evt.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        
        // Find and update existing subscription
        const existing = await base44.asServiceRole.entities.UserSubscription.filter({
          stripe_subscription_id: subscription.id
        });

        if (existing.length > 0) {
          await base44.asServiceRole.entities.UserSubscription.update(existing[0].id, {
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
            last_synced: new Date().toISOString()
          });
          console.log(`Subscription updated for ${customer.email}`);
        }
      },

      "customer.subscription.deleted": async (evt) => {
        const subscription = evt.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        
        // Find and update subscription status
        const existing = await base44.asServiceRole.entities.UserSubscription.filter({
          stripe_subscription_id: subscription.id
        });

        if (existing.length > 0) {
          await base44.asServiceRole.entities.UserSubscription.update(existing[0].id, {
            status: "canceled",
            canceled_at: new Date().toISOString(),
            last_synced: new Date().toISOString()
          });
          console.log(`Subscription canceled for ${customer.email}`);
        }
      }
    };

    // Execute handler if exists
    if (handled[event.type]) {
      await handled[event.type](event);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});