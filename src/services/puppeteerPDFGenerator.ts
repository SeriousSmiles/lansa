import { supabase } from '@/integrations/supabase/client';
import { PDFResumeData, ResumeTemplate } from '@/types/pdf';

export class PuppeteerPDFGenerator {
  static async generatePDF(
    data: PDFResumeData,
    template: ResumeTemplate = 'modern',
    filename?: string
  ): Promise<Blob> {
    const defaultFilename = `${data.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`;
    const finalFilename = filename || defaultFilename;

    const { data: pdfData, error } = await supabase.functions.invoke('generate-pdf-puppeteer', {
      body: {
        template,
        data,
        filename: finalFilename
      }
    });

    if (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }

    // Convert the response to a blob
    const response = new Response(pdfData);
    return await response.blob();
  }

  static async downloadPDF(
    data: PDFResumeData,
    template: ResumeTemplate = 'modern',
    filename?: string
  ): Promise<void> {
    const blob = await this.generatePDF(data, template, filename);
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `${data.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async previewPDF(
    data: PDFResumeData,
    template: ResumeTemplate = 'modern'
  ): Promise<string> {
    const blob = await this.generatePDF(data, template);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    return url;
  }
}