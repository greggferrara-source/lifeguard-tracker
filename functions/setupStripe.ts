import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.14.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

const plans = [
  {
    id: "starter",
    name: "Starter Plan",
    prices: {
      monthly: { amount: 4900, interval: "month" },
      annual: { amount: 39 * 12 * 100, interval: "year" }
    }
  },
  {
    id: "pro",
    name: "Pro Plan",
    prices: {
      monthly: { amount: 12900, interval: "month" },
      annual: { amount: 99 * 12 * 100, interval: "year" }
    }
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    prices: {
      monthly: { amount: 29900, interval: "month" },
      annual: { amount: 239 * 12 * 100, interval: "year" }
    }
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const results = {};

    for (const plan of plans) {
      try {
        // Create product
        const product = await stripe.products.create({
          id: plan.id,
          name: plan.name,
          type: "service"
        });

        results[plan.id] = { product: product.id, prices: {} };

        // Create monthly price
        const monthlyPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: plan.prices.monthly.amount,
          currency: "usd",
          recurring: {
            interval: plan.prices.monthly.interval,
            interval_count: 1
          }
        });

        results[plan.id].prices.monthly = monthlyPrice.id;

        // Create annual price
        const annualPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: plan.prices.annual.amount,
          currency: "usd",
          recurring: {
            interval: plan.prices.annual.interval,
            interval_count: 1
          }
        });

        results[plan.id].prices.annual = annualPrice.id;

      } catch (error) {
        console.error(`Error creating plan ${plan.id}:`, error.message);
        results[plan.id] = { error: error.message };
      }
    }

    return Response.json({
      success: true,
      message: "Stripe products and prices created successfully",
      results,
      nextSteps: "Update the PRICE_IDS object in pages/Pricing.jsx with the price IDs above"
    });

  } catch (error) {
    console.error("Setup error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});