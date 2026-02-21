import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins/facility managers can invite
    if (user.role !== 'admin' && user.role !== 'facility_manager') {
      return Response.json({ error: 'Forbidden: Only facility managers can invite employees' }, { status: 403 });
    }

    const { employee_email, employee_name } = await req.json();

    if (!employee_email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Invite the user with employee role
    await base44.users.inviteUser(employee_email, 'user');

    // Log the invitation in a notifications/audit log if needed
    console.log(`[Invite] ${user.email} invited ${employee_email} to their facility`);

    return Response.json({
      success: true,
      message: `Invitation sent to ${employee_email}`,
      invited_email: employee_email,
    });
  } catch (error) {
    console.error('[inviteEmployee] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});