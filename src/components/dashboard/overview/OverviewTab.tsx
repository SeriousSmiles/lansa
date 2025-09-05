
import { RecommendedActions } from "./RecommendedActions";
import { GrowthCardSection } from "./GrowthCardSection";
import { HireRateCard } from "../HireRateCard";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileData } from "@/hooks/useProfileData";

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
  const profileData = useProfileData(user?.id);

  return (
    <div className="space-y-6">
      {/* Hire Rate Progress - Prominently Featured */}
      <HireRateCard profile={profileData} />
      
      {/* Growth Card System */}
      <GrowthCardSection userId={user?.id} />
      
      {/* Existing Overview Content */}
      <div>
        <RecommendedActions role={role} highlightActions={highlightActions} />
      </div>
    </div>
  );
}
