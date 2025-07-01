
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PageTransition } from "@/components/transitions/PageTransition";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import SharedProfile from "./pages/SharedProfile";
import Dashboard from "./pages/Dashboard";
import Resources from "./pages/Resources";
import ContentLibrary from "./pages/ContentLibrary";
import Card from "./pages/Card";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Default route now handles both authenticated and unauthenticated users */}
              <Route path="/" element={<PageTransition><Index /></PageTransition>} />
              <Route path="/auth" element={<PageTransition><Index /></PageTransition>} />
              <Route element={<ProtectedRoute />}>
                <Route path="/onboarding" element={<PageTransition><Onboarding /></PageTransition>} />
                <Route path="/card" element={<PageTransition><Card /></PageTransition>} />
                <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
                <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
                <Route path="/resources" element={<PageTransition><Resources /></PageTransition>} />
                <Route path="/content" element={<PageTransition><ContentLibrary /></PageTransition>} />
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
