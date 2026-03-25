import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

import { 
  getUserAnswers, 
  getProfileRole, 
  getProfileGoal,
  getBasicInsightFromAnswers,
  getPersonalizedInsight
} from "@/services/question";
import { getProfileStatus } from "@/services/profileStatus";
import { useAuth } from "@/contexts/UnifiedAuthProvider";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { useActionTracking } from "@/hooks/useActionTracking";
import { ProfileCard } from "@/components/dashboard/overview/ProfileCard";
import { SEOHead } from "@/components/SEOHead";
import { LansaLoader } from "@/components/shared/LansaLoader";

export default function Dashboard() {
  const [userAnswers, setUserAnswers] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightActions, setHighlightActions] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | undefined>();
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [openAIPlan, setOpenAIPlan] = useState(false);
  const { user } = useAuth();
  const { track } = useActionTracking();
  const mountedRef = useRef(true);
  const initializingRef = useRef(false);
  const location = useLocation();
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Single consolidated data fetch on mount — Guard already ensures user is 
  // authenticated, onboarded, and is a job_seeker before rendering this page.
  useEffect(() => {
    async function loadDashboard() {
      if (!user?.id || hasInitialized || initializingRef.current) return;
      
      initializingRef.current = true;
      setIsLoading(true);
      
      try {
        track('dashboard_visited');

        // Check profile completeness (single DB call — no duplicate onboarding check)
        const [answers, profileStatus] = await Promise.all([
          getUserAnswers(user.id),
          getProfileStatus(user.id),
        ]);
        
        if (!mountedRef.current) return;
        
        if (!profileStatus.isProfileReady) {
          const toastShown = sessionStorage.getItem('profile-incomplete-toast');
          if (!toastShown) {
            toast.info('Complete your profile to unlock all features');
            sessionStorage.setItem('profile-incomplete-toast', 'true');
          }
        }

        if (answers) {
          setUserAnswers(answers);
          
          if (answers.ai_insight) {
            setAiInsight(answers.ai_insight);
          } else {
            setIsLoadingInsight(true);
            try {
              const insight = await getPersonalizedInsight(user.id, answers);
              if (!mountedRef.current) return;
              setAiInsight(insight);
            } catch (error) {
              console.error("Failed to get AI insight:", error);
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
        
        const shouldHighlight = localStorage.getItem('highlightRecommendedActions') === 'true';
        if (shouldHighlight) {
          setHighlightActions(true);
          localStorage.removeItem('highlightRecommendedActions');
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

  const role = getProfileRole(userAnswers?.identity, userAnswers?.career_path) || "Professional seeking clarity";
  const goal = getProfileGoal(userAnswers?.desired_outcome) || "Gaining professional clarity";
  const insight = aiInsight || getBasicInsightFromAnswers(userAnswers || null);
  const userName = user?.displayName || "Lansa User";
  
  return (
    <>
      {isLoading && <LansaLoader duration={5000} />}
      
      <SEOHead
        title="Dashboard | Lansa - AI-Powered Career Builder"
        description="Access your personalized career dashboard with AI insights, profile management, and growth tracking tools."
        canonical="https://lansa.online/dashboard"
      />
      <DashboardLayout userName={userName} email={user?.email || ""}>
        <div className="p-4 md:p-6">
          <div className="w-full">
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
    </>
  );
}
