import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { trigger_type, trigger_entity_id, trigger_entity_type } = await req.json();

    // Find all workflows matching this trigger
    const workflows = await base44.asServiceRole.entities.Workflow.filter({
      trigger_type: trigger_type,
      enabled: true
    });

    const executions = [];

    for (const workflow of workflows) {
      // Create workflow execution
      const execution = await base44.asServiceRole.entities.WorkflowExecution.create({
        workflow_id: workflow.id,
        workflow_name: workflow.name,
        trigger_entity_type: trigger_entity_type,
        trigger_entity_id: trigger_entity_id,
        status: 'pending',
        current_step_index: 0,
        step_results: [],
        pending_approvals: [],
        started_at: new Date().toISOString()
      });

      // Process first step
      if (workflow.steps && workflow.steps.length > 0) {
        await processWorkflowStep(base44, execution, workflow);
      }

      executions.push(execution);
    }

    return Response.json({ executions: executions });
  } catch (error) {
    console.error('Workflow trigger processing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function processWorkflowStep(base44, execution, workflow) {
  const step = workflow.steps[execution.current_step_index];
  if (!step) return;

  try {
    let result = {};

    if (step.action_type === 'create_task') {
      const task = await base44.asServiceRole.entities.MaintenanceRequest.create({
        asset_id: step.action_config.asset_id,
        title: step.action_config.title,
        description: step.action_config.description,
        priority: step.action_config.priority || 'medium',
        submitted_by_email: step.action_config.created_by || 'system@lifeguardtracker.app',
        status: 'submitted'
      });
      result = { task_id: task.id };
    } else if (step.action_type === 'create_assessment') {
      const assessment = await base44.asServiceRole.entities.ComplianceAssessment.create({
        location_id: step.action_config.location_id,
        assessment_type: step.action_config.assessment_type,
        title: step.action_config.title,
        status: 'not_started'
      });
      result = { assessment_id: assessment.id };
    } else if (step.action_type === 'send_notification') {
      await base44.asServiceRole.entities.UserNotification.create({
        recipient_email: step.action_config.recipient_email,
        title: step.action_config.title,
        message: step.action_config.message,
        notification_type: step.action_config.notification_type || 'incident_report',
        severity: step.action_config.severity || 'info'
      });
      result = { notification_sent: true };
    }

    // Record step result
    const updatedExecution = await base44.asServiceRole.entities.WorkflowExecution.update(execution.id, {
      step_results: [
        ...(execution.step_results || []),
        {
          step_id: step.id,
          status: 'completed',
          result: result,
          timestamp: new Date().toISOString()
        }
      ]
    });

    // Move to next step or complete
    if (execution.current_step_index < workflow.steps.length - 1) {
      const nextExecution = await base44.asServiceRole.entities.WorkflowExecution.update(execution.id, {
        current_step_index: execution.current_step_index + 1,
        status: 'in_progress'
      });
      await processWorkflowStep(base44, nextExecution, workflow);
    } else {
      await base44.asServiceRole.entities.WorkflowExecution.update(execution.id, {
        status: 'completed',
        completed_at: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Workflow step error:', error);
    await base44.asServiceRole.entities.WorkflowExecution.update(execution.id, {
      status: 'failed',
      error_message: error.message,
      completed_at: new Date().toISOString()
    });
  }
}