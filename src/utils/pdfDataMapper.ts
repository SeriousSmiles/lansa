import { PDFResumeData } from "@/types/pdf";
import { ProfileDataReturn } from "@/hooks/useProfileData";

export function mapProfileToPDFData(profileData: ProfileDataReturn): PDFResumeData {
  return {
    personalInfo: {
      name: profileData.userName || "Your Name",
      title: profileData.userTitle || "Your Title",
      email: profileData.userEmail || "",
      phone: profileData.phoneNumber || "",
      summary: profileData.aboutText || "",
      professionalGoal: profileData.professionalGoal || "",
      profileImage: profileData.profileImage || undefined,
    },
    experience: profileData.experiences || [],
    education: profileData.educationItems || [],
    skills: profileData.userSkills || [],
    languages: profileData.userLanguages || [],
    colors: {
      primary: profileData.highlightColor || "#FF6B4A",
      secondary: profileData.coverColor || "#FFFFFF",
    },
  };
}