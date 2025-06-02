import { Card } from "@/components/ui/card";
import { ProfileCard } from "./ProfileCard";
import { RecommendedActions } from "./RecommendedActions";
import { GrowthCardSection } from "./GrowthCardSection";
import { useAuth } from "@/contexts/AuthContext";

export function OverviewTab() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Growth Card System - Featured prominently at the top */}
      <GrowthCardSection userId={user?.id} />
      
      {/* Existing Overview Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileCard />
        <RecommendedActions />
      </div>
    </div>
  );
}
