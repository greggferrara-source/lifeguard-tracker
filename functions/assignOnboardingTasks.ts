import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { employee_id, workflow_id, employee_role } = await req.json();

    if (!employee_id || !workflow_id || !employee_role) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get employee details
    const employee = await base44.entities.Employee.read(employee_id);

    // Define role-based tasks
    const tasksByRole = {
      lifeguard: [
        { title: 'IT Setup - Create Account', description: 'Set up employee IT account and email', assigned_to: 'IT Department' },
        { title: 'Complete HR Paperwork', description: 'Fill out employment forms and tax documents', assigned_to: 'HR Department' },
        { title: 'Safety Training', description: 'Complete facility safety and orientation training', assigned_to: 'Training' },
        { title: 'Certification Review', description: 'Verify current certifications and compliance', assigned_to: 'Compliance' }
      ],
      head_lifeguard: [
        { title: 'IT Setup - Create Account', description: 'Set up employee IT account and email', assigned_to: 'IT Department' },
        { title: 'Complete HR Paperwork', description: 'Fill out employment forms and tax documents', assigned_to: 'HR Department' },
        { title: 'Management Training', description: 'Complete leadership and management training', assigned_to: 'Training' },
        { title: 'Safety Training', description: 'Complete facility safety and orientation training', assigned_to: 'Training' },
        { title: 'Certification Review', description: 'Verify current certifications and compliance', assigned_to: 'Compliance' }
      ],
      supervisor: [
        { title: 'IT Setup - Create Account', description: 'Set up employee IT account and email and system access', assigned_to: 'IT Department' },
        { title: 'Complete HR Paperwork', description: 'Fill out employment forms and tax documents', assigned_to: 'HR Department' },
        { title: 'Management Training', description: 'Complete leadership and management training', assigned_to: 'Training' },
        { title: 'System Access Setup', description: 'Configure admin portal and reporting tools access', assigned_to: 'IT Department' },
        { title: 'Safety Training', description: 'Complete facility safety and orientation training', assigned_to: 'Training' }
      ],
      manager: [
        { title: 'IT Setup - Create Account', description: 'Set up employee IT account and email', assigned_to: 'IT Department' },
        { title: 'Complete HR Paperwork', description: 'Fill out employment forms and tax documents', assigned_to: 'HR Department' },
        { title: 'Executive Onboarding', description: 'Complete management-level orientation', assigned_to: 'Training' },
        { title: 'System Access Setup', description: 'Configure full admin portal and analytics access', assigned_to: 'IT Department' },
        { title: 'Policy Review', description: 'Review company policies and procedures', assigned_to: 'HR Department' }
      ]
    };

    const tasksToCreate = tasksByRole[employee_role] || tasksByRole.lifeguard;

    // Fetch the workflow
    const workflow = await base44.entities.OnboardingWorkflow.read(workflow_id);

    // Create tasks array with completion tracking
    const tasks = tasksToCreate.map((task, idx) => ({
      id: `task-${idx + 1}`,
      title: task.title,
      description: task.description,
      due_date: new Date(new Date().getTime() + (idx + 1) * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assigned_to_email: user.email,
      assigned_to_name: user.full_name,
      status: 'pending',
      completed: false,
      completed_date: null
    }));

    // Update workflow with auto-assigned tasks
    await base44.entities.OnboardingWorkflow.update(workflow_id, {
      tasks: tasks
    });

    return Response.json({
      success: true,
      tasks_assigned: tasks.length,
      employee_id,
      workflow_id
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});