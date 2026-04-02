import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { integration_id, data_type } = await req.json();

    if (!integration_id || !data_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get payroll integration
    const integrations = await base44.entities.PayrollIntegration.filter({ id: integration_id });
    const integration = integrations[0];

    if (!integration) {
      return Response.json({ error: 'Integration not found' }, { status: 404 });
    }

    if (!integration.oauth_access_token) {
      return Response.json({ error: 'Not connected' }, { status: 400 });
    }

    // Update status
    await base44.entities.PayrollIntegration.update(integration_id, {
      status: 'syncing'
    });

    let syncedRecords = 0;
    const errors = [];

    // Sync based on data type
    if (data_type === 'timesheets') {
      syncedRecords = await syncTimesheets(base44, integration);
    } else if (data_type === 'schedules') {
      syncedRecords = await syncSchedules(base44, integration);
    } else if (data_type === 'employees') {
      syncedRecords = await syncEmployees(base44, integration);
    }

    // Update integration with sync result
    await base44.entities.PayrollIntegration.update(integration_id, {
      status: 'connected',
      last_sync: new Date().toISOString()
    });

    return Response.json({ 
      success: true,
      synced_records: syncedRecords,
      data_type
    });
  } catch (error) {
    console.error('Payroll sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function syncTimesheets(base44, integration) {
  const clockEntries = await base44.entities.ClockEntry.filter({
    location_id: integration.location_id
  });
  
  // Transform and send to payroll provider
  // This would call the actual payroll API
  return clockEntries.length;
}

async function syncSchedules(base44, integration) {
  const shifts = await base44.entities.Shift.filter({
    location_id: integration.location_id
  });
  
  return shifts.length;
}

async function syncEmployees(base44, integration) {
  const employees = await base44.entities.Employee.filter({
    location_id: integration.location_id
  });
  
  return employees.length;
}