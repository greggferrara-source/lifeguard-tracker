import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function DocsEnhancedFeatures() {
  const [expandedSection, setExpandedSection] = useState(null);

  const sections = [
    {
      id: 'performance-reviews',
      title: 'Performance Review System (Enterprise Only)',
      icon: '⭐',
      description: 'AI-powered performance reviews for comprehensive employee evaluations',
      details: `
        The Performance Review System is an enterprise-level feature designed to streamline and enhance the employee evaluation process. Here's what you can do:

        **Key Features:**
        - **Create Reviews**: Initiate performance reviews for any active employee
        - **Structured Feedback**: Provide feedback on specific skills with ratings (1-5 scale)
        - **AI-Generated Summaries**: Automatically generate professional review summaries using AI analysis
        - **Performance Metrics**: Track and display key metrics:
          • Total hours worked during review period
          • Average hours per week
          • Certifications held
          • Training modules completed
          • Incidents reported
          • Attendance rate

        **Workflow:**
        1. Navigate to Performance Reviews (Enterprise menu)
        2. Click "New Review" to create a review
        3. Select employee and review period dates
        4. Fill in skill feedback and manager notes
        5. Click "Generate AI Summary" to create comprehensive summary
        6. Mark as "Completed" when finished
        7. Employee profile displays review history automatically

        **Integration:**
        - Reviews link directly to Employee Profiles
        - Onboarding data is included in AI summary generation
        - Performance metrics pull from actual work history
        - Training completion data is analyzed

        **Who Can Access:**
        - Enterprise Site Owners
        - Enterprise Admins
        
        **Note:** Performance reviews are automatically saved as drafts and can be edited before completion.
      `
    },
    {
      id: 'booking-notifications',
      title: 'Resource Booking Notifications',
      icon: '🔔',
      description: 'Automated email and in-app notifications for resource bookings',
      details: `
        When you make a resource booking, the system automatically sends notifications based on your preferences. Here's how it works:

        **Notification Types:**
        - **Confirmation Notifications**: Sent immediately when a booking is confirmed
        - **Upcoming Reminders**: Sent before scheduled bookings
        - **Conflict Alerts**: Sent when booking conflicts are detected

        **Notification Channels:**
        - **Email Notifications**: Professional email with booking details
        - **In-App Notifications**: Appear in your notification center
        
        **Customize Your Preferences:**
        1. Go to Notification Preferences (click your profile)
        2. Toggle email notifications ON/OFF
        3. Toggle in-app notifications ON/OFF
        4. Save your preferences

        **What Gets Sent:**
        - Booking confirmation with resource details, dates, and times
        - Upcoming booking reminders 24 hours before
        - Immediate alerts if conflicts are detected with your bookings

        **Email Notification Contains:**
        - Resource name and type
        - Booking date and time
        - Booking title and description
        - Your action (confirmation/reminder/alert)

        **Disable Notifications:**
        You can disable email or in-app notifications independently. Visit your Notification Preferences at any time to adjust settings.
      `
    },
    {
      id: 'notification-preferences',
      title: 'Notification Preferences Center',
      icon: '⚙️',
      description: 'Centralized control over all notification settings',
      details: `
        Control how and when you receive notifications across the entire platform.

        **Available Settings:**
        - Email notifications for bookings
        - In-app notifications for bookings
        - Digest frequency options
        - Notification severity filters

        **How to Access:**
        1. Click your profile avatar (top-right)
        2. Select "Notification Preferences"
        3. Toggle options ON/OFF as needed
        4. Save changes

        **Email Notifications:**
        When enabled, you'll receive professional emails for:
        - Resource booking confirmations
        - Upcoming booking reminders
        - Booking conflict alerts

        **In-App Notifications:**
        When enabled, you'll see notification badges and messages for:
        - New bookings confirmed
        - Upcoming bookings
        - Any conflicts detected

        **Best Practices:**
        - Keep email enabled for important confirmations
        - Use in-app for real-time reminders
        - Adjust based on your workflow needs
      `
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Link to={"/Docs"} className="inline-block">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Docs
          </Button>
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Enhanced Features Guide</h1>
          <p className="text-gray-600">Performance Reviews, Booking Notifications & Preferences</p>
        </div>

        {/* Feature Sections */}
        <div className="space-y-4">
          {sections.map(section => (
            <Card key={section.id} className="overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="w-full text-left"
              >
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{section.icon}</span>
                    <div>
                      <CardTitle>{section.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                    </div>
                  </div>
                </CardHeader>
              </button>

              {expandedSection === section.id && (
                <CardContent className="border-t pt-6">
                  <div className="prose prose-sm max-w-none whitespace-pre-line text-gray-700">
                    {section.details}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Performance Reviews:</strong> Go to Enterprise → Performance Reviews (Enterprise users only)</p>
            <p><strong>Notification Settings:</strong> Click your profile avatar → Notification Preferences</p>
            <p><strong>Resource Booking:</strong> Go to Operations → Resource Booking</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}