
import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AddToHomeScreenPrompt } from "@/components/mobile/AddToHomeScreenPrompt";
import { HotjarScript } from "@/components/analytics/HotjarScript";
import { CookieConsent } from "@/components/analytics/CookieConsent";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/mobile/app/AppShell";
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
import ResumeEditor from "./pages/ResumeEditor";
import Dashboard from "./pages/Dashboard";
import BrowseCandidates from "./pages/BrowseCandidates";
import EmployerDashboard from "./pages/EmployerDashboard";
import OrganizationSettings from "./pages/OrganizationSettings";
import Resources from "./pages/Resources";
import ContentLibrary from "./pages/ContentLibrary";
import MentorDashboard from "./pages/MentorDashboard";
import Card from "./pages/Card";
import LearningJobFeed from "./pages/LearningJobFeed";
import DevTools from "./pages/DevTools";
import Certification from "./pages/Certification";
import VerifyCertification from "./pages/VerifyCertification";
import Notifications from "./pages/Notifications";
import Chat from "./pages/Chat";
import AdminHome from "./pages/admin/AdminHome";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrganizations from "./pages/admin/AdminOrganizations";
import AdminUpdates from "./pages/admin/AdminUpdates";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminTrends from "./pages/admin/AdminTrends";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminHistorical from "./pages/admin/AdminHistorical";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminContent from "./pages/admin/AdminContent";
import AdminMentors from "./pages/admin/AdminMentors";
import ForBusiness from "./pages/ForBusiness";
import Pricing from "./pages/Pricing";

import { UnifiedAuthProvider } from "./contexts/UnifiedAuthProvider";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { Guard } from "./components/auth/Guard";
import { AdminLayout } from "./components/admin/AdminLayout";
import { DefaultRoute } from "./components/auth/DefaultRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <UnifiedAuthProvider>
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
                <Route path="/" element={<DefaultRoute />} />
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
                <Route path="/for-business" element={<ForBusiness />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/verify/:code" element={<VerifyCertification />} />
                
                {/* Auth-only routes (no type/onboarding check) */}
                <Route path="/onboarding" element={
                  <Guard auth><Onboarding /></Guard>
                } />
                <Route path="/profile-starter" element={
                  <Guard auth><ProfileStarter /></Guard>
                } />
                <Route path="/card" element={
                  <Guard auth><Card /></Guard>
                } />
                <Route path="/dev-tools" element={
                  <Guard auth admin><DevTools /></Guard>
                } />
                <Route path="/notifications" element={
                  <Guard auth onboarding><Notifications /></Guard>
                } />
                <Route path="/chat" element={
                  <Guard auth onboarding><Chat /></Guard>
                } />
                <Route path="/chat/:threadId" element={
                  <Guard auth onboarding><Chat /></Guard>
                } />
                
                {/* Job Seeker Routes */}
                <Route path="/dashboard" element={
                  <Guard auth onboarding types={['job_seeker']}><Dashboard /></Guard>
                } />
                <Route path="/jobs" element={
                  <Guard auth onboarding types={['job_seeker']}><LearningJobFeed /></Guard>
                } />
                {/* Legacy redirect — /jobs/legacy → /jobs */}
                <Route path="/jobs/legacy" element={<Navigate to="/jobs" replace />} />
                <Route path="/profile" element={
                  <Guard auth onboarding types={['job_seeker']}><Profile /></Guard>
                } />
                <Route path="/profile/resume-editor" element={
                  <Guard auth onboarding types={['job_seeker']}><ResumeEditor /></Guard>
                } />
                <Route path="/discovery" element={
                  <Guard auth onboarding types={['job_seeker']}><OpportunityDiscovery /></Guard>
                } />
                {/* Legacy redirect — /opportunity-discovery → /discovery */}
                <Route path="/opportunity-discovery" element={<Navigate to="/discovery" replace />} />
                <Route path="/resources" element={
                  <Guard auth types={['job_seeker']}><Resources /></Guard>
                } />
                <Route path="/content" element={
                  <Guard auth types={['job_seeker', 'mentor']}><ContentLibrary /></Guard>
                } />
                <Route path="/certification" element={
                  <Guard auth onboarding types={['job_seeker']}><Certification /></Guard>
                } />
                <Route path="/certification/:sector" element={
                  <Guard auth onboarding types={['job_seeker']}><Certification /></Guard>
                } />
                <Route path="/certification/result/:resultId" element={
                  <Guard auth onboarding types={['job_seeker']}><Certification /></Guard>
                } />

                {/* Mentor Routes */}
                <Route path="/mentor-dashboard" element={
                  <Guard auth onboarding types={['mentor']}><MentorDashboard /></Guard>
                } />
                
                {/* Employer Routes */}
                <Route path="/employer-dashboard" element={
                  <Guard auth onboarding types={['employer']}><EmployerDashboard /></Guard>
                } />
                <Route path="/organization/settings" element={
                  <Guard auth onboarding types={['employer']}><OrganizationSettings /></Guard>
                } />
                <Route path="/browse-candidates" element={
                  <Guard auth onboarding types={['employer']}><BrowseCandidates /></Guard>
                } />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <Guard auth admin><AdminLayout /></Guard>
                  }
                >
                  <Route index element={<AdminHome />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="organizations" element={<AdminOrganizations />} />
                  <Route path="updates" element={<AdminUpdates />} />
                  <Route path="pricing" element={<AdminPricing />} />
                  <Route path="trends" element={<AdminTrends />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="historical" element={<AdminHistorical />} />
                  <Route path="documents" element={<AdminDocuments />} />
                  <Route path="support" element={<AdminSupport />} />
                  <Route path="content" element={<AdminContent />} />
                  <Route path="mentors" element={<AdminMentors />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
                
                {/* 404 — any unmatched route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppShell>
            </BrowserRouter>
            </TooltipProvider>
          </NotificationProvider>
        </OrganizationProvider>
      </UnifiedAuthProvider>
    </QueryClientProvider>
  );
};

export default App;
