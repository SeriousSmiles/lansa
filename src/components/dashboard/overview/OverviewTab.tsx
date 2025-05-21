
import { useRef } from "react";
import { ProfileCard } from "./ProfileCard";
import { InsightCard } from "./InsightCard";
import { RecommendedActions } from "./RecommendedActions";

interface OverviewTabProps {
  userName: string;
  role: string;
  goal: string;
  insight: string;
  highlightActions: boolean;
  isLoading?: boolean;
}

export function OverviewTab({ 
  userName,
  role,
  goal,
  insight,
  highlightActions,
  isLoading = false
}: OverviewTabProps) {
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ProfileCard role={role} goal={goal} />
        <InsightCard insight={insight} isLoading={isLoading} />
      </div>
      
      <RecommendedActions 
        role={role}
        highlightActions={highlightActions}
      />
    </>
  );
}
