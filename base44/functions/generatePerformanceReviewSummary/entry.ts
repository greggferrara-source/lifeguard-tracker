import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'enterprise_admin' && user?.role !== 'enterprise_site_owner') {
      return Response.json({ error: 'Forbidden: Enterprise access required' }, { status: 403 });
    }

    const { review_id } = await req.json();

    if (!review_id) {
      return Response.json({ error: 'Missing review_id' }, { status: 400 });
    }

    const review = await base44.asServiceRole.entities.PerformanceReview.read(review_id);
    if (!review) {
      return Response.json({ error: 'Review not found' }, { status: 404 });
    }

    // Get employee data
    const employee = await base44.asServiceRole.entities.Employee.read(review.employee_id);

    // Get clock entries for metrics
    const clockEntries = await base44.asServiceRole.entities.ClockEntry.filter({
      employee_id: review.employee_id
    }, '-clock_in', 200);

    // Get incidents
    const incidents = await base44.asServiceRole.entities.IncidentLog.filter({
      reporting_staff_email: review.employee_email
    }, '-date', 50);

    // Get onboarding data
    const onboarding = await base44.asServiceRole.entities.OnboardingWorkflow.filter({
      employee_id: review.employee_id
    }, '-created_at', 1);

    // Get training completions
    const trainings = await base44.asServiceRole.entities.TrainingCompletion.filter({
      employee_id: review.employee_id,
      status: 'completed'
    });

    // Calculate metrics
    const totalHours = clockEntries.reduce((sum, entry) => sum + (entry.total_minutes || 0), 0) / 60;
    const weeks = Math.ceil((new Date(review.review_period_end) - new Date(review.review_period_start)) / (7 * 24 * 60 * 60 * 1000));
    const avgHoursPerWeek = totalHours / (weeks || 1);
    const certCount = employee?.certifications?.filter(c => new Date(c.expiry_date) > new Date())?.length || 0;

    const metrics = {
      total_hours_worked: Math.round(totalHours),
      avg_hours_per_week: Math.round(avgHoursPerWeek * 10) / 10,
      certifications_completed: certCount,
      training_modules_completed: trainings.length,
      incidents_count: incidents.length,
      attendance_rate: clockEntries.length > 0 ? Math.round((clockEntries.length / (weeks * 5)) * 100) : 0
    };

    // Generate AI summary
    const prompt = `
Based on the following employee performance data, generate a professional and constructive performance review summary (2-3 paragraphs):

Employee: ${review.employee_name}
Review Period: ${review.review_period_start} to ${review.review_period_end}
Role: ${employee?.role || 'N/A'}

Performance Metrics:
- Total Hours Worked: ${metrics.total_hours_worked}
- Average Hours/Week: ${metrics.avg_hours_per_week}
- Certifications: ${metrics.certifications_completed}
- Training Modules Completed: ${metrics.training_modules_completed}
- Incidents Reported: ${metrics.incidents_count}
- Attendance Rate: ${metrics.attendance_rate}%

Skills Feedback:
${review.skills_feedback?.map(s => `- ${s.skill_name}: Rating ${s.rating}/5 - ${s.feedback}`).join('\n')}

Manager Notes:
${review.manager_notes || 'N/A'}

Onboarding Status: ${onboarding?.[0]?.status || 'Not started'}

Please provide a balanced summary highlighting strengths, areas for improvement, and recommendations for the next period.
    `;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false
    });

    // Update review with metrics and AI summary
    await base44.asServiceRole.entities.PerformanceReview.update(review_id, {
      metrics,
      ai_generated_summary: aiResponse,
      updated_at: new Date().toISOString()
    });

    console.log(`Performance review summary generated for review ${review_id}`);

    return Response.json({
      success: true,
      metrics,
      ai_summary: aiResponse
    });
  } catch (error) {
    console.error('Generate review summary error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});