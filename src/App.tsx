
import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AddToHomeScreenPrompt } from "@/components/mobile/AddToHomeScreenPrompt";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PageTransition } from "@/components/transitions/PageTransition";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import OpportunityDiscovery from "./pages/OpportunityDiscovery";
import ProfileStarter from "./pages/ProfileStarter";
import Profile from "./pages/Profile";
import SharedProfile from "./pages/SharedProfile";
import Dashboard from "./pages/Dashboard";
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
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<PageTransition><Index /></PageTransition>} />
              {/* Change the default route to redirect to /auth instead of /dashboard */}
              <Route path="/" element={<Navigate to="/auth" replace />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/onboarding" element={<PageTransition><Onboarding /></PageTransition>} />
                <Route path="/profile-starter" element={<PageTransition><ProfileStarter /></PageTransition>} />
                <Route path="/card" element={<PageTransition><Card /></PageTransition>} />
                <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
                <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
                <Route path="/resources" element={<PageTransition><Resources /></PageTransition>} />
                <Route path="/content" element={<PageTransition><ContentLibrary /></PageTransition>} />
                <Route path="/discovery" element={<PageTransition><OpportunityDiscovery /></PageTransition>} />
              </Route>
              {/* Public shared profile route - no authentication required */}
              <Route path="/profile/share/:userId" element={<PageTransition><SharedProfile /></PageTransition>} />
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
  );
};

export default App;
