import html2canvas from 'html2canvas';

export interface HTMLToJPEGOptions {
  quality?: number;
  dpi?: number;
}

export class HTMLToJPEGGenerator {
  // A4 dimensions at 300 DPI for print quality
  private static readonly A4_WIDTH_PX = 2480; // 210mm at 300 DPI
  private static readonly A4_HEIGHT_PX = 3508; // 297mm at 300 DPI

  static async generateJPEG(
    elementId: string,
    options: HTMLToJPEGOptions = {}
  ): Promise<Blob> {
    const { quality = 0.9, dpi = 300 } = options;

    // Get the element to convert
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    try {
      // Calculate scale based on DPI (300 DPI is ~2.5x of typical 96 DPI screen)
      const scale = dpi / 96;

      // Configure html2canvas for high-quality image capture
      const canvas = await html2canvas(element, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.offsetWidth,
        height: element.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.offsetWidth,
        windowHeight: element.offsetHeight,
      });

      // Create a new canvas with exact A4 dimensions
      const a4Canvas = document.createElement('canvas');
      a4Canvas.width = this.A4_WIDTH_PX;
      a4Canvas.height = this.A4_HEIGHT_PX;
      const ctx = a4Canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, a4Canvas.width, a4Canvas.height);

      // Calculate scaling to fit A4 while maintaining aspect ratio
      const canvasAspectRatio = canvas.height / canvas.width;
      const a4AspectRatio = this.A4_HEIGHT_PX / this.A4_WIDTH_PX;

      let finalWidth = this.A4_WIDTH_PX;
      let finalHeight = this.A4_HEIGHT_PX;

      if (canvasAspectRatio > a4AspectRatio) {
        // Canvas is taller, fit to height
        finalWidth = this.A4_HEIGHT_PX / canvasAspectRatio;
      } else {
        // Canvas is wider, fit to width
        finalHeight = this.A4_WIDTH_PX * canvasAspectRatio;
      }

      // Center the image on A4 canvas
      const xOffset = (this.A4_WIDTH_PX - finalWidth) / 2;
      const yOffset = (this.A4_HEIGHT_PX - finalHeight) / 2;

      // Draw the captured content onto A4 canvas
      ctx.drawImage(canvas, xOffset, yOffset, finalWidth, finalHeight);

      // Convert to JPEG blob
      return new Promise((resolve, reject) => {
        a4Canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create JPEG blob'));
            }
          },
          'image/jpeg',
          quality
        );
      });
    } catch (error) {
      console.error('Error generating JPEG:', error);
      throw new Error('Failed to generate JPEG image');
    }
  }

  static async downloadJPEG(
    elementId: string,
    filename: string = 'resume.jpg',
    options: HTMLToJPEGOptions = {}
  ): Promise<void> {
    try {
      const blob = await this.generateJPEG(elementId, options);

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
      console.error('Error downloading JPEG:', error);
      throw error;
    }
  }

  static async previewJPEG(elementId: string, options: HTMLToJPEGOptions = {}): Promise<string> {
    try {
      const blob = await this.generateJPEG(elementId, options);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      return url;
    } catch (error) {
      console.error('Error previewing JPEG:', error);
      throw error;
    }
  }
}
