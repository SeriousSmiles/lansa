
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

export default function Dashboard() {
  const [userAnswers, setUserAnswers] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightActions, setHighlightActions] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | undefined>();
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [hasTrackedVisit, setHasTrackedVisit] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { user } = useAuth();
  const { track } = useActionTracking();
  const mountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  useEffect(() => {
    async function loadDashboard() {
      if (!user?.id || isLoadingData) return;
      
      setIsLoadingData(true);
      
      try {
        // Track dashboard visit only once per session
        if (!hasTrackedVisit) {
          track('dashboard_visited');
          setHasTrackedVisit(true);
        }
        
        const answers = await getUserAnswers(user.id);
        
        // Check if component is still mounted
        if (!mountedRef.current) return;
        
        if (answers) {
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
        
        if (mountedRef.current) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
        if (mountedRef.current) {
          setIsLoading(false);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoadingData(false);
        }
      }
    }
    
    loadDashboard();
    
    // Check if we should highlight the recommended actions
    const shouldHighlight = localStorage.getItem('highlightRecommendedActions') === 'true';
    if (shouldHighlight) {
      setHighlightActions(true);
      // Clean up the flag after using it to prevent multiple highlights
      localStorage.removeItem('highlightRecommendedActions');
    }
  }, [user?.id, track, hasTrackedVisit, isLoadingData]);
  
  useEffect(() => {
    // Show welcome toast if highlighting actions
    if (highlightActions && !isLoading) {
      toast.success("Welcome! Here are your recommended actions to get started.", {
        duration: 5000
      });
    }
  }, [highlightActions, isLoading]);
  
  if (isLoading) {
    return <DashboardLoadingState />;
  }
  
  const role = getProfileRole(userAnswers?.question1, userAnswers?.identity);
  const goal = getProfileGoal(userAnswers?.question3, userAnswers?.desired_outcome);
  const insight = aiInsight || getBasicInsightFromAnswers(userAnswers);
  
  // Use the display name from the user object
  const userName = user?.displayName || "Lansa User";
  
  return (
    <DashboardLayout userName={userName} email={user?.email || ""}>
      <div className="p-4 md:p-6 h-[calc(100vh-72px)] overflow-y-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 animate-fade-in">Dashboard</h1>
        
        <DashboardTabs
          userName={userName}
          role={role}
          goal={goal}
          insight={insight}
          highlightActions={highlightActions}
          isLoading={isLoadingInsight}
        />
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
