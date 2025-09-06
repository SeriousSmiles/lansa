import { ExperienceItem, EducationItem, LanguageItem } from "@/hooks/profile/profileTypes";

export interface PDFResumeData {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    summary: string; // aboutText
    professionalGoal: string;
    profileImage?: string;
  };
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  languages?: LanguageItem[];
  colors: {
    primary: string; // highlightColor
    secondary: string; // coverColor
  };
}

export type ResumeTemplate = 'modern' | 'classic' | 'creative';

export interface PDFGenerationOptions {
  template: ResumeTemplate;
  includePhoto: boolean;
  sections: {
    summary: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
  };
}