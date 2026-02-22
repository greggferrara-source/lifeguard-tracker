import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { workflow_id, orientation_datetime, attendees = [] } = await req.json();

    if (!workflow_id || !orientation_datetime) {
      return Response.json({ error: 'Missing workflow_id or orientation_datetime' }, { status: 400 });
    }

    const workflow = await base44.asServiceRole.entities.OnboardingWorkflow.read(workflow_id);
    if (!workflow) {
      return Response.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Update workflow with meeting details
    await base44.asServiceRole.entities.OnboardingWorkflow.update(workflow_id, {
      orientation_meeting_scheduled: true,
      orientation_meeting_datetime: orientation_datetime,
      checklist_items: workflow.checklist_items.map(item =>
        item.id === '2' ? { ...item, completed: true, completed_date: new Date().toISOString() } : item
      )
    });

    // Send meeting notification to employee and attendees
    const meetingDate = new Date(orientation_datetime).toLocaleString();
    const recipients = [workflow.employee_email, ...attendees.map(a => a.email)];

    for (const email of recipients) {
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: `Orientation Meeting Scheduled - ${workflow.employee_name}`,
        body: `
Orientation Meeting Scheduled

Employee: ${workflow.employee_name}
Date & Time: ${meetingDate}
Duration: 2 hours

This is an important meeting to welcome the new team member and discuss:
- Company overview and culture
- Role responsibilities
- Team introductions
- Q&A session

Please come prepared with any questions or materials.

See you then!
        `
      });
    }

    console.log(`Orientation meeting scheduled for workflow ${workflow_id} at ${orientation_datetime}`);

    return Response.json({
      success: true,
      message: 'Orientation meeting scheduled and notifications sent'
    });
  } catch (error) {
    console.error('Schedule orientation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});