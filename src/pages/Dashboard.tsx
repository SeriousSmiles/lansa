
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getUserAnswers, 
  getProfileRole, 
  getProfileGoal,
  getBasicInsightFromAnswers,
  getPersonalizedInsight
} from "@/services/question";
import { hasCompletedOnboarding } from "@/services/question";
import { getProfileStatus } from "@/services/profileStatus";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { useActionTracking } from "@/hooks/useActionTracking";
import { ProfileCard } from "@/components/dashboard/overview/ProfileCard";
import { useUserState } from "@/contexts/UserStateProvider";
import EmployerDashboard from "./EmployerDashboard";
import { SEOHead } from "@/components/SEOHead";
import { LansaLoader } from "@/components/shared/LansaLoader";

export default function Dashboard() {
  const [userAnswers, setUserAnswers] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [highlightActions, setHighlightActions] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | undefined>();
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const { track } = useActionTracking();
  const { userType, loading: isLoadingUserType } = useUserState();
  const mountedRef = useRef(true);
  const initializingRef = useRef(false);
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Check onboarding and profile status when component mounts
  useEffect(() => {
    if (!session?.user || !user) return;

    let mounted = true;

    const checkUserProfile = async () => {
      try {
        // Get user answers to check onboarding completion
        const userAnswers = await getUserAnswers(user.id);
        const onboardingStatus = hasCompletedOnboarding(userAnswers);
        
        if (!mounted) return;
        
        if (!onboardingStatus) {
          navigate('/onboarding', { replace: true });
          return;
        }

        // Check if profile is ready and show soft notification
        const profileStatus = await getProfileStatus(user.id);
        
        if (!mounted) return;
        
        if (!profileStatus.isProfileReady) {
          // Only show toast once per session
          const toastShown = sessionStorage.getItem('profile-incomplete-toast');
          if (!toastShown) {
            toast.info('Complete your profile to unlock all features');
            sessionStorage.setItem('profile-incomplete-toast', 'true');
          }
        }
        
        setIsCheckingProfile(false);
      } catch (error) {
        console.error('Error checking user profile:', error);
        if (mounted) {
          setIsCheckingProfile(false);
        }
      }
    };

    checkUserProfile();

    return () => {
      mounted = false;
    };
  }, [session, user, navigate]);
  
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
  
  // Redirect employers to their dedicated dashboard
  if (!isLoading && !isLoadingUserType && !isCheckingProfile && userType === 'employer') {
    return <EmployerDashboard />;
  }

  // Show loader as overlay while content loads behind
  const showLoader = isLoading || isLoadingUserType || isCheckingProfile;

  // Defensive fallbacks to avoid rendering issues when answers are missing
  const role = getProfileRole(userAnswers?.identity, userAnswers?.career_path) || "Professional seeking clarity";
  const goal = getProfileGoal(userAnswers?.desired_outcome) || "Gaining professional clarity";
  const insight = aiInsight || getBasicInsightFromAnswers(userAnswers || null);
  
  // Use the display name from the user object
  const userName = user?.displayName || "Lansa User";
  
  return (
    <>
      {/* Loader overlay - renders on top while loading */}
      {showLoader && <LansaLoader duration={5000} />}
      
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
