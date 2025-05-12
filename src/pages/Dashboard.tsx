
import { useEffect, useState } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LockKeyhole } from "lucide-react";

export default function Dashboard() {
  const [userAnswers, setUserAnswers] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
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
  }, [user]);
  
  if (isLoading) {
    return (
      <div className="h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
        <div className="text-2xl text-[#2E2E2E]">Loading your dashboard...</div>
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
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Dashboard</h1>
        
        <Tabs defaultValue="overview" className="mb-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="storybuilder" className="flex items-center gap-1.5">
              <span>Story Builder</span>
              <LockKeyhole className="h-3.5 w-3.5" />
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card className="h-auto">
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
                        <Button variant="outline" size="sm">View Full Profile</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="h-auto">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg md:text-xl">Your Insight</CardTitle>
                  <CardDescription>Personalized for your journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-base md:text-lg italic">"{insight}"</p>
                </CardContent>
              </Card>
            </div>
            
            <h2 className="text-xl md:text-2xl font-semibold mb-3">Recommended Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="h-auto">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base md:text-lg">Define Your Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-sm">Clarify how you talk about yourself and your work to resonate with your audience.</p>
                  <Button variant="outline" size="sm" className="w-full">Start Exercise</Button>
                </CardContent>
              </Card>
              
              <Card className="h-auto">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base md:text-lg">Build Your Presence</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-sm">Create a standout online profile that showcases your unique value.</p>
                  <Button variant="outline" size="sm" className="w-full">Start Building</Button>
                </CardContent>
              </Card>
              
              <Card className="h-auto">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base md:text-lg">Track Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-sm">See your journey toward greater clarity and professional visibility.</p>
                  <Button variant="outline" size="sm" className="w-full">View Progress</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="storybuilder" className="pt-4">
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
              <div className="z-10 w-full max-w-lg">
                <div className="bg-[#F8F8F8] rounded-full p-4 mb-6 w-24 h-24 flex items-center justify-center mx-auto">
                  <LockKeyhole className="h-12 w-12 text-[#FF6B4A]" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold mb-3">Story Builder</h2>
                <p className="text-md mb-6">
                  Discover your authentic origin story by exploring your deep motivational factors,
                  professional desires, and the pivotal moments that pushed you to want more.
                </p>
                <div className="bg-[#FFF4EE] border border-[#FFDED0] rounded-md p-4 mb-6">
                  <h3 className="font-medium text-[#FF6B4A] mb-2">Starter Plan Required</h3>
                  <p className="text-sm">
                    This feature is available on our Starter Plan at ƒ9,- per month.
                    Upgrade now to unlock the Story Builder and find your authentic voice.
                  </p>
                </div>
                <Button className="bg-[#FF6B4A] hover:bg-[#E55A3A]">
                  Upgrade to Starter Plan
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
