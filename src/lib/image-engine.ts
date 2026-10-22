/**
 * ExamSewa Core Smart Image Pipeline
 * Exact Pixel Preservation + Unsharp Masking + 300 DPI + Exact Target KB Padding
 */

export interface SmartExportOptions {
  targetKb?: number;
  dpi?: number;
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

function processJfifAndPad(blob: Blob, dpi: number = 300, targetBytes: number): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const buffer = reader.result as ArrayBuffer;
      const bytes = new Uint8Array(buffer);

      const jfifHeader = new Uint8Array([
        0xff, 0xe0,
        0x00, 0x10,
        0x4a, 0x46, 0x49, 0x46, 0x00,
        0x01, 0x01,
        0x01,
        (dpi >> 8) & 0xff, dpi & 0xff,
        (dpi >> 8) & 0xff, dpi & 0xff,
        0x00, 0x00
      ]);

      let bodyStart = 2;
      if (bytes[2] === 0xff && (bytes[3] === 0xe0 || bytes[3] === 0xe1)) {
        const blockLen = (bytes[4] << 8) + bytes[5];
        bodyStart = 4 + blockLen;
      }

      const bodyBytes = bytes.slice(bodyStart);

      let baseLength = 2 + jfifHeader.length + bodyBytes.length;
      let padBytesNeeded = targetBytes > baseLength ? targetBytes - baseLength : 0;

      // मल्टी-ब्लॉक पैडिंग (140 KB, 200 KB या उससे अधिक के लिए जितने आवश्यक हों उतने 64KB COM मार्कर जोड़ें)
      const comChunks = [];
      let remainingPad = padBytesNeeded;

      while (remainingPad > 4) {
        const chunkSize = Math.min(65530, remainingPad);
        const chunk = new Uint8Array(chunkSize);
        chunk[0] = 0xff;
        chunk[1] = 0xfe; // JPEG COM Marker
        chunk[2] = (chunkSize - 2) >> 8;
        chunk[3] = (chunkSize - 2) & 0xff;
        for (let i = 4; i < chunkSize; i++) {
          chunk[i] = 0x20; // Safe Space Padding
        }
        comChunks.push(chunk);
        remainingPad -= chunkSize;
      }

      const totalComLen = comChunks.reduce((acc, c) => acc + c.length, 0);
      const totalLen = 2 + jfifHeader.length + totalComLen + bodyBytes.length;
      const finalBytes = new Uint8Array(totalLen);

      finalBytes[0] = 0xff;
      finalBytes[1] = 0xd8;
      finalBytes.set(jfifHeader, 2);

      let cursor = 2 + jfifHeader.length;
      for (const chunk of comChunks) {
        finalBytes.set(chunk, cursor);
        cursor += chunk.length;
      }
      finalBytes.set(bodyBytes, cursor);

      resolve(new Blob([finalBytes], { type: "image/jpeg" }));
    };
    reader.readAsArrayBuffer(blob);
  });
}

function applySmartSharpen(ctx: CanvasRenderingContext2D, w: number, h: number) {
  try {
    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;
    const copy = new Uint8ClampedArray(d);

    const weight = 0.22;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;
        for (let c = 0; c < 3; c++) {
          const up = ((y - 1) * w + x) * 4 + c;
          const down = ((y + 1) * w + x) * 4 + c;
          const left = (y * w + (x - 1)) * 4 + c;
          const right = (y * w + (x + 1)) * 4 + c;

          const laplacian = 4 * copy[idx + c] - (copy[up] + copy[down] + copy[left] + copy[right]);
          d[idx + c] = Math.min(255, Math.max(0, copy[idx + c] + laplacian * weight));
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } catch (e) {
  }
}

export async function exportSmartJpg(
  sourceCanvas: HTMLCanvasElement,
  options: SmartExportOptions = {}
): Promise<SmartExportResult> {
  const { targetKb = 50, dpi = 300 } = options;
  const targetBytes = targetKb * 1024;

  let currentCanvas = document.createElement("canvas");
  currentCanvas.width = sourceCanvas.width;
  currentCanvas.height = sourceCanvas.height;
  let ctx = currentCanvas.getContext("2d", { alpha: false });
  if (ctx) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, currentCanvas.width, currentCanvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(sourceCanvas, 0, 0);
    applySmartSharpen(ctx, currentCanvas.width, currentCanvas.height);
  }

  const getBlob = (cvs: HTMLCanvasElement, q: number): Promise<Blob> =>
    new Promise((res) => cvs.toBlob((b) => res(b!), "image/jpeg", q));

  let finalRawBlob: Blob | null = null;
  let finalWidth = currentCanvas.width;
  let finalHeight = currentCanvas.height;

  // डाउनस्केल और क्वालिटी ट्यूनिंग लूप (अधिकतम 4 स्केलिंग चरण)
  for (let scaleStep = 0; scaleStep < 4; scaleStep++) {
    let qLow = 0.15;
    let qHigh = 0.98;
    let bestUnder: Blob | null = null;
    let closestOver: Blob | null = null;

    for (let step = 0; step < 8; step++) {
      const qMid = (qLow + qHigh) / 2;
      const b = await getBlob(currentCanvas, qMid);

      if (b.size <= targetBytes) {
        bestUnder = b;
        qLow = qMid;
      } else {
        closestOver = b;
        qHigh = qMid;
      }
    }

    if (bestUnder) {
      finalRawBlob = bestUnder;
      finalWidth = currentCanvas.width;
      finalHeight = currentCanvas.height;
      break;
    }

    // अगर 15% क्वालिटी पर भी फ़ाइल लक्ष्य से बड़ी है, तो डायमेंशन 15% कम करें
    const nextW = Math.max(160, Math.round(currentCanvas.width * 0.85));
    const nextH = Math.max(160, Math.round(currentCanvas.height * 0.85));
    const nextCanvas = document.createElement("canvas");
    nextCanvas.width = nextW;
    nextCanvas.height = nextH;
    const nCtx = nextCanvas.getContext("2d", { alpha: false });
    if (nCtx) {
      nCtx.fillStyle = "#FFFFFF";
      nCtx.fillRect(0, 0, nextW, nextH);
      nCtx.imageSmoothingEnabled = true;
      nCtx.imageSmoothingQuality = "high";
      nCtx.drawImage(currentCanvas, 0, 0, nextW, nextH);
      currentCanvas = nextCanvas;
    } else {
      finalRawBlob = closestOver;
      break;
    }
  }

  if (!finalRawBlob) {
    finalRawBlob = await getBlob(currentCanvas, 0.4);
  }

  const finalBlob = await processJfifAndPad(finalRawBlob, dpi, targetBytes);
  const actualKb = Math.round(finalBlob.size / 1024);
  const dataUrl = URL.createObjectURL(finalBlob);

  return {
    blob: finalBlob,
    actualKb,
    dataUrl,
    width: finalWidth,
    height: finalHeight,
  };
}
