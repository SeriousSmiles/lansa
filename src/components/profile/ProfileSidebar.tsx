
import { useSidebarHandlers } from "@/hooks/useSidebarHandlers";
import { SidebarPersonalInfo } from "./sidebar/SidebarPersonalInfo";
import { SkillsList } from "./sidebar/SkillsList";
import { LanguagesList } from "./sidebar/LanguagesList";
import { CertificationsList } from "./sidebar/CertificationsList";
import { ProfessionalGoalWithAI } from "./sidebar/ProfessionalGoalWithAI";
import { LanguageItem, CertificationItem } from "@/hooks/profile/profileTypes";

interface ProfileSidebarProps {
  userName: string;
  role: string;
  email: string;
  title?: string;
  skills: string[];
  languages?: LanguageItem[];
  certifications?: CertificationItem[];
  goal: string;
  phoneNumber?: string;
  coverColor?: string;
  highlightColor?: string;
  profileImage?: string;
  professionalGoal?: string;
  biggestChallenge?: string;
  location?: string;
  userId?: string;
  onUpdate?: (field: string, value: string) => Promise<void>;
  onUpdateUserName?: (name: string) => Promise<void>;
  onUpdateTitle?: (title: string) => Promise<void>;
  onUpdatePhoneNumber?: (phone: string) => Promise<void>;
  onUpdateLocation?: (location: string) => Promise<void>;
  onUpdateProfessionalGoal?: (goal: string) => Promise<void>;
  onUpdateBiggestChallenge?: (challenge: string) => Promise<void>;
  onAddSkill?: (skill: string) => Promise<void>;
  onRemoveSkill?: (skill: string) => Promise<void>;
  onAddLanguage?: (language: LanguageItem) => Promise<void>;
  onEditLanguage?: (id: string, language: LanguageItem) => Promise<void>;
  onRemoveLanguage?: (id: string) => Promise<void>;
  onAddCertification?: (cert: CertificationItem) => Promise<void>;
  onEditCertification?: (id: string, cert: CertificationItem) => Promise<void>;
  onRemoveCertification?: (id: string) => Promise<void>;
  onUploadProfileImage?: (file: File) => Promise<string>;
}

export function ProfileSidebar({ 
  userName, 
  role, 
  email, 
  title = "",
  skills, 
  languages = [],
  certifications = [],
  goal,
  phoneNumber,
  coverColor,
  highlightColor = "#FF6B4A",
  profileImage,
  professionalGoal = "",
  biggestChallenge = "",
  location,
  userId,
  onUpdate,
  onUpdateUserName,
  onUpdateTitle,
  onUpdatePhoneNumber,
  onUpdateLocation,
  onUpdateProfessionalGoal,
  onUpdateBiggestChallenge,
  onAddSkill,
  onRemoveSkill,
  onAddLanguage,
  onEditLanguage,
  onRemoveLanguage,
  onAddCertification,
  onEditCertification,
  onRemoveCertification,
  onUploadProfileImage,
}: ProfileSidebarProps) {
  // Use our custom hook to handle all events
  const {
    handleUpdateUserName,
    handleUpdatePhoneNumber,
    handleUpdateGoal,
    handleAddSkill,
    handleRemoveSkill,
    handleUploadProfileImage
  } = useSidebarHandlers({
    onUpdateUserName,
    onUpdatePhoneNumber,
    onUpdate,
    onAddSkill,
    onRemoveSkill,
    onUploadProfileImage
  });

  const handleUpdateTitle = async (newTitle: string) => {
    if (onUpdateTitle) {
      await onUpdateTitle(newTitle);
    }
  };

  return (
    <div className="lg:col-span-4 space-y-8">
      {/* Personal info card */}
      <SidebarPersonalInfo
        userName={userName}
        role={role}
        email={email}
        title={title}
        phoneNumber={phoneNumber}
        profileImage={profileImage}
        highlightColor={highlightColor}
        location={location}
        onUpdateUserName={handleUpdateUserName}
        onUpdateTitle={handleUpdateTitle}
        onUpdatePhoneNumber={handleUpdatePhoneNumber}
        onUpdateLocation={onUpdateLocation}
        onUploadProfileImage={handleUploadProfileImage}
      />

      {/* Skills */}
      <SkillsList
        skills={skills}
        onAddSkill={handleAddSkill}
        onRemoveSkill={handleRemoveSkill}
        highlightColor={highlightColor}
        userId={userId}
      />
      
      {/* Languages */}
      <LanguagesList
        languages={languages}
        onAddLanguage={onAddLanguage}
        onEditLanguage={onEditLanguage}
        onRemoveLanguage={onRemoveLanguage}
        highlightColor={highlightColor}
      />
      
      {/* Certifications */}
      <CertificationsList
        certifications={certifications}
        onAddCertification={onAddCertification}
        onEditCertification={onEditCertification}
        onRemoveCertification={onRemoveCertification}
        highlightColor={highlightColor}
      />
      
      {/* Professional Goal */}
      <ProfessionalGoalWithAI
        goal={professionalGoal}
        onUpdate={onUpdateProfessionalGoal}
        highlightColor={highlightColor}
        userId={userId}
      />
    </div>
  );
}
