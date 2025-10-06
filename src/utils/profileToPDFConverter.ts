import { PDFResumeData } from '@/types/pdf';
import { ProfileDataReturn } from '@/hooks/profile/profileTypes';

export const convertProfileToPDFData = (profileData: ProfileDataReturn): PDFResumeData => {
  return {
    personalInfo: {
      name: profileData.userName || 'Your Name',
      title: profileData.userTitle || '',
      email: profileData.userEmail || '',
      phone: profileData.phoneNumber || '',
      summary: profileData.aboutText || '',
      professionalGoal: profileData.professionalGoal || '',
      biggestChallenge: profileData.biggestChallenge || '',
      profileImage: profileData.profileImage || undefined,
    },
    experience: profileData.experiences || [],
    education: profileData.educationItems || [],
    skills: profileData.userSkills || [],
    languages: profileData.userLanguages || [],
    projects: [],
    certifications: (profileData.userCertifications || []).map(cert => ({
      title: cert.title,
      issuer: cert.issuer,
      date: cert.issue_date,
      credentialId: cert.credential_id || undefined,
      credentialUrl: cert.credential_url || undefined
    })),
    awards: [],
    volunteer: [],
    colors: {
      primary: profileData.highlightColor || '#FF6B4A',
      secondary: profileData.coverColor || '#F3F4F6',
    },
  };
};

export const validatePDFData = (data: PDFResumeData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.personalInfo.name || data.personalInfo.name.trim() === '') {
    errors.push('Name is required');
  }

  if (!data.personalInfo.email && !data.personalInfo.phone) {
    errors.push('At least one contact method (email or phone) is required');
  }

  if (!data.experience.length && !data.education.length && !data.skills.length) {
    errors.push('At least one section (experience, education, or skills) must have content');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};