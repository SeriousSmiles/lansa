
import { Card } from "@/components/ui/card";
import { ProfileCard } from "./ProfileCard";
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
    <div className="space-y-8">
      {/* Growth Card System - Featured prominently at the top */}
      <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl shadow-sm border border-gray-200/50 p-6">
        <GrowthCardSection userId={user?.id} />
      </div>
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Profile Card - Takes up 1 column */}
        <div className="xl:col-span-1">
          <ProfileCard role={role} goal={goal} />
        </div>
        
        {/* Recommended Actions - Takes up 2 columns */}
        <div className="xl:col-span-2">
          <RecommendedActions role={role} highlightActions={highlightActions} />
        </div>
      </div>
    </div>
  );
}
