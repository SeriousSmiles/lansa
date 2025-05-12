
import { UserAnswers } from "@/services/QuestionService";

export interface ExperienceItem {
  id?: string;
  title: string;
  description: string;
}

export interface EducationItem {
  id?: string;
  title: string;
  description: string;
}

// Define interface for profile data
export interface UserProfile {
  user_id?: string;
  name?: string;
  about_text?: string;
  phone_number?: string;
  cover_color?: string;
  highlight_color?: string;
  profile_image?: string;
  skills?: string[];
  experiences?: ExperienceItem[];
  education?: EducationItem[];
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
  experiences: ExperienceItem[];
  educationItems: EducationItem[];

  // Update functions
  updateUserName: (name: string) => Promise<void>;
  updatePhoneNumber: (phone: string) => Promise<void>;
  updateAboutText: (text: string) => Promise<void>;
  updateCoverColor: (color: string) => Promise<void>;
  updateHighlightColor: (color: string) => Promise<void>;
  updateUserAnswer: (field: string, value: string) => Promise<void>;
  
  // Skills functions
  addSkill: (skill: string) => Promise<void>;
  removeSkill: (skillToRemove: string) => Promise<void>;
  
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
