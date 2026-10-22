import { createWorker } from 'tesseract.js';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { UploadedPageItem, ProcessingProgress } from '@/types/image-to-searchable-pdf-test';

function renderRotatedCanvas(image: HTMLImageElement, rotation: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  const isSideways = rotation === 90 || rotation === 270;
  canvas.width = isSideways ? image.height : image.width;
  canvas.height = isSideways ? image.width : image.height;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  return canvas;
}

async function compressPageImage(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const maxDim = 2200;
  let targetW = canvas.width;
  let targetH = canvas.height;

  if (targetW > maxDim || targetH > maxDim) {
    if (targetW > targetH) {
      targetH = Math.round((targetH * maxDim) / targetW);
      targetW = maxDim;
    } else {
      targetW = Math.round((targetW * maxDim) / targetH);
      targetH = maxDim;
    }
  }

  const offscreen = document.createElement('canvas');
  offscreen.width = targetW;
  offscreen.height = targetH;
  const ctx = offscreen.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, targetW, targetH);
  }

  return new Promise((resolve, reject) => {
    offscreen.toBlob(
      async (blob) => {
        if (!blob) return reject(new Error('Image compression failed'));
        const buffer = await blob.arrayBuffer();
        resolve(new Uint8Array(buffer));
      },
      'image/jpeg',
      0.85
    );
  });
}

export interface EngineResult {
  pdfBytes: Uint8Array;
  extractedText: string;
}

export async function buildMultiPageSearchablePdf(
  pages: UploadedPageItem[],
  lang: string = 'eng',
  onProgress?: (progress: ProcessingProgress) => void
): Promise<EngineResult> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const worker = await createWorker(lang, 1);
  let allRecognizedText = '';

  for (let i = 0; i < pages.length; i++) {
    const pageItem = pages[i];
    const pageNum = i + 1;

    if (onProgress) {
      onProgress({
        currentPage: pageNum,
        totalPages: pages.length,
        percent: Math.round(((pageNum - 0.7) / pages.length) * 100),
        statusText: `Page ${pageNum}/${pages.length}: टेक्स्ट पढ़ा जा रहा है...`,
      });
    }

    const img = new Image();
    img.src = pageItem.previewUrl;
    await new Promise((res) => (img.onload = res));
    const pageCanvas = renderRotatedCanvas(img, pageItem.rotation);

    // OCR पहचान
    const ocrResult = await worker.recognize(pageCanvas);
    const words = (ocrResult.data as any).words || [];
    const pageText = (ocrResult.data as any).text || '';
    allRecognizedText += `--- Page ${pageNum} ---\n` + pageText + '\n\n';

    if (onProgress) {
      onProgress({
        currentPage: pageNum,
        totalPages: pages.length,
        percent: Math.round(((pageNum - 0.3) / pages.length) * 100),
        statusText: `Page ${pageNum}/${pages.length}: इमेज तैयार हो रही है...`,
      });
    }

    const compressedJpgBytes = await compressPageImage(pageCanvas);

    const pdfWidth = 595.28;
    const pdfHeight = (pageCanvas.height / pageCanvas.width) * pdfWidth;
    const pdfPage = pdfDoc.addPage([pdfWidth, pdfHeight]);

    // 1. बेस इमेज रेंडर
    const embeddedImg = await pdfDoc.embedJpg(compressedJpgBytes);
    pdfPage.drawImage(embeddedImg, { x: 0, y: 0, width: pdfWidth, height: pdfHeight });

    // 2. टेक्स्ट लेयर (0.01 ओपेसिटी ताकि मोबाइल और डेस्कटॉप दोनों कर्सर इसे 100% पकड़ सकें)
    const scaleX = pdfWidth / pageCanvas.width;
    const scaleY = pdfHeight / pageCanvas.height;

    for (const w of words) {
      const text = w.text?.trim();
      if (!text) continue;

      const { x0, y0, x1, y1 } = w.bbox;
      const boxX = x0 * scaleX;
      const boxHeight = (y1 - y0) * scaleY;
      const boxY = pdfHeight - (y1 * scaleY);
      const fontSize = Math.max(6, boxHeight * 0.85);

      try {
        pdfPage.drawText(text, {
          x: boxX,
          y: boxY,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
          opacity: 0.01, // 0.01 से यह आँखों को नहीं दिखेगा लेकिन मोबाइल टच इसे तुरंत सेलेक्ट कर लेगा
        });
      } catch {
        continue;
      }
    }
  }

  await worker.terminate();

  if (onProgress) {
    onProgress({
      currentPage: pages.length,
      totalPages: pages.length,
      percent: 100,
      statusText: 'सर्चबल PDF तैयार है!',
    });
  }

  const pdfBytes = await pdfDoc.save();
  return {
    pdfBytes,
    extractedText: allRecognizedText.trim(),
  };
}
