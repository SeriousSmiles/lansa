
import { useSidebarHandlers } from "@/hooks/useSidebarHandlers";
import { SidebarPersonalInfo } from "./sidebar/SidebarPersonalInfo";
import { SkillsList } from "./sidebar/SkillsList";
import { ProfessionalGoal } from "./sidebar/ProfessionalGoal";

interface ProfileSidebarProps {
  userName: string;
  role: string;
  email: string;
  skills: string[];
  goal: string;
  phoneNumber?: string;
  coverColor?: string;
  highlightColor?: string;
  profileImage?: string;
  onUpdate?: (field: string, value: string) => Promise<void>;
  onUpdateUserName?: (name: string) => Promise<void>;
  onUpdatePhoneNumber?: (phone: string) => Promise<void>;
  onAddSkill?: (skill: string) => Promise<void>;
  onRemoveSkill?: (skill: string) => Promise<void>;
  onUploadProfileImage?: (file: File) => Promise<string>;
}

export function ProfileSidebar({ 
  userName, 
  role, 
  email, 
  skills, 
  goal,
  phoneNumber,
  coverColor,
  highlightColor = "#FF6B4A",
  profileImage,
  onUpdate,
  onUpdateUserName,
  onUpdatePhoneNumber,
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

  return (
    <div className="lg:col-span-4 space-y-8">
      {/* Personal info card */}
      <SidebarPersonalInfo
        userName={userName}
        role={role}
        email={email}
        phoneNumber={phoneNumber}
        profileImage={profileImage}
        highlightColor={highlightColor}
        onUpdateUserName={handleUpdateUserName}
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
      
      {/* Goals */}
      <ProfessionalGoal
        goal={goal}
        onUpdate={handleUpdateGoal}
        highlightColor={highlightColor}
      />
    </div>
  );
}
