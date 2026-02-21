import Stripe from "npm:stripe@14";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

Deno.serve(async (req) => {
  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey || !stripeKey.startsWith("sk_")) {
      console.error("Invalid or missing STRIPE_SECRET_KEY");
      return Response.json({ error: "Stripe not configured properly" }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey);
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { price_id, success_url, cancel_url, plan } = await req.json();

    if (!price_id) {
      return Response.json({ error: "price_id is required" }, { status: 400 });
    }

    // Map price_id to plan for transaction tracking
    const priceMap = {
      'price_1QqglnEQXZ5k6pTKIoQpJEI4': 'enterprise_monthly',
      'price_1QqglnEQXZ5k6pTKu8M8M2Bz': 'enterprise_annual',
      'price_1QqglnEQXZ5k6pTKL7hN3X5e': 'pro_monthly',
      'price_1QqglnEQXZ5k6pTKv5wK4Y9j': 'pro_annual',
    };
    const planLabel = plan || priceMap[price_id] || 'unknown';

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: price_id, quantity: 1 }],
      customer_email: user.email,
      success_url: success_url || `${req.headers.get("origin")}/`,
      cancel_url: cancel_url || `${req.headers.get("origin")}/`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        user_email: user.email,
        user_id: user.id,
        plan: planLabel,
      },
    });

    console.log("Checkout session created:", session.id, "for user:", user.email);
    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error("Checkout error:", error.message, error.status);
    console.error("Full error:", error);
    return Response.json({ error: "Failed to create checkout session. Please try again." }, { status: 500 });
  }
});