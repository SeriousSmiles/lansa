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
      // Ensure element is fully expanded for capture
      const originalStyle = {
        height: element.style.height,
        overflow: element.style.overflow,
        maxHeight: element.style.maxHeight,
      };
      
      // Temporarily modify styles to show all content
      element.style.height = 'auto';
      element.style.overflow = 'visible';
      element.style.maxHeight = 'none';
      
      // Wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get the full scroll height
      const fullHeight = element.scrollHeight;
      const fullWidth = element.scrollWidth;
      
      // Configure html2canvas options for better quality and full content capture
      const canvas = await html2canvas(element, {
        scale: quality,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: fullWidth,
        height: fullHeight,
        scrollX: 0,
        scrollY: 0,
      });
      
      // Restore original styles
      element.style.height = originalStyle.height;
      element.style.overflow = originalStyle.overflow;
      element.style.maxHeight = originalStyle.maxHeight;

      // Calculate PDF dimensions
      const pageWidth = format === 'a4' ? 210 : 216; // mm
      const pageHeight = format === 'a4' ? 297 : 279; // mm
      const margin = 10; // mm margins
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);
      
      // Create PDF
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: format === 'a4' ? 'a4' : 'letter',
      });

      // Calculate how the canvas should be scaled to fit page width
      const canvasPixelWidth = canvas.width;
      const canvasPixelHeight = canvas.height;
      
      // Scale to fit content width (maintaining aspect ratio)
      const scaleToFitWidth = contentWidth / (canvasPixelWidth / quality);
      const scaledHeight = (canvasPixelHeight / quality) * scaleToFitWidth;
      
      // Check if content fits on one page
      if (scaledHeight <= contentHeight) {
        // Single page - center content
        const yOffset = margin + (contentHeight - scaledHeight) / 2;
        const imgData = canvas.toDataURL('image/png', 1.0);
        pdf.addImage(imgData, 'PNG', margin, yOffset, contentWidth, scaledHeight);
      } else {
        // Multi-page - split content
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pagesNeeded = Math.ceil(scaledHeight / contentHeight);
        
        for (let page = 0; page < pagesNeeded; page++) {
          if (page > 0) {
            pdf.addPage();
          }
          
          // Calculate source area for this page
          const sourceY = (page * contentHeight) / scaleToFitWidth * quality;
          const sourceHeight = Math.min(
            (contentHeight / scaleToFitWidth) * quality,
            canvasPixelHeight - sourceY
          );
          
          // Calculate destination height for this page
          const destHeight = (sourceHeight / quality) * scaleToFitWidth;
          
          // Create a temporary canvas for this page slice
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvasPixelWidth;
          pageCanvas.height = sourceHeight;
          const pageCtx = pageCanvas.getContext('2d');
          
          if (pageCtx) {
            pageCtx.drawImage(
              canvas,
              0, sourceY, canvasPixelWidth, sourceHeight,
              0, 0, canvasPixelWidth, sourceHeight
            );
            
            const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
            pdf.addImage(pageImgData, 'PNG', margin, margin, contentWidth, destHeight);
          }
        }
      }

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