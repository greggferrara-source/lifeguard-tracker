import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { shift_id } = await req.json();

    if (!shift_id) {
      return Response.json({ error: "shift_id required" }, { status: 400 });
    }

    // Fetch shift, employee, and all shifts for that week
    const [shifts, employees] = await Promise.all([
      base44.entities.Shift.list(),
      base44.entities.Employee.list()
    ]);

    const shift = shifts.find(s => s.id === shift_id);
    if (!shift) {
      return Response.json({ error: "Shift not found" }, { status: 404 });
    }

    const employee = employees.find(e => e.id === shift.employee_id);
    if (!employee || !employee.hourly_rate) {
      return Response.json({ success: true, skipped: "No hourly rate" });
    }

    // Calculate shift hours and cost
    const [startHour, startMin] = shift.start_time.split(":").map(Number);
    const [endHour, endMin] = shift.end_time.split(":").map(Number);
    const shiftHours = (endHour + endMin / 60) - (startHour + startMin / 60);
    const shiftCost = shiftHours * employee.hourly_rate;

    // Get week boundaries
    const shiftDate = new Date(shift.date);
    const dayOfWeek = shiftDate.getDay();
    const weekStart = new Date(shiftDate);
    weekStart.setDate(shiftDate.getDate() - dayOfWeek);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // Calculate total hours for employee this week
    const weekShifts = shifts.filter(s => 
      s.employee_id === shift.employee_id &&
      new Date(s.date) >= weekStart &&
      new Date(s.date) <= weekEnd &&
      s.status !== "cancelled"
    );

    const totalWeekHours = weekShifts.reduce((total, s) => {
      const [sh, sm] = s.start_time.split(":").map(Number);
      const [eh, em] = s.end_time.split(":").map(Number);
      return total + ((eh + em / 60) - (sh + sm / 60));
    }, 0);

    // Check for overtime (40 hour threshold)
    const overtimeHours = Math.max(0, totalWeekHours - 40);
    const overtimeCost = overtimeHours * employee.hourly_rate * 1.5; // 1.5x pay
    const totalWeekCost = weekShifts.reduce((total, s) => {
      const [sh, sm] = s.start_time.split(":").map(Number);
      const [eh, em] = s.end_time.split(":").map(Number);
      const hours = (eh + em / 60) - (sh + sm / 60);
      return total + (hours * employee.hourly_rate);
    }, 0) + (overtimeCost - (overtimeHours * employee.hourly_rate));

    // Create alert if overtime detected
    if (overtimeHours > 0) {
      await base44.entities.Alert.create({
        alert_type: "overtime_warning",
        severity: overtimeHours > 5 ? "high" : "medium",
        employee_id: shift.employee_id,
        employee_name: `${employee.first_name} ${employee.last_name}`,
        location_id: shift.location_id,
        message: `${employee.first_name} has ${overtimeHours.toFixed(1)} hours of overtime this week (${totalWeekHours.toFixed(1)} total hours)`,
        details: {
          overtime_hours: overtimeHours,
          total_week_hours: totalWeekHours,
          week_start: weekStart.toISOString().split("T")[0],
          overtime_cost: overtimeCost.toFixed(2),
          total_week_cost: totalWeekCost.toFixed(2)
        },
        resolved: false
      });
    }

    console.log(`Labor analysis: ${employee.first_name} - ${shiftHours}h shift ($${shiftCost.toFixed(2)}), ${totalWeekHours.toFixed(1)}h this week`);

    return Response.json({
      success: true,
      shift_hours: shiftHours,
      shift_cost: shiftCost,
      total_week_hours: totalWeekHours,
      overtime_hours: overtimeHours,
      total_week_cost: totalWeekCost,
      alert_created: overtimeHours > 0
    });
  } catch (error) {
    console.error("Labor cost analysis error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});