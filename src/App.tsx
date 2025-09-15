
import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AddToHomeScreenPrompt } from "@/components/mobile/AddToHomeScreenPrompt";
import { HotjarScript } from "@/components/analytics/HotjarScript";
import { CookieConsent } from "@/components/analytics/CookieConsent";

import { MobileNavigationProvider } from "@/contexts/MobileNavigationContext";
import { GlobalHelpModal } from "@/components/mobile/GlobalHelpModal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PageTransition } from "@/components/transitions/PageTransition";
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
            <MobileNavigationProvider>
              <Routes>
                <Route path="/" element={<HomeSpotlight />} />
                <Route path="/auth" element={<PageTransition><Index /></PageTransition>} />
                <Route path="/auth/callback" element={<PageTransition><AuthCallback /></PageTransition>} />
                {/* Public SEO pages */}
                <Route path="/help" element={<PageTransition><Help /></PageTransition>} />
                <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
                <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/onboarding" element={<PageTransition><Onboarding /></PageTransition>} />
                  <Route path="/profile-starter" element={<PageTransition><ProfileStarter /></PageTransition>} />
                  <Route path="/card" element={<PageTransition><Card /></PageTransition>} />
                  <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
                  <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
                  <Route path="/resources" element={<PageTransition><Resources /></PageTransition>} />
                  <Route path="/content" element={<PageTransition><ContentLibrary /></PageTransition>} />
                  <Route path="/discovery" element={<PageTransition><OpportunityDiscovery /></PageTransition>} />
                  <Route path="/employer-dashboard" element={<PageTransition><EmployerDashboard /></PageTransition>} />
                  <Route path="/browse-candidates" element={<PageTransition><BrowseCandidates /></PageTransition>} />
                </Route>
                {/* Public shared profile route - no authentication required */}
                <Route path="/profile/share/:userId" element={<PageTransition><SharedProfile /></PageTransition>} />
                <Route path="*" element={<HomeSpotlight />} />
              </Routes>
              <GlobalHelpModal />
              
            </MobileNavigationProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
