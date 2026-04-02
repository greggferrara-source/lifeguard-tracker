import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get tomorrow's date in YYYY-MM-DD format
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Fetch all shifts scheduled for tomorrow
    const shiftsForTomorrow = await base44.asServiceRole.entities.Shift.filter(
      { date: tomorrowStr, status: { $in: ['scheduled', 'completed'] } },
      '-created_date',
      1000
    );

    if (!shiftsForTomorrow || shiftsForTomorrow.length === 0) {
      return Response.json({ message: 'No shifts found for tomorrow', count: 0 });
    }

    // Get employees and locations for context
    const employees = await base44.asServiceRole.entities.Employee.list('-created_date', 1000);
    const locations = await base44.asServiceRole.entities.Location.list('-created_date', 1000);
    const employeeMap = Object.fromEntries(employees.map(e => [e.id, e]));
    const locationMap = Object.fromEntries(locations.map(l => [l.id, l]));

    // Get Gmail connection
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    let sentCount = 0;
    const errors = [];

    // Send email for each shift
    for (const shift of shiftsForTomorrow) {
      try {
        const employee = employeeMap[shift.employee_id];
        const location = locationMap[shift.location_id];

        if (!employee || !employee.email) {
          errors.push(`No email for employee ${shift.employee_id}`);
          continue;
        }

        const emailSubject = `Shift Reminder: ${shift.date} at ${shift.location_name || location?.name || 'Location'}`;
        const emailBody = `
Hi ${employee.name || employee.full_name},

This is a reminder that you have a scheduled shift tomorrow:

📍 Location: ${shift.location_name || location?.name || 'TBD'}
🕐 Time: ${shift.start_time} - ${shift.end_time}
📅 Date: ${shift.date}

${location?.address ? `Address: ${location.address}\n` : ''}

Please arrive 15 minutes early. If you need to swap shifts or request time off, please use the Employee Dashboard.

Thank you!
        `.trim();

        // Send via Gmail API
        const message = Buffer.from(
          `To: ${employee.email}\r\nSubject: ${emailSubject}\r\n\r\n${emailBody}`
        ).toString('base64');

        const gmailRes = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: message }),
        });

        if (!gmailRes.ok) {
          const err = await gmailRes.text();
          errors.push(`Gmail API error for ${employee.email}: ${err}`);
          continue;
        }

        sentCount++;
      } catch (error) {
        errors.push(`Error sending reminder for shift ${shift.id}: ${error.message}`);
      }
    }

    return Response.json({
      message: `Shift reminders sent successfully`,
      sentCount,
      totalShifts: shiftsForTomorrow.length,
      errors: errors.length > 0 ? errors : null,
    });
  } catch (error) {
    console.error('sendShiftReminders error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});