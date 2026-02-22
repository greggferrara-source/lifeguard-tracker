/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminSetup from './pages/AdminSetup';
import AdvancedReporting from './pages/AdvancedReporting';
import Alerts from './pages/Alerts';
import Announcements from './pages/Announcements';
import AssetManagement from './pages/AssetManagement';
import Assets from './pages/Assets';
import Assignments from './pages/Assignments';
import Billing from './pages/Billing';
import BillingDashboard from './pages/BillingDashboard';
import CertComplianceDashboard from './pages/CertComplianceDashboard';
import Certifications from './pages/Certifications';
import Channels from './pages/Channels';
import ChecklistDashboard from './pages/ChecklistDashboard';
import ChemicalLogs from './pages/ChemicalLogs';
import Compliance from './pages/Compliance';
import ComplianceAIAdvisor from './pages/ComplianceAIAdvisor';
import ComplianceAssessmentManager from './pages/ComplianceAssessmentManager';
import ComplianceDashboard from './pages/ComplianceDashboard';
import Contact from './pages/Contact';
import CustomDashboard from './pages/CustomDashboard';
import Dashboard from './pages/Dashboard';
import DocsUpdated from './pages/DocsUpdated';
import DocumentManagement from './pages/DocumentManagement';
import EmergencyActionPlans from './pages/EmergencyActionPlans';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeDirectory from './pages/EmployeeDirectory';
import EmployeeManagement from './pages/EmployeeManagement';
import EmployeeOnboarding from './pages/EmployeeOnboarding';
import EmployeePerformanceDashboard from './pages/EmployeePerformanceDashboard';
import Employees from './pages/Employees';
import ErrorLogs from './pages/ErrorLogs';
import Features from './pages/Features';
import GlobalSearch from './pages/GlobalSearch';
import Home from './pages/Home';
import IncidentDashboard from './pages/IncidentDashboard';
import IncidentLogs from './pages/IncidentLogs';
import IncidentTrendReport from './pages/IncidentTrendReport';
import Inspections from './pages/Inspections';
import Locations from './pages/Locations';
import MaintenanceReports from './pages/MaintenanceReports';
import Messages from './pages/Messages';
import MobileBilling from './pages/MobileBilling';
import MobileCertifications from './pages/MobileCertifications';
import MobileEmployees from './pages/MobileEmployees';
import MobileGuardDashboard from './pages/MobileGuardDashboard';
import MobileLocations from './pages/MobileLocations';
import MobileSchedule from './pages/MobileSchedule';
import MobileTimeOff from './pages/MobileTimeOff';
import MultiLocationDashboard from './pages/MultiLocationDashboard';
import MyAvailability from './pages/MyAvailability';
import NotificationCenter from './pages/NotificationCenter';
import Notifications from './pages/Notifications';
import OnboardingDashboard from './pages/OnboardingDashboard';
import OperationalForms from './pages/OperationalForms';
import PatronCounts from './pages/PatronCounts';
import PatronManagement from './pages/PatronManagement';
import Payroll from './pages/Payroll';
import PayrollIntegrations from './pages/PayrollIntegrations';
import PoolTestReporting from './pages/PoolTestReporting';
import Pricing from './pages/Pricing';
import Privacy from './pages/Privacy';
import PublicSafetyDashboard from './pages/PublicSafetyDashboard';
import Reports from './pages/Reports';
import Schedule from './pages/Schedule';
import Settings from './pages/Settings';
import SetupWizard from './pages/SetupWizard';
import ShiftPreferencesManager from './pages/ShiftPreferencesManager';
import ShiftSwaps from './pages/ShiftSwaps';
import StaffingForecast from './pages/StaffingForecast';
import StaffingForecastDashboard from './pages/StaffingForecastDashboard';
import Terms from './pages/Terms';
import TimeOff from './pages/TimeOff';
import TrainingDashboard from './pages/TrainingDashboard';
import Tutorials from './pages/Tutorials';
import UrgentAlerts from './pages/UrgentAlerts';
import WeatherAlertsMonitor from './pages/WeatherAlertsMonitor';
import WorkflowAutomation from './pages/WorkflowAutomation';
import NotificationPreferences from './pages/NotificationPreferences';
import ResourceBooking from './pages/ResourceBooking';
import EmployeeProfile from './pages/EmployeeProfile';
import EmployeeLocationTracking from './pages/EmployeeLocationTracking';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminSetup": AdminSetup,
    "AdvancedReporting": AdvancedReporting,
    "Alerts": Alerts,
    "Announcements": Announcements,
    "AssetManagement": AssetManagement,
    "Assets": Assets,
    "Assignments": Assignments,
    "Billing": Billing,
    "BillingDashboard": BillingDashboard,
    "CertComplianceDashboard": CertComplianceDashboard,
    "Certifications": Certifications,
    "Channels": Channels,
    "ChecklistDashboard": ChecklistDashboard,
    "ChemicalLogs": ChemicalLogs,
    "Compliance": Compliance,
    "ComplianceAIAdvisor": ComplianceAIAdvisor,
    "ComplianceAssessmentManager": ComplianceAssessmentManager,
    "ComplianceDashboard": ComplianceDashboard,
    "Contact": Contact,
    "CustomDashboard": CustomDashboard,
    "Dashboard": Dashboard,
    "DocsUpdated": DocsUpdated,
    "DocumentManagement": DocumentManagement,
    "EmergencyActionPlans": EmergencyActionPlans,
    "EmployeeDashboard": EmployeeDashboard,
    "EmployeeDirectory": EmployeeDirectory,
    "EmployeeManagement": EmployeeManagement,
    "EmployeeOnboarding": EmployeeOnboarding,
    "EmployeePerformanceDashboard": EmployeePerformanceDashboard,
    "Employees": Employees,
    "ErrorLogs": ErrorLogs,
    "Features": Features,
    "GlobalSearch": GlobalSearch,
    "Home": Home,
    "IncidentDashboard": IncidentDashboard,
    "IncidentLogs": IncidentLogs,
    "IncidentTrendReport": IncidentTrendReport,
    "Inspections": Inspections,
    "Locations": Locations,
    "MaintenanceReports": MaintenanceReports,
    "Messages": Messages,
    "MobileBilling": MobileBilling,
    "MobileCertifications": MobileCertifications,
    "MobileEmployees": MobileEmployees,
    "MobileGuardDashboard": MobileGuardDashboard,
    "MobileLocations": MobileLocations,
    "MobileSchedule": MobileSchedule,
    "MobileTimeOff": MobileTimeOff,
    "MultiLocationDashboard": MultiLocationDashboard,
    "MyAvailability": MyAvailability,
    "NotificationCenter": NotificationCenter,
    "Notifications": Notifications,
    "OnboardingDashboard": OnboardingDashboard,
    "OperationalForms": OperationalForms,
    "PatronCounts": PatronCounts,
    "PatronManagement": PatronManagement,
    "Payroll": Payroll,
    "PayrollIntegrations": PayrollIntegrations,
    "PoolTestReporting": PoolTestReporting,
    "Pricing": Pricing,
    "Privacy": Privacy,
    "PublicSafetyDashboard": PublicSafetyDashboard,
    "Reports": Reports,
    "Schedule": Schedule,
    "Settings": Settings,
    "SetupWizard": SetupWizard,
    "ShiftPreferencesManager": ShiftPreferencesManager,
    "ShiftSwaps": ShiftSwaps,
    "StaffingForecast": StaffingForecast,
    "StaffingForecastDashboard": StaffingForecastDashboard,
    "Terms": Terms,
    "TimeOff": TimeOff,
    "TrainingDashboard": TrainingDashboard,
    "Tutorials": Tutorials,
    "UrgentAlerts": UrgentAlerts,
    "WeatherAlertsMonitor": WeatherAlertsMonitor,
    "WorkflowAutomation": WorkflowAutomation,
    "NotificationPreferences": NotificationPreferences,
    "ResourceBooking": ResourceBooking,
    "EmployeeProfile": EmployeeProfile,
    "EmployeeLocationTracking": EmployeeLocationTracking,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};