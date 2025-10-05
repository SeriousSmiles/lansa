
import { useRef } from "react";
import { ProfileLayout } from "@/components/profile/layout/ProfileLayout";
import { SharedProfileContent } from "@/components/profile/shared/SharedProfileContent";
import { SharedProfileSidebar } from "@/components/profile/shared/SharedProfileSidebar";
import { ProfileFooter } from "@/components/profile/layout/ProfileFooter";
import { useElementAnimation } from "@/utils/animationHelpers";
import { SharedProfileData } from "@/hooks/useSharedProfileData";
import { MadeOnLansaBadge } from "@/components/profile/shared/MadeOnLansaBadge";

interface SharedProfileContainerProps {
  profileData: SharedProfileData;
  urlParam: string | undefined;
}

export function SharedProfileContainer({ profileData, urlParam }: SharedProfileContainerProps) {
  const mainContentRef = useElementAnimation();

  return (
    <div className="min-h-screen flex flex-col">
      <ProfileLayout 
        userName={profileData.userName} 
        role={profileData.role}
        user={{ id: urlParam }}
        coverColor={profileData.coverColor}
        highlightColor={profileData.highlightColor}
        onCoverColorChange={async () => {}}
        mainContentRef={mainContentRef}
        readOnly={true}
        hideBackButton={true}
      >
        <SharedProfileSidebar 
          userName={profileData.userName}
          role={profileData.role}
          goal={profileData.goal}
          blocker={profileData.blocker}
          userSkills={profileData.userSkills}
          profileImage={profileData.profileImage}
          phoneNumber={profileData.phoneNumber}
          userEmail={profileData.userEmail}
          userTitle={profileData.userTitle}
          coverColor={profileData.coverColor}
          highlightColor={profileData.highlightColor}
          professionalGoal={profileData.professionalGoal}
          biggestChallenge={profileData.biggestChallenge}
        />
        
        <SharedProfileContent 
          aboutText={profileData.aboutText}
          experiences={profileData.experiences}
          educationItems={profileData.educationItems}
          highlightColor={profileData.highlightColor}
        />
      </ProfileLayout>
      
      <ProfileFooter coverColor={profileData.coverColor} />
      
      <MadeOnLansaBadge />
    </div>
  );
}
