import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { employee_id, start_date } = await req.json();

    if (!employee_id || !start_date) {
      return Response.json({ error: 'Missing employee_id or start_date' }, { status: 400 });
    }

    // Fetch employee details
    const employee = await base44.entities.Employee.read(employee_id);
    if (!employee) {
      return Response.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Fetch all enabled rules sorted by priority
    const rules = await base44.asServiceRole.entities.OnboardingTaskRule.filter(
      { enabled: true },
      '-priority',
      100
    );

    console.log(`Evaluating ${rules.length} rules for employee ${employee_id}`);

    // Evaluate rules and collect matching tasks
    const matchedTasks = [];
    const taskMap = new Map();

    for (const rule of rules) {
      const matches = evaluateRule(rule, employee);
      console.log(`Rule "${rule.name}" matches: ${matches}`);

      if (matches) {
        for (const task of rule.tasks) {
          const taskId = `${rule.id}-${task.task_id}`;
          if (!taskMap.has(taskId)) {
            taskMap.set(taskId, {
              id: taskId,
              title: task.title,
              description: task.description,
              due_date: calculateDueDate(start_date, task.days_offset),
              assigned_to_role: task.assigned_to_role,
              depends_on: task.depends_on ? task.depends_on.map(dep => `${rule.id}-${dep}`) : [],
              order: task.order || 0,
              status: 'pending'
            });
          }
        }
      }
    }

    // Sort tasks by order and dependencies
    const finalTasks = Array.from(taskMap.values()).sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.title.localeCompare(b.title);
    });

    console.log(`Generated ${finalTasks.length} tasks based on rules`);

    return Response.json({
      success: true,
      tasks: finalTasks,
      task_count: finalTasks.length,
      rules_matched: rules.filter(r => finalTasks.some(t => t.id.startsWith(r.id))).length
    });
  } catch (error) {
    console.error('Task generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function evaluateRule(rule, employee) {
  const criteria = rule.criteria || {};

  // Check roles
  if (criteria.roles && criteria.roles.length > 0) {
    if (!criteria.roles.includes(employee.role)) {
      return false;
    }
  }

  // Check locations
  if (criteria.locations && criteria.locations.length > 0) {
    if (!criteria.locations.includes(employee.location_id)) {
      return false;
    }
  }

  // Check certifications (if employee has all required certs)
  if (criteria.certifications_required && criteria.certifications_required.length > 0) {
    const employeeCerts = (employee.certifications || []).map(c => c.name);
    const hasCerts = criteria.certifications_required.every(cert => employeeCerts.includes(cert));
    if (!hasCerts) {
      return false;
    }
  }

  return true;
}

function calculateDueDate(startDate, daysOffset = 0) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}