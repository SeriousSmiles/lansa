import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface HTMLToPDFOptions {
  filename?: string;
  quality?: number;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
}

export class HTMLToPDFGenerator {
  static async generatePDF(
    elementId: string, 
    options: HTMLToPDFOptions = {}
  ): Promise<Blob> {
    const {
      filename = 'resume.pdf',
      quality = 2,
      format = 'a4',
      orientation = 'portrait'
    } = options;

    // Get the element to convert
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    try {
      // Configure html2canvas options for better quality
      const canvas = await html2canvas(element, {
        scale: quality,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.offsetWidth,
        height: element.offsetHeight,
        scrollX: 0,
        scrollY: 0,
      });

      // Calculate PDF dimensions
      const imgWidth = format === 'a4' ? 210 : 216; // mm
      const imgHeight = format === 'a4' ? 297 : 279; // mm
      
      // Create PDF
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: format === 'a4' ? 'a4' : 'letter',
      });

      // Calculate scaling to fit the page
      const canvasAspectRatio = canvas.height / canvas.width;
      const pdfAspectRatio = imgHeight / imgWidth;

      let finalWidth = imgWidth;
      let finalHeight = imgHeight;

      // Adjust dimensions to maintain aspect ratio
      if (canvasAspectRatio > pdfAspectRatio) {
        // Canvas is taller, fit to height
        finalWidth = imgHeight / canvasAspectRatio;
      } else {
        // Canvas is wider, fit to width
        finalHeight = imgWidth * canvasAspectRatio;
      }

      // Center the image on the page
      const xOffset = (imgWidth - finalWidth) / 2;
      const yOffset = (imgHeight - finalHeight) / 2;

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);

      // Convert to blob
      return pdf.output('blob');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  static async downloadPDF(
    elementId: string, 
    filename: string = 'resume.pdf',
    options: HTMLToPDFOptions = {}
  ): Promise<void> {
    try {
      const blob = await this.generatePDF(elementId, { ...options, filename });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  }

  static async previewPDF(elementId: string, options: HTMLToPDFOptions = {}): Promise<string> {
    try {
      const blob = await this.generatePDF(elementId, options);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      return url;
    } catch (error) {
      console.error('Error previewing PDF:', error);
      throw error;
    }
  }
}