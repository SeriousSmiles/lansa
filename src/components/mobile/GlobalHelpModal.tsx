import { ProfileStepModal } from "@/components/profile/guide/ProfileStepModal";
import { useMobileNavigation } from "@/contexts/MobileNavigationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileData } from "@/hooks/useProfileData";

export function GlobalHelpModal() {
  const { isHelpModalOpen, setIsHelpModalOpen } = useMobileNavigation();
  const { user } = useAuth();
  const profile = useProfileData(user?.id);

  if (!user || !profile) return null;

  return (
    <ProfileStepModal
      open={isHelpModalOpen}
      onOpenChange={setIsHelpModalOpen}
      profile={profile}
      userId={user.id}
    />
  );
}