import { ExperienceItem, EducationItem, LanguageItem } from "@/hooks/profile/profileTypes";

export interface PDFResumeData {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    summary: string; // aboutText
    professionalGoal: string;
    biggestChallenge?: string;
    profileImage?: string;
  };
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  languages?: LanguageItem[];
  projects?: Array<{
    title: string;
    description: string;
    url?: string;
  }>;
  certifications?: Array<{
    title: string;
    issuer: string;
    date?: string;
  }>;
  awards?: Array<{
    title: string;
    issuer: string;
    date?: string;
  }>;
  volunteer?: Array<{
    title: string;
    organization: string;
    description?: string;
    startYear?: string;
    endYear?: string;
  }>;
  colors: {
    primary: string; // highlightColor
    secondary: string; // coverColor
  };
}

export type ResumeTemplate =
  | 'modern'
  | 'classic'
  | 'creative'
  | 'professional'
  | 'minimal'
  | 'timeline'
  | 'academic'
  | 'logos';

export interface PDFGenerationOptions {
  template: ResumeTemplate;
  includePhoto: boolean;
  atsSafe: boolean;
  locale?: 'en' | 'nl' | 'pap';
  sections: {
    summary: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
    projects?: boolean;
    certifications?: boolean;
    awards?: boolean;
    volunteer?: boolean;
    languages?: boolean;
  };
}