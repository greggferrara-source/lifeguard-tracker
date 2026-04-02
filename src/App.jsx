import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import SharedView from './pages/SharedView';
import OperationsCommandDashboard from './pages/OperationsCommandDashboard';
import EnterprisePreview from './pages/EnterprisePreview';
import AttendanceAudit from './pages/AttendanceAudit';
import RetentionDashboard from './pages/RetentionDashboard';
import PayrollExport from './pages/PayrollExport';
import GeofenceCheckIn from './pages/GeofenceCheckIn';
import EmployeeShiftDashboard from './pages/EmployeeShiftDashboard';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/SharedView" element={<SharedView />} />
      <Route path="/OperationsCommandDashboard" element={
        <LayoutWrapper currentPageName="OperationsCommandDashboard">
          <OperationsCommandDashboard />
        </LayoutWrapper>
      } />
      <Route path="/EnterprisePreview" element={
        <LayoutWrapper currentPageName="EnterprisePreview">
          <EnterprisePreview />
        </LayoutWrapper>
      } />
      <Route path="/AttendanceAudit" element={
        <LayoutWrapper currentPageName="AttendanceAudit">
          <AttendanceAudit />
        </LayoutWrapper>
      } />
      <Route path="/RetentionDashboard" element={
        <LayoutWrapper currentPageName="RetentionDashboard">
          <RetentionDashboard />
        </LayoutWrapper>
      } />
      <Route path="/PayrollExport" element={
        <LayoutWrapper currentPageName="PayrollExport">
          <PayrollExport />
        </LayoutWrapper>
      } />
      <Route path="/GeofenceCheckIn" element={
        <LayoutWrapper currentPageName="GeofenceCheckIn">
          <GeofenceCheckIn />
        </LayoutWrapper>
      } />
      <Route path="/EmployeeShiftDashboard" element={
        <LayoutWrapper currentPageName="EmployeeShiftDashboard">
          <EmployeeShiftDashboard />
        </LayoutWrapper>
      } />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App