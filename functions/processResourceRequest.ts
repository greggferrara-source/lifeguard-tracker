import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { request_id } = await req.json();

    if (!request_id) {
      return Response.json({ error: 'Missing request_id' }, { status: 400 });
    }

    const request = await base44.asServiceRole.entities.ResourceRequest.read(request_id);
    if (!request) {
      return Response.json({ error: 'Request not found' }, { status: 404 });
    }

    // If already processed, skip
    if (request.status !== 'pending') {
      return Response.json({ message: 'Request already processed' });
    }

    // Try auto-approval
    const approvalRes = await base44.functions.invoke('autoApproveResourceRequest', {
      request_id
    });

    if (approvalRes.approved) {
      // Send confirmation notification
      await base44.integrations.Core.SendEmail({
        to: request.requested_by_email,
        subject: `Resource Request Auto-Approved: ${request.resource_name}`,
        body: `Your booking request for ${request.resource_name} on ${request.start_date} has been automatically approved (no conflicts detected).`
      });

      console.log(`Resource request ${request_id} auto-approved and user notified`);
    } else {
      // Send notification about conflict
      await base44.integrations.Core.SendEmail({
        to: request.requested_by_email,
        subject: `Resource Request Pending Review: ${request.resource_name}`,
        body: `Your booking request for ${request.resource_name} has scheduling conflicts and requires manual approval.`
      });

      console.log(`Resource request ${request_id} has conflicts, waiting for manual approval`);
    }

    return Response.json(approvalRes);
  } catch (error) {
    console.error('Process request error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});