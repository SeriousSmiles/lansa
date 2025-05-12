
import { Card } from "@/components/ui/card";
import { ProfileAvatar } from "./sidebar/ProfileAvatar";
import { EditableUserName } from "./sidebar/EditableUserName";
import { ContactInfo } from "./sidebar/ContactInfo";
import { SkillsList } from "./sidebar/SkillsList";
import { ProfessionalGoal } from "./sidebar/ProfessionalGoal";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  // Handlers with toast notifications
  const handleUpdateUserName = async (name: string) => {
    if (onUpdateUserName) {
      try {
        await onUpdateUserName(name);
        toast({
          title: "Changes saved",
          description: "Your name has been updated.",
        });
        return Promise.resolve();
      } catch (error) {
        toast({
          title: "Error saving changes",
          description: "Please try again later.",
          variant: "destructive",
        });
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  };

  const handleUpdatePhoneNumber = async (phone: string) => {
    if (onUpdatePhoneNumber) {
      try {
        await onUpdatePhoneNumber(phone);
        toast({
          title: "Changes saved",
          description: "Your phone number has been updated.",
        });
        return Promise.resolve();
      } catch (error) {
        toast({
          title: "Error saving changes",
          description: "Please try again later.",
          variant: "destructive",
        });
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  };

  const handleUpdateGoal = async (field: string, value: string) => {
    if (onUpdate) {
      try {
        await onUpdate(field, value);
        toast({
          title: "Changes saved",
          description: "Your professional goal has been updated.",
        });
        return Promise.resolve();
      } catch (error) {
        toast({
          title: "Error saving changes",
          description: "Please try again later.",
          variant: "destructive",
        });
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  };

  const handleAddSkill = async (skill: string) => {
    if (onAddSkill) {
      try {
        await onAddSkill(skill);
        toast({
          title: "Skill added",
          description: "Your new skill has been added to your profile.",
        });
        return Promise.resolve();
      } catch (error) {
        toast({
          title: "Error adding skill",
          description: "Please try again later.",
          variant: "destructive",
        });
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  };

  const handleRemoveSkill = async (skill: string) => {
    if (onRemoveSkill) {
      try {
        await onRemoveSkill(skill);
        toast({
          title: "Skill removed",
          description: "The skill has been removed from your profile.",
        });
        return Promise.resolve();
      } catch (error) {
        toast({
          title: "Error removing skill",
          description: "Please try again later.",
          variant: "destructive",
        });
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  };

  const handleUploadProfileImage = async (file: File) => {
    if (onUploadProfileImage) {
      try {
        const result = await onUploadProfileImage(file);
        toast({
          title: "Image uploaded",
          description: "Your profile image has been updated.",
        });
        return result;
      } catch (error) {
        toast({
          title: "Error uploading image",
          description: "Please try again later.",
          variant: "destructive",
        });
        return Promise.reject(error);
      }
    }
    return Promise.reject(new Error("Upload function not provided"));
  };

  return (
    <div className="lg:col-span-4 space-y-8">
      <Card className="overflow-hidden">
        <div 
          className="h-24" 
          style={{ backgroundColor: coverColor || "#FF6B4A" }}
        ></div>
        <div className="p-6 pt-0 -mt-12 flex flex-col items-center">
          <ProfileAvatar
            userName={userName}
            profileImage={profileImage}
            onUploadProfileImage={handleUploadProfileImage}
          />
          
          <EditableUserName
            userName={userName}
            onUpdateUserName={handleUpdateUserName}
          />
          
          <p className="font-medium text-center" style={{ color: highlightColor }}>{role}</p>
          
          <ContactInfo
            email={email}
            phoneNumber={phoneNumber}
            onUpdatePhoneNumber={handleUpdatePhoneNumber}
            highlightColor={highlightColor}
          />
        </div>
      </Card>

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
