
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
import ProtectedRoute from "./components/auth/ProtectedRoute";

console.log("App.tsx loading, React available:", !!React);
console.log("React hooks available:", typeof React.useState, typeof React.useEffect);

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AddToHomeScreenPrompt />
          <HotjarScript />
          <CookieConsent />
          <BrowserRouter>
            <AppShell>
              <Routes>
                <Route path="/" element={<HomeSpotlight />} />
                <Route path="/auth" element={<Index />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                {/* Public SEO pages */}
                <Route path="/help" element={<Help />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/profile-starter" element={<ProfileStarter />} />
                  <Route path="/card" element={<Card />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/content" element={<ContentLibrary />} />
                  <Route path="/discovery" element={<OpportunityDiscovery />} />
                  <Route path="/opportunity-discovery" element={<OpportunityDiscovery />} />
          <Route path="/jobs" element={<LearningJobFeed />} />
          <Route path="/jobs/legacy" element={<JobFeed />} />
          <Route path="/dev-tools" element={<DevTools />} />
                  <Route path="/employer-dashboard" element={<EmployerDashboard />} />
                  <Route path="/browse-candidates" element={<BrowseCandidates />} />
                </Route>
                {/* Public shared profile route - no authentication required */}
                <Route path="/profile/share/:userId" element={<SharedProfile />} />
                <Route path="*" element={<HomeSpotlight />} />
              </Routes>
            </AppShell>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
