import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader, Plus, Star, Send, CheckCircle2 } from "lucide-react";

export default function PerformanceReviewManager() {
  const queryClient = useQueryClient();
  const [selectedReview, setSelectedReview] = useState(null);
  const [newReviewOpen, setNewReviewOpen] = useState(false);
  const [skillsFeedback, setSkillsFeedback] = useState([]);
  const [formData, setFormData] = useState({
    employee_id: '',
    review_period_start: '',
    review_period_end: '',
    overall_rating: 4
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const isEnterprise = user?.role === 'enterprise_admin' || user?.role === 'enterprise_site_owner';

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['performance-reviews'],
    queryFn: () => base44.entities.PerformanceReview.filter({}, '-created_at', 50),
    enabled: isEnterprise
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.filter({ status: 'active' }),
    enabled: isEnterprise
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data) => {
      const review = await base44.entities.PerformanceReview.create({
        ...data,
        reviewer_email: user.email,
        reviewer_name: user.full_name,
        status: 'draft'
      });
      return review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      setNewReviewOpen(false);
      setFormData({ employee_id: '', review_period_start: '', review_period_end: '', overall_rating: 4 });
    }
  });

  const generateSummaryMutation = useMutation({
    mutationFn: async (reviewId) => {
      const result = await base44.functions.invoke('generatePerformanceReviewSummary', {
        review_id: reviewId
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
    }
  });

  const updateReviewMutation = useMutation({
    mutationFn: async (updates) => {
      await base44.entities.PerformanceReview.update(selectedReview.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      setSelectedReview(null);
    }
  });

  if (!isEnterprise) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 font-semibold">Enterprise Feature</p>
            <p className="text-gray-600 mt-2">Performance reviews are available to enterprise users only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColor = {
    'draft': 'bg-gray-100 text-gray-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'published': 'bg-purple-100 text-purple-800'
  };

  const draftReviews = reviews.filter(r => r.status === 'draft');
  const activeReviews = reviews.filter(r => r.status === 'in_progress');
  const completedReviews = reviews.filter(r => ['completed', 'published'].includes(r.status));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Performance Reviews</h1>
            <p className="text-gray-600 mt-1">Manage and conduct employee performance reviews</p>
          </div>
          <Button onClick={() => setNewReviewOpen(true)} className="bg-[#1a9c5b] hover:bg-[#158a4e]">
            <Plus className="w-4 h-4 mr-2" />
            New Review
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Draft</p>
              <p className="text-3xl font-bold mt-2">{draftReviews.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{activeReviews.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{completedReviews.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total Reviews</p>
              <p className="text-3xl font-bold mt-2">{reviews.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Reviews by Status */}
        <Tabs defaultValue="draft" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="draft">Draft ({draftReviews.length})</TabsTrigger>
            <TabsTrigger value="active">In Progress ({activeReviews.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedReviews.length})</TabsTrigger>
          </TabsList>

          {['draft', 'active', 'completed'].map(tab => {
            const data = tab === 'draft' ? draftReviews : tab === 'active' ? activeReviews : completedReviews;
            return (
              <TabsContent key={tab} value={tab}>
                {isLoading ? (
                  <div className="text-center py-12">
                    <Loader className="w-8 h-8 animate-spin text-[#1a9c5b] mx-auto" />
                  </div>
                ) : data.length === 0 ? (
                  <Card>
                    <CardContent className="pt-12 pb-12 text-center text-gray-500">
                      <p>No {tab} reviews</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {data.map(review => (
                      <Card key={review.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedReview(review)}>
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-semibold">{review.employee_name}</p>
                              <p className="text-sm text-gray-500">
                                {review.review_period_start} to {review.review_period_end}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              {review.overall_rating && (
                                <div className="flex gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${i < review.overall_rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                              )}
                              <Badge className={statusColor[review.status]}>
                                {review.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Detail View */}
      {selectedReview && (
        <div className="max-w-6xl mx-auto mt-8 space-y-4">
          <Button variant="outline" onClick={() => setSelectedReview(null)}>← Back to list</Button>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedReview.employee_name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedReview.review_period_start} to {selectedReview.review_period_end}
                  </p>
                </div>
                <Badge className={statusColor[selectedReview.status]}>
                  {selectedReview.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Summary */}
              {selectedReview.ai_generated_summary && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="font-semibold text-sm mb-2">AI-Generated Summary</p>
                  <p className="text-sm text-gray-700">{selectedReview.ai_generated_summary}</p>
                </div>
              )}

              {/* Performance Metrics */}
              {selectedReview.metrics && (
                <div>
                  <p className="font-semibold mb-3">Performance Metrics</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Hours</p>
                      <p className="text-2xl font-bold">{selectedReview.metrics.total_hours_worked}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg Hours/Week</p>
                      <p className="text-2xl font-bold">{selectedReview.metrics.avg_hours_per_week}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Training Modules</p>
                      <p className="text-2xl font-bold">{selectedReview.metrics.training_modules_completed}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {!selectedReview.ai_generated_summary && (
                  <Button 
                    onClick={() => generateSummaryMutation.mutate(selectedReview.id)}
                    disabled={generateSummaryMutation.isPending}
                    className="bg-[#1a9c5b]"
                  >
                    {generateSummaryMutation.isPending ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Generate AI Summary
                      </>
                    )}
                  </Button>
                )}
                {selectedReview.status === 'draft' && (
                  <Button 
                    onClick={() => updateReviewMutation.mutate({ status: 'in_progress' })}
                    className="bg-blue-600"
                  >
                    Start Review
                  </Button>
                )}
                {selectedReview.status === 'in_progress' && (
                  <Button 
                    onClick={() => updateReviewMutation.mutate({ status: 'completed', completed_at: new Date().toISOString() })}
                    className="bg-green-600"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Review
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Review Dialog */}
      <Dialog open={newReviewOpen} onOpenChange={setNewReviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Performance Review</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Employee</Label>
              <Select value={formData.employee_id} onValueChange={(value) => setFormData({...formData, employee_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Review Period Start</Label>
              <Input
                type="date"
                value={formData.review_period_start}
                onChange={(e) => setFormData({...formData, review_period_start: e.target.value})}
              />
            </div>

            <div>
              <Label>Review Period End</Label>
              <Input
                type="date"
                value={formData.review_period_end}
                onChange={(e) => setFormData({...formData, review_period_end: e.target.value})}
              />
            </div>

            <Button
              onClick={() => createReviewMutation.mutate(formData)}
              disabled={!formData.employee_id || !formData.review_period_start || !formData.review_period_end || createReviewMutation.isPending}
              className="w-full bg-[#1a9c5b]"
            >
              {createReviewMutation.isPending ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Review'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}