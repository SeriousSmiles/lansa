
import { useProfileText } from "./useProfileText";
import { useProfileColors } from "./useProfileColors";
import { useProfileDataCore } from "./useProfileData.core";

export function useProfileBasics(userId: string | undefined) {
  // Use the core hooks for profile data operations
  const { updateProfileData, updateUserAnswer } = useProfileDataCore({ userId });
  
  // Use specialized hooks for different aspects of the profile
  const profileText = useProfileText({ userId, updateProfileData });
  const profileColors = useProfileColors({ userId, updateProfileData });

  return {
    // Text data
    userName: profileText.userName,
    setUserName: profileText.setUserName,
    userEmail: profileText.userEmail,
    setUserEmail: profileText.setUserEmail,
    userTitle: profileText.userTitle,
    setUserTitle: profileText.setUserTitle,
    phoneNumber: profileText.phoneNumber,
    setPhoneNumber: profileText.setPhoneNumber,
    aboutText: profileText.aboutText, 
    setAboutText: profileText.setAboutText,
    location: profileText.location,
    setLocation: profileText.setLocation,
    
    // Color data
    coverColor: profileColors.coverColor,
    setCoverColor: profileColors.setCoverColor,
    highlightColor: profileColors.highlightColor,
    setHighlightColor: profileColors.setHighlightColor,
    
    // Update functions
    updateUserName: profileText.updateUserName,
    updateUserEmail: profileText.updateUserEmail,
    updateUserTitle: profileText.updateUserTitle,
    updatePhoneNumber: profileText.updatePhoneNumber,
    updateAboutText: profileText.updateAboutText,
    updateLocation: profileText.updateLocation,
    updateCoverColor: profileColors.updateCoverColor,
    updateHighlightColor: profileColors.updateHighlightColor,
    
    // Core data functions
    updateProfileData,
    updateUserAnswer
  };
}
