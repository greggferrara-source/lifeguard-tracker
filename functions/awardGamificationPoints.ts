import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Award points, badges, and track achievements based on training completion
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { assignment_id, quiz_score, completion_time_minutes } = await req.json();

    // Get assignment
    const assign = await base44.asServiceRole.entities.TrainingAssignment.filter({ id: assignment_id });
    if (!assign || assign.length === 0) {
      return Response.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const assignment = assign[0];

    // Get module for gamification config
    const module = await base44.asServiceRole.entities.TrainingModule.filter({ id: assignment.module_id });
    const gameConfig = module[0]?.gamification || {};

    // Calculate points
    let pointsEarned = gameConfig.points_on_completion || 100;
    
    // Bonus for perfect quiz score
    if (quiz_score === 100) {
      pointsEarned += gameConfig.points_on_quiz_perfect || 50;
    }
    
    // Time bonus (faster completion)
    if (completion_time_minutes < (module[0]?.estimated_duration_minutes || 60) * 0.7) {
      pointsEarned += 25; // Speed bonus
    }

    // Update assignment with gamification data
    const badgesEarned = [];
    const achievements = [];

    // Check for special badges
    if (quiz_score === 100) {
      badgesEarned.push('perfect_score');
      achievements.push('Perfect Score: 100% on quiz');
    }

    if (completion_time_minutes < (module[0]?.estimated_duration_minutes || 60) * 0.5) {
      badgesEarned.push('speed_demon');
      achievements.push('Speed Demon: Completed in record time');
    }

    // Streak tracking
    const previousAssignments = await base44.asServiceRole.entities.TrainingAssignment.filter({
      employee_id: assignment.employee_id
    });
    const recentlyCompleted = previousAssignments.filter(a => {
      const daysAgo = (Date.now() - new Date(a.completed_at).getTime()) / (1000 * 60 * 60 * 24);
      return a.status === 'completed' && daysAgo < 7;
    });
    const currentStreak = recentlyCompleted.length + 1;

    if (currentStreak >= 5) {
      badgesEarned.push('on_fire');
      achievements.push(`On Fire: ${currentStreak} modules completed in 7 days!`);
    }

    if (currentStreak >= 10) {
      badgesEarned.push('unstoppable');
      achievements.push('Unstoppable: 10 modules in 7 days!');
    }

    // Update assignment
    await base44.asServiceRole.entities.TrainingAssignment.update(assignment_id, {
      gamification: {
        points_earned: pointsEarned,
        badges_earned: badgesEarned,
        achievement_unlocked: achievements,
        streak_count: currentStreak
      }
    });

    // Create badge records
    for (const badgeId of badgesEarned) {
      const badgeConfig = {
        perfect_score: { name: '🎯 Perfect Score', desc: 'Scored 100% on quiz', rarity: 'rare' },
        speed_demon: { name: '⚡ Speed Demon', desc: 'Completed in half the estimated time', rarity: 'uncommon' },
        on_fire: { name: '🔥 On Fire', desc: 'Completed 5 modules in 7 days', rarity: 'rare' },
        unstoppable: { name: '💪 Unstoppable', desc: 'Completed 10 modules in 7 days', rarity: 'epic' }
      };

      const config = badgeConfig[badgeId] || { name: 'Achievement', desc: 'Unknown', rarity: 'common' };

      await base44.asServiceRole.entities.EmployeeBadge.create({
        employee_id: assignment.employee_id,
        employee_email: assignment.employee_email,
        employee_name: assignment.employee_name,
        badge_id: badgeId,
        badge_name: config.name,
        badge_description: config.desc,
        badge_icon: config.name.split(' ')[0],
        badge_type: 'achievement',
        earned_at: new Date().toISOString(),
        earned_for: assignment.module_id,
        rarity: config.rarity
      });
    }

    // Update user total points (store in user preferences or custom field)
    const existingPoints = await base44.asServiceRole.entities.TrainingAssignment.filter({
      employee_id: assignment.employee_id
    });
    const totalPoints = existingPoints.reduce((sum, a) => sum + (a.gamification?.points_earned || 0), 0) + pointsEarned;

    console.log(`Gamification points awarded: ${pointsEarned} points, ${badgesEarned.length} badges`);

    return Response.json({ 
      success: true, 
      points_earned: pointsEarned,
      badges_earned: badgesEarned.length,
      total_points: totalPoints,
      achievements
    });
  } catch (error) {
    console.error('Gamification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});