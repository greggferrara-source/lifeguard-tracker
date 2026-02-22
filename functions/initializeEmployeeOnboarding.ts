import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { employee_id, start_date, mentor_email, training_module_ids = [] } = await req.json();

    if (!employee_id || !start_date) {
      return Response.json({ error: 'Missing employee_id or start_date' }, { status: 400 });
    }

    const employee = await base44.asServiceRole.entities.Employee.read(employee_id);
    if (!employee) {
      return Response.json({ error: 'Employee not found' }, { status: 404 });
    }

    const fullName = employee.first_name + ' ' + employee.last_name;

    // Create onboarding workflow
    const workflow = await base44.asServiceRole.entities.OnboardingWorkflow.create({
      employee_id,
      employee_name: fullName,
      employee_email: employee.email,
      start_date,
      status: 'not_started',
      assigned_mentor_email: mentor_email,
      training_modules_assigned: training_module_ids,
      tasks: [
        {
          id: '1',
          title: 'Complete HR Paperwork',
          description: 'Fill out all required HR forms and documents',
          due_date: new Date(new Date(start_date).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending'
        },
        {
          id: '2',
          title: 'IT Setup & Access',
          description: 'Configure email, systems access, and equipment',
          due_date: new Date(new Date(start_date).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending'
        },
        {
          id: '3',
          title: 'Safety & Compliance Training',
          description: 'Complete required safety and compliance training',
          due_date: new Date(new Date(start_date).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending'
        },
        {
          id: '4',
          title: 'Meet Department Team',
          description: 'Meet with team members and department leads',
          due_date: new Date(new Date(start_date).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending'
        }
      ],
      checklist_items: [
        { id: '1', item: 'Welcome email sent', completed: false },
        { id: '2', item: 'Orientation meeting scheduled', completed: false },
        { id: '3', item: 'Training modules assigned', completed: false },
        { id: '4', item: 'Mentor assigned', completed: false },
        { id: '5', item: 'Office access granted', completed: false }
      ]
    });

    // Send welcome email
    await base44.integrations.Core.SendEmail({
      to: employee.email,
      subject: `Welcome to the Team, ${employee.first_name}!`,
      body: `
Hi ${employee.first_name},

Welcome to our team! We're excited to have you join us starting ${start_date}.

Your onboarding journey begins today. Over the next few weeks, you'll:
- Complete HR paperwork and IT setup
- Attend orientation and safety training
- Meet your team and mentor
- Complete assigned training modules

${mentor_email ? `Your mentor is: ${mentor_email}` : 'A mentor will be assigned soon.'}

If you have any questions, don't hesitate to reach out!

Best regards,
HR Team
      `
    });

    // Update workflow status
    await base44.asServiceRole.entities.OnboardingWorkflow.update(workflow.id, {
      status: 'in_progress',
      welcome_email_sent: true,
      checklist_items: workflow.checklist_items.map(item => 
        item.id === '1' ? { ...item, completed: true, completed_date: new Date().toISOString() } : item
      )
    });

    console.log(`Onboarding workflow initialized for employee ${employee_id}. Workflow ID: ${workflow.id}`);

    return Response.json({
      success: true,
      workflow_id: workflow.id,
      message: 'Onboarding workflow initialized and welcome email sent'
    });
  } catch (error) {
    console.error('Onboarding initialization error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});