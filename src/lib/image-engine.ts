/**
 * ExamSewa / StudySetu Core Smart Image Pipeline
 * Accurate KB Target + Text/Line-Art Edge Preservation
 */

export interface SmartExportOptions {
  targetKb?: number;
  isDocument?: boolean;
  minQuality?: number;
  maxQuality?: number;
}

export interface SmartExportResult {
  blob: Blob;
  actualKb: number;
  dataUrl: string;
  width: number;
  height: number;
}

export async function exportSmartJpg(
  sourceCanvas: HTMLCanvasElement,
  options: SmartExportOptions = {}
): Promise<SmartExportResult> {
  const {
    targetKb = 50,
    isDocument = false,
    minQuality = 0.08,
    maxQuality = 0.98,
  } = options;

  const targetBytes = targetKb * 1024;
  const origW = sourceCanvas.width;
  const origH = sourceCanvas.height;

  // 1. स्मार्ट स्केलिंग (अति-कम्प्रेशन से बचाना ताकि नाम, तारीख और फॉन्ट न फटें)
  let scale = 1.0;
  if (isDocument) {
    if (targetKb <= 20) scale = Math.min(1.0, 950 / Math.max(origW, origH));
    else if (targetKb <= 50) scale = Math.min(1.0, 1400 / Math.max(origW, origH));
  } else {
    // पासपोर्ट / नेम-डेट फोटो
    if (targetKb <= 25) scale = Math.min(1.0, 800 / Math.max(origW, origH));
    else if (targetKb <= 50) scale = Math.min(1.0, 1200 / Math.max(origW, origH));
  }

  const targetW = Math.max(80, Math.round(origW * scale));
  const targetH = Math.max(80, Math.round(origH * scale));

  let workCanvas: HTMLCanvasElement = sourceCanvas;

  if (targetW !== origW || targetH !== origH) {
    workCanvas = document.createElement("canvas");
    workCanvas.width = targetW;
    workCanvas.height = targetH;
    const ctx = workCanvas.getContext("2d", { alpha: false });
    if (ctx) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(sourceCanvas, 0, 0, targetW, targetH);
    }
  }

  // 2. 10-स्टेप बाइनरी सर्च (सटीक Blob एलोकेशन)
  let qLow = minQuality;
  let qHigh = maxQuality;
  let bestBlob: Blob | null = null;

  for (let step = 0; step < 10; step++) {
    const qMid = (qLow + qHigh) / 2;
    const blob: Blob = await new Promise((resolve) =>
      workCanvas.toBlob((b) => resolve(b!), "image/jpeg", qMid)
    );

    if (blob.size <= targetBytes) {
      bestBlob = blob;
      qLow = qMid; // और बेहतर क्वालिटी पाने की कोशिश
    } else {
      qHigh = qMid;
    }
  }

  const finalBlob =
    bestBlob ||
    (await new Promise<Blob>((resolve) =>
      workCanvas.toBlob((b) => resolve(b!), "image/jpeg", minQuality)
    ));

  const actualKb = Math.round(finalBlob.size / 1024);
  const dataUrl = URL.createObjectURL(finalBlob);

  return {
    blob: finalBlob,
    actualKb,
    dataUrl,
    width: targetW,
    height: targetH,
  };
}
