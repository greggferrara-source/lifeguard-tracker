import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_email, user_name, plan_name, checkout_url } = await req.json();
    
    if (!user_email) {
      return Response.json({ error: 'User email required' }, { status: 400 });
    }

    // Create abandoned checkout record
    const abandon_record = await base44.asServiceRole.entities.AbandonedCheckout.create({
      user_email: user_email,
      user_name: user_name || 'Unknown',
      plan_name: plan_name || 'Unknown',
      checkout_url: checkout_url,
      abandoned_at: new Date().toISOString(),
      email_sent: false,
      recovery_attempts: 0
    });

    console.log(`Checkout abandoned: ${user_email} - ${plan_name}`);

    return Response.json({ 
      success: true, 
      message: 'Checkout abandonment tracked',
      record_id: abandon_record.id
    });

  } catch (error) {
    console.error('Checkout tracking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});