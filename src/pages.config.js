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
import Assignments from './pages/Assignments';
import ChemicalLogs from './pages/ChemicalLogs';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Docs from './pages/Docs';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeOnboarding from './pages/EmployeeOnboarding';
import Employees from './pages/Employees';
import Inspections from './pages/Inspections';
import Locations from './pages/Locations';
import MaintenanceReports from './pages/MaintenanceReports';
import MyAvailability from './pages/MyAvailability';
import Notifications from './pages/Notifications';
import PatronCounts from './pages/PatronCounts';
import Payroll from './pages/Payroll';
import Privacy from './pages/Privacy';
import Reports from './pages/Reports';
import Schedule from './pages/Schedule';
import Settings from './pages/Settings';
import ShiftSwaps from './pages/ShiftSwaps';
import Terms from './pages/Terms';
import TimeOff from './pages/TimeOff';
import Tutorials from './pages/Tutorials';
import Certifications from './pages/Certifications';
import Pricing from './pages/Pricing';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Alerts": Alerts,
    "Assignments": Assignments,
    "ChemicalLogs": ChemicalLogs,
    "Contact": Contact,
    "Dashboard": Dashboard,
    "Docs": Docs,
    "EmployeeDashboard": EmployeeDashboard,
    "EmployeeOnboarding": EmployeeOnboarding,
    "Employees": Employees,
    "Inspections": Inspections,
    "Locations": Locations,
    "MaintenanceReports": MaintenanceReports,
    "MyAvailability": MyAvailability,
    "Notifications": Notifications,
    "PatronCounts": PatronCounts,
    "Payroll": Payroll,
    "Privacy": Privacy,
    "Reports": Reports,
    "Schedule": Schedule,
    "Settings": Settings,
    "ShiftSwaps": ShiftSwaps,
    "Terms": Terms,
    "TimeOff": TimeOff,
    "Tutorials": Tutorials,
    "Certifications": Certifications,
    "Pricing": Pricing,
}

export const pagesConfig = {
    mainPage: "Alerts",
    Pages: PAGES,
    Layout: __Layout,
};