import { ResumeTemplate } from '@/types/pdf';

export async function getReactPDFDocFor(template: ResumeTemplate) {
  switch (template) {
    case 'minimal':
      return (await import('./templates/pdf/MinimalDoc')).default;
    case 'academic':
      return (await import('./templates/pdf/AcademicDoc')).default;
    case 'professional':
      return (await import('./templates/pdf/ProfessionalDoc')).default;
    case 'classic':
      return (await import('./templates/pdf/ClassicDoc')).default;
    case 'creative':
      return (await import('./templates/pdf/CreativeDoc')).default;
    case 'logos':
      return (await import('./templates/pdf/LogosDoc')).default;
    case 'modern':
      return (await import('./templates/pdf/ModernDoc')).default;
    case 'timeline':
      return (await import('./templates/pdf/TimelineDoc')).default;
    default:
      throw new Error(`Unsupported react-pdf template: ${template}`);
  }
}
