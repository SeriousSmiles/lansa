import { PDFResumeData } from "@/types/pdf";
import { ProfileDataReturn } from "@/hooks/profile/profileTypes";

export function mapProfileToPDFData(profileData: ProfileDataReturn): PDFResumeData {
  return {
    personalInfo: {
      name: profileData.userName || "Your Name",
      title: profileData.userTitle || "Your Title",
      email: profileData.userEmail || "",
      phone: profileData.phoneNumber || "",
      summary: profileData.aboutText || "",
      professionalGoal: profileData.professionalGoal || "",
      biggestChallenge: profileData.biggestChallenge || "",
      profileImage: profileData.profileImage || undefined,
    },
    experience: profileData.experiences || [],
    education: profileData.educationItems || [],
    skills: profileData.userSkills || [],
    languages: profileData.userLanguages || [],
    projects: [], // Can be extended later if profile has projects
    certifications: [], // Can be extended later if profile has certifications
    awards: [], // Can be extended later if profile has awards
    volunteer: [], // Can be extended later if profile has volunteer work
    colors: {
      primary: profileData.highlightColor || "#FF6B4A",
      secondary: profileData.coverColor || "#F3F4F6",
    },
  };
}