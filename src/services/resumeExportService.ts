import React from 'react';
import ReactDOM from 'react-dom/client';
import { PDFResumeData, ResumeTemplate } from '@/types/pdf';

const HTML_TEMPLATES: ResumeTemplate[] = ['classic', 'creative', 'logos', 'modern', 'professional', 'timeline'];
const REACT_PDF_TEMPLATES: ResumeTemplate[] = ['academic', 'minimal'];

async function getHTMLExportComponent(template: ResumeTemplate) {
  switch (template) {
    case 'classic':
      return (await import('@/components/pdf/templates/ClassicTemplateExport')).ClassicTemplateExport;
    case 'creative':
      return (await import('@/components/pdf/templates/CreativeTemplateExport')).CreativeTemplateExport;
    case 'logos':
      return (await import('@/components/pdf/templates/LogosTemplateExport')).LogosTemplateExport;
    case 'modern':
      return (await import('@/components/pdf/templates/ModernTemplateExport')).ModernTemplateExport;
    case 'professional':
      return (await import('@/components/pdf/templates/ProfessionalTemplateExport')).ProfessionalTemplateExport;
    case 'timeline':
      return (await import('@/components/pdf/templates/TimelineTemplateExport')).TimelineTemplateExport;
    default:
      throw new Error(`No HTML export component for template: ${template}`);
  }
}

async function exportHTMLTemplate(
  template: ResumeTemplate,
  data: PDFResumeData,
  format: 'pdf' | 'png' | 'jpeg'
): Promise<void> {
  const Component = await getHTMLExportComponent(template);

  // Create off-screen container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.zIndex = '-1';
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);
  root.render(React.createElement(Component, { data }));

  // Wait for render + images
  await new Promise(resolve => setTimeout(resolve, 500));

  const exportEl = container.querySelector('#pdf-resume-export-container') as HTMLElement;
  if (!exportEl) {
    root.unmount();
    document.body.removeChild(container);
    throw new Error('Export container not found');
  }

  try {
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(exportEl, {
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: exportEl.scrollWidth,
      height: exportEl.scrollHeight,
    });

    if (format === 'pdf') {
      const { default: jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgData = canvas.toDataURL('image/png', 1.0);
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, 297));
      pdf.save('resume.pdf');
    } else {
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, 0.95);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `resume.${format}`;
      link.click();
    }
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
}

async function exportReactPDFTemplate(
  template: ResumeTemplate,
  data: PDFResumeData
): Promise<void> {
  const { pdf } = await import('@react-pdf/renderer');
  const { getReactPDFDocFor } = await import('@/components/pdf/reactPdfFactory');
  const DocComponent = await getReactPDFDocFor(template);

  const doc = React.createElement(DocComponent, { data }) as any;
  const blob = await (pdf as any)(doc).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'resume.pdf';
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportResume(
  template: ResumeTemplate,
  data: PDFResumeData,
  format: 'pdf' | 'png' | 'jpeg' = 'pdf'
): Promise<void> {
  if (REACT_PDF_TEMPLATES.includes(template)) {
    if (format !== 'pdf') {
      throw new Error(`${template} template only supports PDF export`);
    }
    return exportReactPDFTemplate(template, data);
  }

  if (HTML_TEMPLATES.includes(template)) {
    return exportHTMLTemplate(template, data, format);
  }

  throw new Error(`Unknown template: ${template}`);
}
