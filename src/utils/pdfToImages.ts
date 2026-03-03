/**
 * Convert a PDF or image file to an array of JPEG data URLs.
 * Uses a fake worker (main-thread rendering) to avoid pdfjs-dist v5
 * worker compatibility issues ("getOrInsertComputed is not a function").
 */
export const convertFileToImages = async (file: File): Promise<string[]> => {
  const TIMEOUT_MS = 45_000;

  const doConversion = async (): Promise<string[]> => {
    const images: string[] = [];

    if (file.type === 'application/pdf') {
      // Dynamically import pdfjs and disable the worker to avoid v5 worker bugs
      const pdfjs = await import('pdfjs-dist');

      // Point to the real worker file — required in pdfjs-dist v5
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      const maxPages = Math.min(pdf.numPages, 4);

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.2 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvas,
          canvasContext: context,
          viewport,
        }).promise;

        images.push(canvas.toDataURL('image/jpeg', 0.7));
        page.cleanup();
      }
    } else if (file.type.startsWith('image/')) {
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const maxSize = 1280;
          let { width, height } = img;

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            } else {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
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

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error('PDF processing timed out. Please try a smaller file.')),
      TIMEOUT_MS
    )
  );

  return Promise.race([doConversion(), timeoutPromise]);
};
