import { ProfileDataReturn } from '@/hooks/useProfileData';
import { SectionComponentType, SectionTemplate } from '@/types/resumeSection';
import { Textbox, Line, FabricObject } from 'fabric';

// Maps profile data to Fabric.js objects based on section template
export function mapProfileToSection(
  sectionType: SectionComponentType,
  profileData: ProfileDataReturn,
  sectionTemplate: SectionTemplate,
  yOffset: number = 0
): FabricObject[] {
  switch (sectionType) {
    case 'header':
      return createHeaderObjects(profileData, sectionTemplate, yOffset);
    case 'summary':
      return createSummaryObjects(profileData, sectionTemplate, yOffset);
    case 'experience':
      return createExperienceObjects(profileData, sectionTemplate, yOffset);
    case 'education':
      return createEducationObjects(profileData, sectionTemplate, yOffset);
    case 'skills':
      return createSkillsObjects(profileData, sectionTemplate, yOffset);
    case 'languages':
      return createLanguagesObjects(profileData, sectionTemplate, yOffset);
    case 'projects':
      return createProjectsObjects(profileData, sectionTemplate, yOffset);
    case 'certifications':
      return createCertificationsObjects(profileData, sectionTemplate, yOffset);
    case 'achievements':
      return createAchievementsObjects(profileData, sectionTemplate, yOffset);
    case 'custom':
      return createCustomObjects(sectionTemplate, yOffset);
    default:
      return [];
  }
}

function createHeaderObjects(
  profileData: ProfileDataReturn,
  template: SectionTemplate,
  yOffset: number
): FabricObject[] {
  const objects: FabricObject[] = [];
  
  // Name
  objects.push(new Textbox(profileData.userName || 'YOUR NAME', {
    left: 40,
    top: yOffset + 30,
    width: 500,
    fontSize: 32,
    fontWeight: 'bold',
    fill: '#000000',
    fontFamily: 'Inter'
  }));
  
  // Title
  objects.push(new Textbox(profileData.userTitle || 'The role you are applying for?', {
    left: 40,
    top: yOffset + 70,
    width: 500,
    fontSize: 16,
    fill: '#666666',
    fontFamily: 'Inter'
  }));
  
  // Contact info
  const contactParts: string[] = [];
  if (profileData.phoneNumber) contactParts.push(`📞 ${profileData.phoneNumber}`);
  if (profileData.userEmail) contactParts.push(`📧 ${profileData.userEmail}`);
  if (profileData.location) contactParts.push(`📍 ${profileData.location}`);
  
  objects.push(new Textbox(contactParts.join('  '), {
    left: 40,
    top: yOffset + 100,
    width: 500,
    fontSize: 12,
    fill: '#666666',
    fontFamily: 'Inter'
  }));
  
  return objects;
}

function createSummaryObjects(
  profileData: ProfileDataReturn,
  template: SectionTemplate,
  yOffset: number
): FabricObject[] {
  const objects: FabricObject[] = [];
  
  // Section title
  objects.push(new Textbox('PROFESSIONAL SUMMARY', {
    left: 40,
    top: yOffset,
    width: 500,
    fontSize: 14,
    fontWeight: 'bold',
    fill: '#000000',
    fontFamily: 'Inter'
  }));
  
  // Divider line
  objects.push(new Line([40, yOffset + 25, 540, yOffset + 25], {
    stroke: '#000000',
    strokeWidth: 1
  }));
  
  // Summary text
  const summaryText = profileData.aboutText || profileData.professionalGoal || 
    'Write a brief summary about your professional background and goals...';
  
  objects.push(new Textbox(summaryText, {
    left: 40,
    top: yOffset + 35,
    width: 500,
    fontSize: 11,
    fill: '#333333',
    fontFamily: 'Inter'
  }));
  
  return objects;
}

function createExperienceObjects(
  profileData: ProfileDataReturn,
  template: SectionTemplate,
  yOffset: number
): FabricObject[] {
  const objects: FabricObject[] = [];
  
  // Section title
  objects.push(new Textbox('PROFESSIONAL EXPERIENCE', {
    left: 40,
    top: yOffset,
    width: 500,
    fontSize: 14,
    fontWeight: 'bold',
    fill: '#000000',
    fontFamily: 'Inter'
  }));
  
  // Divider line
  objects.push(new Line([40, yOffset + 25, 540, yOffset + 25], {
    stroke: '#000000',
    strokeWidth: 1
  }));
  
  let currentY = yOffset + 35;
  const experiences = profileData.experiences || [];
  
  experiences.forEach((exp: any, index: number) => {
    // Job title
    objects.push(new Textbox(exp.title || 'Job Title', {
      left: 40,
      top: currentY,
      width: 350,
      fontSize: 13,
      fontWeight: 'bold',
      fill: '#000000',
      fontFamily: 'Inter'
    }));
    
    // Company
    objects.push(new Textbox(exp.company || 'Company Name', {
      left: 40,
      top: currentY + 20,
      width: 250,
      fontSize: 12,
      fill: '#666666',
      fontFamily: 'Inter'
    }));
    
    // Dates
    const dates = `${exp.start_date || 'Start'} - ${exp.end_date || 'Present'}`;
    objects.push(new Textbox(dates, {
      left: 300,
      top: currentY + 20,
      width: 240,
      fontSize: 11,
      fill: '#999999',
      fontFamily: 'Inter',
      textAlign: 'right'
    }));
    
    // Description
    objects.push(new Textbox(exp.description || 'Job description...', {
      left: 40,
      top: currentY + 40,
      width: 500,
      fontSize: 11,
      fill: '#333333',
      fontFamily: 'Inter'
    }));
    
    currentY += template.layout.entryHeight! + template.layout.spacing;
  });
  
  return objects;
}

function createEducationObjects(
  profileData: ProfileDataReturn,
  template: SectionTemplate,
  yOffset: number
): FabricObject[] {
  const objects: FabricObject[] = [];
  
  // Section title
  objects.push(new Textbox('EDUCATION', {
    left: 40,
    top: yOffset,
    width: 500,
    fontSize: 14,
    fontWeight: 'bold',
    fill: '#000000',
    fontFamily: 'Inter'
  }));
  
  // Divider line
  objects.push(new Line([40, yOffset + 25, 540, yOffset + 25], {
    stroke: '#000000',
    strokeWidth: 1
  }));
  
  let currentY = yOffset + 35;
  const education = profileData.educationItems || [];
  
  education.forEach((edu: any) => {
    // Degree
    objects.push(new Textbox(edu.degree || 'Degree Name', {
      left: 40,
      top: currentY,
      width: 350,
      fontSize: 13,
      fontWeight: 'bold',
      fill: '#000000',
      fontFamily: 'Inter'
    }));
    
    // Institution
    objects.push(new Textbox(edu.institution || 'Institution Name', {
      left: 40,
      top: currentY + 20,
      width: 250,
      fontSize: 12,
      fill: '#666666',
      fontFamily: 'Inter'
    }));
    
    // Year
    objects.push(new Textbox(edu.year || 'Year', {
      left: 300,
      top: currentY + 20,
      width: 240,
      fontSize: 11,
      fill: '#999999',
      fontFamily: 'Inter',
      textAlign: 'right'
    }));
    
    if (edu.description) {
      objects.push(new Textbox(edu.description, {
        left: 40,
        top: currentY + 40,
        width: 500,
        fontSize: 11,
        fill: '#333333',
        fontFamily: 'Inter'
      }));
    }
    
    currentY += template.layout.entryHeight! + template.layout.spacing;
  });
  
  return objects;
}

function createSkillsObjects(
  profileData: ProfileDataReturn,
  template: SectionTemplate,
  yOffset: number
): FabricObject[] {
  const objects: FabricObject[] = [];
  
  // Section title
  objects.push(new Textbox('SKILLS', {
    left: 40,
    top: yOffset,
    width: 500,
    fontSize: 14,
    fontWeight: 'bold',
    fill: '#000000',
    fontFamily: 'Inter'
  }));
  
  // Divider line
  objects.push(new Line([40, yOffset + 25, 540, yOffset + 25], {
    stroke: '#000000',
    strokeWidth: 1
  }));
  
  // Skills text
  const skills = profileData.userSkills || [];
  const skillsText = skills.length > 0 ? skills.join(' • ') : 'Add your skills...';
  
  objects.push(new Textbox(skillsText, {
    left: 40,
    top: yOffset + 35,
    width: 500,
    fontSize: 11,
    fill: '#333333',
    fontFamily: 'Inter'
  }));
  
  return objects;
}

function createLanguagesObjects(
  profileData: ProfileDataReturn,
  template: SectionTemplate,
  yOffset: number
): FabricObject[] {
  const objects: FabricObject[] = [];
  
  // Section title
  objects.push(new Textbox('LANGUAGES', {
    left: 40,
    top: yOffset,
    width: 500,
    fontSize: 14,
    fontWeight: 'bold',
    fill: '#000000',
    fontFamily: 'Inter'
  }));
  
  // Divider line
  objects.push(new Line([40, yOffset + 25, 540, yOffset + 25], {
    stroke: '#000000',
    strokeWidth: 1
  }));
  
  // Languages text
  const languages = profileData.userLanguages || [];
  const languagesText = languages.length > 0 
    ? languages.map((lang: any) => `${lang.language} (${lang.proficiency})`).join(' • ')
    : 'Add your languages...';
  
  objects.push(new Textbox(languagesText, {
    left: 40,
    top: yOffset + 35,
    width: 500,
    fontSize: 11,
    fill: '#333333',
    fontFamily: 'Inter'
  }));
  
  return objects;
}

function createProjectsObjects(
  profileData: ProfileDataReturn,
  template: SectionTemplate,
  yOffset: number
): FabricObject[] {
  const objects: FabricObject[] = [];
  
  // Section title
  objects.push(new Textbox('PROJECTS', {
    left: 40,
    top: yOffset,
    width: 500,
    fontSize: 14,
    fontWeight: 'bold',
    fill: '#000000',
    fontFamily: 'Inter'
  }));
  
  // Divider line
  objects.push(new Line([40, yOffset + 25, 540, yOffset + 25], {
    stroke: '#000000',
    strokeWidth: 1
  }));
  
  let currentY = yOffset + 35;
  const projects = profileData.userProjects || [];
  
  projects.forEach((project: any) => {
    objects.push(new Textbox(project.title || 'Project Name', {
      left: 40,
      top: currentY,
      width: 500,
      fontSize: 13,
      fontWeight: 'bold',
      fill: '#000000',
      fontFamily: 'Inter'
    }));
    
    objects.push(new Textbox(project.description || 'Project description...', {
      left: 40,
      top: currentY + 20,
      width: 500,
      fontSize: 11,
      fill: '#333333',
      fontFamily: 'Inter'
    }));
    
    currentY += template.layout.entryHeight! + template.layout.spacing;
  });
  
  return objects;
}

function createCertificationsObjects(
  profileData: ProfileDataReturn,
  template: SectionTemplate,
  yOffset: number
): FabricObject[] {
  const objects: FabricObject[] = [];
  
  // Section title
  objects.push(new Textbox('TRAINING & COURSES', {
    left: 40,
    top: yOffset,
    width: 500,
    fontSize: 14,
    fontWeight: 'bold',
    fill: '#000000',
    fontFamily: 'Inter'
  }));
  
  // Divider line
  objects.push(new Line([40, yOffset + 25, 540, yOffset + 25], {
    stroke: '#000000',
    strokeWidth: 1
  }));
  
  let currentY = yOffset + 35;
  const certifications = profileData.userCertifications || [];
  
  certifications.forEach((cert: any) => {
    objects.push(new Textbox(cert.title || 'Certification Name', {
      left: 40,
      top: currentY,
      width: 350,
      fontSize: 12,
      fontWeight: 'bold',
      fill: '#000000',
      fontFamily: 'Inter'
    }));
    
    objects.push(new Textbox(cert.issuer || 'Issuing Organization', {
      left: 40,
      top: currentY + 18,
      width: 250,
      fontSize: 11,
      fill: '#666666',
      fontFamily: 'Inter'
    }));
    
    objects.push(new Textbox(cert.issue_date || 'Date', {
      left: 300,
      top: currentY + 18,
      width: 240,
      fontSize: 11,
      fill: '#999999',
      fontFamily: 'Inter',
      textAlign: 'right'
    }));
    
    currentY += template.layout.entryHeight! + template.layout.spacing;
  });
  
  return objects;
}

function createAchievementsObjects(
  profileData: ProfileDataReturn,
  template: SectionTemplate,
  yOffset: number
): FabricObject[] {
  const objects: FabricObject[] = [];
  
  // Section title
  objects.push(new Textbox('KEY ACHIEVEMENTS', {
    left: 40,
    top: yOffset,
    width: 500,
    fontSize: 14,
    fontWeight: 'bold',
    fill: '#000000',
    fontFamily: 'Inter'
  }));
  
  // Divider line
  objects.push(new Line([40, yOffset + 25, 540, yOffset + 25], {
    stroke: '#000000',
    strokeWidth: 1
  }));
  
  let currentY = yOffset + 35;
  const achievements = profileData.userAchievements || [];
  
  achievements.forEach((achievement: any) => {
    objects.push(new Textbox(achievement.title || 'Achievement Title', {
      left: 40,
      top: currentY,
      width: 500,
      fontSize: 12,
      fontWeight: 'bold',
      fill: '#000000',
      fontFamily: 'Inter'
    }));
    
    objects.push(new Textbox(achievement.description || 'Description...', {
      left: 40,
      top: currentY + 18,
      width: 500,
      fontSize: 11,
      fill: '#333333',
      fontFamily: 'Inter'
    }));
    
    currentY += template.layout.entryHeight! + template.layout.spacing;
  });
  
  return objects;
}

function createCustomObjects(
  template: SectionTemplate,
  yOffset: number
): FabricObject[] {
  const objects: FabricObject[] = [];
  
  objects.push(new Textbox('CUSTOM SECTION', {
    left: 40,
    top: yOffset,
    width: 500,
    fontSize: 14,
    fontWeight: 'bold',
    fill: '#000000',
    fontFamily: 'Inter'
  }));
  
  objects.push(new Line([40, yOffset + 25, 540, yOffset + 25], {
    stroke: '#000000',
    strokeWidth: 1
  }));
  
  objects.push(new Textbox('Add your custom content here...', {
    left: 40,
    top: yOffset + 35,
    width: 500,
    fontSize: 11,
    fill: '#333333',
    fontFamily: 'Inter'
  }));
  
  return objects;
}

// Calculate section height dynamically based on content
export function calculateSectionHeight(
  sectionType: SectionComponentType,
  profileData: ProfileDataReturn,
  template: SectionTemplate
): number {
  const baseHeight = 35; // Section title + line
  
  switch (sectionType) {
    case 'header':
      return template.layout.height || 140;
    case 'summary':
      return template.layout.minHeight || 100;
    case 'skills':
      return template.layout.height || 80;
    case 'languages':
      return template.layout.height || 70;
    case 'experience':
      const expCount = profileData.experiences?.length || 0;
      return baseHeight + (expCount * (template.layout.entryHeight! + template.layout.spacing));
    case 'education':
      const eduCount = profileData.educationItems?.length || 0;
      return baseHeight + (eduCount * (template.layout.entryHeight! + template.layout.spacing));
    case 'projects':
      const projCount = profileData.userProjects?.length || 0;
      return baseHeight + (projCount * (template.layout.entryHeight! + template.layout.spacing));
    case 'certifications':
      const certCount = profileData.userCertifications?.length || 0;
      return baseHeight + (certCount * (template.layout.entryHeight! + template.layout.spacing));
    case 'achievements':
      const achCount = profileData.userAchievements?.length || 0;
      return baseHeight + (achCount * (template.layout.entryHeight! + template.layout.spacing));
    default:
      return template.layout.minHeight || 80;
  }
}
