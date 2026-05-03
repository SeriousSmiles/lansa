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
import { PortalShell } from "@/components/dashboard/portal/PortalShell";
import { Sparkles } from "lucide-react";

const PORTAL_FLAG_KEY = "lansa.dashboardPortalV2";

function readPortalFlag(): boolean {
  if (typeof window === "undefined") return true;
  const v = localStorage.getItem(PORTAL_FLAG_KEY);
  // Default: portal v2 ON. Users can opt out with `0`.
  return v !== "0";
}

export default function Dashboard() {
  const [userAnswers, setUserAnswers] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightActions, setHighlightActions] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | undefined>();
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [openAIPlan, setOpenAIPlan] = useState(false);
  const [usePortalV2, setUsePortalV2] = useState<boolean>(() => readPortalFlag());
  const { user } = useAuth();
  const { track } = useActionTracking();
  const mountedRef = useRef(true);
  const initializingRef = useRef(false);
  const location = useLocation();

  // Read openAIPlan from navigation state (set by AIActivationPrompt) and clear it
  useEffect(() => {
    if (location.state?.openAIPlan) {
      setOpenAIPlan(true);
      // Clear state so refresh doesn't re-open
      window.history.replaceState({}, '', location.pathname);
    }
  }, []);
  
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

  const togglePortal = () => {
    const next = !usePortalV2;
    setUsePortalV2(next);
    localStorage.setItem(PORTAL_FLAG_KEY, next ? "1" : "0");
  };

  return (
    <>
      {isLoading && <LansaLoader duration={5000} />}

      <SEOHead
        title="Dashboard | Lansa - AI-Powered Career Builder"
        description="Access your personalized career dashboard with AI insights, profile management, and growth tracking tools."
        canonical="https://lansa.online/dashboard"
      />

      {usePortalV2 ? (
        <DashboardLayout
          userName={userName}
          email={user?.email || ""}
          hideTopNav
          fullBleed
        >
          <PortalShell
            userName={userName}
            role={role}
            goal={goal}
            insight={insight}
            openAIPlan={openAIPlan}
          />
          <button
            type="button"
            onClick={togglePortal}
            className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/90 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-lg hover:text-foreground transition-colors"
            title="Switch to classic dashboard"
          >
            <Sparkles className="h-3 w-3 text-primary" />
            New dashboard · use classic
          </button>
        </DashboardLayout>
      ) : (
        <DashboardLayout userName={userName} email={user?.email || ""}>
          <div className="w-full pt-4 md:pt-6 overflow-x-clip">
            <div className="flex items-center justify-between mb-4 animate-fade-in">
              <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
              <button
                type="button"
                onClick={togglePortal}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/80 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Sparkles className="h-3 w-3 text-primary" />
                Try the new dashboard
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 min-w-0">
              <aside className="order-last lg:order-first lg:sticky lg:top-4">
                <ProfileCard role={role} goal={goal} />
              </aside>
              <section className="min-w-0">
                <DashboardTabs
                  userName={userName}
                  role={role}
                  goal={goal}
                  insight={insight}
                  highlightActions={highlightActions}
                  isLoading={isLoadingInsight}
                  openAIPlan={openAIPlan}
                />
              </section>
            </div>
          </div>
        </DashboardLayout>
      )}
    </>
  );
}
