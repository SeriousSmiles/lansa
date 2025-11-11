import html2canvas from 'html2canvas';

export interface HTMLToJPEGOptions {
  quality?: number;
  dpi?: number;
}

export class HTMLToJPEGGenerator {
  // A4 dimensions at 300 DPI for print quality
  private static readonly A4_WIDTH_PX = 2480; // 210mm at 300 DPI
  private static readonly A4_HEIGHT_PX = 3508; // 297mm at 300 DPI

  // Wait for all fonts and images to load
  private static async waitForResources(): Promise<void> {
    // Wait for fonts
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // Wait for images
    const images = Array.from(document.images);
    const imagePromises = images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = resolve; // Resolve anyway to not block
        setTimeout(resolve, 5000); // Timeout after 5s
      });
    });

    await Promise.all(imagePromises);
  }

  static async generateJPEG(
    elementId: string,
    options: HTMLToJPEGOptions = {}
  ): Promise<Blob> {
    const { quality = 0.9 } = options;

    // Get the element to convert
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(
        `Export failed: Template container not found. ` +
        `This template may not support JPEG export. ` +
        `Try using PDF format instead.`
      );
    }

    try {
      // Wait for all resources to load
      await this.waitForResources();

      // Element should already be 2480x3508px
      // Capture at scale 1 for pixel-perfect rendering
      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: this.A4_WIDTH_PX,
        height: this.A4_HEIGHT_PX,
        scrollX: 0,
        scrollY: 0,
        windowWidth: this.A4_WIDTH_PX,
        windowHeight: this.A4_HEIGHT_PX,
      });

      // Direct conversion to JPEG - no rescaling needed
      return new Promise((resolve, reject) => {
        canvas.toBlob(
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
