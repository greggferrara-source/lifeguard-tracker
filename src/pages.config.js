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
import Dashboard from './pages/Dashboard';
import EmployeeOnboarding from './pages/EmployeeOnboarding';
import Employees from './pages/Employees';
import Locations from './pages/Locations';
import MyAvailability from './pages/MyAvailability';
import Notifications from './pages/Notifications';
import Payroll from './pages/Payroll';
import Reports from './pages/Reports';
import Schedule from './pages/Schedule';
import Settings from './pages/Settings';
import ShiftSwaps from './pages/ShiftSwaps';
import TimeOff from './pages/TimeOff';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import Docs from './pages/Docs';
import Tutorials from './pages/Tutorials';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ChemicalLogs from './pages/ChemicalLogs';
import MaintenanceReports from './pages/MaintenanceReports';
import PatronCounts from './pages/PatronCounts';
import Assignments from './pages/Assignments';
import Inspections from './pages/Inspections';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Alerts": Alerts,
    "Dashboard": Dashboard,
    "EmployeeOnboarding": EmployeeOnboarding,
    "Employees": Employees,
    "Locations": Locations,
    "MyAvailability": MyAvailability,
    "Notifications": Notifications,
    "Payroll": Payroll,
    "Reports": Reports,
    "Schedule": Schedule,
    "Settings": Settings,
    "ShiftSwaps": ShiftSwaps,
    "TimeOff": TimeOff,
    "Terms": Terms,
    "Privacy": Privacy,
    "Contact": Contact,
    "Docs": Docs,
    "Tutorials": Tutorials,
    "EmployeeDashboard": EmployeeDashboard,
    "ChemicalLogs": ChemicalLogs,
    "MaintenanceReports": MaintenanceReports,
    "PatronCounts": PatronCounts,
    "Assignments": Assignments,
    "Inspections": Inspections,
}

export const pagesConfig = {
    mainPage: "Alerts",
    Pages: PAGES,
    Layout: __Layout,
};