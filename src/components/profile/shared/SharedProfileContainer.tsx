
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProfileLayout } from "@/components/profile/layout/ProfileLayout";
import { SharedProfileContent } from "@/components/profile/shared/SharedProfileContent";
import { SharedProfileSidebar } from "@/components/profile/shared/SharedProfileSidebar";
import { ProfileFooter } from "@/components/profile/layout/ProfileFooter";
import { useElementAnimation } from "@/utils/animationHelpers";
import { SharedProfileData } from "@/hooks/useSharedProfileData";

interface SharedProfileContainerProps {
  profileData: SharedProfileData;
  urlParam: string | undefined;
}

export function SharedProfileContainer({ profileData, urlParam }: SharedProfileContainerProps) {
  const navigate = useNavigate();
  const mainContentRef = useElementAnimation();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-4">
        <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2">
          <ArrowLeft size={16} />
          <span>Back</span>
        </Button>
      </div>
      
      <ProfileLayout 
        userName={profileData.userName} 
        role={profileData.role}
        user={{ id: urlParam }}
        coverColor={profileData.coverColor}
        highlightColor={profileData.highlightColor}
        onCoverColorChange={async () => {}}
        mainContentRef={mainContentRef}
        readOnly={true}
      >
        <SharedProfileSidebar 
          userName={profileData.userName}
          role={profileData.role}
          goal={profileData.goal}
          blocker={profileData.blocker}
          userSkills={profileData.userSkills}
          profileImage={profileData.profileImage}
          phoneNumber={profileData.phoneNumber}
          coverColor={profileData.coverColor}
          highlightColor={profileData.highlightColor}
        />
        
        <SharedProfileContent 
          aboutText={profileData.aboutText}
          experiences={profileData.experiences}
          educationItems={profileData.educationItems}
          highlightColor={profileData.highlightColor}
        />
        
        <ProfileFooter coverColor={profileData.coverColor} />
      </ProfileLayout>
    </div>
  );
}
