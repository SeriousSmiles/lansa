import * as pdfjs from 'pdfjs-dist';

// Set the worker source for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * Convert a PDF or image file to an array of JPEG data URLs.
 * PDFs are rendered page-by-page (max 10 pages) at 2× scale.
 * Images are resized to max 1024px and compressed to 70% JPEG quality.
 */
export const convertFileToImages = async (file: File): Promise<string[]> => {
  const images: string[] = [];

  if (file.type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
    const maxPages = Math.min(pdf.numPages, 10);

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
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
      img.onerror = reject;

      const reader = new FileReader();
      reader.onload = () => (img.src = reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    images.push(imageDataUrl);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or image file.');
  }

  return images;
};
