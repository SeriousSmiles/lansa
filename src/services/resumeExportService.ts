import { pdf } from '@react-pdf/renderer';
import React, { createElement } from 'react';
import { PDFResumeData, ResumeTemplate } from '@/types/pdf';
import { getReactPDFDocFor } from '@/components/pdf/reactPdfFactory';

/**
 * Unified resume export service using react-pdf for all templates.
 * Produces pixel-perfect vector PDF output with automatic pagination.
 */
export class ResumeExportService {
  /**
   * Generate a PDF blob for the given template and data.
   */
  static async generatePDFBlob(
    template: ResumeTemplate,
    data: PDFResumeData
  ): Promise<Blob> {
    const DocComponent = await getReactPDFDocFor(template);
    const element = createElement(DocComponent, { data }) as any;
    const blob = await pdf(element).toBlob();
    return blob;
  }

  /**
   * Generate and trigger a download of the PDF.
   */
  static async downloadPDF(
    template: ResumeTemplate,
    data: PDFResumeData,
    filename?: string
  ): Promise<void> {
    const blob = await this.generatePDFBlob(template, data);
    const defaultFilename = `${data.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`;
    const finalFilename = filename || defaultFilename;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate and open PDF in a new tab for preview.
   */
  static async previewPDF(
    template: ResumeTemplate,
    data: PDFResumeData
  ): Promise<string> {
    const blob = await this.generatePDFBlob(template, data);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    return url;
  }
}
