import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { swap_request_id, action } = body;

    if (!swap_request_id || !action) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const swaps = await base44.asServiceRole.entities.ShiftSwapRequest.filter({ id: swap_request_id });
    if (!swaps.length) {
      return Response.json({ error: 'Swap request not found' }, { status: 404 });
    }

    const swap = swaps[0];
    const requesterEmps = await base44.asServiceRole.entities.Employee.filter({ id: swap.requester_employee_id });
    const targetEmps = await base44.asServiceRole.entities.Employee.filter({ id: swap.target_employee_id });

    if (!requesterEmps.length || !targetEmps.length) {
      return Response.json({ error: 'Employee not found' }, { status: 404 });
    }

    const requester = requesterEmps[0];
    const target = targetEmps[0];

    let requesterSubject = '';
    let requesterBody = '';
    let targetSubject = '';
    let targetBody = '';

    const shiftInfo = `${swap.requester_shift_date} ${swap.requester_shift_time} at ${swap.requester_shift_location}`;

    if (action === 'employee_accepted') {
      targetSubject = 'Shift Swap Request Pending Manager Review';
      targetBody = `${requester.first_name} ${requester.last_name} has accepted your shift swap request. Your manager will review the request.`;
    } else if (action === 'employee_declined') {
      requesterSubject = 'Shift Swap Request Declined';
      requesterBody = `${target.first_name} ${target.last_name} has declined your shift swap request.`;
    } else if (action === 'manager_approved') {
      requesterSubject = 'Shift Swap Approved';
      requesterBody = `Your shift swap with ${target.first_name} ${target.last_name} has been approved. The shifts have been automatically updated in the schedule.`;
      targetSubject = 'Shift Swap Approved';
      targetBody = `Your shift swap with ${requester.first_name} ${requester.last_name} has been approved by your manager. The shifts have been automatically updated in the schedule.`;
    } else if (action === 'manager_denied') {
      requesterSubject = 'Shift Swap Denied';
      requesterBody = `Your shift swap request with ${target.first_name} ${target.last_name} has been denied by your manager.`;
      targetSubject = 'Shift Swap Denied';
      targetBody = `The shift swap request from ${requester.first_name} ${requester.last_name} has been denied by the manager.`;
    }

    const promises = [];

    if (requesterSubject && requester.email) {
      promises.push(
        base44.integrations.Core.SendEmail({
          to: requester.email,
          subject: requesterSubject,
          body: requesterBody,
        })
      );
    }

    if (targetSubject && target.email) {
      promises.push(
        base44.integrations.Core.SendEmail({
          to: target.email,
          subject: targetSubject,
          body: targetBody,
        })
      );
    }

    await Promise.all(promises);

    return Response.json({ success: true, notified: promises.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});