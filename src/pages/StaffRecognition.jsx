import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Star, Zap, Shield, Clock, TrendingUp, Trophy, Medal, Users, Sparkles } from "lucide-react";

const BADGE_DEFINITIONS = [
  { id: "perfect_attendance", icon: "🏅", label: "Perfect Attendance", description: "No absences this month", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  { id: "fast_responder", icon: "⚡", label: "Fast Responder", description: "Logged incident within 5 minutes", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { id: "certified_pro", icon: "🛡️", label: "Certified Pro", description: "All certifications up to date", color: "bg-green-100 text-green-800 border-green-300" },
  { id: "team_player", icon: "🤝", label: "Team Player", description: "Covered 3+ shift swaps", color: "bg-purple-100 text-purple-800 border-purple-300" },
  { id: "safety_star", icon: "⭐", label: "Safety Star", description: "Zero incidents for 90 days", color: "bg-red-100 text-red-800 border-red-300" },
  { id: "early_bird", icon: "🌅", label: "Early Bird", description: "On time for all shifts this month", color: "bg-orange-100 text-orange-800 border-orange-300" },
  { id: "mentor", icon: "🎓", label: "Mentor", description: "Completed all training modules", color: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  { id: "top_performer", icon: "🏆", label: "Top Performer", description: "Highest performance rating", color: "bg-amber-100 text-amber-800 border-amber-300" },
];

export default function StaffRecognition() {
  const [awardingBadge, setAwardingBadge] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });
  const { data: employees = [] } = useQuery({
    queryKey: ["employees-active"],
    queryFn: () => base44.entities.Employee.filter({ status: "active" }),
  });
  const { data: badges = [] } = useQuery({
    queryKey: ["employee-badges"],
    queryFn: () => base44.entities.EmployeeBadge.list("-created_date", 200),
  });

  const isAdmin = ["admin", "manager", "site_owner", "enterprise_site_owner", "enterprise_admin"].includes(user?.role);

  const awardBadgeMutation = useMutation({
    mutationFn: async ({ employeeId, employeeName, badgeId, badgeLabel }) => {
      return await base44.entities.EmployeeBadge.create({
        employee_id: employeeId,
        employee_name: employeeName,
        badge_id: badgeId,
        badge_label: badgeLabel,
        awarded_by: user?.full_name || "Manager",
        awarded_by_email: user?.email,
        awarded_date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-badges"] });
      setAwardingBadge(null);
      setSelectedEmployee(null);
    },
  });

  const generateLeaderboard = async () => {
    setGenerating(true);
    try {
      const empSummary = employees.slice(0, 20).map(e => ({
        id: e.id,
        name: `${e.first_name} ${e.last_name}`,
        role: e.role,
        badgeCount: badges.filter(b => b.employee_id === e.id).length,
        certCount: (e.certifications || []).length,
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are recognizing top-performing lifeguard staff. Based on this data, identify 3 employees to spotlight with personalized recognition messages.

Employees: ${JSON.stringify(empSummary)}

Return JSON:
{
  "spotlights": [
    {
      "employee_id": "id",
      "employee_name": "name",
      "reason": "specific reason for recognition",
      "suggested_badge": "badge id from: perfect_attendance, fast_responder, certified_pro, team_player, safety_star, early_bird, mentor, top_performer",
      "message": "personalized recognition message"
    }
  ]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            spotlights: { type: "array", items: { type: "object" } },
          },
        },
      });
      setSpotlights(result?.spotlights || []);
    } finally {
      setGenerating(false);
    }
  };

  const [spotlights, setSpotlights] = useState([]);

  // Build leaderboard
  const leaderboard = employees.map(emp => {
    const empBadges = badges.filter(b => b.employee_id === emp.id);
    return {
      id: emp.id,
      name: `${emp.first_name} ${emp.last_name}`,
      role: emp.role,
      badgeCount: empBadges.length,
      badges: empBadges,
      points: empBadges.length * 10 + (emp.certifications?.length || 0) * 5,
    };
  }).sort((a, b) => b.points - a.points);

  const getBadgeDef = (badgeId) => BADGE_DEFINITIONS.find(b => b.id === badgeId) || { icon: "🏅", label: badgeId, color: "bg-gray-100 text-gray-700 border-gray-300" };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" /> Staff Recognition
          </h1>
          <p className="text-gray-500 text-sm mt-1">Celebrate achievements and reward top performers</p>
        </div>
        <Button onClick={generateLeaderboard} disabled={generating} variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
          <Sparkles className="w-4 h-4 mr-2" />
          {generating ? "Generating..." : "AI Spotlights"}
        </Button>
      </div>

      {/* AI Spotlights */}
      {spotlights.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" />AI Staff Spotlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {spotlights.map((s, i) => {
              const badgeDef = getBadgeDef(s.suggested_badge);
              return (
                <Card key={i} className="border-amber-200 bg-amber-50">
                  <CardContent className="pt-4 pb-4 text-center space-y-2">
                    <div className="text-3xl">{badgeDef.icon}</div>
                    <div className="font-bold text-gray-900">{s.employee_name}</div>
                    <p className="text-xs text-gray-600">{s.message}</p>
                    <Badge className={`text-xs border ${badgeDef.color}`}>{badgeDef.label}</Badge>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs"
                        onClick={() => awardBadgeMutation.mutate({
                          employeeId: s.employee_id,
                          employeeName: s.employee_name,
                          badgeId: s.suggested_badge,
                          badgeLabel: badgeDef.label,
                        })}
                      >
                        Award Badge
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-500" />Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.slice(0, 10).map((emp, i) => (
              <div key={emp.id} className={`flex items-center gap-3 p-3 rounded-lg ${i === 0 ? "bg-amber-50 border border-amber-200" : i === 1 ? "bg-gray-50 border border-gray-200" : i === 2 ? "bg-orange-50 border border-orange-200" : "bg-white border border-gray-100"}`}>
                <div className="w-8 h-8 flex items-center justify-center font-bold text-lg">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span className="text-sm text-gray-400">#{i + 1}</span>}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{emp.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{emp.role?.replace(/_/g, " ")}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1 flex-wrap justify-end max-w-32">
                    {emp.badges.slice(0, 3).map((b, bi) => (
                      <span key={bi} title={getBadgeDef(b.badge_id)?.label} className="text-base">{getBadgeDef(b.badge_id)?.icon}</span>
                    ))}
                    {emp.badges.length > 3 && <span className="text-xs text-gray-400">+{emp.badges.length - 3}</span>}
                  </div>
                  <Badge variant="secondary" className="text-xs">{emp.points} pts</Badge>
                  {isAdmin && (
                    <Button size="sm" variant="outline" className="text-xs h-7"
                      onClick={() => { setSelectedEmployee(emp); setAwardingBadge(true); }}>
                      Award
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Badges */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Medal className="w-4 h-4" />Available Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BADGE_DEFINITIONS.map(badge => (
              <div key={badge.id} className={`rounded-lg p-3 border text-center ${badge.color}`}>
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="text-xs font-bold">{badge.label}</div>
                <div className="text-xs mt-1 opacity-75">{badge.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Award Badge Modal */}
      {awardingBadge && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Award Badge to {selectedEmployee.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {BADGE_DEFINITIONS.map(badge => (
                  <button
                    key={badge.id}
                    onClick={() => awardBadgeMutation.mutate({
                      employeeId: selectedEmployee.id,
                      employeeName: selectedEmployee.name,
                      badgeId: badge.id,
                      badgeLabel: badge.label,
                    })}
                    className={`p-2 rounded-lg border text-left hover:opacity-80 transition-opacity ${badge.color}`}
                  >
                    <div className="text-xl">{badge.icon}</div>
                    <div className="text-xs font-semibold mt-1">{badge.label}</div>
                  </button>
                ))}
              </div>
              <Button variant="outline" className="w-full" onClick={() => { setAwardingBadge(false); setSelectedEmployee(null); }}>
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}