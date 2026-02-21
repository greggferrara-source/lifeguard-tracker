import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reason } = await req.json();

    // Log the deletion request (in production, store this in a DataDeletionRequest entity)
    console.log(`[Data Deletion Request] User: ${user.email}, Reason: ${reason || 'No reason provided'}`);

    // Send confirmation email to user
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: 'Data Deletion Request Received',
      body: `We have received your request to delete your account and associated data. Our team will process this within 30 days in accordance with our privacy policy. You will receive a confirmation email once the process is complete.`,
    });

    return Response.json({
      success: true,
      message: 'Data deletion request submitted. You will receive a confirmation email shortly.',
    });
  } catch (error) {
    console.error('[requestDataDeletion] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});