import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { integrationId } = body;

    if (!integrationId) {
      return Response.json({ error: 'Missing integrationId' }, { status: 400 });
    }

    // Fetch integration details
    const integration = await base44.entities.PayrollIntegration.get(integrationId);
    
    if (!integration || integration.status !== 'connected') {
      return Response.json({ error: 'Integration not connected' }, { status: 400 });
    }

    const { provider, access_token } = integration;

    // API endpoints for employee data
    const apiEndpoints = {
      gusto: 'https://api.gusto.com/v1/employees',
      adp: 'https://api.adp.com/core/v2/workers',
      paychex: 'https://api.paychex.com/api/v1/employees',
      bamboohr: 'https://api.bamboohr.com/api/gateway.php/{{domain}}/v1/employees/directory',
      rippling: 'https://api.rippling.com/platform/api/v1/employees',
      workday: 'https://wd2.myworkday.com/ccx/service/customreport2'
    };

    const endpoint = apiEndpoints[provider];
    
    // Fetch employee data from payroll provider
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorMsg = `Failed to fetch data from ${provider}: ${response.statusText}`;
      console.error(errorMsg);
      
      // Update integration with error
      await base44.entities.PayrollIntegration.update(integrationId, {
        status: 'error',
        last_sync_error: errorMsg
      });
      
      return Response.json({ error: errorMsg }, { status: 500 });
    }

    const data = await response.json();
    let syncedCount = 0;

    // Process employee data based on provider response format
    const employees = data.employees || data.workers || data.data || [];

    for (const empData of employees) {
      // Map provider data to our Employee entity
      const employeePayload = {
        first_name: empData.firstName || empData.given_name || '',
        last_name: empData.lastName || empData.family_name || '',
        email: empData.email || empData.workEmail || '',
        phone: empData.phone || empData.mobilePhone || '',
        hourly_rate: empData.rate || empData.salary || 0,
        role: empData.jobTitle || 'lifeguard'
      };

      try {
        // Check if employee exists
        const existing = await base44.entities.Employee.filter(
          { email: employeePayload.email },
          '-created_date',
          1
        );

        if (existing.length > 0) {
          await base44.entities.Employee.update(existing[0].id, employeePayload);
        } else {
          await base44.entities.Employee.create(employeePayload);
        }
        syncedCount++;
      } catch (err) {
        console.error(`Failed to sync employee ${empData.email}:`, err);
      }
    }

    // Update integration with success
    await base44.entities.PayrollIntegration.update(integrationId, {
      status: 'connected',
      last_synced: new Date().toISOString(),
      last_sync_error: null
    });

    console.log(`Synced ${syncedCount} employees from ${provider}`);

    return Response.json({
      success: true,
      syncedCount,
      provider,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Payroll sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});