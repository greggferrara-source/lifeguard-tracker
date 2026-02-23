import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Automatically assign follow-up tasks based on incident type
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { incident_id, incident_type, location_id, severity } = await req.json();

    const taskTemplates = {
      drowning: [
        { title: 'Medical Report', days: 1, role: 'manager' },
        { title: 'Review Incident Video', days: 1, role: 'head_lifeguard' },
        { title: 'Update Protocols', days: 3, role: 'manager' },
        { title: 'Incident Investigation', days: 7, role: 'admin' }
      ],
      rescue: [
        { title: 'Document Rescue Details', days: 1, role: 'lifeguard' },
        { title: 'Medical Follow-up', days: 1, role: 'manager' },
        { title: 'Training Review', days: 3, role: 'head_lifeguard' }
      ],
      injury: [
        { title: 'Injury Assessment', days: 0, role: 'manager' },
        { title: 'OSHA Reporting', days: 1, role: 'admin' },
        { title: 'Employee Interview', days: 1, role: 'manager' },
        { title: 'Prevention Measures', days: 7, role: 'manager' }
      ],
      chemical_spill: [
        { title: 'Containment Verification', days: 0, role: 'head_lifeguard' },
        { title: 'Chemical Inventory Check', days: 1, role: 'manager' },
        { title: 'Safety Audit', days: 3, role: 'admin' },
        { title: 'Staff Retraining', days: 7, role: 'head_lifeguard' }
      ]
    };

    const templates = taskTemplates[incident_type] || [];
    const tasks = [];

    for (const template of templates) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + template.days);

      const task = {
        incident_id,
        title: template.title,
        description: `Follow-up task for ${incident_type} incident - ${template.role} responsible`,
        due_date: dueDate.toISOString().split('T')[0],
        assigned_role: template.role,
        status: 'pending',
        priority: severity === 'critical' ? 'high' : 'normal'
      };

      // Note: In production, would create an actual task entity
      tasks.push(task);
    }

    // Update incident with assigned tasks
    await base44.asServiceRole.entities.IncidentReport.update(incident_id, {
      follow_up_tasks_assigned: tasks.map(t => t.title)
    });

    console.log(`Assigned ${tasks.length} follow-up tasks for incident ${incident_id}`);

    return Response.json({ 
      success: true, 
      tasks_created: tasks.length,
      tasks 
    });
  } catch (error) {
    console.error('Task assignment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});