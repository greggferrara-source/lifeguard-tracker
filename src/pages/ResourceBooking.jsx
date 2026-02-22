import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Loader, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ResourceBookingCalendar from "@/components/resources/ResourceBookingCalendar";
import BookingForm from "@/components/resources/BookingForm";

const resourceTypeIcons = {
  meeting_room: '🏢',
  equipment: '🔧',
  vehicle: '🚗',
  facility: '🏛️',
  other: '📦'
};

export default function ResourceBooking() {
  const queryClient = useQueryClient();
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filterType, setFilterType] = useState("all");

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: resources = [], isLoading: resourcesLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: () => base44.entities.Resource.filter({ is_active: true }),
    refetchInterval: 30000
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['resource-bookings'],
    queryFn: () => base44.entities.ResourceBooking.list('-created_at', 500),
    refetchInterval: 30000
  });

  const deleteMutation = useMutation({
    mutationFn: (bookingId) => base44.entities.ResourceBooking.update(bookingId, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource-bookings'] });
      setSelectedBooking(null);
    }
  });

  const filteredResources = filterType === 'all' 
    ? resources 
    : resources.filter(r => r.resource_type === filterType);

  const userBookings = bookings.filter(b => b.booked_by_email === user?.email);
  const pendingApproval = bookings.filter(b => b.status === 'pending_approval').length;

  const getStatusColor = (status) => {
    const colors = {
      pending_approval: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.confirmed;
  };

  const handleNewBooking = (resource) => {
    setSelectedResource(resource);
    setBookingDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-8 h-8 text-[#1a9c5b]" />
              Resource Booking
            </h1>
            <p className="text-gray-600 mt-2">View, book, and manage shared resources</p>
          </div>
          <div className="text-right">
            {pendingApproval > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800 mb-2">{pendingApproval} Pending Approval</Badge>
            )}
            <p className="text-sm text-gray-600">Your bookings: {userBookings.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {['all', 'meeting_room', 'equipment', 'vehicle', 'facility', 'other'].map(type => (
            <Button
              key={type}
              variant={filterType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(type)}
              className={filterType === type ? "bg-[#1a9c5b] hover:bg-[#158a4e]" : ""}
            >
              {type === 'all' ? 'All Resources' : resourceTypeIcons[type] + ' ' + type.replace('_', ' ').toUpperCase()}
            </Button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {resourcesLoading ? (
            <div className="col-span-3 text-center py-12">
              <Loader className="w-8 h-8 animate-spin text-[#1a9c5b] mx-auto" />
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-gray-500">
              <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No resources found</p>
            </div>
          ) : (
            filteredResources.map(resource => {
              const resourceBookings = bookings.filter(b => b.resource_id === resource.id && b.status !== 'cancelled');
              return (
                <Card key={resource.id} className="hover:border-[#1a9c5b] transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {resourceTypeIcons[resource.resource_type]} {resource.name}
                        </CardTitle>
                        <p className="text-xs text-gray-500 mt-1">{resource.location_name}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{resource.resource_type.replace('_', ' ')}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {resource.description && (
                      <p className="text-sm text-gray-600">{resource.description}</p>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {resource.capacity && <div className="bg-gray-50 p-2 rounded"><p className="text-gray-500">Capacity</p><p className="font-semibold">{resource.capacity}</p></div>}
                      <div className="bg-gray-50 p-2 rounded"><p className="text-gray-500">Bookings</p><p className="font-semibold">{resourceBookings.length}</p></div>
                    </div>
                    {resource.requires_approval && (
                      <Badge className="bg-orange-100 text-orange-800 text-xs w-full text-center">Requires Approval</Badge>
                    )}
                    <Button
                      onClick={() => handleNewBooking(resource)}
                      className="w-full bg-[#1a9c5b] hover:bg-[#158a4e]"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Book Resource
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Calendar View */}
        {filteredResources.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Availability Calendar</h2>
            <ResourceBookingCalendar resources={filteredResources} bookings={bookings} />
          </div>
        )}

        {/* My Bookings */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Bookings</h2>
          {bookingsLoading ? (
            <div className="text-center py-12">
              <Loader className="w-8 h-8 animate-spin text-[#1a9c5b] mx-auto" />
            </div>
          ) : userBookings.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center text-gray-500">
                <p>No bookings yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {userBookings.map(booking => (
                <Card key={booking.id} className="cursor-pointer hover:shadow-md transition-all" onClick={() => setSelectedBooking(booking)}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{booking.booking_title}</h3>
                          <Badge className={getStatusColor(booking.status)} className="text-xs">{booking.status.replace('_', ' ')}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{resourceTypeIcons[booking.resource_type]} {booking.resource_name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {booking.start_date} · {booking.start_time} - {booking.end_time}
                        </p>
                        {booking.attendees && booking.attendees.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">{booking.attendees.length} attendee{booking.attendees.length !== 1 ? 's' : ''}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {booking.status === 'confirmed' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        {booking.status === 'pending_approval' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Book Resource</DialogTitle>
            <DialogDescription>{selectedResource?.name}</DialogDescription>
          </DialogHeader>
          {selectedResource && (
            <BookingForm
              resource={selectedResource}
              onSuccess={() => {
                setBookingDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ['resource-bookings'] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedBooking?.booking_title}</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">Resource</p>
                <p className="text-sm text-gray-900">{selectedBooking.resource_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Date</p>
                  <p className="text-sm text-gray-900">{selectedBooking.start_date}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Time</p>
                  <p className="text-sm text-gray-900">{selectedBooking.start_time} - {selectedBooking.end_time}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Status</p>
                <Badge className={getStatusColor(selectedBooking.status)} className="text-xs mt-1">{selectedBooking.status}</Badge>
              </div>
              {selectedBooking.attendees && selectedBooking.attendees.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Attendees</p>
                  <div className="space-y-1">
                    {selectedBooking.attendees.map((a, idx) => (
                      <p key={idx} className="text-xs text-gray-600">{a.name} ({a.status})</p>
                    ))}
                  </div>
                </div>
              )}
              {selectedBooking.notes && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Notes</p>
                  <p className="text-sm text-gray-600">{selectedBooking.notes}</p>
                </div>
              )}
              {selectedBooking.status === 'confirmed' && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteMutation.mutate(selectedBooking.id);
                  }}
                  disabled={deleteMutation.isPending}
                  className="w-full"
                >
                  {deleteMutation.isPending ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Cancel Booking
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}