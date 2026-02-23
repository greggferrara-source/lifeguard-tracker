import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Zap, TrendingUp } from 'lucide-react';

export default function TrainingGamification() {
  const [period, setPeriod] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: myAssignments = [] } = useQuery({
    queryKey: ['my-assignments'],
    queryFn: () => base44.entities.TrainingAssignment.filter({ employee_email: user?.email }),
    enabled: !!user
  });

  const { data: myBadges = [] } = useQuery({
    queryKey: ['my-badges'],
    queryFn: () => base44.entities.EmployeeBadge.filter({ employee_email: user?.email }),
    enabled: !!user
  });

  const { data: allEmployees = [] } = useQuery({
    queryKey: ['all-employees'],
    queryFn: () => base44.entities.User.list()
  });

  // Calculate leaderboard
  const leaderboard = allEmployees.map(emp => {
    const assignments = myAssignments.filter(a => a.employee_email === emp.email);
    const totalPoints = assignments.reduce((sum, a) => sum + (a.gamification?.points_earned || 0), 0);
    const badgesCount = myBadges.filter(b => b.employee_email === emp.email).length;
    const completedCount = assignments.filter(a => a.status === 'completed').length;
    
    return {
      ...emp,
      points: totalPoints,
      badges: badgesCount,
      completedModules: completedCount
    };
  }).sort((a, b) => b.points - a.points);

  const myStats = leaderboard.find(e => e.email === user?.email) || { points: 0, badges: 0, completedModules: 0 };
  const myRank = leaderboard.findIndex(e => e.email === user?.email) + 1;

  const completedAssignments = myAssignments.filter(a => a.status === 'completed');
  const currentStreak = myAssignments.filter(a => a.gamification?.streak_count > 0).length;

  const badgesByRarity = {
    legendary: myBadges.filter(b => b.rarity === 'legendary'),
    epic: myBadges.filter(b => b.rarity === 'epic'),
    rare: myBadges.filter(b => b.rarity === 'rare'),
    uncommon: myBadges.filter(b => b.rarity === 'uncommon'),
    common: myBadges.filter(b => b.rarity === 'common')
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Training Gamification Hub</h1>
        <p className="text-gray-600 mt-1">Earn points, badges, and climb the leaderboard</p>
      </div>

      {/* Player Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <p className="text-3xl font-bold">{myStats.points}</p>
            <p className="text-xs text-gray-500 mt-1">Points</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-3xl font-bold">{myStats.badges}</p>
            <p className="text-xs text-gray-500 mt-1">Badges</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <p className="text-3xl font-bold">{currentStreak}</p>
            <p className="text-xs text-gray-500 mt-1">Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-3xl font-bold"># {myRank}</p>
            <p className="text-xs text-gray-500 mt-1">Rank</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-semibold mb-2">Modules Completed: {completedAssignments.length}/{myAssignments.length}</p>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                style={{ width: `${(completedAssignments.length / myAssignments.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 uppercase">Next Milestone</p>
              <p className="text-lg font-bold mt-1">{Math.ceil((myStats.points + 1) / 100) * 100} Points</p>
              <p className="text-xs text-gray-500 mt-1">{Math.ceil((myStats.points + 1) / 100) * 100 - myStats.points} points to go</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-600 uppercase">Average Score</p>
              <p className="text-lg font-bold mt-1">
                {completedAssignments.length > 0 
                  ? (completedAssignments.reduce((s, a) => s + (a.final_score || 0), 0) / completedAssignments.length).toFixed(1)
                  : 'N/A'}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Your Badges ({myBadges.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {myBadges.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Complete modules to earn badges!</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(badgesByRarity).map(([rarity, badges]) => {
                if (badges.length === 0) return null;
                return (
                  <div key={rarity}>
                    <p className="text-xs font-bold uppercase text-gray-600 mb-2 capitalize">{rarity}</p>
                    <div className="grid grid-cols-4 gap-3">
                      {badges.map(badge => (
                        <div key={badge.id} className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                          <div className="text-3xl mb-2">{badge.badge_icon}</div>
                          <p className="text-xs font-semibold">{badge.badge_name}</p>
                          <p className="text-[10px] text-gray-500 mt-1">{new Date(badge.earned_at).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.slice(0, 10).map((emp, i) => (
              <div key={emp.id} className={`flex items-center gap-4 p-3 rounded-lg ${emp.email === user?.email ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50'}`}>
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-sm">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{emp.full_name}</p>
                  <p className="text-xs text-gray-500">{emp.completedModules} modules · {emp.badges} badges</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{emp.points}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}