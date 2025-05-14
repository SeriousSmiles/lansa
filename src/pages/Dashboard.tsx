
import { useEffect, useState } from "react";
import { 
  getUserAnswers, 
  getProfileRole, 
  getProfileGoal,
  getInsightFromAnswers
} from "@/services/QuestionService";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { DashboardLoadingState } from "@/components/dashboard/LoadingState";

export default function Dashboard() {
  const [userAnswers, setUserAnswers] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightActions, setHighlightActions] = useState(false);
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
    
    // Check if we should highlight the recommended actions
    const shouldHighlight = localStorage.getItem('highlightRecommendedActions') === 'true';
    if (shouldHighlight) {
      setHighlightActions(true);
      localStorage.removeItem('highlightRecommendedActions');
    }
  }, [user]);
  
  if (isLoading) {
    return <DashboardLoadingState />;
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
        
        <DashboardTabs
          userName={userName}
          role={role}
          goal={goal}
          insight={insight}
          highlightActions={highlightActions}
        />
      </div>
    </DashboardLayout>
  );
}
