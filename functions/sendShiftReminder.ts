import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

const twilio_account_sid = Deno.env.get("TWILIO_ACCOUNT_SID");
const twilio_auth_token = Deno.env.get("TWILIO_AUTH_TOKEN");
const twilio_phone_number = Deno.env.get("TWILIO_PHONE_NUMBER");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || !["admin", "site_owner", "manager"].includes(user.role)) {
      return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { shift_id } = await req.json();

    if (!shift_id) {
      return Response.json({ error: "shift_id required" }, { status: 400 });
    }

    // Fetch shift details
    const shift = await base44.entities.Shift.list();
    const targetShift = shift.find(s => s.id === shift_id);

    if (!targetShift) {
      return Response.json({ error: "Shift not found" }, { status: 404 });
    }

    // Fetch employee phone
    const employees = await base44.entities.Employee.list();
    const employee = employees.find(e => e.id === targetShift.employee_id);

    if (!employee || !employee.phone) {
      console.log(`No phone number for employee ${employee?.first_name}`);
      return Response.json({ success: true, skipped: "No phone number" });
    }

    // Format message
    const message = `Hi ${employee.first_name}, you have a shift tomorrow at ${targetShift.start_time} - ${targetShift.end_time} at ${targetShift.location_name}. Reply CONFIRM to acknowledge.`;

    // Send SMS via Twilio
    const auth = btoa(`${twilio_account_sid}:${twilio_auth_token}`);
    const params = new URLSearchParams();
    params.append("From", twilio_phone_number);
    params.append("To", employee.phone);
    params.append("Body", message);

    const smsResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilio_account_sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      }
    );

    if (!smsResponse.ok) {
      const error = await smsResponse.text();
      console.error("Twilio error:", error);
      return Response.json({ error: "Failed to send SMS" }, { status: 500 });
    }

    const result = await smsResponse.json();
    console.log(`Shift reminder sent to ${employee.phone} for shift ${shift_id}`);

    return Response.json({ 
      success: true, 
      message_sid: result.sid,
      phone: employee.phone 
    });
  } catch (error) {
    console.error("Send shift reminder error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});