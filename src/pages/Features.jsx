import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Features() {
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const module = pathParts[pathParts.length - 1] || "scheduling";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [module]);

  const moduleContent = {
    scheduling: {
      title: "Staff Scheduling",
      subtitle: "Scheduling your staff has never been easier.",
      quote: "Easy to schedule staff and make new schedules. Summer schedules that used to take me almost TWO DAYS to complete were finished in a FEW HOURS with LifeGuard Tracker.",
      icon: Calendar,
      stats: "10,482,059 shifts scheduled and counting.",
      sections: [
        {
          title: "Spend Less Time Scheduling",
          description: "Setting up your staff schedule is quick and easy. Once you set up your locations, positions and preferences (day of week, view mode, etc.), you can quickly import your employees via spreadsheet.",
          image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&h=500&fit=crop&crop=center",
          reverse: false,
          highlight: true
        },
        {
          title: "Simple Data Entry",
          description: "Inviting your employees to LifeGuard Tracker is easy. Once you create their profile, we'll automatically send them an email and text message invitation to log in and get on-boarded straight from their phone!"
        },
        {
          title: "24/7 Mobile Access",
          description: "Staff are always in-the-know. They can access their schedule anytime from their phone, get reminded about upcoming shifts, and trade shifts with the click of a button. They can even sync their schedule with Google Calendar, iCloud Calendar, and more."
        },
        {
          title: "Cross-device Compatibility",
          description: "LifeGuard Tracker is web-based. No need to worry about installation, just open your browser on any desktop, tablet, or mobile device and build or adjust your schedule on the go!"
        },
        {
          title: "Schedule Notes",
          description: "Have a special event or just need to let staff know about something important on the schedule? Simply create a schedule note on that day and they'll be able to see the details when they view their schedule on any device."
        },
        {
          title: "Intelligently Scheduling",
          description: "Have a 15 year old on your payroll? It's easy to make sure they don't get scheduled outside department of labor rules. Any underage employee (based on their birthdate) is highlighted so you know to take extra precautions when scheduling them. Also, we'll make sure you don't double book employees by alerting you with shift conflicts."
        },
        {
          title: "Always Know Your Schedule",
          description: "Staff no longer have an excuse for not knowing their schedule. They can view their own schedule on any device, 24/7. The schedule is always up-to-date, so there's no old copies laying around. Staff are even alerted instantly when the schedule is published so they know what shifts they have been assigned!"
        },
        {
          title: "Auto-Schedule",
          description: "In a hurry? LifeGuard Tracker Auto-Schedule can fill all of your unassigned shifts with eligible employees for you! Simply create your empty schedule and once all your employee availability, time off request, desired hours, and max hours are set, our algorithm does all the heavy lifting.",
          image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=700&h=500&fit=crop&crop=center",
          reverse: true
        },
        {
          title: "Keep Your Schedule Under Control",
          description: "There's always human factors. For example, you know which employees you can trust opening shifts to, or which lesson instructors are best. Assign your must-haves in the schedule first, then let Auto-Schedule fill in rest of the gaps!"
        },
        {
          title: "Keep It Fair",
          description: "Auto-Schedule maximizes the availability and desired hours of all employees first. Shifts are spread across all staff up to their desired hours before starting to go up to max weekly hours, so you can keep the schedule fair and consistent across staff."
        },
        {
          title: "Employee Availability",
          description: "Keeping track of when staff are available to work used to be a pain, but not anymore! You will always know when employees are available, if they have requested time off, so you can quickly build your staff schedule around their needs.",
          image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&h=500&fit=crop&crop=center",
          reverse: false
        },
        {
          title: "Up-To-Date Employee Availability",
          description: "LifeGuard Tracker allows each employee to input and manage their own work availability, on any device. Once they enter their availability, it automatically integrates with the staff schedule so you can quickly see who can and can't work a shift. You can even lock the employee from changing their availability while you schedule, so you don't have to worry about things changing on you!"
        },
        {
          title: "Time Off Requests",
          description: "Quality of life is directly connected to having healthy time away from work. Handle vacation and time off requests with ease and clear communication.",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&h=500&fit=crop&crop=center",
          reverse: true
        },
        {
          title: "Simple Vacation & Time Off Management",
          description: "Employees can make time off requests directly from their mobile device, tablet, or PC. Managers are alerted automatically via text or email for approval. Once approved, employees are automatically alerted that their request was approved or denied. Then this information is logged and integrated into the staff schedule to further identify who is eligible to fill shifts."
        },
        {
          title: "Open Shifts",
          description: "Have a shift that needs filled? Employees can sign up for open shifts on their own by creating these special shifts on the schedule. Unlike unassigned shifts, published open shifts are visible to any eligible employee and they can sign up with one click while viewing their schedule.",
          image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&h=500&fit=crop&crop=center",
          reverse: false
        }
      ]
    },
    timeclock: {
      title: "Time Clock & Attendance",
      subtitle: "Time and attendance tracking built with aquatics in mind",
      quote: "DigiQuatics makes time cards worlds easier. I shudder to think of my days before DigiQuatics! This not only works for Aquatics but for our entire Recreation Department. It's fantastic!",
      stats: "3,025,830 clock-ins and counting.",
      sections: [
        {
          title: "Optimized for staff with multiple job titles",
          description: "Do you have lifeguards, lesson instructors, managers on duty all with different job codes and pay rates? We've optimized Time Clock just for that. Easily add multiple positions to your employee profile with their job code and pay rate and the software takes care of the rest! No more tallying hours and calculating different pay rates.",
          image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&h=500&fit=crop&crop=center",
          reverse: false,
          highlight: true
        },
        {
          title: "Simple integration for multiple departments outside aquatics",
          description: "Aquatic centers frequently have other staff that could use a simple time tracking tool as well. LifeGuard Tracker works great for aquatics operations, front desk, instructors, and more. Simply create multiple departments to keep staff separate while centralizing all your time-keeping into one user-friendly platform."
        },
        {
          title: "Always make sure your facility is staffed",
          description: "Having an un-staffed facility is the last thing you want to get a phone call about, especially early in the morning. Get a notification sent instantly to your phone when a staff member doesn't clock in for their shift, so you can follow up and make sure staff are there when they're supposed to be."
        },
        {
          title: "Check clock-ins across multiple facilities from one place",
          description: "Making sure your staff have shown up when managing multiple facilities isn't easy. You can check your Time Clock dashboard and verify everyone has shown up and clocked in on-site from one screen, giving you peace of mind that all your pools are starting the day off right."
        },
        {
          title: "Ensure staff are actually on-site when they clock in",
          description: "With GPS timekeeping, you can see exactly where your staff are when they clock in and out from their mobile device. No more guessing games and staff saying they were at the pool when they weren't. LifeGuard Tracker Time Clock Portal allows your staff to quickly clock in on a desktop workstation or on-site tablet."
        },
        {
          title: "Integrates with your payroll process",
          description: "How much does it cost to staff your swimming pool? Or run a lesson program? Two clicks and you've got those numbers. Simply enter your employee's pay rates for their various positions and reports are one click away.",
          image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&h=500&fit=crop&crop=center",
          reverse: true
        }
      ]
    },
    reports: {
      title: "Shift Reports & Communications",
      subtitle: "Your one-stop-shop for simple staff communication",
      quote: "DigiQuatics has simplified our records and cut down on our paperwork! We love it!",
      stats: "195,521 shift reports filled out.",
      sections: [
        {
          title: "Simple report submission from anywhere",
          description: "Streamlining communication between staff has never been easier with LifeGuard Tracker. Staff can submit reports from the mobile devices, or workstation tablets and computers. They can even attach documents such as incident reports, facility inspections, and more with the click of a button!",
          image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&h=500&fit=crop&crop=center",
          reverse: false,
          highlight: true
        },
        {
          title: "Stay in the loop with instant report notifications",
          description: "Need to follow up on an accident report that was submitted at another site? Simple. LifeGuard Tracker can automatically notify you via email or text when a shift report is submitted, so follow-up is straightforward and timely."
        },
        {
          title: "Quickly filter and search for past reports",
          description: "LifeGuard Tracker automatically tags reports based on topics found in the content so you can easily search for them at a later date. Optical character recognition (OCR) is used for intelligent indexing of shift report attachments including PDFs, office documents, and images."
        },
        {
          title: "Smart Tagging automatically categorizes shift reports by topic",
          description: "Do your reports commonly mentioned keywords in them? It's easy to find shift reports related by topic with smart tags from LifeGuard Tracker. Shift Reports are automatically tagged by relevant keywords so finding reports related to incidents or training is typing a keyword away!"
        }
      ]
    },
    employees: {
      title: "Employee Management",
      subtitle: "Your staff. Your way.",
      quote: "LifeGuard Tracker has helped us manage our employees' schedules, certifications, work permits and contact information all in one database.",
      stats: "122,277 employees managed!",
      sections: [
        {
          title: "Track key employee fields",
          description: "With LifeGuard Tracker Employee Management you can track key fields for your staff effortlessly. From address and date of birth, to emergency contacts, to sizing information, you can track it all without breaking a sweat.",
          image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&h=500&fit=crop&crop=center",
          reverse: false,
          highlight: true
        },
        {
          title: "Access controls done right",
          description: "Handling a large staff? Or a small staff that requests subs or has time off for school? With LifeGuard Tracker you can simply add the locations and positions each staff member has access to. LifeGuard Tracker can even help you manage the top priority locations and positions an employee has access to."
        },
        {
          title: "Attachments. We got you.",
          description: "Attach key files to staff profiles so you can stay on top of school schedules, letters of recommendation, and more."
        },
        {
          title: "Track supervisor notes and files",
          description: "Enter notes about employees for private viewing only amongst other supervisors regarding write-ups, interactions, and other key private information so you always know who a staff member truly is. You can even upload documents to their profile for management's eyes only."
        },
        {
          title: "Summer only. No problem.",
          description: "LifeGuard Tracker was designed from the group up for summer only and year-round operations. Easily activate or deactivate seasonal staff, remove staff that are no longer going to return or got let go, and easily handle mass-scale importing and exporting of your staff records."
        }
      ]
    }
  };

  const content = moduleContent[module] || moduleContent.scheduling;
  const Icon = content.icon;

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="px-6 py-20 max-w-4xl mx-auto text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4">{content.title}</h1>
        <p className="text-xl text-gray-600">{content.subtitle}</p>
      </section>

      {/* Testimonial */}
      {content.quote && (
        <section className="px-6 py-12 max-w-3xl mx-auto text-center border-b border-gray-200">
          <p className="text-lg text-gray-700 italic mb-6">"{content.quote}"</p>
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-5 h-5 bg-yellow-400 rounded-full"></div>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-20">
          {content.sections.map((section, idx) => (
            <div key={idx}>
              <div
                className={`flex flex-col ${
                  section.reverse ? "lg:flex-row-reverse" : "lg:flex-row"
                } items-center gap-12`}
              >
                {/* Text */}
                <div className="w-full lg:w-1/2">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{section.title}</h2>
                  <p className="text-lg text-gray-600 leading-relaxed">{section.description}</p>
                </div>

                {/* Image */}
                {section.image && (
                  <div className="w-full lg:w-1/2">
                    <div className="rounded-2xl overflow-hidden shadow-xl">
                      <img
                        src={section.image}
                        alt={section.title}
                        className="w-full h-96 object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              {idx < content.sections.length - 1 && (
                <div className="h-px bg-gray-200 mt-20"></div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      {content.stats && (
        <section className="px-6 py-16 bg-gray-50 border-t border-gray-200">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-3xl font-bold text-gray-900">{content.stats}</p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-6 py-20 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to transform your operations?</h2>
        <Link to={createPageUrl("Dashboard")}>
          <Button className="bg-[#1a9c5b] hover:bg-[#158a4e] text-white px-8 py-6 text-lg rounded-xl h-auto">
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </section>
    </div>
  );
}