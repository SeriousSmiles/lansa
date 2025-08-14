
import { useEffect, useState, useRef } from "react";
import { 
  getUserAnswers, 
  getProfileRole, 
  getProfileGoal,
  getBasicInsightFromAnswers,
  getPersonalizedInsight
} from "@/services/question";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { useActionTracking } from "@/hooks/useActionTracking";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ProfileCard } from "@/components/dashboard/overview/ProfileCard";
import { useUserType } from "@/hooks/useUserType";
import EmployerDashboard from "./EmployerDashboard";

export default function Dashboard() {
  const [userAnswers, setUserAnswers] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightActions, setHighlightActions] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | undefined>();
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { user } = useAuth();
  const { track } = useActionTracking();
  const { userType, isLoading: isLoadingUserType } = useUserType();
  const mountedRef = useRef(true);
  const initializingRef = useRef(false);
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  useEffect(() => {
    async function loadDashboard() {
      // Prevent duplicate initialization
      if (!user?.id || hasInitialized || initializingRef.current) return;
      
      initializingRef.current = true;
      setIsLoading(true);
      
      try {
        console.log('Dashboard: Starting initialization for user:', user.id);
        
        // Track dashboard visit only once
        track('dashboard_visited');
        
        const answers = await getUserAnswers(user.id);
        
        // Check if component is still mounted
        if (!mountedRef.current) return;
        
        if (answers) {
          console.log('Dashboard: User answers loaded successfully');
          setUserAnswers(answers);
          
          // Check if we have a stored AI insight
          if (answers.ai_insight) {
            setAiInsight(answers.ai_insight);
          } else {
            // Generate insight if we don't have one stored
            setIsLoadingInsight(true);
            try {
              const insight = await getPersonalizedInsight(user.id, answers);
              
              // Check if component is still mounted
              if (!mountedRef.current) return;
              
              setAiInsight(insight);
            } catch (error) {
              console.error("Failed to get AI insight:", error);
              // Fallback to basic insight
              if (mountedRef.current) {
                setAiInsight(getBasicInsightFromAnswers(answers));
              }
            } finally {
              if (mountedRef.current) {
                setIsLoadingInsight(false);
              }
            }
          }
        }
        
        // Check if we should highlight the recommended actions
        const shouldHighlight = localStorage.getItem('highlightRecommendedActions') === 'true';
        if (shouldHighlight) {
          setHighlightActions(true);
          // Clean up the flag after using it to prevent multiple highlights
          localStorage.removeItem('highlightRecommendedActions');
          
          // Show welcome toast
          setTimeout(() => {
            if (mountedRef.current) {
              toast.success("Welcome! Here are your recommended actions to get started.", {
                duration: 5000
              });
            }
          }, 500);
        }
        
        if (mountedRef.current) {
          setHasInitialized(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
        if (mountedRef.current) {
          setIsLoading(false);
          setHasInitialized(true);
        }
      } finally {
        initializingRef.current = false;
      }
    }
    
    loadDashboard();
  }, [user?.id, hasInitialized, track]);
  
  if (isLoading || isLoadingUserType) {
    return <DashboardLoadingState />;
  }

  // Redirect employers to their dedicated dashboard
  if (userType === 'employer') {
    return <EmployerDashboard />;
  }

  // Defensive fallbacks to avoid rendering issues when answers are missing
  const role = getProfileRole(userAnswers?.question1, userAnswers?.identity) || "Professional seeking clarity";
  const goal = getProfileGoal(userAnswers?.question3, userAnswers?.desired_outcome) || "Gaining professional clarity";
  const insight = aiInsight || getBasicInsightFromAnswers(userAnswers || null);
  
  // Use the display name from the user object
  const userName = user?.displayName || "Lansa User";
  
  return (
    <DashboardLayout userName={userName} email={user?.email || ""}>
      <div className="p-4 md:p-6 h-[calc(100vh-72px)] overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4 animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            <aside className="order-last lg:order-first lg:sticky lg:top-4">
              <ProfileCard role={role} goal={goal} />
            </aside>
            <section>
              <DashboardTabs
                userName={userName}
                role={role}
                goal={goal}
                insight={insight}
                highlightActions={highlightActions}
                isLoading={isLoadingInsight}
              />
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function DashboardLoadingState() {
  return (
    <div className="h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
      <div className="text-2xl text-[#2E2E2E] animate-pulse">Loading your dashboard...</div>
    </div>
  );
}
