// Import all template thumbnails
import modernProfessional from './modern-professional-thumb.png';
import executiveProfessional from './executive-professional-thumb.png';
import classicAts from './classic-ats-thumb.png';
import creativePortfolio from './creative-portfolio-thumb.png';

export const templateThumbnails: Record<string, string> = {
  '/src/assets/templates/modern-professional-thumb.png': modernProfessional,
  '/src/assets/templates/executive-professional-thumb.png': executiveProfessional,
  '/src/assets/templates/classic-ats-thumb.png': classicAts,
  '/src/assets/templates/creative-portfolio-thumb.png': creativePortfolio,
};

export const getTemplateThumbnail = (path: string | null): string | null => {
  if (!path) return null;
  return templateThumbnails[path] || null;
};
