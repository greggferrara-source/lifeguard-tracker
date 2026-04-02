import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all abandoned checkouts not yet emailed
    const abandoned = await base44.asServiceRole.entities.AbandonedCheckout.filter({
      email_sent: false
    }, '', 100);

    let emailsSent = 0;
    let errors = 0;

    for (const checkout of abandoned) {
      try {
        // Send recovery email via marketing trigger
        const emailResult = await base44.asServiceRole.functions.invoke('emailMarketingTrigger', {
          trigger_type: 'abandoned_checkout',
          user_email: checkout.user_email,
          user_name: checkout.user_name,
          trigger_data: {
            plan: checkout.plan_name,
            checkout_url: checkout.checkout_url
          }
        });

        if (emailResult.data?.success) {
          // Update record to mark email sent
          await base44.asServiceRole.entities.AbandonedCheckout.update(checkout.id, {
            email_sent: true,
            recovery_attempts: (checkout.recovery_attempts || 0) + 1,
            last_email_sent: new Date().toISOString()
          });
          emailsSent++;
        }
      } catch (error) {
        console.error(`Error sending email to ${checkout.user_email}:`, error);
        errors++;
      }
    }

    return Response.json({
      success: true,
      emails_sent: emailsSent,
      errors: errors,
      total_processed: abandoned.length
    });

  } catch (error) {
    console.error('Abandoned checkout email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});