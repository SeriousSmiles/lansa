
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProfileLayout } from "@/components/profile/layout/ProfileLayout";
import { ProfileContent } from "@/components/profile/layout/ProfileContent";
import { ProfileFooter } from "@/components/profile/layout/ProfileFooter";
import { useElementAnimation } from "@/utils/animationHelpers";
import { ExperienceItem, EducationItem } from "@/hooks/profile/profileTypes";
import { SharedProfileData } from "@/hooks/useSharedProfileData";

interface SharedProfileContainerProps {
  profileData: SharedProfileData;
  urlParam: string | undefined;
}

export function SharedProfileContainer({ profileData, urlParam }: SharedProfileContainerProps) {
  const navigate = useNavigate();
  const mainContentRef = useElementAnimation();

  // Create no-op functions that correctly match the expected parameter types
  const noopString = async (_: string) => {
    return Promise.resolve();
  };
  
  const noopExperience = async (_: ExperienceItem) => {
    return Promise.resolve();
  };
  
  // Fixed function signature for editExperience
  const noopEditExperience = async (_id: string, _experience: ExperienceItem) => {
    return Promise.resolve();
  };
  
  const noopEducation = async (_: EducationItem) => {
    return Promise.resolve();
  };
  
  // Fixed function signature for editEducation
  const noopEditEducation = async (_id: string, _education: EducationItem) => {
    return Promise.resolve();
  };
  
  const noopFile = async (_: File): Promise<string> => {
    return Promise.resolve("");
  };

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
        onCoverColorChange={noopString}
        onHighlightColorChange={noopString}
        mainContentRef={mainContentRef}
        readOnly={true}
      >
        <ProfileContent 
          profile={{
            // Include all required properties from ProfileDataReturn type
            isLoading: false,
            user: { id: urlParam },
            userName: profileData.userName,
            setUserName: () => {},
            userAnswers: null,
            role: profileData.role,
            goal: profileData.goal,
            blocker: profileData.blocker,
            phoneNumber: "",
            aboutText: profileData.aboutText,
            coverColor: profileData.coverColor,
            highlightColor: profileData.highlightColor,
            profileImage: profileData.profileImage,
            userSkills: profileData.userSkills,
            experiences: profileData.experiences,
            educationItems: profileData.educationItems,
            
            // No-op functions for all update methods
            updateUserName: noopString,
            updatePhoneNumber: noopString,
            updateAboutText: noopString,
            updateCoverColor: noopString,
            updateHighlightColor: noopString,
            updateUserAnswer: noopString,
            addSkill: noopString,
            removeSkill: noopString,
            addExperience: noopExperience,
            editExperience: noopEditExperience,
            removeExperience: noopString,
            addEducation: noopEducation,
            editEducation: noopEditEducation,
            removeEducation: noopString,
            uploadProfileImage: noopFile
          }}
          textColor={profileData.coverColor}
          navigate={navigate}
        />
        
        <ProfileFooter coverColor={profileData.coverColor} />
      </ProfileLayout>
    </div>
  );
}
