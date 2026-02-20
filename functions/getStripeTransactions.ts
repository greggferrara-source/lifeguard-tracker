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

    const { limit = 50, starting_after } = await req.json().catch(() => ({}));

    // Fetch customers
    const customersResponse = await stripe.customers.list({
      limit: 100,
    });

    // Fetch invoices (payments)
    const invoicesResponse = await stripe.invoices.list({
      limit,
      starting_after,
    });

    // Fetch subscriptions
    const subscriptionsResponse = await stripe.subscriptions.list({
      limit: 100,
    });

    const transactions = invoicesResponse.data.map((invoice) => ({
      id: invoice.id,
      type: 'invoice',
      customer_email: invoice.customer_email,
      amount: invoice.amount_paid / 100,
      status: invoice.status,
      created: new Date(invoice.created * 1000).toISOString(),
      paid: invoice.paid,
    }));

    return Response.json({
      transactions,
      customers: customersResponse.data,
      subscriptions: subscriptionsResponse.data,
      has_more: invoicesResponse.has_more,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});