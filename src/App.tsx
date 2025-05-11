
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Result from "./pages/Result";
import Profile from "./pages/Profile";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasEnvVars, setHasEnvVars] = useState(true);

  useEffect(() => {
    // Check if Supabase environment variables are set
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setHasEnvVars(false);
      console.error("Missing Supabase environment variables");
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!hasEnvVars) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[rgba(253,248,242,1)] p-8 text-center">
        <h1 className="mb-4 text-3xl font-bold text-[#FF6B4A]">Missing Environment Variables</h1>
        <p className="mb-6 max-w-md text-lg">
          The application requires Supabase credentials to function. Please ensure that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
        </p>
        <div className="rounded-lg bg-amber-50 p-4 text-left text-sm text-amber-800">
          <p className="font-semibold">For development:</p>
          <p className="my-2">
            1. Connect your Lovable project to Supabase using the green Supabase button in the top-right corner.
          </p>
          <p>2. Refresh the page after integration is complete.</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Index />} />
              <Route path="/" element={<Navigate to="/auth" replace />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/result" element={<Result />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
