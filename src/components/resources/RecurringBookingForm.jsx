import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RecurringBookingForm({ onRecurrenceChange }) {
  const [isRecurring, setIsRecurring] = useState(false);
  const [pattern, setPattern] = useState('daily');
  const [endDate, setEndDate] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);

  const handleDayToggle = (day) => {
    const updated = selectedDays.includes(day) 
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    setSelectedDays(updated);
    
    onRecurrenceChange({
      is_recurring: isRecurring,
      pattern,
      end_date: endDate,
      recurring_days: updated
    });
  };

  const handleChange = (field, value) => {
    const updates = {
      is_recurring: field === 'recurring' ? value : isRecurring,
      pattern: field === 'pattern' ? value : pattern,
      end_date: field === 'endDate' ? value : endDate,
      recurring_days: selectedDays
    };

    if (field === 'recurring') setIsRecurring(value);
    if (field === 'pattern') setPattern(value);
    if (field === 'endDate') setEndDate(value);

    onRecurrenceChange(updates);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recurring Booking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox 
            id="recurring"
            checked={isRecurring}
            onCheckedChange={(checked) => handleChange('recurring', checked)}
          />
          <Label htmlFor="recurring" className="cursor-pointer">
            Make this a recurring booking
          </Label>
        </div>

        {isRecurring && (
          <>
            {/* Pattern Selection */}
            <div>
              <Label>Repeat Pattern</Label>
              <Select value={pattern} onValueChange={(value) => handleChange('pattern', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Day Selection for Weekly Pattern */}
            {pattern === 'weekly' && (
              <div>
                <Label className="mb-2 block">Repeat on</Label>
                <div className="grid grid-cols-7 gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                    <button
                      key={day}
                      onClick={() => handleDayToggle(idx)}
                      className={`p-2 rounded text-sm font-medium transition ${
                        selectedDays.includes(idx)
                          ? 'bg-[#1a9c5b] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* End Date */}
            <div>
              <Label>End Date</Label>
              <Input 
                type="date"
                value={endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}