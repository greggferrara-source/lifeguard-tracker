import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { workflow_id, training_module_ids = [] } = await req.json();

    if (!workflow_id) {
      return Response.json({ error: 'Missing workflow_id' }, { status: 400 });
    }

    const workflow = await base44.asServiceRole.entities.OnboardingWorkflow.read(workflow_id);
    if (!workflow) {
      return Response.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Get training modules
    const modules = await base44.asServiceRole.entities.TrainingModule.filter({
      id: { $in: training_module_ids }
    });

    // Update workflow
    await base44.asServiceRole.entities.OnboardingWorkflow.update(workflow_id, {
      training_modules_assigned: training_module_ids,
      checklist_items: workflow.checklist_items.map(item =>
        item.id === '3' ? { ...item, completed: true, completed_date: new Date().toISOString() } : item
      )
    });

    // Create training completion records for tracking
    for (const moduleId of training_module_ids) {
      await base44.asServiceRole.entities.TrainingCompletion.create({
        employee_id: workflow.employee_id,
        employee_name: workflow.employee_name,
        training_module_id: moduleId,
        status: 'assigned',
        assigned_date: new Date().toISOString(),
        due_date: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // Notify employee
    await base44.integrations.Core.SendEmail({
      to: workflow.employee_email,
      subject: `Training Modules Assigned - ${modules.length} courses`,
      body: `
Hello ${workflow.employee_name},

We've assigned ${modules.length} training modules for you to complete as part of your onboarding:

${modules.map(m => `• ${m.name || m.title}`).join('\n')}

Please complete these modules within the next 2 weeks. You can access them in your training portal.

If you have any questions, reach out to your mentor or HR team.

Best regards,
HR Team
      `
    });

    console.log(`Training modules assigned to workflow ${workflow_id}. Modules: ${training_module_ids.length}`);

    return Response.json({
      success: true,
      modules_assigned: training_module_ids.length,
      message: 'Training modules assigned and notifications sent'
    });
  } catch (error) {
    console.error('Assign training error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});