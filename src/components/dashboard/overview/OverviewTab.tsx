
import { RecommendedActions } from "./RecommendedActions";
import { GrowthCardSection } from "./GrowthCardSection";
import { StudentAnalyticsCard } from "./StudentAnalyticsCard";
import { useUser } from "@clerk/clerk-react";

interface OverviewTabProps {
  userName: string;
  role: string;
  goal: string;
  insight: string;
  highlightActions: boolean;
  isLoading: boolean;
}

export function OverviewTab({ userName, role, goal, insight, highlightActions, isLoading }: OverviewTabProps) {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      {/* Student Analytics Dashboard */}
      <StudentAnalyticsCard />
      
      {/* Existing Overview Content */}
      <div>
        <RecommendedActions role={role} highlightActions={highlightActions} />
      </div>
    </div>
  );
}
