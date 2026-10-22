"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";

interface PageItem {
  id: string;
  dataUrl: string;
  name: string;
  width: number;
  height: number;
  rotation: number; // 0, 90, 180, 270
}

type PresetMode = "auto" | "original" | "custom";

export default function JpgToPdfPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [margin, setMargin] = useState<number>(0); // 0, 5, 10 mm
  
  // साइज़ सेटिंग्स
  const [sizeMode, setSizeMode] = useState<PresetMode>("auto");
  const [customKb, setCustomKb] = useState<number>(200);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>("");
  const [lastGeneratedPdfBlob, setLastGeneratedPdfBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const addMoreInputRef = useRef<HTMLInputElement | null>(null);

  // प्रभावी टारगेट KB
  const effectiveTargetKb = (): number => {
    if (sizeMode === "auto") return 400;
    if (sizeMode === "original") return 99999;
    return customKb;
  };

  const currentDisplayKb = lastGeneratedPdfBlob 
    ? `${Math.round(lastGeneratedPdfBlob.size / 1024)} KB` 
    : (sizeMode === "original" ? "मूल/HD" : `~${effectiveTargetKb()} KB`);

  // === CAMERA & 4-CORNER MAGNIFIER CROP SYSTEM ===
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [activeCorner, setActiveCorner] = useState<number | null>(null);
  const [corners, setCorners] = useState<{ x: number; y: number }[]>([
    { x: 10, y: 10 },
    { x: 90, y: 10 },
    { x: 90, y: 90 },
    { x: 10, y: 90 }
  ]);

  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const cropImageRef = useRef<HTMLImageElement | null>(null);

  const startCamera = async () => {
    setCameraError("");
    setCameraModalOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });
      cameraStreamRef.current = stream;
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        cameraVideoRef.current.play();
      }
    } catch (err) {
      setCameraError("कैमरा चालू करने की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग्स में कैमरा अनुमति दें।");
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    }
    setCameraModalOpen(false);
  };

  const capturePhoto = () => {
    if (!cameraVideoRef.current) return;
    const v = cameraVideoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth || 1280;
    canvas.height = v.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    stopCamera();
    setCapturedImage(dataUrl);
    setCorners([
      { x: 10, y: 10 },
      { x: 90, y: 10 },
      { x: 90, y: 90 },
      { x: 10, y: 90 }
    ]);
    setCropModalOpen(true);
  };

  const handlePointerDown = (index: number) => {
    setActiveCorner(index);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeCorner === null || !cropImageRef.current) return;
    const rect = cropImageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setCorners(prev => {
      const updated = [...prev];
      updated[activeCorner] = { x, y };
      return updated;
    });
  };

  const handlePointerUp = () => {
    setActiveCorner(null);
  };

  const applyCropAndFitA4 = () => {
    if (!capturedImage) return;
    const img = new Image();
    img.src = capturedImage;
    img.onload = () => {
      const minX = Math.min(...corners.map(c => c.x)) * (img.width / 100);
      const maxX = Math.max(...corners.map(c => c.x)) * (img.width / 100);
      const minY = Math.min(...corners.map(c => c.y)) * (img.height / 100);
      const maxY = Math.max(...corners.map(c => c.y)) * (img.height / 100);

      const cropW = Math.max(10, maxX - minX);
      const cropH = Math.max(10, maxY - minY);

      const canvas = document.createElement("canvas");
      // A4 मानक रिज़ॉल्यूशन (300 DPI - 2480 x 3508)
      const a4Width = 2480;
      const a4Height = 3508;
      canvas.width = a4Width;
      canvas.height = a4Height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // सफ़ेद A4 बैकग्राउंड
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, a4Width, a4Height);

      // दस्तावेज़ को A4 के अंदर फिट और केंद्रित करना
      const margin = 100;
      const printableW = a4Width - margin * 2;
      const printableH = a4Height - margin * 2;

      const scale = Math.min(printableW / cropW, printableH / cropH);
      const drawW = cropW * scale;
      const drawH = cropH * scale;
      const offsetX = margin + (printableW - drawW) / 2;
      const offsetY = margin + (printableH - drawH) / 2;

      ctx.drawImage(img, minX, minY, cropW, cropH, offsetX, offsetY, drawW, drawH);

      const finalA4DataUrl = canvas.toDataURL("image/jpeg", 0.92);
      const newPage: PageItem = {
        id: "page-" + Date.now(),
        dataUrl: finalA4DataUrl,
        name: `Camera_Doc_${pages.length + 1}.jpg`,
        width: a4Width,
        height: a4Height
      };

      setPages(prev => [...prev, newPage]);
      setCropModalOpen(false);
      setCapturedImage(null);
    };
  };


  // फ़ाइलें लोड करना
  const handleFiles = (files: FileList | null, isAppend = false) => {
    if (!files || files.length === 0) return;

    const currentTotal = isAppend ? pages.length : 0;
    const remainingSlots = 50 - currentTotal;

    if (remainingSlots <= 0) {
      alert("अधिकतम 50 पेज की सीमा पूरी हो चुकी है। आप 50 से अधिक पेज नहीं जोड़ सकते।");
      return;
    }

    let fileArr = Array.from(files);
    if (fileArr.length > remainingSlots) {
      alert(`अधिकतम 50 पेज ही जोड़े जा सकते हैं। केवल पहले ${remainingSlots} पेज जोड़े जा रहे हैं।`);
      fileArr = fileArr.slice(0, remainingSlots);
    }

    const newItems: PageItem[] = [];
    let loadedCount = 0;

    fileArr.forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          newItems.push({
            id: Math.random().toString(36).substring(2, 9),
            dataUrl,
            name: file.name,
            width: img.width,
            height: img.height,
          });
          loadedCount++;
          if (loadedCount === fileArr.length) {
            setPages((prev) => (isAppend ? [...prev, ...newItems] : newItems));
            setLastGeneratedPdfBlob(null);
          }
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // पन्नों का क्रम बदलना (बटन द्वारा - 100% सुरक्षित)
  const movePage = (index: number, direction: "left" | "right") => {
    const targetIdx = direction === "left" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= pages.length) return;

    const updated = [...pages];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setPages(updated);
    setLastGeneratedPdfBlob(null);
  };

  // iLovePDF जैसा स्मूथ रियल-टाइम कार्ड स्वैप
  const handleDragHoverSwap = (targetIndex: number) => {
    if (draggedIdx === null || draggedIdx === targetIndex) return;

    const updated = [...pages];
    const [movedItem] = updated.splice(draggedIdx, 1);
    updated.splice(targetIndex, 0, movedItem);

    setPages(updated);
    setDraggedIdx(targetIndex);
    setDragOverIdx(targetIndex);
    setLastGeneratedPdfBlob(null);
  };

  // पन्ना हटाना
    // 90 डिग्री रोटेट फ़ंक्शन
  const rotatePage = (id: string) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextRotation = ((p.rotation || 0) + 90) % 360;
          return { ...p, rotation: nextRotation };
        }
        return p;
      })
    );
    setLastGeneratedPdfBlob(null);
  };

  const removePage = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
    setLastGeneratedPdfBlob(null);
  };

  // jsPDF लोड करना
  const loadJsPdf = async (): Promise<any> => {
    if ((window as any).jspdf) return (window as any).jspdf.jsPDF;
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = () => resolve((window as any).jspdf.jsPDF);
      script.onerror = () => reject(new Error("PDF इंजन लोड नहीं हो सका"));
      document.body.appendChild(script);
    });
  };

  // हाई-क्वालिटी टेक्स्ट शार्पनिंग व लो-साइज एल्गोरिदम
  // iLovePDF 150 DPI मानक A4 इंजन (1240x1754 px, ~300KB प्रति पेज, 100% क्रिस्प टेक्स्ट)
  // A4 स्मार्ट ऑप्टिमाइज़ेशन इंजन (रोटेशन + 85% हाई-शार्पनेस)
  // तीनों मोड्स के लिए अलग और सटीक इंजन
  const optimizePage = (
    dataUrl: string,
    qualityFactor: number,
    maxDim: number,
    rotation: number = 0,
    isOriginalMode: boolean = false
  ): Promise<{ dataUrl: string; width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const rad = ((rotation % 360) * Math.PI) / 180;
        const isSwapped = (rotation % 180) !== 0;

        // 1. मैक्स HD (ओरिजिनल): बिना रोटेशन के 100% मूल फाइल बाइट्स (Zero Loss)
        if (isOriginalMode && rotation % 360 === 0) {
          resolve({
            dataUrl: dataUrl,
            width: img.width,
            height: img.height,
          });
          return;
        }

        let w = img.width;
        let h = img.height;

        if (!isOriginalMode && maxDim > 0) {
          const scale = Math.min(maxDim / w, (maxDim * 1.414) / h, 1.0);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }

        const canvas = document.createElement("canvas");
        canvas.width = isSwapped ? h : w;
        canvas.height = isSwapped ? w : h;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) {
          resolve({ dataUrl, width: w, height: h });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rad);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        ctx.restore();

        const finalQ = isOriginalMode ? 0.99 : (qualityFactor || 0.84);
        resolve({
          dataUrl: canvas.toDataURL("image/jpeg", finalQ),
          width: canvas.width,
          height: canvas.height,
        });
      };
      img.src = dataUrl;
    });
  };

  // संयुक्त PDF बनाना
  const buildPdfDocument = async (quality: number, maxDim: number, isOriginalMode: boolean = false) => {
    const JsPDF = await loadJsPdf();
    const isPortrait = orientation === "portrait";
    const doc = new JsPDF({
      orientation: isPortrait ? "p" : "l",
      unit: "mm",
      format: "a4",
      compress: !isOriginalMode,
    });

    const pageWidth = isPortrait ? 210 : 297;
    const pageHeight = isPortrait ? 297 : 210;
    const availWidth = pageWidth - margin * 2;
    const availHeight = pageHeight - margin * 2;

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) doc.addPage("a4", isPortrait ? "p" : "l");
      const page = pages[i];
      const { dataUrl: optData, width: curW, height: curH } = await optimizePage(
        page.dataUrl,
        quality,
        maxDim,
        page.rotation || 0,
        isOriginalMode
      );

      const imgRatio = curW / curH;
      const boxRatio = availWidth / availHeight;
      let drawW = availWidth;
      let drawH = availHeight;

      if (imgRatio > boxRatio) {
        drawW = availWidth;
        drawH = availWidth / imgRatio;
      } else {
        drawH = availHeight;
        drawW = availHeight * imgRatio;
      }

      const posX = margin + (availWidth - drawW) / 2;
      const posY = margin + (availHeight - drawH) / 2;

      doc.addImage(optData, "JPEG", posX, posY, drawW, drawH, undefined, "SLOW");
    }

    const pdfBlob = doc.output("blob") as Blob;
    return { doc, pdfBlob };
  };

  // पक्का साइज़ कंट्रोल और जनरेट करना
  const handleProcessPdf = async (autoDownload = true): Promise<Blob | null> => {
    if (pages.length === 0) return null;
    setIsProcessing(true);
    setProgressMsg("प्रोसेसिंग...");

    try {
      let result;

      // MODE 1: मैक्स HD (ओरिजिनल - 100% ओरिजिनल पिक्सल)
      if (sizeMode === "original") {
        setProgressMsg("मैक्स HD तैयार हो रहा है...");
        result = await buildPdfDocument(1.0, 0, true);
      } 
      // MODE 2: डिफ़ॉल्ट (स्मार्ट A4 - 150 DPI क्रिस्प टेक्स्ट)
      else if (sizeMode === "auto") {
        setProgressMsg("डिफ़ॉल्ट स्मार्ट A4 तैयार हो रहा है...");
        result = await buildPdfDocument(0.72, 1280, false);
      } 
      // MODE 3: कस्टम (टारगेट KB स्लाइडर)
      else {
        const maxLimit = customKb;
        const perPageKb = maxLimit / pages.length;
        let maxDim = 1500;
        let quality = 0.75;

        if (perPageKb < 30) {
          maxDim = 950;
          quality = 0.35;
        } else if (perPageKb < 60) {
          maxDim = 1150;
          quality = 0.50;
        } else if (perPageKb < 100) {
          maxDim = 1350;
          quality = 0.65;
        }

        result = await buildPdfDocument(quality, maxDim, false);
        let sizeKb = Math.round(result.pdfBlob.size / 1024);

        if (sizeKb > maxLimit) {
          setProgressMsg("साइज़ सेट हो रहा है...");
          let attempts = 0;
          while (sizeKb > maxLimit && attempts < 3) {
            attempts++;
            quality = Math.max(0.20, quality * (maxLimit / sizeKb) * 0.92);
            if (attempts > 1) maxDim = Math.max(800, Math.round(maxDim * 0.88));
            result = await buildPdfDocument(quality, maxDim, false);
            sizeKb = Math.round(result.pdfBlob.size / 1024);
          }
        }
      }

      const blobUrl = URL.createObjectURL(result.pdfBlob);
      setLastGeneratedPdfBlob(result.pdfBlob);

      if (autoDownload) {
        const a = document.createElement("a");
        a.href = blobUrl;
        const downloadName = `ExamSewa-${pages.length}pages-${Math.round(result.pdfBlob.size / 1024)}kb.pdf`;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      return result.pdfBlob;

    } catch (err) {
      console.error(err);
      alert("PDF बनाने में त्रुटि हुई। कृपया पुनः प्रयास करें।");
      return null;
    } finally {
      setIsProcessing(false);
      setProgressMsg("");
    }
  };

  // वेब शेयर फ़ंक्शन
  const handleSharePdf = async () => {
    let blobToShare = lastGeneratedPdfBlob;
    if (!blobToShare) {
      blobToShare = await handleProcessPdf(false);
    }
    if (!blobToShare) return;

    const file = new File(
      [blobToShare],
      `ExamSewa-Document-${pages.length}-pages.pdf`,
      { type: "application/pdf" }
    );

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "ExamSewa A4 PDF",
          text: `ExamSewa से तैयार A4 PDF (${pages.length} पेज, ${Math.round(blobToShare.size / 1024)} KB)`,
        });
      } catch (e) {
        console.log("शेयर रद्द");
      }
    } else {
      alert("आपके डिवाइस में डायरेक्ट शेयरिंग समर्थित नहीं है। कृपया डाउनलोड बटन का उपयोग करें।");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-3 sm:py-6 px-2 sm:px-4 text-slate-800 select-none">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* हेडर */}
        <div className="flex items-center justify-between gap-2 bg-white px-3 sm:px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs">
          <Link
            href="/"
            className="shrink-0 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-300 transition-all"
            title="होमपेज पर जाएँ"
          >
            ← होम
          </Link>
          <div className="text-center min-w-0">
            <h1 className="text-sm sm:text-lg font-black text-slate-900 truncate">
              JPG to PDF Converter
            </h1>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              तस्वीरों को क्रमबद्ध करके मानक A4 PDF में बदलें
            </p>
          </div>
          <span className="shrink-0 text-[10px] sm:text-xs font-bold bg-blue-50 text-blue-700 px-2 sm:px-2.5 py-1 rounded-full border border-blue-200 whitespace-nowrap">
            A4 सरकारी PDF
          </span>
        </div>

        {/* खाली अपलोड कार्ड */}
        {pages.length === 0 && (
          <div className="w-full max-w-4xl mx-auto space-y-4">
            {/* मुख्य आधुनिक अपलोड बॉक्स */}
            <div className="bg-white border-2 border-dashed border-blue-400 rounded-3xl p-6 sm:p-10 text-center shadow-sm relative overflow-hidden">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFiles(e.target.files, false)}
                className="hidden"
              />

              {/* ग्राफिक इलस्ट्रेशन */}
              <div className="relative mb-4 flex items-center justify-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-blue-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="absolute -left-4 sm:left-1/4 bottom-0 bg-white p-1 rounded-xl shadow-md border border-slate-100 -rotate-12">
                  <div className="w-10 h-8 sm:w-12 sm:h-9 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-xs">
                    🖼️
                  </div>
                </div>
                <div className="absolute -right-4 sm:right-1/4 bottom-0 bg-white p-1 rounded-xl shadow-md border border-slate-100 rotate-12">
                  <div className="w-10 h-8 sm:w-12 sm:h-9 bg-rose-500 rounded-lg flex items-center justify-center text-white text-[10px] font-black">
                    PDF
                  </div>
                </div>
              </div>

              {/* शीर्षक एवं विवरण */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">
                तस्वीरें चुनें या यहाँ खींच कर छोड़ें
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-lg mx-auto mb-6">
                मार्कशीट, पहचान पत्र, दस्तावेज़ या कई फ़ोटो एक साथ जोड़ें (JPG, JPEG, PNG)
              </p>

              {/* डुअल एक्शन बटन */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-lg mx-auto">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:flex-1 py-3 px-6 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-green-600/25 flex items-center justify-between gap-3 transition"
                >
                  <span className="flex items-center gap-2 text-sm sm:text-base">
                    📁 फ़ाइल चुनें
                  </span>
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                    ➔
                  </span>
                </button>

                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full sm:flex-1 py-3 px-6 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-slate-800/25 flex items-center justify-center gap-2 text-sm sm:text-base transition"
                >
                  📷 कैमरा से फ़ोटो लें
                </button>
              </div>

              {/* 4 फ़ीचर कार्ड्स */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-8 pt-6 border-t border-slate-100">
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 flex items-center gap-2 text-left">
                  <span className="text-xl">📚</span>
                  <div className="leading-tight">
                    <span className="text-xs font-bold text-slate-800 block">एक साथ</span>
                    <span className="text-[10px] text-slate-500">कई फ़ोटो</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 flex items-center gap-2 text-left">
                  <span className="text-xl">🖼️</span>
                  <div className="leading-tight">
                    <span className="text-xs font-bold text-slate-800 block">JPG • JPEG</span>
                    <span className="text-[10px] text-slate-500">• PNG</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 flex items-center gap-2 text-left">
                  <span className="text-xl">📄</span>
                  <div className="leading-tight">
                    <span className="text-xs font-bold text-slate-800 block">A4 सरकारी</span>
                    <span className="text-[10px] text-slate-500">मानक PDF</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 flex items-center gap-2 text-left">
                  <span className="text-xl">🛡️</span>
                  <div className="leading-tight">
                    <span className="text-xs font-bold text-slate-800 block">100% सुरक्षित</span>
                    <span className="text-[10px] text-slate-500">और निजी</span>
                  </div>
                </div>
              </div>

              {/* सुरक्षा नोट */}
              <div className="mt-4 pt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
                <span className="text-emerald-600">✓</span>
                <span>आपकी फ़ाइलें आपके डिवाइस में ही सुरक्षित रहती हैं और कहीं अपलोड नहीं होती हैं।</span>
              </div>
            </div>

            {/* बॉटम टैगलाइन */}
            <p className="text-center text-xs text-slate-400 font-serif italic tracking-wider">
              — Fast • Simple • Secure —
            </p>
          </div>
        )}

        {pages.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* बायाँ हिस्सा: ग्रिड */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  कुल पेज: <span className="text-blue-600 font-black text-sm">{pages.length}</span> / 50
                </span>

                <div className="flex items-center gap-2">
                  <input
                    ref={addMoreInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFiles(e.target.files, true)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={pages.length >= 50}
                    onClick={() => addMoreInputRef.current?.click()}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-bold text-xs border border-blue-200 flex items-center gap-1 cursor-pointer"
                  >
                    <span>➕</span> और जोड़ें
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPages([]); setLastGeneratedPdfBlob(null); }}
                    className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold text-xs border border-rose-200 cursor-pointer"
                  >
                    ← वापस
                  </button>
                </div>
              </div>

              {/* स्क्रॉल बॉक्स: डेस्कटॉप पर 18 कार्ड्स (6x3) व मोबाइल पर 6-8 कार्ड्स */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {pages.map((page, idx) => (
                  <div
                    key={page.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggedIdx(idx);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnter={() => handleDragHoverSwap(idx)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                    }}
                    onDragEnd={() => setDraggedIdx(null)}
                    className={`group bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 hover:shadow-md rounded-xl p-1 relative flex flex-col justify-center select-none cursor-grab active:cursor-grabbing transition-all duration-150 ${
                      draggedIdx === idx ? "opacity-30 border-2 border-dashed border-blue-500 scale-95" : ""
                    }`}
                  >
                    {/* मुख्य प्रीव्यू बॉक्स जिसमें सारे बटन ऊपर ही तैरेंगे */}
                    <div className="relative w-full aspect-[1/1.35] bg-slate-50 rounded-lg border border-slate-100 overflow-hidden flex items-center justify-center p-1">
                      
                      {/* फोटो */}
                      <img
                        src={page.dataUrl}
                        alt={`पेज ${idx + 1}`}
                        style={{ transform: `rotate(${page.rotation || 0}deg)`, transition: "transform 0.2s ease-out" }}
                        className="max-h-full max-w-full object-contain pointer-events-none"
                      />



                      {/* ऊपर दाएँ: रोटेट व डिलीट बटन */}
                      <div className="absolute top-1.5 right-1.5 z-20 flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150">
                        {/* रोटेशन बटन (iLovePDF स्टाइल SVG आइकॉन) */}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); rotatePage(page.id); }}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-white/90 text-slate-600 border border-slate-300 shadow-sm hover:bg-red-600 hover:text-white hover:border-red-600 cursor-pointer active:scale-90 transition-all duration-150"
                          title="पेज घुमाएँ (Rotate)"
                        >
                          <svg className="w-3.5 h-3.5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                          </svg>
                        </button>

                        {/* क्लोज / डिलीट बटन (iLovePDF स्टाइल) */}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removePage(page.id); }}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-white/90 text-slate-600 border border-slate-300 shadow-sm hover:bg-red-600 hover:text-white hover:border-red-600 cursor-pointer active:scale-90 transition-all duration-150"
                          title="पेज हटाएँ (Delete)"
                        >
                          <svg className="w-3.5 h-3.5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* दायाँ हिस्सा: सेटिंग्स शेल्फ़ */}
            <div className="lg:col-span-4 bg-white border-2 border-slate-900 rounded-2xl p-3.5 sm:p-4 shadow-md space-y-4">
              
              <div className="border-b pb-1.5 flex justify-between items-center">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  PDF सेटिंग्स (Controls)
                </span>
                <span className="text-[11px] font-bold text-slate-500">A4 मानक</span>
              </div>

              {/* 1. ओरिएंटेशन */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  पेज लेआउट (Orientation):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setOrientation("portrait"); setLastGeneratedPdfBlob(null); }}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      orientation === "portrait"
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>📄</span> Portrait (खड़ा)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOrientation("landscape"); setLastGeneratedPdfBlob(null); }}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      orientation === "landscape"
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>📃</span> Landscape (आड़ा)
                  </button>
                </div>
              </div>

              {/* 2. मार्जिन */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  पेज मार्जिन:
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  {[
                    { label: "0mm (पूर्ण)", val: 0 },
                    { label: "5mm (छोटा)", val: 5 },
                    { label: "10mm (बड़ा)", val: 10 },
                  ].map((m) => (
                    <button
                      key={m.val}
                      type="button"
                      onClick={() => { setMargin(m.val); setLastGeneratedPdfBlob(null); }}
                      className={`py-1.5 font-bold rounded-lg border text-center transition cursor-pointer ${
                        margin === m.val
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. क्वालिटी व साइज़ मोड (3 Clean Modes) */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-800 block">
                  क्वालिटी व साइज़ मोड:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSizeMode("auto")}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      sizeMode === "auto"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    <span className="text-sm">⚡</span>
                    <span>डिफ़ॉल्ट</span>
                    <span className={`text-[9px] font-normal ${sizeMode === "auto" ? "text-blue-100" : "text-slate-400"}`}>
                      स्मार्ट कंप्रेस
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSizeMode("original")}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      sizeMode === "original"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    <span className="text-sm">⭐</span>
                    <span>मैक्स HD</span>
                    <span className={`text-[9px] font-normal ${sizeMode === "original" ? "text-blue-100" : "text-slate-400"}`}>
                      ओरिजिनल
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSizeMode("custom")}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      sizeMode === "custom"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    <span className="text-sm">🎯</span>
                    <span>कस्टम</span>
                    <span className={`text-[9px] font-normal ${sizeMode === "custom" ? "text-blue-100" : "text-slate-400"}`}>
                      KB स्लाइडर
                    </span>
                  </button>
                </div>

                {sizeMode === "custom" && (
                  <div className="pt-2 p-3 bg-blue-50/70 rounded-xl border border-blue-100 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700">टारगेट साइज़ चुनें:</span>
                      <span className="text-blue-700 font-black text-sm bg-white px-2 py-0.5 rounded-lg border border-blue-200">
                        {customKb} KB
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={1000}
                      step={10}
                      value={customKb}
                      onChange={(e) => setCustomKb(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                      <span>10 KB</span>
                      <span>500 KB</span>
                      <span>1000 KB</span>
                    </div>

                    {/* डायनामिक सुझाव मैसेज */}
                    {pages.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-blue-200/60 text-[11px] leading-tight">
                        {customKb / pages.length < 70 ? (
                          <p className="text-amber-800 font-medium flex items-start gap-1">
                            <span>💡</span>
                            <span>
                              <b>सुझाव:</b> {pages.length} पेजों के बेहतर टेक्स्ट हेतु कम से कम <b>~{pages.length * 80} KB</b> या <b>डिफ़ॉल्ट मोड</b> चुनें। अधिक कम करने पर टेक्स्ट हल्का पड़ सकता है।
                            </span>
                          </p>
                        ) : (
                          <p className="text-emerald-700 font-medium flex items-center gap-1">
                            <span>✓</span>
                            <span>{pages.length} पेजों के लिए यह साइज़ बिल्कुल संतुलित व पढ़ने योग्य रहेगा।</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 4. एक ही लाइन में दोनों बटन (डाउनलोड और शेयर) */}
              <div className="pt-2 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  
                  {/* डाउनलोड बटन */}
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleProcessPdf(true)}
                    className={`sm:col-span-7 py-3 px-2 rounded-xl font-black text-xs sm:text-sm text-white shadow-md flex items-center justify-center gap-1.5 transition transform active:scale-95 cursor-pointer ${
                      isProcessing
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {isProcessing ? (
                      <span>⏳ {progressMsg}</span>
                    ) : (
                      <>
                        <span>📥</span>
                        <span>डाउनलोड PDF</span>
                        <span className="bg-emerald-800 text-emerald-100 text-[10px] px-1.5 py-0.5 rounded font-bold ml-0.5">
                          {currentDisplayKb}
                        </span>
                      </>
                    )}
                  </button>

                  {/* शेयर बटन */}
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleSharePdf}
                    className="sm:col-span-5 py-3 px-2 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <span>🔗</span>
                    <span>शेयर करें</span>
                  </button>

                </div>

                {lastGeneratedPdfBlob && (
                  <p className="text-center text-[11px] font-bold text-emerald-700 bg-emerald-50 py-1 rounded-lg border border-emerald-200">
                    ✓ फ़ाइल साइज़: {Math.round(lastGeneratedPdfBlob.size / 1024)} KB (डाउनलोड संपन्न)
                  </p>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    
      {/* 1. लाइव कैमरा मॉडल */}
      {cameraModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-between p-4">
          <div className="w-full max-w-md flex justify-between items-center text-white pt-2">
            <span className="font-semibold text-lg">दस्तावेज़ की फ़ोटो लें</span>
            <button onClick={stopCamera} className="text-2xl px-2">✕</button>
          </div>

          <div className="relative w-full max-w-md flex-1 flex items-center justify-center overflow-hidden my-2 rounded-2xl bg-black">
            <video ref={cameraVideoRef} playsInline autoPlay className="w-full h-full object-cover rounded-2xl" />
            <div className="absolute inset-6 border-2 border-dashed border-white/50 pointer-events-none rounded-lg" />
          </div>

          {cameraError && (
            <div className="text-red-400 text-sm mb-2 bg-red-950/60 px-3 py-1.5 rounded-lg border border-red-800">
              {cameraError}
            </div>
          )}

          <div className="w-full max-w-md flex justify-around items-center pb-6">
            <button onClick={stopCamera} className="text-white px-4 py-2 rounded-lg bg-white/20 text-sm">रद्द करें</button>
            <button
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full bg-green-600 border-4 border-white shadow-lg active:scale-90 transition flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full border-2 border-white/40" />
            </button>
            <div className="w-12" />
          </div>
        </div>
      )}

      {/* 2. 4-कॉर्नर मैग्नीफायर लेंस क्रॉप मॉडल */}
      {cropModalOpen && capturedImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950 flex flex-col select-none touch-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div className="flex justify-between items-center px-4 py-3 bg-slate-900 border-b border-slate-800 text-white">
            <div>
              <h3 className="font-bold text-base">कोने सेट करें (Smart Crop)</h3>
              <p className="text-xs text-slate-400">दस्तावेज़ के 4 कोनों को खींचकर सही जगह रखें</p>
            </div>
            <button onClick={() => setCropModalOpen(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
          </div>

          {/* मैग्नीफायर ज़ूम लेंस (जब कोई कोना खींचा जा रहा हो) */}
          {activeCorner !== null && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 w-16 h-16 rounded-full border-2 border-green-500 overflow-hidden shadow-2xl bg-black pointer-events-none">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `url(${capturedImage})`,
                  backgroundPosition: `${corners[activeCorner].x}% ${corners[activeCorner].y}%`,
                  backgroundSize: "600%",
                  backgroundRepeat: "no-repeat"
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 border-t-2 border-l-2 border-green-500 -translate-x-0.5 -translate-y-0.5" />
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              </div>
            </div>
          )}

          {/* इमेज व्यूअर व कॉर्नर हैंडलर */}
          <div className="flex-1 relative flex items-center justify-center p-4 bg-black/60 overflow-hidden">
            <div className="relative inline-block max-w-full max-h-[70vh]">
              <img
                ref={cropImageRef}
                src={capturedImage}
                alt="Captured document"
                className="max-w-full max-h-[70vh] object-contain rounded select-none pointer-events-none"
              />

              {/* चारों कोनों को जोड़ने वाली स्पष्ट हरी लाइन */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible" style={{ width: "100%", height: "100%" }}>
                <polygon
                  points={corners.map(c => `${c.x * (cropImageRef.current?.clientWidth || 0) / 100},${c.y * (cropImageRef.current?.clientHeight || 0) / 100}`).join(" ")}
                  fill="rgba(34, 197, 94, 0.18)"
                  stroke="#22c55e"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
              </svg>

              {/* 4 कॉर्नर हैंडल्स */}
              {corners.map((corner, i) => (
                <div
                  key={i}
                  onPointerDown={() => handlePointerDown(i)}
                  style={{ left: `${corner.x}%`, top: `${corner.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white shadow-xl cursor-grab active:cursor-grabbing flex items-center justify-center z-20 transition-transform ${
                    activeCorner === i ? "bg-green-500 scale-125" : "bg-green-600"
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-white shadow-xs"></div>
                </div>
              ))}
            </div>
          </div>

          {/* एक्शन बार */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                setCropModalOpen(false);
                startCamera();
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800"
            >
              दोबारा फ़ोटो लें
            </button>
            <button
              onClick={applyCropAndFitA4}
              className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-red-700 text-white text-sm font-semibold shadow-lg active:scale-95 transition flex items-center gap-1.5"
            >
              ✓ क्रॉप कर A4 में जोड़ें
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
