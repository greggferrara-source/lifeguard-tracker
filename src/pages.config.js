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
import Alerts from './pages/Alerts';
import Announcements from './pages/Announcements';
import Assignments from './pages/Assignments';
import BillingDashboard from './pages/BillingDashboard';
import Certifications from './pages/Certifications';
import Channels from './pages/Channels';
import ChemicalLogs from './pages/ChemicalLogs';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Docs from './pages/Docs';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeDirectory from './pages/EmployeeDirectory';
import EmployeeOnboarding from './pages/EmployeeOnboarding';
import Employees from './pages/Employees';
import Home from './pages/Home';
import Inspections from './pages/Inspections';
import Locations from './pages/Locations';
import MaintenanceReports from './pages/MaintenanceReports';
import Messages from './pages/Messages';
import MobileEmployees from './pages/MobileEmployees';
import MobileSchedule from './pages/MobileSchedule';
import MobileTimeOff from './pages/MobileTimeOff';
import MyAvailability from './pages/MyAvailability';
import Notifications from './pages/Notifications';
import OnboardingDashboard from './pages/OnboardingDashboard';
import PatronCounts from './pages/PatronCounts';
import Payroll from './pages/Payroll';
import PayrollIntegrations from './pages/PayrollIntegrations';
import Pricing from './pages/Pricing';
import Privacy from './pages/Privacy';
import Reports from './pages/Reports';
import Schedule from './pages/Schedule';
import Settings from './pages/Settings';
import SetupWizard from './pages/SetupWizard';
import ShiftSwaps from './pages/ShiftSwaps';
import Terms from './pages/Terms';
import TimeOff from './pages/TimeOff';
import Tutorials from './pages/Tutorials';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Alerts": Alerts,
    "Announcements": Announcements,
    "Assignments": Assignments,
    "BillingDashboard": BillingDashboard,
    "Certifications": Certifications,
    "Channels": Channels,
    "ChemicalLogs": ChemicalLogs,
    "Contact": Contact,
    "Dashboard": Dashboard,
    "Docs": Docs,
    "EmployeeDashboard": EmployeeDashboard,
    "EmployeeDirectory": EmployeeDirectory,
    "EmployeeOnboarding": EmployeeOnboarding,
    "Employees": Employees,
    "Home": Home,
    "Inspections": Inspections,
    "Locations": Locations,
    "MaintenanceReports": MaintenanceReports,
    "Messages": Messages,
    "MobileEmployees": MobileEmployees,
    "MobileSchedule": MobileSchedule,
    "MobileTimeOff": MobileTimeOff,
    "MyAvailability": MyAvailability,
    "Notifications": Notifications,
    "OnboardingDashboard": OnboardingDashboard,
    "PatronCounts": PatronCounts,
    "Payroll": Payroll,
    "PayrollIntegrations": PayrollIntegrations,
    "Pricing": Pricing,
    "Privacy": Privacy,
    "Reports": Reports,
    "Schedule": Schedule,
    "Settings": Settings,
    "SetupWizard": SetupWizard,
    "ShiftSwaps": ShiftSwaps,
    "Terms": Terms,
    "TimeOff": TimeOff,
    "Tutorials": Tutorials,
}

export const pagesConfig = {
    mainPage: "Alerts",
    Pages: PAGES,
    Layout: __Layout,
};