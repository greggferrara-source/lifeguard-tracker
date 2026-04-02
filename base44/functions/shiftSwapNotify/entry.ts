import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { swap_request_id, action } = await req.json();

    const allSwaps = await base44.asServiceRole.entities.ShiftSwapRequest.list('-created_date', 500);
    const swap = allSwaps.find(s => s.id === swap_request_id);
    if (!swap) return Response.json({ error: "Swap request not found" }, { status: 404 });

    const employees = await base44.asServiceRole.entities.Employee.list();
    const requester = employees.find(e => e.id === swap.requester_employee_id);
    const target = employees.find(e => e.id === swap.target_employee_id);

    if (!requester || !target) return Response.json({ error: "Employees not found" }, { status: 404 });

    let toEmail, subject, body;

    if (action === "new_request") {
      // Notify target employee
      toEmail = target.email;
      subject = `ShiftGuard: Shift Swap Request from ${requester.first_name} ${requester.last_name}`;
      body = `Hi ${target.first_name},\n\n${requester.first_name} ${requester.last_name} is requesting to swap shifts with you.\n\nTheir shift: ${swap.requester_shift_date} ${swap.requester_shift_time} at ${swap.requester_shift_location}\nYour shift: ${swap.target_shift_date} ${swap.target_shift_time} at ${swap.target_shift_location}\n\nMessage: ${swap.requester_message || "No message provided."}\n\nPlease log in to ShiftGuard to accept or decline this request.\n\nShiftGuard Team`;
    } else if (action === "employee_accepted") {
      // Notify managers — find manager emails
      const managers = employees.filter(e => e.role === "manager" || e.role === "supervisor");
      for (const mgr of managers) {
        if (!mgr.email) continue;
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: mgr.email,
          subject: `ShiftGuard: Shift Swap Needs Approval`,
          body: `Hi ${mgr.first_name},\n\nA shift swap request has been accepted by both employees and needs your approval.\n\n${requester.first_name} ${requester.last_name}: ${swap.requester_shift_date} ${swap.requester_shift_time} at ${swap.requester_shift_location}\n${target.first_name} ${target.last_name}: ${swap.target_shift_date} ${swap.target_shift_time} at ${swap.target_shift_location}\n\nPlease log in to ShiftGuard to approve or deny.\n\nShiftGuard Team`
        });
      }
      return Response.json({ success: true, notified: managers.length });
    } else if (action === "employee_declined") {
      toEmail = requester.email;
      subject = `ShiftGuard: Your shift swap request was declined`;
      body = `Hi ${requester.first_name},\n\n${target.first_name} ${target.last_name} has declined your shift swap request.\n\nYour shift on ${swap.requester_shift_date} remains unchanged.\n\nShiftGuard Team`;
    } else if (action === "manager_approved") {
      // Notify both employees
      for (const emp of [requester, target]) {
        if (!emp.email) continue;
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: emp.email,
          subject: `ShiftGuard: Shift swap approved`,
          body: `Hi ${emp.first_name},\n\nYour shift swap between ${requester.first_name} and ${target.first_name} has been approved by a manager.\n\nPlease check your updated schedule.\n\nShiftGuard Team`
        });
      }
      return Response.json({ success: true });
    } else if (action === "manager_denied") {
      for (const emp of [requester, target]) {
        if (!emp.email) continue;
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: emp.email,
          subject: `ShiftGuard: Shift swap denied`,
          body: `Hi ${emp.first_name},\n\nThe shift swap request has been denied by a manager. ${swap.manager_notes ? `\n\nManager notes: ${swap.manager_notes}` : ""}\n\nShiftGuard Team`
        });
      }
      return Response.json({ success: true });
    }

    if (toEmail) {
      await base44.asServiceRole.integrations.Core.SendEmail({ to: toEmail, subject, body });
      await base44.asServiceRole.entities.Notification.create({
        recipient_email: toEmail,
        recipient_name: action === "new_request" ? `${target.first_name} ${target.last_name}` : `${requester.first_name} ${requester.last_name}`,
        subject, body,
        type: "email", category: "shift_assigned", status: "sent"
      });
    }
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});