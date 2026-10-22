"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

type UnitType = "cm" | "mm" | "px" | "inch";

export default function PassportPhotoMaker() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [useCamera, setUseCamera] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const [finalCroppedImage, setFinalCroppedImage] = useState<string | null>(null);

  // स्टेप 2: क्रॉपर स्टेट्स
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [cropBox, setCropBox] = useState({ x: 30, y: 20, width: 220, height: 283 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, boxX: 0, boxY: 0, boxW: 0, boxH: 0 });

  const [activeTool, setActiveTool] = useState<"zoom" | "brightness" | "contrast">("brightness");
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // स्टेप 3: साइज एवं इंजन
  const [sizeMode, setSizeMode] = useState<"default" | "custom">("default");
  const [unit, setUnit] = useState<UnitType>("cm");
  const [customWidth, setCustomWidth] = useState<number>(3.5);
  const [customHeight, setCustomHeight] = useState<number>(4.5);
  const [dpi, setDpi] = useState<number>(300);
  const [targetKb, setTargetKb] = useState<number>(35);

  const getTodayFormattedDate = () => {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, "0");
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const y = today.getFullYear();
    return `${d}/${m}/${y}`;
  };

  // नाम और तारीख: डिफ़ॉल्ट रूप से पूर्णतः अनचेक (false)
  const [nameDate, setNameDate] = useState({
    enabled: false,
    name: "",
    date: "",
    fontSize: 23,
  });

  useEffect(() => {
    setNameDate((prev) => ({
      ...prev,
      date: prev.date || getTodayFormattedDate(),
    }));
  }, []);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async (facing: "user" | "environment" = cameraFacing) => {
    setUseCamera(true);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      alert("कैमरा चालू नहीं हो सका! कृपया ब्राउज़र परमिशन चेक करें।");
      setUseCamera(false);
    }
  };

  const switchCamera = () => {
    const nextFacing = cameraFacing === "user" ? "environment" : "user";
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setUseCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      if (cameraFacing === "user") {
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, w, h);
      setImageSrc(canvas.toDataURL("image/jpeg", 0.98));
      stopCamera();
      setStep(2);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageSrc(ev.target?.result as string);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const onPointerDownMove = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      boxX: cropBox.x,
      boxY: cropBox.y,
      boxW: cropBox.width,
      boxH: cropBox.height,
    };
  };

  const onPointerDownResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      boxX: cropBox.x,
      boxY: cropBox.y,
      boxW: cropBox.width,
      boxH: cropBox.height,
    };
  };

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      if (isDragging) {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        let newX = Math.max(0, Math.min(dragStart.current.boxX + dx, rect.width - cropBox.width));
        let newY = Math.max(0, Math.min(dragStart.current.boxY + dy, rect.height - cropBox.height));
        setCropBox((prev) => ({ ...prev, x: newX, y: newY }));
      } else if (isResizing) {
        const dx = e.clientX - dragStart.current.x;
        let newW = Math.max(60, dragStart.current.boxW + dx);
        let newH = newW * (4.5 / 3.5);
        if (cropBox.x + newW > rect.width) newW = rect.width - cropBox.x;
        if (cropBox.y + newH > rect.height) newH = rect.height - cropBox.y;
        setCropBox((prev) => ({ ...prev, width: newW, height: newH }));
      }
    },
    [isDragging, isResizing, cropBox.x, cropBox.y, cropBox.width, cropBox.height]
  );

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      return () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };
    }
  }, [isDragging, isResizing, onPointerMove, onPointerUp]);

  const handleSaveAndNext = () => {
    if (!imgRef.current || !containerRef.current) return;
    const img = imgRef.current;
    const container = containerRef.current;

    const scaleX = img.naturalWidth / container.clientWidth;
    const scaleY = img.naturalHeight / container.clientHeight;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(cropBox.width * scaleX);
    canvas.height = Math.round(cropBox.height * scaleY);
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.drawImage(
        img,
        cropBox.x * scaleX,
        cropBox.y * scaleY,
        cropBox.width * scaleX,
        cropBox.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );
      setFinalCroppedImage(canvas.toDataURL("image/jpeg", 0.98));
      setStep(3);
    }
  };

  const calculateOutputDimensions = () => {
    if (sizeMode === "default") {
      return {
        targetWidth: Math.round((3.5 * 300) / 2.54),
        targetHeight: Math.round((4.5 * 300) / 2.54),
        appliedDpi: 300,
      };
    }

    const appliedDpi = Math.max(72, Number(dpi) || 300);

    if (unit === "px") {
      return {
        targetWidth: Math.max(1, Math.round(Number(customWidth) || 240)),
        targetHeight: Math.max(1, Math.round(Number(customHeight) || 240)),
        appliedDpi,
      };
    }

    let wInches = Number(customWidth) || 3.5;
    let hInches = Number(customHeight) || 4.5;

    if (unit === "cm") {
      wInches = wInches / 2.54;
      hInches = hInches / 2.54;
    } else if (unit === "mm") {
      wInches = wInches / 25.4;
      hInches = hInches / 25.4;
    }

    return {
      targetWidth: Math.max(1, Math.round(wInches * appliedDpi)),
      targetHeight: Math.max(1, Math.round(hInches * appliedDpi)),
      appliedDpi,
    };
  };

  const applySmartEdgeSharpen = (ctx: CanvasRenderingContext2D, width: number, height: number, stripY: number) => {
    try {
      const processHeight = Math.max(10, Math.min(stripY, height));
      const imgData = ctx.getImageData(0, 0, width, processHeight);
      const d = imgData.data;
      const copy = new Uint8ClampedArray(d);

      for (let y = 1; y < processHeight - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;
          for (let c = 0; c < 3; c++) {
            const center = copy[idx + c];
            const up = copy[((y - 1) * width + x) * 4 + c];
            const down = copy[((y + 1) * width + x) * 4 + c];
            const left = copy[(y * width + (x - 1)) * 4 + c];
            const right = copy[(y * width + (x + 1)) * 4 + c];

            const val = center * 1.72 - (up + down + left + right) * 0.18;
            d[idx + c] = Math.min(255, Math.max(0, val));
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } catch {}
  };

  const renderFinalCanvas = useCallback(() => {
    if (!finalCroppedImage || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const { targetWidth, targetHeight } = calculateOutputDimensions();
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // पुराना कैन्वस साफ़ करें ताकि अनचेक होने पर पिछली पट्टी न दिखे
    ctx.clearRect(0, 0, targetWidth, targetHeight);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = finalCroppedImage;
    img.onload = () => {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // केवल तभी पट्टी का हिसाब होगा जब nameDate.enabled सचमुच TRUE हो
      const stripHeight = nameDate.enabled ? Math.max(40, Math.round(targetHeight * 0.19)) : 0;
      const stripY = targetHeight - stripHeight;

      // शार्पनिंग केवल चेहरे वाले हिस्से पर
      applySmartEdgeSharpen(ctx, targetWidth, targetHeight, stripY);

      // नाम और तारीख की पट्टी - 100% केवल तभी जब enabled हो
      if (nameDate.enabled) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, stripY, targetWidth, stripHeight);

        ctx.fillStyle = "#000000";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, stripY);
        ctx.lineTo(targetWidth, stripY);
        ctx.stroke();

        const fontPx = Math.max(13, Math.round((nameDate.fontSize / 16) * (targetWidth * 0.055)));
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const lineGap = stripHeight * 0.28;

        if (nameDate.name.trim()) {
          ctx.fillStyle = "#000000";
          ctx.font = `900 ${fontPx}px Arial, sans-serif`;
          ctx.fillText(nameDate.name.toUpperCase(), targetWidth / 2, stripY + lineGap);
        } else {
          ctx.fillStyle = "#94a3b8";
          ctx.font = `italic 700 ${fontPx}px Arial, sans-serif`;
          ctx.fillText("YOUR NAME", targetWidth / 2, stripY + lineGap);
        }

        const activeDate = nameDate.date || getTodayFormattedDate();
        ctx.fillStyle = "#000000";
        ctx.font = `bold ${Math.round(fontPx * 0.88)}px Arial, sans-serif`;
        ctx.fillText(`DOP: ${activeDate}`, targetWidth / 2, stripY + stripHeight - lineGap);
      }
    };
  }, [finalCroppedImage, sizeMode, unit, customWidth, customHeight, dpi, nameDate]);

  useEffect(() => {
    if (step === 3) {
      renderFinalCanvas();
    }
  }, [step, renderFinalCanvas]);

  const injectDpiAndPadding = async (blob: Blob, targetDpi: number, targetBytes: number): Promise<Blob> => {
    const buffer = await blob.arrayBuffer();
    const view = new DataView(buffer);
    let bytes: Uint8Array;

    if (view.getUint16(0) === 0xffd8 && view.getUint16(2) === 0xffe0) {
      bytes = new Uint8Array(buffer);
      bytes[13] = 1;
      bytes[14] = (targetDpi >> 8) & 0xff;
      bytes[15] = targetDpi & 0xff;
      bytes[16] = (targetDpi >> 8) & 0xff;
      bytes[17] = targetDpi & 0xff;
    } else {
      const jfifHeader = new Uint8Array([
        0xff, 0xe0, 0x00, 0x10,
        0x4a, 0x46, 0x49, 0x46, 0x00,
        0x01, 0x01,
        0x01,
        (targetDpi >> 8) & 0xff, targetDpi & 0xff,
        (targetDpi >> 8) & 0xff, targetDpi & 0xff,
        0x00, 0x00
      ]);

      const origBytes = new Uint8Array(buffer);
      bytes = new Uint8Array(origBytes.length + jfifHeader.length);
      bytes.set(origBytes.slice(0, 2), 0);
      bytes.set(jfifHeader, 2);
      bytes.set(origBytes.slice(2), 2 + jfifHeader.length);
    }

    if (bytes.length < targetBytes) {
      const padNeeded = targetBytes - bytes.length;
      if (padNeeded >= 4) {
        const padded = new Uint8Array(targetBytes);
        const insertPos = 2;
        padded.set(bytes.slice(0, insertPos), 0);

        const commentHeader = new Uint8Array([0xff, 0xfe, (padNeeded >> 8) & 0xff, padNeeded & 0xff]);
        padded.set(commentHeader, insertPos);
        padded.fill(0x00, insertPos + 4, insertPos + padNeeded);

        padded.set(bytes.slice(insertPos), insertPos + padNeeded);
        return new Blob([padded], { type: "image/jpeg" });
      }
    }

    return new Blob([bytes], { type: "image/jpeg" });
  };

  const getExactJpgBlob = async (targetBytes: number, targetDpi: number): Promise<Blob> => {
    const canvas = previewCanvasRef.current;
    if (!canvas) throw new Error("Canvas missing");

    let minQ = 0.05;
    let maxQ = 0.98;
    let bestBlob: Blob | null = null;

    for (let i = 0; i < 7; i++) {
      const midQ = (minQ + maxQ) / 2;
      const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/jpeg", midQ));
      bestBlob = blob;

      if (blob.size > targetBytes) {
        maxQ = midQ;
      } else {
        minQ = midQ;
      }
    }

    return await injectDpiAndPadding(bestBlob!, targetDpi, targetBytes);
  };

  const handleDownloadJpg = async () => {
    if (!previewCanvasRef.current) return;
    const { appliedDpi } = calculateOutputDimensions();
    const targetKiloBytes = sizeMode === "default" ? 35 : targetKb;
    const blob = await getExactJpgBlob(targetKiloBytes * 1024, appliedDpi);
    const link = document.createElement("a");
    link.download = `examsewa_passport_${Math.round(blob.size / 1024)}kb_${appliedDpi}dpi.jpg`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const createPdfBlob = async (targetBytes: number): Promise<Blob> => {
    const canvas = previewCanvasRef.current;
    if (!canvas) throw new Error("Canvas missing");

    const imgTargetBytes = Math.max(3 * 1024, targetBytes - 1800);

    let minQ = 0.05;
    let maxQ = 0.98;
    let bestJpgBlob: Blob | null = null;

    for (let i = 0; i < 7; i++) {
      const midQ = (minQ + maxQ) / 2;
      const b: Blob = await new Promise((res) => canvas.toBlob((blob) => res(blob!), "image/jpeg", midQ));
      bestJpgBlob = b;
      if (b.size > imgTargetBytes) {
        maxQ = midQ;
      } else {
        minQ = midQ;
      }
    }

    const imgBytes = new Uint8Array(await bestJpgBlob!.arrayBuffer());
    const w = canvas.width;
    const h = canvas.height;

    const pdfW = (w / 300) * 72;
    const pdfH = (h / 300) * 72;

    const encoder = new TextEncoder();
    const parts: Uint8Array[] = [];
    const offsets: number[] = [];
    let currentOffset = 0;

    const addString = (str: string) => {
      const u8 = encoder.encode(str);
      parts.push(u8);
      currentOffset += u8.length;
    };

    const addBytes = (u8: Uint8Array) => {
      parts.push(u8);
      currentOffset += u8.length;
    };

    addString("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

    offsets.push(currentOffset);
    addString("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

    offsets.push(currentOffset);
    addString("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

    offsets.push(currentOffset);
    addString(
      `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfW.toFixed(2)} ${pdfH.toFixed(2)}] /Contents 4 0 R /Resources << /XObject << /Im1 5 0 R >> >> >>\nendobj\n`
    );

    const contentStream = `q\n${pdfW.toFixed(2)} 0 0 ${pdfH.toFixed(2)} 0 0 cm\n/Im1 Do\nQ\n`;
    offsets.push(currentOffset);
    addString(
      `4 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`
    );

    offsets.push(currentOffset);
    addString(
      `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`
    );
    addBytes(imgBytes);
    addString("\nendstream\nendobj\n");

    const xrefOffset = currentOffset;
    addString(`xref\n0 6\n0000000000 65535 f \n`);
    for (const off of offsets) {
      addString(off.toString().padStart(10, "0") + " 00000 n \n");
    }
    addString(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

    let totalLen = parts.reduce((acc, p) => acc + p.length, 0);

    if (totalLen < targetBytes) {
      const padLen = targetBytes - totalLen;
      const padText = "\n% " + "0".repeat(Math.max(0, padLen - 4)) + "\n";
      const padU8 = encoder.encode(padText);
      parts.push(padU8);
    }

    return new Blob(parts as BlobPart[], { type: "application/pdf" });
  };

  const handleDownloadPdf = async () => {
    if (!previewCanvasRef.current) return;
    const targetKiloBytes = sizeMode === "default" ? 35 : targetKb;
    const pdfBlob = await createPdfBlob(targetKiloBytes * 1024);
    const link = document.createElement("a");
    link.download = `examsewa_passport_${Math.round(pdfBlob.size / 1024)}kb.pdf`;
    link.href = URL.createObjectURL(pdfBlob);
    link.click();
  };

  const handleShare = async () => {
    if (!previewCanvasRef.current) return;
    const { appliedDpi } = calculateOutputDimensions();
    const targetKiloBytes = sizeMode === "default" ? 35 : targetKb;
    const blob = await getExactJpgBlob(targetKiloBytes * 1024, appliedDpi);
    const file = new File([blob], `passport_${Math.round(blob.size / 1024)}kb_${appliedDpi}dpi.jpg`, { type: "image/jpeg" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: "ExamSewa पासपोर्ट फोटो",
          text: `मेरी पासपोर्ट फोटो (${Math.round(blob.size / 1024)} KB, ${appliedDpi} DPI) - ExamSewa`,
          files: [file],
        });
      } catch {}
    } else {
      handleDownloadJpg();
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pb-12 font-sans">
      <div className="max-w-md mx-auto p-3">
        {step === 1 && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center">
            <div className="mb-4">
              <h1 className="text-xl font-black text-blue-700 tracking-tight mb-1">
                ExamSewa पासपोर्ट फोटो
              </h1>
              <p className="text-xs text-slate-500 font-medium">सरकारी फॉर्म एवं पासपोर्ट के लिए सटीक DPI व KB</p>
            </div>

            {!useCamera ? (
              <div className="space-y-3 pt-2">
                <label className="flex flex-col items-center justify-center p-6 bg-blue-50/50 hover:bg-blue-50 border-2 border-dashed border-blue-400 rounded-2xl cursor-pointer transition">
                  <span className="text-3xl mb-1">📁</span>
                  <span className="text-sm font-bold text-blue-700">गैलरी से फोटो लें</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>

                <button
                  onClick={() => startCamera("user")}
                  className="w-full flex flex-col items-center justify-center p-6 bg-emerald-50/50 hover:bg-emerald-50 border-2 border-dashed border-emerald-400 rounded-2xl transition cursor-pointer"
                >
                  <span className="text-3xl mb-1">📸</span>
                  <span className="text-sm font-bold text-emerald-700">लाइव कैमरा शुरू करें</span>
                </button>
              </div>
            ) : (
              <div className="bg-slate-950 p-3 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-2 px-1">
                  <span className="text-xs font-bold text-slate-300">
                    {cameraFacing === "user" ? "🤳 फ्रंट कैमरा" : "📷 बैक कैमरा"}
                  </span>
                  <button
                    onClick={switchCamera}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold border border-slate-600 flex items-center gap-1 cursor-pointer"
                  >
                    🔄 कैमरा बदलें
                  </button>
                </div>

                <div className="relative w-full rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`w-full h-auto block ${cameraFacing === "user" ? "-scale-x-100" : ""}`}
                  />
                </div>

                <div className="flex justify-between items-center px-2 pt-3">
                  <button onClick={stopCamera} className="text-xs font-bold text-rose-400 hover:underline">
                    रद्द करें
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs shadow-md transition cursor-pointer"
                  >
                    📸 फोटो खींचें
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl p-4 border border-blue-600 shadow-sm">
            <h2 className="text-center font-bold text-blue-800 text-sm mb-3">Crop Face</h2>

            <div
              ref={containerRef}
              className="relative w-full overflow-hidden select-none rounded-lg bg-slate-900 flex items-center justify-center"
              style={{ touchAction: "none" }}
            >
              {imageSrc && (
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop"
                  className="w-full h-auto block pointer-events-none"
                  style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                    transform: `scale(${zoomLevel / 100})`,
                  }}
                />
              )}
              <div
                onPointerDown={onPointerDownMove}
                className="absolute border-2 border-blue-500 cursor-move shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
                style={{
                  left: `${cropBox.x}px`,
                  top: `${cropBox.y}px`,
                  width: `${cropBox.width}px`,
                  height: `${cropBox.height}px`,
                }}
              >
                <div
                  onPointerDown={onPointerDownResize}
                  className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-600 rounded-sm cursor-nwse-resize shadow-md flex items-center justify-center border-2 border-white"
                >
                  <div className="w-1.5 h-1.5 bg-white rounded-xs" />
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3 my-3">
              <button onClick={() => setZoomLevel((z) => Math.min(200, z + 10))} className="p-1.5 border border-slate-200 rounded-lg text-xs">🔍+</button>
              <button onClick={() => setZoomLevel((z) => Math.max(50, z - 10))} className="p-1.5 border border-slate-200 rounded-lg text-xs">🔍-</button>
              <button onClick={() => setActiveTool("brightness")} className={`p-1.5 border rounded-lg text-xs ${activeTool === "brightness" ? "bg-blue-50 border-blue-600 text-blue-700 font-bold" : "border-slate-200"}`}>☀️ ब्राइटनेस</button>
              <button onClick={() => setActiveTool("contrast")} className={`p-1.5 border rounded-lg text-xs ${activeTool === "contrast" ? "bg-blue-50 border-blue-600 text-blue-700 font-bold" : "border-slate-200"}`}>◐ कॉन्ट्रास्ट</button>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 mb-4">
              <input
                type="range"
                min="50"
                max="150"
                value={activeTool === "brightness" ? brightness : contrast}
                onChange={(e) => (activeTool === "brightness" ? setBrightness(Number(e.target.value)) : setContrast(Number(e.target.value)))}
                className="w-full accent-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setStep(1)} className="py-2.5 border-2 border-blue-600 text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-50">↩ Back</button>
              <button onClick={handleSaveAndNext} className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md">↪ Save & Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2.5">
            <div className="bg-slate-100 rounded-2xl p-3 border border-slate-200 shadow-sm flex flex-col items-center justify-center">
              <canvas
                ref={previewCanvasRef}
                style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: "250px" }}
                className="bg-white border border-slate-300 shadow-md rounded-xs block"
              />
            </div>

            {/* नाम और तारीख सेक्शन: डिफ़ॉल्ट रूप से अनचेक */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={nameDate.enabled}
                  onChange={(e) => setNameDate({ ...nameDate, enabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600"
                />
                <span className="text-xs font-bold text-slate-800">फोटो पर नाम और तारीख जोड़ें</span>
              </label>

              {nameDate.enabled && (
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={nameDate.name}
                      onChange={(e) => setNameDate({ ...nameDate, name: e.target.value })}
                      className="text-xs font-bold p-1.5 border border-slate-200 rounded-lg bg-slate-50/50 placeholder:text-slate-400 placeholder:italic"
                      placeholder="YOUR NAME"
                    />
                    <input
                      type="text"
                      value={nameDate.date}
                      onChange={(e) => setNameDate({ ...nameDate, date: e.target.value })}
                      className="text-xs font-bold p-1.5 border border-slate-200 rounded-lg bg-slate-50/50"
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-0.5">
                      <span>अक्षर साइज़ (Font Size)</span>
                      <span className="text-blue-600 font-black">{nameDate.fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="28"
                      value={nameDate.fontSize}
                      onChange={(e) => setNameDate({ ...nameDate, fontSize: Number(e.target.value) })}
                      className="w-full accent-blue-600 h-1.5"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* फोटो साइज़ सेटिंग्स */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span className="text-xs font-bold text-slate-800">फोटो साइज़ सेटिंग्स</span>
                <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    onClick={() => setSizeMode("default")}
                    className={`px-2.5 py-0.5 rounded transition ${sizeMode === "default" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600"}`}
                  >
                    डिफ़ॉल्ट
                  </button>
                  <button
                    onClick={() => setSizeMode("custom")}
                    className={`px-2.5 py-0.5 rounded transition ${sizeMode === "custom" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600"}`}
                  >
                    कस्टम
                  </button>
                </div>
              </div>

              {sizeMode === "default" ? (
                <div className="text-center py-1">
                  <div className="text-xs font-black text-blue-900">3.5 × 4.5 cm @ 300 DPI (~35 KB)</div>
                  <div className="text-[10px] text-slate-500">सभी भारतीय सरकारी फॉर्म्स का मानक (20-50 KB)</div>
                </div>
              ) : (
                <div className="space-y-2 pt-0.5">
                  <div className="grid grid-cols-4 gap-1.5">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 block mb-0.5">इकाई</span>
                      <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value as UnitType)}
                        className="w-full text-xs font-bold p-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
                      >
                        <option value="px">Px</option>
                        <option value="cm">CM</option>
                        <option value="mm">MM</option>
                        <option value="inch">Inch</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 block mb-0.5">चौड़ाई</span>
                      <input
                        type="number"
                        step="any"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(Number(e.target.value))}
                        className="w-full text-xs font-bold p-1.5 border border-slate-200 rounded-lg bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 block mb-0.5">ऊँचाई</span>
                      <input
                        type="number"
                        step="any"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(Number(e.target.value))}
                        className="w-full text-xs font-bold p-1.5 border border-slate-200 rounded-lg bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 block mb-0.5">DPI</span>
                      <input
                        type="number"
                        value={dpi}
                        onChange={(e) => setDpi(Number(e.target.value))}
                        className="w-full text-xs font-black p-1.5 border border-blue-400 rounded-lg bg-blue-50/40 text-blue-900 text-center"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                      <span>फ़ाइल साइज़ (Exact KB):</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="10"
                          max="500"
                          value={targetKb}
                          onChange={(e) => setTargetKb(Math.max(10, Math.min(500, Number(e.target.value))))}
                          className="w-14 text-center font-black text-xs text-blue-700 bg-white border border-blue-300 rounded px-1 py-0.5"
                        />
                        <span className="text-blue-700 font-black">KB</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="500"
                      value={targetKb}
                      onChange={(e) => setTargetKb(Number(e.target.value))}
                      className="w-full accent-blue-600 h-1.5 cursor-pointer"
                    />
                    <div className="flex justify-between text-[8px] font-bold text-slate-400">
                      <span>10 KB</span>
                      <span>100 KB</span>
                      <span>250 KB</span>
                      <span>500 KB</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                onClick={() => setStep(2)}
                className="py-2.5 border border-slate-300 bg-white text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 flex items-center justify-center"
              >
                ↩ Back
              </button>
              <button
                onClick={handleDownloadJpg}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1"
              >
                📥 JPG
              </button>
              <button
                onClick={handleDownloadPdf}
                className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1"
              >
                📄 PDF
              </button>
              <button
                onClick={handleShare}
                className="py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1"
              >
                ↗️ शेयर
              </button>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
