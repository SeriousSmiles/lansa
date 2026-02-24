import * as pdfjs from 'pdfjs-dist';

// Use the bundled worker from the npm package (works with v5+)
// Vite handles the ?url import to get the correct asset path
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Convert a PDF or image file to an array of JPEG data URLs.
 * PDFs are rendered page-by-page (max 10 pages) at 2× scale.
 * Images are resized to max 1024px and compressed to 70% JPEG quality.
 * Includes a timeout to prevent infinite hangs.
 */
export const convertFileToImages = async (file: File): Promise<string[]> => {
  const TIMEOUT_MS = 30_000; // 30 second timeout

  const doConversion = async (): Promise<string[]> => {
    const images: string[] = [];

    if (file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const maxPages = Math.min(pdf.numPages, 10);

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvas: canvas,
          canvasContext: context,
          viewport: viewport,
        }).promise;

        images.push(canvas.toDataURL('image/jpeg', 0.7));
      }
    } else if (file.type.startsWith('image/')) {
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const maxSize = 1024;
          let { width, height } = img;

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height * maxSize) / width;
              width = maxSize;
            } else {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => reject(new Error('Failed to load image file'));

        const reader = new FileReader();
        reader.onload = () => (img.src = reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
      });

      images.push(imageDataUrl);
    } else {
      throw new Error('Unsupported file type. Please upload a PDF or image file.');
    }

    return images;
  };

  // Race conversion against a timeout
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('PDF processing timed out. Please try a smaller file or different format.')), TIMEOUT_MS)
  );

  return Promise.race([doConversion(), timeoutPromise]);
};
