// Enhanced chatbot training data for production
export const chatbotTrainingData = {
  version: '2.0',
  lastUpdated: new Date().toISOString(),
  categories: {
    'account': {
      questions: [
        'How do I reset my password?',
        'Can I change my email address?',
        'How do I delete my account?',
        'How do I update my profile?',
        'What is two-factor authentication?'
      ],
      answers: {
        'reset_password': 'Click "Forgot Password" on the login page. You\'ll receive an email with a reset link.',
        'change_email': 'Go to Settings > Account and update your email address.',
        'delete_account': 'Contact support@lifeguardtracker.app to delete your account and data.',
        'update_profile': 'Click your profile icon and select "Settings" to update your information.',
        'two_factor': 'Enable 2FA in Settings > Security for extra account protection.'
      }
    },
    'scheduling': {
      questions: [
        'How do I create a shift?',
        'Can employees swap shifts?',
        'How do shift swaps work?',
        'Can I duplicate schedules?',
        'What is geofencing?'
      ],
      answers: {
        'create_shift': 'Go to Schedule > Create Shift. Fill in date, time, location, and employee details.',
        'employee_swap': 'Yes, employees can request shift swaps through the app.',
        'swap_process': 'Employee requests swap → Manager approves → Shift is reassigned.',
        'duplicate_schedule': 'Use the "Copy Schedule" feature to replicate a week or month.',
        'geofencing': 'Set location boundaries so GPS-enabled clock-ins are only valid within the zone.'
      }
    },
    'compliance': {
      questions: [
        'How does certification tracking work?',
        'When do I get alerts for expiring certifications?',
        'How do I add certifications?',
        'What happens if a certification expires?',
        'How do I prepare for an audit?'
      ],
      answers: {
        'cert_tracking': 'Certifications are tracked automatically. You receive alerts 30 and 7 days before expiry.',
        'alert_timing': 'Email and in-app notifications are sent 30 days and 7 days before certification expires.',
        'add_cert': 'Go to Employee Profile > Certifications > Add. Enter cert name, expiry date, and issuer.',
        'expired_cert': 'Expired certs appear as "At Risk" in compliance dashboard. Reassign to training immediately.',
        'audit_prep': 'Use our Compliance Workflows feature to prepare step-by-step. It guides you through audit checklist.'
      }
    },
    'integrations': {
      questions: [
        'How do I sync with Gusto?',
        'Can you integrate with our payroll system?',
        'How does weather integration work?',
        'What is LMS integration?',
        'Can you import event calendars?'
      ],
      answers: {
        'gusto_sync': 'Go to Settings > Integrations > Gusto. Authorize and select which data to sync.',
        'payroll_integration': 'We support Gusto, ADP, Paychex, and custom APIs. Contact support for setup.',
        'weather': 'Real-time weather alerts are sent when severe weather impacts your facility location.',
        'lms': 'LMS integration syncs training completions from Red Cross, Ellis & Associates, and other platforms.',
        'event_calendar': 'Import local event calendars to anticipate patron load increases and adjust staffing.'
      }
    },
    'support': {
      questions: [
        'How do I contact support?',
        'What is your support availability?',
        'Do you offer training?',
        'Is there a knowledge base?',
        'Can you help with data migration?'
      ],
      answers: {
        'contact_support': 'Email support@lifeguardtracker.app or call our support team for assistance.',
        'availability': 'Support is available Monday-Friday 9am-5pm EST. Enterprise customers get 24/7 support.',
        'training': 'We offer free onboarding training for all customers. Enterprise gets dedicated training.',
        'knowledge_base': 'Visit our Documentation section for guides, FAQs, and video tutorials.',
        'data_migration': 'Yes! We handle free data migration from your current system. Contact support.'
      }
    }
  },
  knowledgeBase: {
    'OSHA_compliance': 'LifeGuard Tracker helps you comply with OSHA standards for lifeguard training, safety protocols, and incident documentation.',
    'MAHC_standards': 'Our system aligns with MAHC (Model Aquatic Health Code) recommendations for facility operations and safety.',
    'pricing': 'Plans start at $29/month (Starter) with no per-user fees. Pro is $149/month and Enterprise is $999/month.',
    'mobile_app': 'iOS and Android apps are available with clock in/out, schedule view, shift swaps, and push notifications.',
    'security': 'We use AES-256 encryption, TLS 1.3, role-based access, and comply with GDPR and CCPA.',
    'api': 'Enterprise customers get API access for custom integrations. Contact sales for details.'
  },
  entityTypes: {
    'employee': ['shift assignments', 'certifications', 'availability', 'performance reviews', 'training modules'],
    'facility': ['locations', 'resources', 'compliance status', 'incident history', 'operational settings'],
    'schedule': ['shifts', 'coverage', 'conflicts', 'time off', 'shift swaps']
  },
  commonTasks: [
    'Schedule a shift',
    'Track certifications',
    'Manage staff',
    'View analytics',
    'Generate reports',
    'Process shift swaps',
    'Log incidents',
    'Update compliance',
    'Configure integrations',
    'Manage notifications'
  ]
};

export function getTrainingDataForContext(context: string) {
  const category = chatbotTrainingData.categories[context.toLowerCase()];
  if (category) {
    return {
      questions: category.questions,
      answers: category.answers,
      context
    };
  }
  return null;
}