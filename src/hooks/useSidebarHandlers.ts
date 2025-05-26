
interface SidebarHandlerProps {
  onUpdateUserName?: (name: string) => Promise<void>;
  onUpdatePhoneNumber?: (phone: string) => Promise<void>;
  onUpdate?: (field: string, value: string) => Promise<void>;
  onAddSkill?: (skill: string) => Promise<void>;
  onRemoveSkill?: (skill: string) => Promise<void>;
  onUploadProfileImage?: (file: File) => Promise<string>;
}

/**
 * Custom hook for managing sidebar event handlers with error-only notifications
 */
export const useSidebarHandlers = ({
  onUpdateUserName,
  onUpdatePhoneNumber,
  onUpdate,
  onAddSkill,
  onRemoveSkill,
  onUploadProfileImage
}: SidebarHandlerProps) => {

  const handleUpdateUserName = async (name: string) => {
    if (onUpdateUserName) {
      try {
        await onUpdateUserName(name);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  };

  const handleUpdatePhoneNumber = async (phone: string) => {
    if (onUpdatePhoneNumber) {
      try {
        await onUpdatePhoneNumber(phone);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  };

  const handleUpdateGoal = async (field: string, value: string) => {
    if (onUpdate) {
      try {
        await onUpdate(field, value);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  };

  const handleAddSkill = async (skill: string) => {
    if (onAddSkill) {
      try {
        await onAddSkill(skill);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  };

  const handleRemoveSkill = async (skill: string) => {
    if (onRemoveSkill) {
      try {
        await onRemoveSkill(skill);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  };

  const handleUploadProfileImage = async (file: File) => {
    if (onUploadProfileImage) {
      try {
        const result = await onUploadProfileImage(file);
        return result;
      } catch (error) {
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
