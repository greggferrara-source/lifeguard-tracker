import React, { useState } from "react";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ResourceBookingCalendar({ resources, bookings }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedResource, setSelectedResource] = useState(resources[0]?.id);
  const [filterType, setFilterType] = useState('all');

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const filteredResources = filterType === 'all' ? resources : resources.filter(r => r.resource_type === filterType);
  const resource = filteredResources.find(r => r.id === selectedResource);
  const resourceBookings = bookings.filter(b => b.resource_id === selectedResource && b.status !== 'cancelled');

  const getDateBookings = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return resourceBookings.filter(b => b.start_date === dateStr);
  };

  const hasConflict = (day) => {
    const dayBookings = getDateBookings(day);
    return dayBookings.length > 1;
  };

  const days = Array.from({ length: firstDay }, () => null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      {/* Filter by Resource Type */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">Filter by Type</label>
        <div className="flex flex-wrap gap-2">
          {['all', 'meeting_room', 'equipment', 'vehicle', 'facility', 'other'].map(type => (
            <button
              key={type}
              onClick={() => {
                setFilterType(type);
                setSelectedResource(filteredResources[0]?.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'All' : type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Selector */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">Select Resource</label>
        <select
          className="w-full border border-gray-300 rounded-lg p-2"
          value={selectedResource}
          onChange={(e) => setSelectedResource(e.target.value)}
        >
          {filteredResources.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-lg font-semibold text-gray-900">{monthName}</h3>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const dayBookings = day ? getDateBookings(day) : [];
          const hasConflictFlag = day && hasConflict(day);

          return (
            <div
              key={idx}
              className={`p-2 rounded-lg text-center aspect-square flex flex-col items-center justify-center text-sm font-medium border-2 transition-all ${
                !day
                  ? 'border-transparent'
                  : hasConflictFlag
                  ? 'border-red-300 bg-red-50'
                  : dayBookings.length > 0
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {day && (
                <>
                  <span className="text-gray-900">{day}</span>
                  {hasConflictFlag && <AlertCircle className="w-3 h-3 text-red-500 mt-0.5" />}
                  {dayBookings.length > 0 && !hasConflictFlag && (
                    <Badge variant="outline" className="text-xs mt-0.5">{dayBookings.length}</Badge>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-4 border-t mt-4 space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-blue-300 bg-blue-50" />
          <span className="text-gray-700">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-red-300 bg-red-50" />
          <span className="text-gray-700">Conflict Detected</span>
        </div>
      </div>
    </div>
  );
}