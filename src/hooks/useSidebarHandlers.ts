
import { useToast } from "@/hooks/use-toast";

interface SidebarHandlerProps {
  onUpdateUserName?: (name: string) => Promise<void>;
  onUpdatePhoneNumber?: (phone: string) => Promise<void>;
  onUpdate?: (field: string, value: string) => Promise<void>;
  onAddSkill?: (skill: string) => Promise<void>;
  onRemoveSkill?: (skill: string) => Promise<void>;
  onUploadProfileImage?: (file: File) => Promise<string>;
}

/**
 * Custom hook for managing sidebar event handlers with toast notifications
 */
export const useSidebarHandlers = ({
  onUpdateUserName,
  onUpdatePhoneNumber,
  onUpdate,
  onAddSkill,
  onRemoveSkill,
  onUploadProfileImage
}: SidebarHandlerProps) => {
  const { toast } = useToast();

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

  return {
    handleUpdateUserName,
    handleUpdatePhoneNumber,
    handleUpdateGoal,
    handleAddSkill,
    handleRemoveSkill,
    handleUploadProfileImage
  };
};
