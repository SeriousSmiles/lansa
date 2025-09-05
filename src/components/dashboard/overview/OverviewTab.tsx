
import { RecommendedActions } from "./RecommendedActions";
import { GrowthCardSection } from "./GrowthCardSection";
import { StudentAnalyticsCard } from "./StudentAnalyticsCard";
import { HireRateProgress } from "../HireRateProgress";
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
      {/* Analytics and Progress Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <StudentAnalyticsCard />
        </div>
        <div>
          <HireRateProgress />
        </div>
      </div>
      
      {/* Existing Overview Content */}
      <div>
        <RecommendedActions role={role} highlightActions={highlightActions} />
      </div>
    </div>
  );
}
