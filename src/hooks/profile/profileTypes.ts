
import { UserAnswers } from "@/services/question";

export interface ExperienceItem {
  id?: string;
  title: string;
  description: string;
  startYear?: number;
  endYear?: number | null; // null means "Present"
}

export interface EducationItem {
  id?: string;
  title: string;
  description: string;
  startYear?: number;
  endYear?: number | null; // null means "Present"
}

export interface LanguageItem {
  id?: string;
  name: string;
  level: number; // 1-5 scale (1=Beginner, 2=Elementary, 3=Intermediate, 4=Advanced, 5=Native)
}

// Define interface for profile data
export interface UserProfile {
  user_id?: string;
  name?: string;
  email?: string;
  title?: string;
  about_text?: string;
  phone_number?: string;
  cover_color?: string;
  highlight_color?: string;
  profile_image?: string;
  skills?: string[];
  languages?: LanguageItem[];
  experiences?: ExperienceItem[];
  education?: EducationItem[];
  professional_goal?: string;
  biggest_challenge?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileDataReturn {
  // User data
  user: any;
  userName: string;
  setUserName: (name: string) => void;
  userAnswers: UserAnswers | null;
  role: string;
  goal: string;
  blocker: string;
  isLoading: boolean;
  
  // Profile fields
  phoneNumber: string;
  aboutText: string;
  coverColor: string;
  highlightColor: string;
  profileImage: string;
  userSkills: string[];
  userLanguages: LanguageItem[];
  experiences: ExperienceItem[];
  educationItems: EducationItem[];
  userEmail: string;
  userTitle: string;
  professionalGoal: string;
  biggestChallenge: string;
  location: string;

  // Update functions
  updateUserName: (name: string) => Promise<void>;
  updatePhoneNumber: (phone: string) => Promise<void>;
  updateAboutText: (text: string) => Promise<void>;
  updateCoverColor: (color: string) => Promise<void>;
  updateHighlightColor: (color: string) => Promise<void>;
  updateUserAnswer: (field: string, value: string) => Promise<void>;
  updateUserEmail: (email: string) => Promise<void>;
  updateUserTitle: (title: string) => Promise<void>;
  updateProfessionalGoal: (goal: string) => Promise<void>;
  updateBiggestChallenge: (challenge: string) => Promise<void>;
  updateLocation: (location: string) => Promise<void>;
  
  // Skills functions
  addSkill: (skill: string) => Promise<void>;
  removeSkill: (skillToRemove: string) => Promise<void>;
  
  // Language functions
  addLanguage: (language: LanguageItem) => Promise<void>;
  editLanguage: (id: string, updatedLanguage: LanguageItem) => Promise<void>;
  removeLanguage: (id: string) => Promise<void>;
  
  // Experience functions
  addExperience: (experience: ExperienceItem) => Promise<void>;
  editExperience: (id: string, updatedExperience: ExperienceItem) => Promise<void>;
  removeExperience: (id: string) => Promise<void>;
  
  // Education functions
  addEducation: (education: EducationItem) => Promise<void>;
  editEducation: (id: string, updatedEducation: EducationItem) => Promise<void>;
  removeEducation: (id: string) => Promise<void>;
  
  // Image upload
  uploadProfileImage: (file: File) => Promise<string>;
}
