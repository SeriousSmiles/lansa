import { ResumeTemplate } from '@/types/pdf';

export async function getReactPDFDocFor(template: ResumeTemplate) {
  switch (template) {
    case 'minimal':
      return (await import('./templates/pdf/MinimalDoc')).default;
    case 'academic':
      return (await import('./templates/pdf/AcademicDoc')).default;
    case 'professional':
      return (await import('./templates/pdf/ProfessionalDoc')).default;
    default:
      throw new Error(`Unsupported react-pdf template: ${template}`);
  }
}
