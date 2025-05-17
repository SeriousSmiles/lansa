
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useProfileData } from "@/hooks/useProfileData";
import { ProfileLayout } from "./layout/ProfileLayout";
import { ProfileContent } from "./layout/ProfileContent";
import { ProfileFooter } from "./layout/ProfileFooter";
import { useElementAnimation } from "@/utils/animationHelpers";

export function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const profile = useProfileData(user?.id);
  const mainContentRef = useElementAnimation();
  
  if (profile.isLoading) {
    return (
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
        <div className="text-2xl text-[#2E2E2E] animate-pulse">Loading your profile...</div>
      </div>
    );
  }

  return (
    <ProfileLayout
      userName={profile.userName}
      role={profile.role}
      user={profile.user}
      userId={user?.id}
      coverColor={profile.coverColor}
      highlightColor={profile.highlightColor}
      onCoverColorChange={profile.updateCoverColor}
      onHighlightColorChange={profile.updateHighlightColor}
      mainContentRef={mainContentRef}
    >
      <ProfileContent 
        profile={profile}
        textColor={profile.coverColor}
        navigate={navigate}
      />
      
      <ProfileFooter coverColor={profile.coverColor} />
    </ProfileLayout>
  );
}
