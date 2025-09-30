
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useProfileData } from "@/hooks/useProfileData";
import { ProfileLayout } from "./layout/ProfileLayout";
import { ProfileContent } from "./layout/ProfileContent";
import { ProfileFooter } from "./layout/ProfileFooter";
import { useElementAnimation } from "@/utils/animationHelpers";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useProfileProgress } from "@/hooks/useProfileProgress";
import { PostOnboardingChoice } from "../onboarding/PostOnboardingChoice";

export function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const profile = useProfileData(user?.id);
  const mainContentRef = useElementAnimation();
  const [choiceModalOpen, setChoiceModalOpen] = useState(false);

  // Handle starter data from ProfileStarter page
  useEffect(() => {
    if (location.state?.fromStarter && location.state?.starterData) {
      const { headline, summary } = location.state.starterData;
      
      // Pre-fill profile with starter data, but handle errors gracefully
      const updateProfile = async () => {
        try {
          if (headline && profile.updateUserTitle) {
            await profile.updateUserTitle(headline);
          }
          if (summary && profile.updateAboutText) {
            await profile.updateAboutText(summary);
          }
          
          // Show welcome message only if updates succeed
          toast.success("Profile started! You can now customize everything to make it uniquely yours.", {
            duration: 4000
          });
        } catch (error) {
          console.error("Error updating profile with starter data:", error);
          // Show success message anyway since the data is there
          toast.success("Profile starter loaded! You can now customize everything.", {
            duration: 4000
          });
        }
      };
      
      updateProfile();
      
      // Clear the navigation state to prevent re-applying on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Auto-open choice modal when key fields are missing (and choice not made yet)
  useEffect(() => {
    if (!profile.isLoading && user?.id) {
      const missingCore = !profile.userTitle || !profile.aboutText || (profile.userSkills?.length || 0) === 0;
      const choiceMade = localStorage.getItem(`profileChoiceMade_${user.id}`) === 'true';
      if (missingCore && !choiceMade) {
        setChoiceModalOpen(true);
      }
    }
  }, [profile.isLoading, profile.userTitle, profile.aboutText, profile.userSkills, user?.id]);

  const handleChooseAIGuide = () => {
    if (user?.id) {
      localStorage.setItem(`profileChoiceMade_${user.id}`, 'true');
    }
    setChoiceModalOpen(false);
  };

  const handleChooseManual = () => {
    if (user?.id) {
      localStorage.setItem(`profileChoiceMade_${user.id}`, 'true');
    }
    setChoiceModalOpen(false);
  };

  const handleChooseCVUpload = () => {
    if (user?.id) {
      localStorage.setItem(`profileChoiceMade_${user.id}`, 'true');
    }
    setChoiceModalOpen(false);
    // CV upload completed, profile should already be populated
    // No additional action needed as CVUploadModal handles profile updates
  };

  // Debug logging
  console.log("Profile debug:", { 
    isLoading: profile.isLoading, 
    userId: user?.id,
    userName: profile.userName,
    user: profile.user
  });
  
  if (profile.isLoading) {
    return (
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
        <div className="text-2xl text-[#2E2E2E] animate-pulse">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
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
        onOpenGuidedSetup={() => {}}
        userProfile={profile}
      >
        <ProfileContent 
          profile={profile}
          textColor={profile.coverColor}
          navigate={navigate}
        />
      </ProfileLayout>
      
        <PostOnboardingChoice
          open={choiceModalOpen}
          onOpenChange={setChoiceModalOpen}
          onChooseAIGuide={handleChooseAIGuide}
          onChooseManual={handleChooseManual}
          onChooseCVUpload={handleChooseCVUpload}
        />

      
      <ProfileFooter coverColor={profile.coverColor} />
    </div>
  );
}
