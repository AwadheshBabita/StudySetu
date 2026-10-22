/**
 * Smart HD Document Optimizer
 * Maintains crisp text and sharp lines even under 100KB-300KB targets
 */

export interface SmartRiotOptions {
  targetKB?: number;
  mode?: 'signature' | 'document' | 'photo';
}

export async function optimizeSmartHd(
  sourceCanvas: HTMLCanvasElement,
  options: SmartRiotOptions = {}
): Promise<{ blob: Blob; sizeKB: number; dataUrl: string }> {
  const targetKB = options.targetKB || 200;
  const targetBytes = targetKB * 1024;

  // 1. टारगेट KB के अनुसार स्मार्ट रिज़ॉल्यूशन चुनना
  // बहुत कम KB में 2480px रखने पर JPEG बिखर जाता है। 
  // सही संतुलन: 1600px से 2000px चौड़ाई + हाई क्वालिटी (0.75 - 0.88) = अल्ट्रा शार्प टेक्स्ट
  let idealWidth = 2480;
  if (targetKB <= 120) {
    idealWidth = 1450;
  } else if (targetKB <= 250) {
    idealWidth = 1754; // 150 DPI Standard Crisp
  } else if (targetKB <= 450) {
    idealWidth = 2000;
  }

  const scale = Math.min(1, idealWidth / sourceCanvas.width);
  const targetW = Math.round(sourceCanvas.width * scale);
  const targetH = Math.round(sourceCanvas.height * scale);

  // वर्किंग कैनवास
  const workCanvas = document.createElement("canvas");
  workCanvas.width = targetW;
  workCanvas.height = targetH;
  const ctx = workCanvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context failed");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(sourceCanvas, 0, 0, targetW, targetH);

  // 2. बाइनरी सर्च लेकिन क्वालिटी फ्लोर प्रोटेक्शन के साथ (कम से कम 50% क्वालिटी)
  let qLow = 0.45;
  let qHigh = 0.95;
  let bestBlob: Blob | null = null;

  for (let i = 0; i < 8; i++) {
    const qMid = (qLow + qHigh) / 2;
    const blob: Blob = await new Promise((res) =>
      workCanvas.toBlob((b) => res(b!), "image/jpeg", qMid)
    );

    if (blob.size <= targetBytes) {
      bestBlob = blob;
      qLow = qMid; // और बेहतर क्वालिटी ढूँढें
    } else {
      qHigh = qMid;
    }
  }

  // अगर 45% क्वालिटी पर भी टारगेट KB से बड़ी है (बहुत जटिल फोटो होने पर), 
  // तो पिक्सल खराब करने के बजाय 10% स्केल कम करके अच्छी क्वालिटी पर आउटपुट देना
  let finalBlob = bestBlob;
  if (!finalBlob) {
    const downW = Math.round(targetW * 0.82);
    const downH = Math.round(targetH * 0.82);
    const fallbackCanvas = document.createElement("canvas");
    fallbackCanvas.width = downW;
    fallbackCanvas.height = downH;
    const fctx = fallbackCanvas.getContext("2d");
    if (fctx) {
      fctx.imageSmoothingEnabled = true;
      fctx.imageSmoothingQuality = "high";
      fctx.drawImage(workCanvas, 0, 0, downW, downH);
    }
    finalBlob = await new Promise<Blob>((res) =>
      fallbackCanvas.toBlob((b) => res(b!), "image/jpeg", 0.70)
    );
  }

  const finalKB = Math.round(finalBlob.size / 1024);
  return {
    blob: finalBlob,
    sizeKB: finalKB,
    dataUrl: URL.createObjectURL(finalBlob)
  };
}
