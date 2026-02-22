import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";

export default function BookingForm({ resource, onSuccess }) {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    booking_title: '',
    booking_description: '',
    start_date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_date: new Date().toISOString().split('T')[0],
    end_time: '10:00',
    attendees: [],
    notes: ''
  });

  React.useEffect(() => {
    base44.auth.me().then(u => setUser(u));
  }, []);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const booking = await base44.entities.ResourceBooking.create({
        resource_id: resource.id,
        resource_name: resource.name,
        resource_type: resource.resource_type,
        location_id: resource.location_id,
        booked_by_email: user.email,
        booked_by_name: user.full_name,
        status: resource.requires_approval ? 'pending_approval' : 'confirmed',
        ...data,
        created_at: new Date().toISOString()
      });

      // Send confirmation notification
      await base44.functions.invoke('sendBookingNotifications', {
        booking_id: booking.id,
        notification_type: 'confirmation'
      });

      return booking;
    },
    onSuccess: onSuccess
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.booking_title && formData.start_date && formData.start_time) {
      createMutation.mutate(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1">Booking Title</label>
        <Input
          placeholder="e.g., Team Meeting, Equipment Setup"
          value={formData.booking_title}
          onChange={(e) => setFormData({ ...formData, booking_title: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1">Description</label>
        <Textarea
          placeholder="Details about the booking..."
          value={formData.booking_description}
          onChange={(e) => setFormData({ ...formData, booking_description: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">Start Date</label>
          <Input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">Start Time</label>
          <Input
            type="time"
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">End Date</label>
          <Input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">End Time</label>
          <Input
            type="time"
            value={formData.end_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1">Notes</label>
        <Textarea
          placeholder="Any special requests or notes..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
        />
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button type="submit" disabled={createMutation.isPending} className="bg-[#1a9c5b] hover:bg-[#158a4e]">
          {createMutation.isPending ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
          {resource.requires_approval ? 'Request Booking' : 'Confirm Booking'}
        </Button>
      </div>
    </form>
  );
}