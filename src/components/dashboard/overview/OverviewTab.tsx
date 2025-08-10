
import { RecommendedActions } from "./RecommendedActions";
import { GrowthCardSection } from "./GrowthCardSection";
import { useAuth } from "@/contexts/AuthContext";

interface OverviewTabProps {
  userName: string;
  role: string;
  goal: string;
  insight: string;
  highlightActions: boolean;
  isLoading: boolean;
}

export function OverviewTab({ userName, role, goal, insight, highlightActions, isLoading }: OverviewTabProps) {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Growth Card System - Featured prominently at the top */}
      <GrowthCardSection userId={user?.id} />
      
      {/* Existing Overview Content */}
        <div>
          <RecommendedActions role={role} highlightActions={highlightActions} />
        </div>
    </div>
  );
}
