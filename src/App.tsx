
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
import Resources from "./pages/Resources";
import ContentLibrary from "./pages/ContentLibrary";
import Card from "./pages/Card";
import JobFeed from "./pages/JobFeed";
import LearningJobFeed from "./pages/LearningJobFeed";
import DevTools from "./pages/DevTools";
import { AuthProvider } from "./contexts/AuthContext";
import { UserStateProvider } from "./contexts/UserStateProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { RequireOnboarding, RequireUserType } from "./components/auth/RouteGuards";

console.log("App.tsx loading, React available:", !!React);
console.log("React hooks available:", typeof React.useState, typeof React.useEffect);

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserStateProvider>
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
                  <Route path="/" element={<HomeSpotlight />} />
                  <Route path="/auth" element={<Index />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/profile/share/:userId" element={<SharedProfile />} />
                  <Route path="/not-allowed" element={<NotAllowed />} />
                  
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
                      <RequireOnboarding soft={true}>
                        <RequireUserType allowedTypes={['job_seeker']}>
                          <LearningJobFeed />
                        </RequireUserType>
                      </RequireOnboarding>
                    } />
                    
                    <Route path="/jobs/legacy" element={
                      <RequireOnboarding soft={true}>
                        <RequireUserType allowedTypes={['job_seeker']}>
                          <JobFeed />
                        </RequireUserType>
                      </RequireOnboarding>
                    } />
                    
                    <Route path="/profile" element={
                      <RequireOnboarding soft={true}>
                        <RequireUserType allowedTypes={['job_seeker']}>
                          <Profile />
                        </RequireUserType>
                      </RequireOnboarding>
                    } />
                    
                    <Route path="/discovery" element={
                      <RequireOnboarding soft={true}>
                        <RequireUserType allowedTypes={['job_seeker']}>
                          <OpportunityDiscovery />
                        </RequireUserType>
                      </RequireOnboarding>
                    } />
                    
                    <Route path="/opportunity-discovery" element={
                      <RequireOnboarding soft={true}>
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
                    
                    <Route path="/content" element={
                      <RequireUserType allowedTypes={['job_seeker']}>
                        <ContentLibrary />
                      </RequireUserType>
                    } />
                    
                    {/* Employer Routes - Protected by user type */}
                    <Route path="/employer-dashboard" element={
                      <RequireOnboarding soft={false}>
                        <RequireUserType allowedTypes={['employer']}>
                          <EmployerDashboard />
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
                  </Route>
                  
                  <Route path="*" element={<HomeSpotlight />} />
                </Routes>
              </AppShell>
            </BrowserRouter>
          </TooltipProvider>
        </UserStateProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
