import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const bills = await base44.asServiceRole.entities.Bill.list('-due_date', 500);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const in3Days = new Date(today);
    in3Days.setDate(in3Days.getDate() + 3);

    const upcoming = [];
    const overdue = [];

    for (const bill of bills) {
      if (!bill.due_date || bill.status === 'paid' || bill.status === 'cancelled') continue;
      const due = new Date(bill.due_date);
      due.setHours(0, 0, 0, 0);

      if (due < today) {
        overdue.push(bill);
      } else if (due <= in3Days) {
        upcoming.push(bill);
      }
    }

    // Get all admin users to notify
    const users = await base44.asServiceRole.entities.User.list();
    const admins = users.filter(u => u.role === 'admin' && u.email);

    const sent = [];

    for (const admin of admins) {
      if (upcoming.length > 0) {
        const billList = upcoming.map(b =>
          `• ${b.vendor_name} — $${(b.amount || 0).toFixed(2)} due ${b.due_date}${b.description ? ` (${b.description})` : ''}`
        ).join('\n');

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: admin.email,
          subject: `⚠️ ${upcoming.length} Bill(s) Due Within 3 Days`,
          body: `Hello ${admin.full_name || ''},\n\nThe following bills are due within the next 3 days:\n\n${billList}\n\nPlease review and arrange payment as needed.\n\nLifeGuard Tracker Billing`
        });
        sent.push({ type: 'upcoming', to: admin.email, count: upcoming.length });
      }

      if (overdue.length > 0) {
        const billList = overdue.map(b =>
          `• ${b.vendor_name} — $${(b.amount || 0).toFixed(2)} was due ${b.due_date}${b.description ? ` (${b.description})` : ''}`
        ).join('\n');

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: admin.email,
          subject: `🚨 ${overdue.length} Overdue Bill(s) Require Attention`,
          body: `Hello ${admin.full_name || ''},\n\nThe following bills are OVERDUE and still unpaid:\n\n${billList}\n\nPlease take immediate action to resolve these outstanding bills.\n\nLifeGuard Tracker Billing`
        });
        sent.push({ type: 'overdue', to: admin.email, count: overdue.length });
      }
    }

    console.log(`Bill reminders sent: ${JSON.stringify(sent)}`);
    return Response.json({ success: true, sent, upcoming: upcoming.length, overdue: overdue.length });
  } catch (error) {
    console.error('billReminders error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});