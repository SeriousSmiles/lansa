
import { useSidebarHandlers } from "@/hooks/useSidebarHandlers";
import { SidebarPersonalInfo } from "./sidebar/SidebarPersonalInfo";
import { SkillsList } from "./sidebar/SkillsList";
import { ProfessionalGoal } from "./sidebar/ProfessionalGoal";

interface ProfileSidebarProps {
  userName: string;
  role: string;
  email: string;
  title?: string;
  skills: string[];
  goal: string;
  phoneNumber?: string;
  coverColor?: string;
  highlightColor?: string;
  profileImage?: string;
  professionalGoal?: string;
  biggestChallenge?: string;
  onUpdate?: (field: string, value: string) => Promise<void>;
  onUpdateUserName?: (name: string) => Promise<void>;
  onUpdateTitle?: (title: string) => Promise<void>;
  onUpdatePhoneNumber?: (phone: string) => Promise<void>;
  onUpdateProfessionalGoal?: (goal: string) => Promise<void>;
  onUpdateBiggestChallenge?: (challenge: string) => Promise<void>;
  onAddSkill?: (skill: string) => Promise<void>;
  onRemoveSkill?: (skill: string) => Promise<void>;
  onUploadProfileImage?: (file: File) => Promise<string>;
}

export function ProfileSidebar({ 
  userName, 
  role, 
  email, 
  title = "",
  skills, 
  goal,
  phoneNumber,
  coverColor,
  highlightColor = "#FF6B4A",
  profileImage,
  professionalGoal = "",
  biggestChallenge = "",
  onUpdate,
  onUpdateUserName,
  onUpdateTitle,
  onUpdatePhoneNumber,
  onUpdateProfessionalGoal,
  onUpdateBiggestChallenge,
  onAddSkill,
  onRemoveSkill,
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
        onUpdateUserName={handleUpdateUserName}
        onUpdateTitle={handleUpdateTitle}
        onUpdatePhoneNumber={handleUpdatePhoneNumber}
        onUploadProfileImage={handleUploadProfileImage}
      />

      {/* Skills */}
      <SkillsList
        skills={skills}
        onAddSkill={handleAddSkill}
        onRemoveSkill={handleRemoveSkill}
        highlightColor={highlightColor}
      />
      
      {/* Professional Goal */}
      <ProfessionalGoal
        goal={professionalGoal}
        onUpdate={onUpdateProfessionalGoal}
        highlightColor={highlightColor}
      />
    </div>
  );
}
