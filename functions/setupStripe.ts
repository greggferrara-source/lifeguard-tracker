import Stripe from 'npm:stripe@16.0.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    console.log('Starting Stripe setup...');

    // Create Starter plan product
    const starterProduct = await stripe.products.create({
      name: 'Starter Plan',
      description: 'Basic lifeguard scheduling for small teams',
    });

    const starterMonthly = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 2900,
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });

    const starterAnnual = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 29000,
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
    });

    // Create Pro plan product
    const proProduct = await stripe.products.create({
      name: 'Pro Plan',
      description: 'Advanced scheduling with analytics and reporting',
    });

    const proMonthly = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 9900,
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });

    const proAnnual = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 99000,
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
    });

    // Create Enterprise plan product
    const enterpriseProduct = await stripe.products.create({
      name: 'Enterprise Plan',
      description: 'Custom solutions for large organizations',
    });

    const enterpriseMonthly = await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 49900,
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });

    const enterpriseAnnual = await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 499000,
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
    });

    const result = {
      success: true,
      products: {
        starter: {
          id: starterProduct.id,
          monthly: starterMonthly.id,
          annual: starterAnnual.id,
        },
        pro: {
          id: proProduct.id,
          monthly: proMonthly.id,
          annual: proAnnual.id,
        },
        enterprise: {
          id: enterpriseProduct.id,
          monthly: enterpriseMonthly.id,
          annual: enterpriseAnnual.id,
        },
      },
    };

    console.log('Stripe setup completed:', JSON.stringify(result, null, 2));
    return Response.json(result);
  } catch (error) {
    console.error('Stripe setup error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});