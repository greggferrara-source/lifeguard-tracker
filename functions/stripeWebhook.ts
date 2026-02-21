import Stripe from "npm:stripe@14";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
if (!stripeKey || !stripeKey.startsWith("sk_")) {
  console.error("Invalid Stripe key in webhook handler");
}
const stripe = new Stripe(stripeKey);

Deno.serve(async (req) => {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("Checkout completed:", session.id, "customer:", session.customer_email);
        console.log("Metadata:", JSON.stringify(session.metadata));
        break;
      }
      case "customer.subscription.created": {
        const sub = event.data.object;
        console.log("Subscription created:", sub.id, "status:", sub.status);
        const email = sub.billing_details?.email || sub.metadata?.user_email;
        if (email) {
          try {
            await base44.asServiceRole.entities.UserSubscription.create({
              user_email: email,
              stripe_customer_id: sub.customer,
              stripe_subscription_id: sub.id,
              plan_name: sub.metadata?.plan_name || "unknown",
              status: sub.status,
              current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
              current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
              last_synced: new Date().toISOString(),
            });
            console.log("UserSubscription created for:", email);
          } catch (err) {
            console.error("Failed to create UserSubscription:", err.message);
            await base44.asServiceRole.entities.SystemLog.create({
              type: "error",
              category: "subscription",
              message: `Failed to create subscription record for ${email}`,
              context: err.message,
            });
          }
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object;
        console.log("Subscription updated:", sub.id, "status:", sub.status);
        try {
          const subs = await base44.asServiceRole.entities.UserSubscription.filter({ stripe_subscription_id: sub.id });
          if (subs.length > 0) {
            await base44.asServiceRole.entities.UserSubscription.update(subs[0].id, {
              status: sub.status,
              current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
              current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
              last_synced: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error("Failed to update subscription:", err.message);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        console.log("Subscription cancelled:", sub.id);
        try {
          const subs = await base44.asServiceRole.entities.UserSubscription.filter({ stripe_subscription_id: sub.id });
          if (subs.length > 0) {
            await base44.asServiceRole.entities.UserSubscription.update(subs[0].id, {
              status: "canceled",
              canceled_at: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error("Failed to cancel subscription:", err.message);
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object;
        console.log("Invoice paid:", invoice.id, "amount:", invoice.amount_paid);
        break;
      }
      default:
        console.log("Unhandled event type:", event.type);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error.message);
    await base44.asServiceRole.entities.SystemLog.create({
      type: "error",
      category: "webhook",
      message: `Stripe webhook processing failed: ${error.message}`,
      context: JSON.stringify(event),
    }).catch(e => console.error("Failed to log error:", e.message));
    return Response.json({ error: error.message }, { status: 500 });
  }
});