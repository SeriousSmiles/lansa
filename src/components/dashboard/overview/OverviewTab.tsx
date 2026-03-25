
// import { RecommendedActions } from "./RecommendedActions";
import { GrowthCardSection } from "./GrowthCardSection";
import { StudentAnalyticsCard } from "./StudentAnalyticsCard";
// import { HireRateProgress } from "../HireRateProgress";
import { CertificationCard } from "./CertificationCard";
import { WhoIsInterestedSection } from "@/components/dashboard/WhoIsInterestedSection";
import { ListingActivationCard } from "./ListingActivationCard";
import { AICareerPlanCard } from "./AICareerPlanCard";
import { useAuth } from "@/contexts/AuthContext";

interface OverviewTabProps {
  userName: string;
  role: string;
  goal: string;
  insight: string;
  highlightActions: boolean;
  isLoading: boolean;
  openAIPlan?: boolean;
}

export function OverviewTab({ userName, role, goal, insight, highlightActions, isLoading, openAIPlan }: OverviewTabProps) {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Listing Activation — only renders for certified seekers */}
      <ListingActivationCard />

      {/* AI Career Plan card — shown to all job seekers */}
      <AICareerPlanCard autoOpen={openAIPlan} />

      {/* Analytics and Certification + Who's Interested — masonry grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-full">
          <StudentAnalyticsCard />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-4">
          <CertificationCard />
          <WhoIsInterestedSection />
        </div>
      </div>
      
      
      {/* Hidden incomplete features */}
      {/* <HireRateProgress /> */}
      {/* <RecommendedActions role={role} highlightActions={highlightActions} /> */}
    </div>
  );
}

