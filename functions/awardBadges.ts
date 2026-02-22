import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const BADGE_CRITERIA = {
  perfect_attendance: { name: 'Perfect Attendance', icon: '⭐', criteria: '0 absences in 3 months' },
  incident_responder: { name: 'Incident Responder', icon: '🚨', criteria: '3+ incidents responded' },
  certified_trainer: { name: 'Certified Trainer', icon: '👨‍🏫', criteria: 'Trainer certification active' },
  safety_hero: { name: 'Safety Hero', icon: '🛡️', criteria: '6+ months no violations' },
  team_player: { name: 'Team Player', icon: '🤝', criteria: '20+ teamwork commendations' },
  commitment_500h: { name: '500 Hour Commitment', icon: '💪', criteria '500+ hours worked' },
  rapid_responder: { name: 'Rapid Responder', icon: '⚡', criteria: 'Avg response < 60 seconds' },
  zero_violations: { name: 'Zero Violations', icon: '✅', criteria: '1+ year no safety issues' },
  mentor: { name: 'Mentor', icon: '🎓', criteria: 'Trained 5+ staff' },
  lifesaver: { name: 'Lifesaver', icon: '🏊', criteria: '2+ rescues or saves' }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const perfs = await base44.asServiceRole.entities.EmployeePerformance.list();
    const badges = [];

    for (const perf of perfs) {
      // Perfect attendance
      if (perf.attendance_rate === 100 && perf.total_shifts_worked >= 10) {
        badges.push({
          employee_id: perf.employee_id,
          employee_name: perf.employee_name,
          badge_id: 'perfect_attendance',
          badge_name: BADGE_CRITERIA.perfect_attendance.name,
          badge_icon: BADGE_CRITERIA.perfect_attendance.icon,
          description: 'Zero absences in recent period',
          earned_at: new Date().toISOString(),
          criteria: BADGE_CRITERIA.perfect_attendance.criteria
        });
      }

      // Commitment 500h
      if (perf.total_hours >= 500) {
        badges.push({
          employee_id: perf.employee_id,
          employee_name: perf.employee_name,
          badge_id: 'commitment_500h',
          badge_name: BADGE_CRITERIA.commitment_500h.name,
          badge_icon: BADGE_CRITERIA.commitment_500h.icon,
          description: `${Math.round(perf.total_hours)} hours contributed`,
          earned_at: new Date().toISOString(),
          criteria: BADGE_CRITERIA.commitment_500h.criteria
        });
      }

      // Zero violations
      if (perf.safety_violations === 0 && perf.total_shifts_worked >= 20) {
        badges.push({
          employee_id: perf.employee_id,
          employee_name: perf.employee_name,
          badge_id: 'zero_violations',
          badge_name: BADGE_CRITERIA.zero_violations.name,
          badge_icon: BADGE_CRITERIA.zero_violations.icon,
          description: 'Maintained perfect safety record',
          earned_at: new Date().toISOString(),
          criteria: BADGE_CRITERIA.zero_violations.criteria
        });
      }

      // Rapid responder
      if (perf.avg_response_time_seconds && perf.avg_response_time_seconds < 60 && perf.incidents_responded_to >= 3) {
        badges.push({
          employee_id: perf.employee_id,
          employee_name: perf.employee_name,
          badge_id: 'rapid_responder',
          badge_name: BADGE_CRITERIA.rapid_responder.name,
          badge_icon: BADGE_CRITERIA.rapid_responder.icon,
          description: `Avg response: ${perf.avg_response_time_seconds}s`,
          earned_at: new Date().toISOString(),
          criteria: BADGE_CRITERIA.rapid_responder.criteria
        });
      }

      // Incident responder
      if (perf.incidents_responded_to >= 3) {
        badges.push({
          employee_id: perf.employee_id,
          employee_name: perf.employee_name,
          badge_id: 'incident_responder',
          badge_name: BADGE_CRITERIA.incident_responder.name,
          badge_icon: BADGE_CRITERIA.incident_responder.icon,
          description: `${perf.incidents_responded_to} incidents handled`,
          earned_at: new Date().toISOString(),
          criteria: BADGE_CRITERIA.incident_responder.criteria
        });
      }
    }

    if (badges.length > 0) {
      await base44.asServiceRole.entities.EmployeeBadge.bulkCreate(badges);
    }

    return Response.json({ badges_awarded: badges.length });
  } catch (error) {
    console.error('Badge award error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});