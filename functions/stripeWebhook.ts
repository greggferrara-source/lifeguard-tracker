import Stripe from "npm:stripe@14";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

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
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object;
        console.log("Subscription updated:", sub.id, "status:", sub.status);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        console.log("Subscription cancelled:", sub.id);
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
    return Response.json({ error: error.message }, { status: 500 });
  }
});