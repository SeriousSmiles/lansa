import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  getUserAnswers, 
  getProfileRole, 
  getProfileGoal,
  getInsightFromAnswers
} from "@/services/QuestionService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";
import { gsap } from "gsap";
import { animateElementsSequence } from "@/utils/animationHelpers";

export default function Dashboard() {
  const [userAnswers, setUserAnswers] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightActions, setHighlightActions] = useState(false);
  const { user } = useAuth();
  const recommendedActionsRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    async function loadDashboard() {
      if (!user?.id) return;
      
      const answers = await getUserAnswers(user.id);
      if (answers) {
        setUserAnswers(answers);
      }
      
      setIsLoading(false);
    }
    
    loadDashboard();
    
    // Check if we should highlight the recommended actions
    const shouldHighlight = localStorage.getItem('highlightRecommendedActions') === 'true';
    if (shouldHighlight) {
      setHighlightActions(true);
      localStorage.removeItem('highlightRecommendedActions');
    }
  }, [user]);
  
  useEffect(() => {
    // Animate tabs when visible
    if (!isLoading && tabsRef.current) {
      gsap.from(tabsRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, [isLoading]);
  
  useEffect(() => {
    // Animate recommended actions cards with staggered delay
    if (!isLoading && recommendedActionsRef.current) {
      const cards = recommendedActionsRef.current.querySelectorAll('.animated-card');
      animateElementsSequence(cards, {
        opacity: [0, 1],
        y: [20, 0],
        stagger: 0.1,
        duration: 0.5,
        delay: 0.3,
        ease: "power2.out" // Added the missing ease property
      });
    }
    
    // Show welcome toast if highlighting actions
    if (highlightActions && !isLoading) {
      toast.success("Welcome! Here are your recommended actions to get started.", {
        duration: 5000
      });
    }
  }, [highlightActions, isLoading]);
  
  if (isLoading) {
    return (
      <div className="h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
        <div className="text-2xl text-[#2E2E2E] animate-pulse">Loading your dashboard...</div>
      </div>
    );
  }
  
  const role = getProfileRole(userAnswers?.question1);
  const goal = getProfileGoal(userAnswers?.question3);
  const insight = getInsightFromAnswers(userAnswers);
  
  // Use the display name from the user object
  const userName = user?.displayName || "Lansa User";
  
  return (
    <DashboardLayout userName={userName} email={user?.email || ""}>
      <div className="p-4 md:p-6 h-[calc(100vh-72px)] overflow-y-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 animate-fade-in">Dashboard</h1>
        
        <div ref={tabsRef}>
          <Tabs defaultValue="overview" className="mb-6">
            <TabsList>
              <TabsTrigger value="overview" className="btn-animate">Overview</TabsTrigger>
              <TabsTrigger value="storybuilder" className="flex items-center gap-1.5 btn-animate">
                <span>Story Builder</span>
                <LockKeyhole className="h-3.5 w-3.5" />
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <AnimatedCard delay={0.1} className="h-auto hover-lift">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg md:text-xl">Your Profile</CardTitle>
                    <CardDescription>Based on your onboarding answers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Role</h3>
                        <div className="flex flex-col gap-1">
                          <p className="text-base md:text-lg">{role}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Goal</h3>
                        <div className="flex flex-col gap-1">
                          <p className="text-base md:text-lg">{goal}</p>
                        </div>
                      </div>
                      <div className="pt-1">
                        <Link to="/profile">
                          <Button variant="outline" size="sm" className="btn-animate">View Full Profile</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </AnimatedCard>
                
                <AnimatedCard delay={0.2} className="h-auto hover-lift">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg md:text-xl">Your Insight</CardTitle>
                    <CardDescription>Personalized for your journey</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base md:text-lg italic">"{insight}"</p>
                  </CardContent>
                </AnimatedCard>
              </div>
              
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-semibold animate-fade-in">Recommended Actions</h2>
                {highlightActions && (
                  <div className="bg-[#FF6B4A]/20 text-[#FF6B4A] px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                    Start here
                  </div>
                )}
              </div>
              
              <div 
                ref={recommendedActionsRef}
                className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${
                  highlightActions ? 'ring-2 ring-[#FF6B4A] ring-offset-4 rounded-lg p-4 animate-[scale-in_0.5s_ease-out]' : ''
                }`}
              >
                <AnimatedCard delay={0.3} className="animated-card h-auto hover-scale">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base md:text-lg">Define Your Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-sm">Clarify how you talk about yourself and your work to resonate with your audience.</p>
                    <Button variant="outline" size="sm" className="w-full btn-animate">Start Exercise</Button>
                  </CardContent>
                </AnimatedCard>
                
                <AnimatedCard delay={0.4} className="animated-card h-auto hover-scale">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base md:text-lg">Build Your Presence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-sm">Create a standout online profile that showcases your unique value.</p>
                    <Button variant="outline" size="sm" className="w-full btn-animate">Start Building</Button>
                  </CardContent>
                </AnimatedCard>
                
                <AnimatedCard delay={0.5} className="animated-card h-auto hover-scale">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base md:text-lg">Track Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-sm">See your journey toward greater clarity and professional visibility.</p>
                    <Button variant="outline" size="sm" className="w-full btn-animate">View Progress</Button>
                  </CardContent>
                </AnimatedCard>
              </div>
            </TabsContent>
            
            <TabsContent value="storybuilder" className="pt-4 animate-fade-in">
              <div className="flex flex-col items-center justify-center py-10 text-center relative">
                {/* Blurred dashboard-like background */}
                <div className="absolute inset-0 opacity-20 blur-sm pointer-events-none">
                  <div className="bg-white/90 h-full w-full p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-gray-200 h-40 rounded-lg"></div>
                      <div className="bg-gray-200 h-40 rounded-lg"></div>
                      <div className="bg-gray-200 h-40 rounded-lg"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-gray-200 h-60 rounded-lg"></div>
                      <div className="bg-gray-200 h-60 rounded-lg"></div>
                    </div>
                  </div>
                </div>
                
                {/* Lock content */}
                <div className="z-10 w-full max-w-lg animate-fade-in">
                  <div className="bg-[#F8F8F8] rounded-full p-4 mb-6 w-24 h-24 flex items-center justify-center mx-auto animate-pulse">
                    <LockKeyhole className="h-12 w-12 text-[#FF6B4A]" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-semibold mb-3">Story Builder</h2>
                  <p className="text-md mb-6">
                    Discover your authentic origin story by exploring your deep motivational factors,
                    professional desires, and the pivotal moments that pushed you to want more.
                  </p>
                  <div className="bg-[#FFF4EE] border border-[#FFDED0] rounded-md p-4 mb-6 animate-fade-in">
                    <h3 className="font-medium text-[#FF6B4A] mb-2">Starter Plan Required</h3>
                    <p className="text-sm">
                      This feature is available on our Starter Plan at ƒ9,- per month.
                      Upgrade now to unlock the Story Builder and find your authentic voice.
                    </p>
                  </div>
                  <Button className="bg-[#FF6B4A] hover:bg-[#E55A3A] btn-animate">
                    Upgrade to Starter Plan
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
