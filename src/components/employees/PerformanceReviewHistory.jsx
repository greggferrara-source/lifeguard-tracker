import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp } from "lucide-react";

export default function PerformanceReviewHistory({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4" />
            Performance Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No performance reviews yet</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      published: 'bg-[#1a9c5b]/10 text-[#1a9c5b]'
    };
    return colors[status] || colors.draft;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Award className="w-4 h-4" />
          Performance Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reviews.map(review => (
          <div key={review.id} className="border-l-4 border-[#1a9c5b] pl-3 py-2">
            <div className="flex items-start justify-between mb-1">
              <p className="text-sm font-semibold">
                {review.review_period_start} to {review.review_period_end}
              </p>
              <Badge className={getStatusColor(review.status)}>
                {review.status}
              </Badge>
            </div>
            {review.overall_rating && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-gray-600" />
                <span className={`text-sm font-bold ${getRatingColor(review.overall_rating)}`}>
                  {review.overall_rating.toFixed(1)} / 5.0
                </span>
              </div>
            )}
            {review.ai_generated_summary && (
              <p className="text-xs text-gray-600 mt-2 line-clamp-2">{review.ai_generated_summary}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}