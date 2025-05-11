
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

export default function Dashboard() {
  const [userAnswers, setUserAnswers] = useState<any>(null);
  const [userName, setUserName] = useState<string>("Lansa User");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    async function loadDashboard() {
      if (!user?.id) return;
      
      const answers = await getUserAnswers(user.id);
      if (answers) {
        setUserAnswers(answers);
      }
      
      if (user.email) {
        setUserName(user.email.split('@')[0]);
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
  
  return (
    <DashboardLayout userName={userName} email={user?.email || ""}>
      <div className="p-4 md:p-6 h-[calc(100vh-72px)] overflow-y-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Dashboard</h1>
        
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
                  <div className="flex flex-wrap gap-2">
                    <p className="text-base md:text-lg">{role}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Goal</h3>
                  <div className="flex flex-wrap gap-2">
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
      </div>
    </DashboardLayout>
  );
}
