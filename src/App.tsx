
import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AddToHomeScreenPrompt } from "@/components/mobile/AddToHomeScreenPrompt";
import { HotjarScript } from "@/components/analytics/HotjarScript";
import { CookieConsent } from "@/components/analytics/CookieConsent";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/mobile/app/AppShell";
import HomeSpotlight from "./pages/HomeSpotlight";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import Help from "./pages/Help";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import NotAllowed from "./pages/NotAllowed";
import Onboarding from "./pages/Onboarding";
import OpportunityDiscovery from "./pages/OpportunityDiscovery";
import ProfileStarter from "./pages/ProfileStarter";
import Profile from "./pages/Profile";
import SharedProfile from "./pages/SharedProfile";
import Dashboard from "./pages/Dashboard";
import BrowseCandidates from "./pages/BrowseCandidates";
import EmployerDashboard from "./pages/EmployerDashboard";
import OrganizationSettings from "./pages/OrganizationSettings";
import Resources from "./pages/Resources";
import ContentLibrary from "./pages/ContentLibrary";
import Card from "./pages/Card";
import JobFeed from "./pages/JobFeed";
import LearningJobFeed from "./pages/LearningJobFeed";
import DevTools from "./pages/DevTools";
import Certification from "./pages/Certification";
import VerifyCertification from "./pages/VerifyCertification";
import Notifications from "./pages/Notifications";
import AdminHome from "./pages/admin/AdminHome";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrganizations from "./pages/admin/AdminOrganizations";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminTrends from "./pages/admin/AdminTrends";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminHistorical from "./pages/admin/AdminHistorical";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AdminSupport from "./pages/admin/AdminSupport";
import { AuthProvider } from "./contexts/AuthContext";
import { UserStateProvider } from "./contexts/UserStateProvider";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { RequireOnboarding, RequireUserType } from "./components/auth/RouteGuards";

console.log("App.tsx loading, React available:", !!React);
console.log("React hooks available:", typeof React.useState, typeof React.useEffect);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserStateProvider>
          <OrganizationProvider>
            <NotificationProvider>
              <TooltipProvider>
              <Toaster />
              <Sonner />
              <AddToHomeScreenPrompt />
              <HotjarScript />
              <CookieConsent />
              <BrowserRouter>
              <AppShell>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/auth" element={<Login />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/profile/share/:userId" element={<SharedProfile />} />
                  <Route path="/not-allowed" element={<NotAllowed />} />
                  <Route path="/verify/:code" element={<VerifyCertification />} />
                  
                  {/* Protected routes */}
                  <Route element={<ProtectedRoute />}>
                    {/* Auth-only routes (no type/onboarding check) */}
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/profile-starter" element={<ProfileStarter />} />
                    <Route path="/card" element={<Card />} />
                    <Route path="/dev-tools" element={<DevTools />} />
                    
                    {/* Job Seeker Routes - Protected by user type */}
                    <Route path="/dashboard" element={
                      <RequireOnboarding soft={false}>
                        <RequireUserType allowedTypes={['job_seeker']}>
                          <Dashboard />
                        </RequireUserType>
                      </RequireOnboarding>
                    } />
                    
                    <Route path="/jobs" element={
                      <RequireOnboarding soft={false}>
                        <RequireUserType allowedTypes={['job_seeker']}>
                          <LearningJobFeed />
                        </RequireUserType>
                      </RequireOnboarding>
                    } />
                    
                    <Route path="/jobs/legacy" element={
                      <RequireOnboarding soft={false}>
                        <RequireUserType allowedTypes={['job_seeker']}>
                          <JobFeed />
                        </RequireUserType>
                      </RequireOnboarding>
                    } />
                    
                    <Route path="/profile" element={
                      <RequireOnboarding soft={false}>
                        <RequireUserType allowedTypes={['job_seeker']}>
                          <Profile />
                        </RequireUserType>
                      </RequireOnboarding>
                    } />
                    
                    <Route path="/discovery" element={
                      <RequireOnboarding soft={false}>
                        <RequireUserType allowedTypes={['job_seeker']}>
                          <OpportunityDiscovery />
                        </RequireUserType>
                      </RequireOnboarding>
                    } />
                    
                    <Route path="/opportunity-discovery" element={
                      <RequireOnboarding soft={false}>
                        <RequireUserType allowedTypes={['job_seeker']}>
                          <OpportunityDiscovery />
                        </RequireUserType>
                      </RequireOnboarding>
                    } />
                    
                    <Route path="/resources" element={
                      <RequireUserType allowedTypes={['job_seeker']}>
                        <Resources />
                      </RequireUserType>
                    } />
                    
                    <Route path="/notifications" element={<Notifications />} />
                    
                    <Route path="/content" element={
                      <RequireUserType allowedTypes={['job_seeker']}>
                        <ContentLibrary />
                      </RequireUserType>
                    } />
                    
                    {/* Certification Routes - Protected by user type */}
                    <Route path="/certification" element={
                      <RequireOnboarding soft={false}>
                        <RequireUserType allowedTypes={['job_seeker']}>
                          <Certification />
                        </RequireUserType>
                      </RequireOnboarding>
                    } />
                    
                    <Route path="/certification/:sector" element={
                      <RequireOnboarding soft={false}>
                        <RequireUserType allowedTypes={['job_seeker']}>
                          <Certification />
                        </RequireUserType>
                      </RequireOnboarding>
                    } />
                    
                    <Route path="/certification/result/:resultId" element={
                      <RequireOnboarding soft={false}>
                        <RequireUserType allowedTypes={['job_seeker']}>
                          <Certification />
                        </RequireUserType>
                      </RequireOnboarding>
                    } />
                    
                    {/* Employer Routes - Protected by user type */}
                    <Route path="/employer-dashboard" element={
                      <RequireOnboarding soft={false}>
                        <RequireUserType allowedTypes={['employer']}>
                          <EmployerDashboard />
                        </RequireUserType>
                      </RequireOnboarding>
                    } />
                    
                    <Route path="/organization/settings" element={
                      <RequireOnboarding soft={false}>
                        <RequireUserType allowedTypes={['employer']}>
                          <OrganizationSettings />
                        </RequireUserType>
                      </RequireOnboarding>
                    } />
                    
                    <Route path="/browse-candidates" element={
                      <RequireOnboarding soft={false}>
                        <RequireUserType allowedTypes={['employer']}>
                          <BrowseCandidates />
                        </RequireUserType>
                      </RequireOnboarding>
                    } />
                    
                    {/* Admin Routes - Auth handled by useAdminAuth hook */}
                    <Route path="/admin" element={<AdminHome />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/organizations" element={<AdminOrganizations />} />
                    <Route path="/admin/pricing" element={<AdminPricing />} />
                    <Route path="/admin/trends" element={<AdminTrends />} />
                    <Route path="/admin/analytics" element={<AdminAnalytics />} />
                    <Route path="/admin/historical" element={<AdminHistorical />} />
                    <Route path="/admin/documents" element={<AdminDocuments />} />
                    <Route path="/admin/support" element={<AdminSupport />} />
                    <Route path="/admin/settings" element={<AdminSettings />} />
                  </Route>
                  
                  <Route path="*" element={<HomeSpotlight />} />
                </Routes>
              </AppShell>
              </BrowserRouter>
              </TooltipProvider>
            </NotificationProvider>
          </OrganizationProvider>
        </UserStateProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
