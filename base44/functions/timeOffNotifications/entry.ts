import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { timeoff_request_id, action } = body;

    if (!timeoff_request_id || !action) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Handle "submitted" with "new" placeholder gracefully
    if (timeoff_request_id === "new") {
      return Response.json({ success: true, skipped: true });
    }

    const request = await base44.asServiceRole.entities.TimeOffRequest.filter({ id: timeoff_request_id });
    if (!request.length) {
      return Response.json({ error: 'Request not found' }, { status: 404 });
    }

    const timeoffReq = request[0];
    const employee = await base44.asServiceRole.entities.Employee.filter({ id: timeoffReq.employee_id });
    if (!employee.length) {
      return Response.json({ error: 'Employee not found' }, { status: 404 });
    }

    const emp = employee[0];
    const empEmail = emp.email;
    const empPhone = emp.phone;

    let subject = '';
    let body_text = '';

    if (action === 'approved') {
      subject = 'Time Off Request Approved';
      body_text = `Your time off request from ${timeoffReq.start_date} to ${timeoffReq.end_date} has been approved.`;
    } else if (action === 'denied') {
      subject = 'Time Off Request Denied';
      body_text = `Your time off request from ${timeoffReq.start_date} to ${timeoffReq.end_date} has been denied.`;
    } else if (action === 'submitted') {
      subject = 'Time Off Request Submitted';
      body_text = `Your time off request from ${timeoffReq.start_date} to ${timeoffReq.end_date} has been submitted for approval.`;
    }

    if (empEmail) {
      await base44.integrations.Core.SendEmail({
        to: empEmail,
        subject,
        body: body_text
      });
    }

    return Response.json({ success: true, notified: !!empEmail });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});