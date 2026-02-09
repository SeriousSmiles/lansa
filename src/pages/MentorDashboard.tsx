import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MentorVideoList } from "@/components/mentor/MentorVideoList";
import { MentorProfileForm } from "@/components/mentor/MentorProfileForm";
import { MentorSubscriptionPanel } from "@/components/mentor/MentorSubscriptionPanel";
import { useMentorProfile } from "@/hooks/useMentorProfile";
import { useMentorSubscription } from "@/hooks/useMentorSubscription";
import { TierBadge } from "@/components/mentor/TierBadge";
import { Video, User, CreditCard } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function MentorDashboard() {
  const { user } = useAuth();
  const { data: profile } = useMentorProfile();
  const { data: subscription } = useMentorSubscription();
  const isMobile = useIsMobile();

  const userName = profile?.display_name || user?.email?.split("@")[0] || "Mentor";
  const tier = subscription?.tier || "free";

  return (
    <DashboardLayout userName={userName} email={user?.email || ""}>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold">Mentor Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {userName}
            </p>
          </div>
          <TierBadge tier={tier} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="videos">
          <TabsList className={isMobile ? "w-full grid grid-cols-3" : ""}>
            <TabsTrigger value="videos" className="gap-1.5">
              <Video className="h-3.5 w-3.5" />
              {!isMobile && "My Videos"}
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-1.5">
              <User className="h-3.5 w-3.5" />
              {!isMobile && "Profile"}
            </TabsTrigger>
            <TabsTrigger value="subscription" className="gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              {!isMobile && "Plan"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-4">
            <MentorVideoList />
          </TabsContent>
          <TabsContent value="profile" className="mt-4">
            <MentorProfileForm />
          </TabsContent>
          <TabsContent value="subscription" className="mt-4">
            <MentorSubscriptionPanel />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
