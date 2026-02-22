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
      id: 'emergency-contact',
      title: 'Emergency Contact Information',
      icon: '🆘',
      description: 'Quick access to employee emergency contact details',
      details: `
        Emergency contact information is now integrated directly into employee profiles for easy access during critical situations.

        **What's Included:**
        - Emergency contact person's name
        - Phone number for immediate reach
        - Relationship to the employee (spouse, parent, sibling, etc.)

        **How to Access:**
        1. Go to Employee Management
        2. Click on any employee profile
        3. View the "Emergency Contact" card in the sidebar
        4. Contact details are clearly displayed with clickable phone number

        **How to Update:**
        - Edit employee profile to add or update emergency contact info
        - Changes are saved immediately and reflected in the profile view

        **Best Practices:**
        - Ensure all employees have at least one emergency contact on file
        - Review and update contacts annually
        - Use clearly labeled relationships for clarity
      `
    },
    {
      id: 'performance-history',
      title: 'Performance Review History on Profiles',
      icon: '📈',
      description: 'View employee performance reviews directly from their profile',
      details: `
        All performance reviews for an employee are now accessible directly from their profile for quick reference.

        **What You'll See:**
        - Review period dates
        - Review status (draft, in progress, completed, published)
        - Overall performance rating (1-5 scale)
        - AI-generated summary preview
        - Most recent reviews first

        **How to Access:**
        1. Go to Employee Management
        2. Click on an employee profile
        3. Scroll to the "Performance Reviews" card in the sidebar
        4. View all reviews and their details

        **Color Coding:**
        - Green ratings (4.5+): Excellent performance
        - Blue ratings (3.5+): Good performance
        - Yellow ratings (2.5+): Needs improvement
        - Red ratings: Below expectations

        **Use Cases:**
        - Quick performance overview before meetings
        - Track improvement over time
        - Reference for promotion or raise decisions
        - Document performance trends
      `
    },
    {
      id: 'auto-onboarding-tasks',
      title: 'Automated Onboarding Task Assignment',
      icon: '🎯',
      description: 'Role-based task assignment when employees are hired',
      details: `
        When a new employee is created or onboarding is initiated, relevant tasks are automatically assigned based on their role.

        **How It Works:**
        When starting onboarding, the system automatically creates role-specific tasks:

        **Lifeguard Tasks:**
        - IT Setup - Create Account
        - Complete HR Paperwork
        - Safety Training
        - Certification Review

        **Head Lifeguard Tasks:**
        - IT Setup - Create Account
        - Complete HR Paperwork
        - Management Training
        - Safety Training
        - Certification Review

        **Supervisor Tasks:**
        - IT Setup - Create Account
        - Complete HR Paperwork
        - Management Training
        - System Access Setup
        - Safety Training

        **Manager Tasks:**
        - IT Setup - Create Account
        - Complete HR Paperwork
        - Executive Onboarding
        - System Access Setup
        - Policy Review

        **Benefits:**
        - Ensures no critical tasks are missed
        - Standardizes onboarding across roles
        - Saves time on manual task creation
        - Automatically tracks completion
      `
    },
    {
      id: 'task-completion-tracking',
      title: 'Onboarding Task Completion Tracking',
      icon: '✅',
      description: 'Monitor progress of all onboarding tasks',
      details: `
        Track the completion status of every onboarding task to ensure smooth employee integration.

        **Task Status Types:**
        - **Pending**: Task assigned but not started
        - **In Progress**: Task currently being worked on
        - **Completed**: Task finished and verified

        **How to Track:**
        1. Go to Employee Onboarding
        2. Click on an active workflow to view details
        3. See all tasks with their status, due dates, and completion info
        4. Click the circle icon to mark tasks as complete

        **Progress Calculation:**
        - Overall workflow progress % based on completed tasks
        - Auto-updates as tasks are marked complete
        - Visual progress bar shows at-a-glance completion status

        **Task Details:**
        - Task title and description
        - Due date (color-coded)
        - Current status badge
        - Assigned person information
      `
    },
    {
      id: 'booking-calendar-filter',
      title: 'Enhanced Resource Booking Calendar',
      icon: '📅',
      description: 'Calendar view with filtering and conflict visualization',
      details: `
        The resource booking calendar now includes advanced filtering and real-time conflict detection.

        **Key Features:**
        - **Filter by Resource Type**: View only meeting rooms, equipment, vehicles, facilities, or all types
        - **Single Resource View**: Select specific resources to see their availability
        - **Conflict Highlighting**: Red shading indicates scheduling conflicts
        - **Booking Count**: See number of bookings per day
        - **Month Navigation**: Move between months easily

        **Visual Indicators:**
        - **Blue Days**: Resource is booked (blue border with count)
        - **Red Days**: Multiple bookings detected - potential conflict
        - **White Days**: No bookings scheduled

        **How to Use:**
        1. Go to Resource Booking
        2. Use filter buttons to select resource types (or "All")
        3. Choose a specific resource from the dropdown
        4. Navigate through months to view availability
        5. Days with red highlighting show conflicts

        **Conflict Detection:**
        - Automatically shows when multiple bookings overlap
        - Visual alert on calendar for quick identification
        - Prevents double-booking through system validation

        **Best Practices:**
        - Check calendar before creating new bookings
        - Use filters to focus on specific resource types
        - Review conflict days carefully before approving
      `
    },
    {
      id: 'booking-notifications',
      title: 'Resource Booking Notifications',
      icon: '🔔',
      description: 'Automated email and in-app notifications for resource bookings',
      details: `
        When you make a resource booking, the system automatically sends notifications based on your preferences.

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
          <p className="text-gray-600">Complete documentation for all new features and enhancements</p>
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
            <p><strong>Employee Profiles:</strong> Go to Operations → Employee Profiles</p>
            <p><strong>Onboarding Management:</strong> Go to Operations → Employee Onboarding</p>
            <p><strong>Resource Booking:</strong> Go to Operations → Resource Booking</p>
            <p><strong>Notification Settings:</strong> Click your profile avatar → Notification Preferences</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}