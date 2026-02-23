import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Track training completion and quiz scores
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { assignment_id, quiz_score, time_spent_minutes, sections_completed } = await req.json();

    // Get assignment
    const assignment = await base44.entities.TrainingAssignment.filter({ id: assignment_id });
    if (!assignment || assignment.length === 0) {
      return Response.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const assign = assignment[0];

    // Get module to check passing score
    const module = await base44.entities.TrainingModule.filter({ id: assign.module_id });
    const passingScore = module[0]?.quiz?.passing_score || 80;

    const passed = quiz_score >= passingScore;

    // Update assignment
    const updated = await base44.asServiceRole.entities.TrainingAssignment.update(assignment_id, {
      status: passed ? 'completed' : 'failed',
      quiz_attempts: (assign.quiz_attempts || 0) + 1,
      final_score: quiz_score,
      passed,
      completed_at: passed ? new Date().toISOString() : null,
      time_spent_minutes,
      sections_completed
    });

    // If passed, generate certificate
    let certificate_url = null;
    if (passed && module[0]?.certificate_enabled) {
      certificate_url = `https://certificates.lifeguardtracker.app/${assignment_id}`;
      
      await base44.asServiceRole.entities.TrainingAssignment.update(assignment_id, {
        certificate_issued: true,
        certificate_url
      });

      // Notify employee
      const employee = await base44.entities.User.filter({ id: assign.employee_id });
      if (employee && employee.length > 0) {
        await base44.integrations.Core.SendEmail({
          to: employee[0].email,
          subject: `🎓 Certificate Earned: ${assign.module_title}`,
          body: `Congratulations! You have completed ${assign.module_title} with a score of ${quiz_score}%.\n\nYour certificate is available at: ${certificate_url}`
        });
      }
    }

    // Update module completion rate
    const allAssignments = await base44.asServiceRole.entities.TrainingAssignment.filter({
      module_id: assign.module_id
    });
    const completed = allAssignments.filter(a => a.status === 'completed').length;
    const completionRate = Math.round((completed / allAssignments.length) * 100);

    await base44.asServiceRole.entities.TrainingModule.update(assign.module_id, {
      completion_rate: completionRate
    });

    console.log(`Training completed: ${assign.module_title} - Score: ${quiz_score}%`);

    return Response.json({ 
      success: true, 
      passed,
      score: quiz_score,
      certificate_issued: passed && module[0]?.certificate_enabled,
      certificate_url
    });
  } catch (error) {
    console.error('Tracking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});