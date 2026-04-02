import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Generate training recommendations based on compliance gaps and performance
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { employee_id, incident_type, skill_gap } = await req.json();

    // Map incident types and gaps to training modules
    const recommendationMap = {
      drowning: {
        modules: ['incident_response', 'first_aid'],
        description: 'CPR, rescue techniques, and emergency response'
      },
      rescue: {
        modules: ['incident_response', 'lifeguarding'],
        description: 'Rescue procedures and lifeguarding skills'
      },
      injury: {
        modules: ['first_aid', 'safety'],
        description: 'First aid, injury prevention, and safety protocols'
      },
      chemical_spill: {
        modules: ['safety', 'compliance'],
        description: 'Chemical safety, spill containment, and OSHA compliance'
      }
    };

    const recommendation = recommendationMap[incident_type];
    if (!recommendation) {
      return Response.json({ error: 'Invalid incident type' }, { status: 400 });
    }

    // Get matching training modules
    const modules = await base44.asServiceRole.entities.TrainingModule.filter({
      is_active: true
    });

    const recommended = modules.filter(m => 
      recommendation.modules.includes(m.category)
    );

    // Check if employee already has these assigned
    const assignments = await base44.asServiceRole.entities.TrainingAssignment.filter({
      employee_id
    });

    const assignedModuleIds = assignments.map(a => a.module_id);
    const newRecommendations = recommended.filter(m => !assignedModuleIds.includes(m.id));

    // Auto-assign recommended modules if not already assigned
    const created = [];
    for (const module of newRecommendations) {
      const assignment = await base44.asServiceRole.entities.TrainingAssignment.create({
        module_id: module.id,
        module_title: module.title,
        employee_id,
        assigned_by_email: 'system',
        assigned_by_name: 'Automated System',
        assigned_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reason: incident_type ? 'incident_followup' : 'compliance_gap',
        reason_details: `Recommended due to ${incident_type || skill_gap}: ${recommendation.description}`,
        status: 'assigned'
      });
      created.push(assignment);
    }

    console.log(`Generated ${created.length} training recommendations for employee ${employee_id}`);

    return Response.json({ 
      success: true, 
      recommendations: newRecommendations,
      assigned: created.length,
      description: recommendation.description
    });
  } catch (error) {
    console.error('Training recommendation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});