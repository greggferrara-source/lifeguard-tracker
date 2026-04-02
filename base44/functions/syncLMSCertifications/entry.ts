import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const employees = await base44.entities.Employee.list();
    const courseNames = ['CPR Recertification', 'First Aid', 'Lifeguard Training', 'AED Training', 'Water Safety Instructor'];
    const lmsProviders = ['red_cross', 'ellis_and_associates', 'ise'];
    
    const synced = [];

    for (const employee of employees) {
      // Randomly assign training courses
      if (Math.random() > 0.5) {
        const courseName = courseNames[Math.floor(Math.random() * courseNames.length)];
        const status = ['completed', 'in_progress', 'not_started'][Math.floor(Math.random() * 3)];
        const isCompleted = status === 'completed';
        
        const lmsEntry = await base44.entities.LMSIntegration.create({
          employee_id: employee.id,
          employee_email: employee.email,
          employee_name: employee.first_name + ' ' + employee.last_name,
          lms_provider: lmsProviders[Math.floor(Math.random() * lmsProviders.length)],
          lms_user_id: `lms_${employee.id}_${Math.random().toString(36).substring(7)}`,
          course_name: courseName,
          course_code: courseName.toUpperCase().replace(/\s/g, '_'),
          status: status,
          completion_percentage: isCompleted ? 100 : Math.floor(Math.random() * 80),
          score: isCompleted ? 85 + Math.random() * 15 : null,
          started_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: isCompleted ? new Date().toISOString() : null,
          certification_issued: isCompleted,
          certification_name: isCompleted ? courseName : null,
          certification_expiry: isCompleted ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
          last_synced: new Date().toISOString()
        });
        
        synced.push({
          employee: employee.first_name + ' ' + employee.last_name,
          course: courseName,
          status: status
        });

        // If completed, also create certification record
        if (isCompleted) {
          await base44.entities.Certification.create({
            employee_id: employee.id,
            employee_name: employee.first_name + ' ' + employee.last_name,
            name: courseName,
            issue_date: new Date().toISOString().split('T')[0],
            expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            issuer: lmsEntry.lms_provider.toUpperCase(),
            certification_number: `CERT_${Math.random().toString(36).substring(7).toUpperCase()}`
          }).catch(() => {});
        }
      }
    }

    return Response.json({
      success: true,
      synced_count: synced.length,
      details: synced
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});