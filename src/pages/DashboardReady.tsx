
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAnswers, hasCompletedOnboarding } from "@/services/question";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardReadyModal } from "@/components/dashboard/DashboardReadyModal";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardReady() {
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Verify user authentication and onboarding completion on page load
  useEffect(() => {
    const verifyAccess = async () => {
      try {
        if (!user?.id) {
          toast.error("You must be logged in to access this page.");
          navigate("/auth", { replace: true });
          return;
        }
        
        const userAnswers = await getUserAnswers(user.id);
        const onboardingComplete = hasCompletedOnboarding(userAnswers);
        
        if (!onboardingComplete) {
          toast.error("Please complete the onboarding process first.");
          navigate("/onboarding", { replace: true });
          return;
        }
        
        // User is authenticated and has completed onboarding
        setIsLoading(false);
        setIsModalOpen(true);
      } catch (error) {
        console.error("Failed to verify access:", error);
        toast.error("There was an error checking your profile.");
        navigate("/auth", { replace: true });
      }
    };
    
    verifyAccess();
  }, [user, navigate]);
  
  // Use the display name from the user object
  const userName = user?.displayName || "Lansa User";
  
  return (
    <>
      {isLoading ? (
        <div className="h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
          <div className="text-2xl text-[#2E2E2E] animate-pulse">Loading your dashboard...</div>
        </div>
      ) : (
        <DashboardLayout userName={userName} email={user?.email || ""}>
          <div className="p-4 md:p-6 h-[calc(100vh-72px)] overflow-y-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 animate-fade-in">Welcome to Your Dashboard</h1>
            
            {/* Placeholder content that shows behind the modal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
              <AnimatedCard delay={0.1}>
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Build your profile to increase visibility</p>
                </CardContent>
              </AnimatedCard>
              
              <AnimatedCard delay={0.2}>
                <CardHeader>
                  <CardTitle>Professional Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Track your progress and set new goals</p>
                </CardContent>
              </AnimatedCard>
              
              <AnimatedCard delay={0.3}>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Access personalized learning materials</p>
                </CardContent>
              </AnimatedCard>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <AnimatedCard delay={0.4} className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Weekly Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center bg-muted/20 rounded-md">
                    <p className="text-muted-foreground">Your activity chart will appear here</p>
                  </div>
                </CardContent>
              </AnimatedCard>
            </div>
          </div>
          
          {/* The modal that appears on top */}
          <DashboardReadyModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
          />
        </DashboardLayout>
      )}
    </>
  );
}
