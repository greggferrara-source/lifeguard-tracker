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
import AccessibilityStatement from './pages/AccessibilityStatement';
import AdminSetup from './pages/AdminSetup';
import AdvancedReporting from './pages/AdvancedReporting';
import Alerts from './pages/Alerts';
import Announcements from './pages/Announcements';
import AssetManagement from './pages/AssetManagement';
import Assets from './pages/Assets';
import Assignments from './pages/Assignments';
import AutoShiftPlanner from './pages/AutoShiftPlanner';
import Billing from './pages/Billing';
import BillingDashboard from './pages/BillingDashboard';
import Blog from './pages/Blog';
import BlogPost1 from './pages/BlogPost1';
import BlogPost10 from './pages/BlogPost10';
import BlogPost11 from './pages/BlogPost11';
import BlogPost12 from './pages/BlogPost12';
import BlogPost2 from './pages/BlogPost2';
import BlogPost3 from './pages/BlogPost3';
import BlogPost4 from './pages/BlogPost4';
import BlogPost5 from './pages/BlogPost5';
import BlogPost6 from './pages/BlogPost6';
import BlogPost7 from './pages/BlogPost7';
import BlogPost8 from './pages/BlogPost8';
import BlogPost9 from './pages/BlogPost9';
import CertComplianceDashboard from './pages/CertComplianceDashboard';
import Certifications from './pages/Certifications';
import Channels from './pages/Channels';
import ChecklistDashboard from './pages/ChecklistDashboard';
import ChemicalLogs from './pages/ChemicalLogs';
import Compliance from './pages/Compliance';
import ComplianceAIAdvisor from './pages/ComplianceAIAdvisor';
import ComplianceAlertSettings from './pages/ComplianceAlertSettings';
import ComplianceAssessmentManager from './pages/ComplianceAssessmentManager';
import ComplianceDashboard from './pages/ComplianceDashboard';
import ComplianceWorkflowDetail from './pages/ComplianceWorkflowDetail';
import ComplianceWorkflowManager from './pages/ComplianceWorkflowManager';
import Contact from './pages/Contact';
import CreateIncidentReport from './pages/CreateIncidentReport';
import CustomDashboard from './pages/CustomDashboard';
import Dashboard from './pages/Dashboard';
import DataImport from './pages/DataImport';
import DataProcessingAgreement from './pages/DataProcessingAgreement';
import Docs from './pages/Docs';
import DocsEnhancedFeatures from './pages/DocsEnhancedFeatures';
import DocsResourceBookingGPS from './pages/DocsResourceBookingGPS';
import DocsUpdated from './pages/DocsUpdated';
import DocumentManagement from './pages/DocumentManagement';
import Documentation from './pages/Documentation';
import EmergencyActionPlans from './pages/EmergencyActionPlans';
import EmergencyCall from './pages/EmergencyCall';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeDirectory from './pages/EmployeeDirectory';
import EmployeeLocationTracking from './pages/EmployeeLocationTracking';
import EmployeeManagement from './pages/EmployeeManagement';
import EmployeeOnboarding from './pages/EmployeeOnboarding';
import EmployeePerformanceDashboard from './pages/EmployeePerformanceDashboard';
import EmployeeProfile from './pages/EmployeeProfile';
import Employees from './pages/Employees';
import ErrorLogs from './pages/ErrorLogs';
import Features from './pages/Features';
import GlobalSearch from './pages/GlobalSearch';
import GuardAIInsights from './pages/GuardAIInsights';
import Home from './pages/Home';
import IncidentDashboard from './pages/IncidentDashboard';
import IncidentDetail from './pages/IncidentDetail';
import IncidentLogs from './pages/IncidentLogs';
import IncidentManagement from './pages/IncidentManagement';
import IncidentTrendReport from './pages/IncidentTrendReport';
import Inspections from './pages/Inspections';
import Integrations from './pages/Integrations';
import IoTAnalyticsDashboard from './pages/IoTAnalyticsDashboard';
import IoTSensorDashboard from './pages/IoTSensorDashboard';
import Locations from './pages/Locations';
import MaintenanceReports from './pages/MaintenanceReports';
import Messages from './pages/Messages';
import MobileBilling from './pages/MobileBilling';
import MobileCertifications from './pages/MobileCertifications';
import MobileEmployees from './pages/MobileEmployees';
import MobileGuardDashboard from './pages/MobileGuardDashboard';
import MobileLocations from './pages/MobileLocations';
import MobileSchedule from './pages/MobileSchedule';
import MobileStaffApp from './pages/MobileStaffApp';
import MobileTimeOff from './pages/MobileTimeOff';
import MultiLocationDashboard from './pages/MultiLocationDashboard';
import MyAvailability from './pages/MyAvailability';
import NotificationCenter from './pages/NotificationCenter';
import NotificationPreferences from './pages/NotificationPreferences';
import Notifications from './pages/Notifications';
import OnboardingDashboard from './pages/OnboardingDashboard';
import OnboardingManagement from './pages/OnboardingManagement';
import OnboardingRuleBuilder from './pages/OnboardingRuleBuilder';
import OperationalForms from './pages/OperationalForms';
import PatronCounts from './pages/PatronCounts';
import PatronManagement from './pages/PatronManagement';
import Payroll from './pages/Payroll';
import PayrollIntegrations from './pages/PayrollIntegrations';
import PerformanceReviewManager from './pages/PerformanceReviewManager';
import PoolTestReporting from './pages/PoolTestReporting';
import PredictiveAnalytics from './pages/PredictiveAnalytics';
import Pricing from './pages/Pricing';
import Privacy from './pages/Privacy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PublicSafetyDashboard from './pages/PublicSafetyDashboard';
import PublicStatusWidget from './pages/PublicStatusWidget';
import Reports from './pages/Reports';
import ResourceBooking from './pages/ResourceBooking';
import SafetyDashboard from './pages/SafetyDashboard';
import Schedule from './pages/Schedule';
import Settings from './pages/Settings';
import SetupWizard from './pages/SetupWizard';
import ShiftPreferencesManager from './pages/ShiftPreferencesManager';
import ShiftSwaps from './pages/ShiftSwaps';
import Sitemap from './pages/Sitemap';
import StaffRecognition from './pages/StaffRecognition';
import StaffingForecast from './pages/StaffingForecast';
import StaffingForecastDashboard from './pages/StaffingForecastDashboard';
import TeamChat from './pages/TeamChat';
import Terms from './pages/Terms';
import TimeOff from './pages/TimeOff';
import TrainingDashboard from './pages/TrainingDashboard';
import TrainingGamification from './pages/TrainingGamification';
import TrainingModuleManager from './pages/TrainingModuleManager';
import Tutorials from './pages/Tutorials';
import UrgentAlerts from './pages/UrgentAlerts';
import WeatherAlertsMonitor from './pages/WeatherAlertsMonitor';
import WorkflowAutomation from './pages/WorkflowAutomation';
import WorkforceScheduler from './pages/WorkforceScheduler';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AccessibilityStatement": AccessibilityStatement,
    "AdminSetup": AdminSetup,
    "AdvancedReporting": AdvancedReporting,
    "Alerts": Alerts,
    "Announcements": Announcements,
    "AssetManagement": AssetManagement,
    "Assets": Assets,
    "Assignments": Assignments,
    "AutoShiftPlanner": AutoShiftPlanner,
    "Billing": Billing,
    "BillingDashboard": BillingDashboard,
    "Blog": Blog,
    "BlogPost1": BlogPost1,
    "BlogPost10": BlogPost10,
    "BlogPost11": BlogPost11,
    "BlogPost12": BlogPost12,
    "BlogPost2": BlogPost2,
    "BlogPost3": BlogPost3,
    "BlogPost4": BlogPost4,
    "BlogPost5": BlogPost5,
    "BlogPost6": BlogPost6,
    "BlogPost7": BlogPost7,
    "BlogPost8": BlogPost8,
    "BlogPost9": BlogPost9,
    "CertComplianceDashboard": CertComplianceDashboard,
    "Certifications": Certifications,
    "Channels": Channels,
    "ChecklistDashboard": ChecklistDashboard,
    "ChemicalLogs": ChemicalLogs,
    "Compliance": Compliance,
    "ComplianceAIAdvisor": ComplianceAIAdvisor,
    "ComplianceAlertSettings": ComplianceAlertSettings,
    "ComplianceAssessmentManager": ComplianceAssessmentManager,
    "ComplianceDashboard": ComplianceDashboard,
    "ComplianceWorkflowDetail": ComplianceWorkflowDetail,
    "ComplianceWorkflowManager": ComplianceWorkflowManager,
    "Contact": Contact,
    "CreateIncidentReport": CreateIncidentReport,
    "CustomDashboard": CustomDashboard,
    "Dashboard": Dashboard,
    "DataImport": DataImport,
    "DataProcessingAgreement": DataProcessingAgreement,
    "Docs": Docs,
    "DocsEnhancedFeatures": DocsEnhancedFeatures,
    "DocsResourceBookingGPS": DocsResourceBookingGPS,
    "DocsUpdated": DocsUpdated,
    "DocumentManagement": DocumentManagement,
    "Documentation": Documentation,
    "EmergencyActionPlans": EmergencyActionPlans,
    "EmergencyCall": EmergencyCall,
    "EmployeeDashboard": EmployeeDashboard,
    "EmployeeDirectory": EmployeeDirectory,
    "EmployeeLocationTracking": EmployeeLocationTracking,
    "EmployeeManagement": EmployeeManagement,
    "EmployeeOnboarding": EmployeeOnboarding,
    "EmployeePerformanceDashboard": EmployeePerformanceDashboard,
    "EmployeeProfile": EmployeeProfile,
    "Employees": Employees,
    "ErrorLogs": ErrorLogs,
    "Features": Features,
    "GlobalSearch": GlobalSearch,
    "GuardAIInsights": GuardAIInsights,
    "Home": Home,
    "IncidentDashboard": IncidentDashboard,
    "IncidentDetail": IncidentDetail,
    "IncidentLogs": IncidentLogs,
    "IncidentManagement": IncidentManagement,
    "IncidentTrendReport": IncidentTrendReport,
    "Inspections": Inspections,
    "Integrations": Integrations,
    "IoTAnalyticsDashboard": IoTAnalyticsDashboard,
    "IoTSensorDashboard": IoTSensorDashboard,
    "Locations": Locations,
    "MaintenanceReports": MaintenanceReports,
    "Messages": Messages,
    "MobileBilling": MobileBilling,
    "MobileCertifications": MobileCertifications,
    "MobileEmployees": MobileEmployees,
    "MobileGuardDashboard": MobileGuardDashboard,
    "MobileLocations": MobileLocations,
    "MobileSchedule": MobileSchedule,
    "MobileStaffApp": MobileStaffApp,
    "MobileTimeOff": MobileTimeOff,
    "MultiLocationDashboard": MultiLocationDashboard,
    "MyAvailability": MyAvailability,
    "NotificationCenter": NotificationCenter,
    "NotificationPreferences": NotificationPreferences,
    "Notifications": Notifications,
    "OnboardingDashboard": OnboardingDashboard,
    "OnboardingManagement": OnboardingManagement,
    "OnboardingRuleBuilder": OnboardingRuleBuilder,
    "OperationalForms": OperationalForms,
    "PatronCounts": PatronCounts,
    "PatronManagement": PatronManagement,
    "Payroll": Payroll,
    "PayrollIntegrations": PayrollIntegrations,
    "PerformanceReviewManager": PerformanceReviewManager,
    "PoolTestReporting": PoolTestReporting,
    "PredictiveAnalytics": PredictiveAnalytics,
    "Pricing": Pricing,
    "Privacy": Privacy,
    "PrivacyPolicy": PrivacyPolicy,
    "PublicSafetyDashboard": PublicSafetyDashboard,
    "PublicStatusWidget": PublicStatusWidget,
    "Reports": Reports,
    "ResourceBooking": ResourceBooking,
    "SafetyDashboard": SafetyDashboard,
    "Schedule": Schedule,
    "Settings": Settings,
    "SetupWizard": SetupWizard,
    "ShiftPreferencesManager": ShiftPreferencesManager,
    "ShiftSwaps": ShiftSwaps,
    "Sitemap": Sitemap,
    "StaffRecognition": StaffRecognition,
    "StaffingForecast": StaffingForecast,
    "StaffingForecastDashboard": StaffingForecastDashboard,
    "TeamChat": TeamChat,
    "Terms": Terms,
    "TimeOff": TimeOff,
    "TrainingDashboard": TrainingDashboard,
    "TrainingGamification": TrainingGamification,
    "TrainingModuleManager": TrainingModuleManager,
    "Tutorials": Tutorials,
    "UrgentAlerts": UrgentAlerts,
    "WeatherAlertsMonitor": WeatherAlertsMonitor,
    "WorkflowAutomation": WorkflowAutomation,
    "WorkforceScheduler": WorkforceScheduler,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};