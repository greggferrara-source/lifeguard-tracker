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
import Alerts from './pages/Alerts';
import Announcements from './pages/Announcements';
import Assets from './pages/Assets';
import Assignments from './pages/Assignments';
import Billing from './pages/Billing';
import BillingDashboard from './pages/BillingDashboard';
import Certifications from './pages/Certifications';
import Channels from './pages/Channels';
import ChecklistDashboard from './pages/ChecklistDashboard';
import ChemicalLogs from './pages/ChemicalLogs';
import Compliance from './pages/Compliance';
import ComplianceDashboard from './pages/ComplianceDashboard';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Docs from './pages/Docs';
import EmergencyActionPlans from './pages/EmergencyActionPlans';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeDirectory from './pages/EmployeeDirectory';
import EmployeeOnboarding from './pages/EmployeeOnboarding';
import Employees from './pages/Employees';
import ErrorLogs from './pages/ErrorLogs';
import Features from './pages/Features';
import Home from './pages/Home';
import IncidentDashboard from './pages/IncidentDashboard';
import IncidentLogs from './pages/IncidentLogs';
import Inspections from './pages/Inspections';
import Locations from './pages/Locations';
import MaintenanceReports from './pages/MaintenanceReports';
import Messages from './pages/Messages';
import MobileBilling from './pages/MobileBilling';
import MobileCertifications from './pages/MobileCertifications';
import MobileEmployees from './pages/MobileEmployees';
import MobileLocations from './pages/MobileLocations';
import MobileSchedule from './pages/MobileSchedule';
import MobileTimeOff from './pages/MobileTimeOff';
import MultiLocationDashboard from './pages/MultiLocationDashboard';
import MyAvailability from './pages/MyAvailability';
import Notifications from './pages/Notifications';
import OnboardingDashboard from './pages/OnboardingDashboard';
import OperationalForms from './pages/OperationalForms';
import PatronCounts from './pages/PatronCounts';
import Payroll from './pages/Payroll';
import PayrollIntegrations from './pages/PayrollIntegrations';
import Pricing from './pages/Pricing';
import Privacy from './pages/Privacy';
import PublicSafetyDashboard from './pages/PublicSafetyDashboard';
import Reports from './pages/Reports';
import Schedule from './pages/Schedule';
import Settings from './pages/Settings';
import SetupWizard from './pages/SetupWizard';
import ShiftSwaps from './pages/ShiftSwaps';
import Terms from './pages/Terms';
import TimeOff from './pages/TimeOff';
import TrainingDashboard from './pages/TrainingDashboard';
import Tutorials from './pages/Tutorials';
import CertComplianceDashboard from './pages/CertComplianceDashboard';
import StaffingForecast from './pages/StaffingForecast';
import UrgentAlerts from './pages/UrgentAlerts';
import MobileGuardDashboard from './pages/MobileGuardDashboard';
import ShiftPreferencesManager from './pages/ShiftPreferencesManager';
import IncidentTrendReport from './pages/IncidentTrendReport';
import EmployeePerformanceDashboard from './pages/EmployeePerformanceDashboard';
import PatronManagement from './pages/PatronManagement';
import WeatherAlertsMonitor from './pages/WeatherAlertsMonitor';
import StaffingForecastDashboard from './pages/StaffingForecastDashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminSetup": AdminSetup,
    "Alerts": Alerts,
    "Announcements": Announcements,
    "Assets": Assets,
    "Assignments": Assignments,
    "Billing": Billing,
    "BillingDashboard": BillingDashboard,
    "Certifications": Certifications,
    "Channels": Channels,
    "ChecklistDashboard": ChecklistDashboard,
    "ChemicalLogs": ChemicalLogs,
    "Compliance": Compliance,
    "ComplianceDashboard": ComplianceDashboard,
    "Contact": Contact,
    "Dashboard": Dashboard,
    "Docs": Docs,
    "EmergencyActionPlans": EmergencyActionPlans,
    "EmployeeDashboard": EmployeeDashboard,
    "EmployeeDirectory": EmployeeDirectory,
    "EmployeeOnboarding": EmployeeOnboarding,
    "Employees": Employees,
    "ErrorLogs": ErrorLogs,
    "Features": Features,
    "Home": Home,
    "IncidentDashboard": IncidentDashboard,
    "IncidentLogs": IncidentLogs,
    "Inspections": Inspections,
    "Locations": Locations,
    "MaintenanceReports": MaintenanceReports,
    "Messages": Messages,
    "MobileBilling": MobileBilling,
    "MobileCertifications": MobileCertifications,
    "MobileEmployees": MobileEmployees,
    "MobileLocations": MobileLocations,
    "MobileSchedule": MobileSchedule,
    "MobileTimeOff": MobileTimeOff,
    "MultiLocationDashboard": MultiLocationDashboard,
    "MyAvailability": MyAvailability,
    "Notifications": Notifications,
    "OnboardingDashboard": OnboardingDashboard,
    "OperationalForms": OperationalForms,
    "PatronCounts": PatronCounts,
    "Payroll": Payroll,
    "PayrollIntegrations": PayrollIntegrations,
    "Pricing": Pricing,
    "Privacy": Privacy,
    "PublicSafetyDashboard": PublicSafetyDashboard,
    "Reports": Reports,
    "Schedule": Schedule,
    "Settings": Settings,
    "SetupWizard": SetupWizard,
    "ShiftSwaps": ShiftSwaps,
    "Terms": Terms,
    "TimeOff": TimeOff,
    "TrainingDashboard": TrainingDashboard,
    "Tutorials": Tutorials,
    "CertComplianceDashboard": CertComplianceDashboard,
    "StaffingForecast": StaffingForecast,
    "UrgentAlerts": UrgentAlerts,
    "MobileGuardDashboard": MobileGuardDashboard,
    "ShiftPreferencesManager": ShiftPreferencesManager,
    "IncidentTrendReport": IncidentTrendReport,
    "EmployeePerformanceDashboard": EmployeePerformanceDashboard,
    "PatronManagement": PatronManagement,
    "WeatherAlertsMonitor": WeatherAlertsMonitor,
    "StaffingForecastDashboard": StaffingForecastDashboard,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};