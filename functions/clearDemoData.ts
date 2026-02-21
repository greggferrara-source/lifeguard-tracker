import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    // Only allow admin users to clear data
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { confirm_deletion, confirmation_token } = await req.json();
    
    // Require explicit two-step confirmation
    if (confirm_deletion !== true || confirmation_token !== "CONFIRM_DELETE_ALL_DATA_PERMANENT") {
      return Response.json({ 
        error: "Multi-layer confirmation required. Provide confirm_deletion=true and confirmation_token='CONFIRM_DELETE_ALL_DATA_PERMANENT'" 
      }, { status: 403 });
    }

    console.log(`WARNING: Admin user ${user.email} initiated full data deletion`);

    // Delete all shifts
    const shifts = await base44.entities.Shift.list();
    for (const shift of shifts) {
      await base44.entities.Shift.delete(shift.id);
    }
    console.log(`Deleted ${shifts.length} shifts`);

    // Delete all employees
    const employees = await base44.entities.Employee.list();
    for (const emp of employees) {
      await base44.entities.Employee.delete(emp.id);
    }
    console.log(`Deleted ${employees.length} employees`);

    // Delete all locations
    const locations = await base44.entities.Location.list();
    for (const loc of locations) {
      await base44.entities.Location.delete(loc.id);
    }
    console.log(`Deleted ${locations.length} locations`);

    return Response.json({ 
      success: true, 
      deleted: {
        shifts: shifts.length,
        employees: employees.length,
        locations: locations.length
      }
    });
  } catch (error) {
    console.error("Clear demo data error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});