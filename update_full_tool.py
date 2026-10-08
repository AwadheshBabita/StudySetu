code = r'''"use client";

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import Link from "next/link";

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

type AspectPreset = "free" | "1:1" | "passport" | "4:6" | "5:7" | "8:10" | "signature" | "card" | "a4";
type EditorMode = "photo" | "document";

export default function PhotoDocEditorPage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [step, setStep] = useState<"upload" | "crop" | "editor">("upload");
  const [editorMode, setEditorMode] = useState<EditorMode>("photo");

  const [imgUrl, setImgUrl] = useState<string>("");
  const [fileName, setFileName] = useState<string>("photo");
  const [croppedUrl, setCroppedUrl] = useState<string>("");
  const [bgRemovedUrl, setBgRemovedUrl] = useState<string | null>(null);

  // Crop Box & Preset States
  const [preset, setPreset] = useState<AspectPreset>("passport");
  const [photoOrientation, setPhotoOrientation] = useState<"portrait" | "landscape">("portrait");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [crop, setCrop] = useState<CropRect>({ x: 10, y: 10, w: 80, h: 80 });

  // Adjustments
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [isAutoEnhanced, setIsAutoEnhanced] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [isBw, setIsBw] = useState<boolean>(false);

  // Photo Mode Specifics
  const [bgColor, setBgColor] = useState<string>("transparent");
  const [hasBorder, setHasBorder] = useState<boolean>(false);
  const [enableStamp, setEnableStamp] = useState<boolean>(false);
  const [candidateName, setCandidateName] = useState<string>("");
  const [dopDate, setDopDate] = useState<string>("");

  // AI Bg State
  const [isRemovingBg, setIsRemovingBg] = useState<boolean>(false);

  // Quality & KB States
  const [kbMode, setKbMode] = useState<"hd" | "custom">("hd");
  const [customKb, setCustomKb] = useState<number>(50);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    type: string | null;
    startX: number;
    startY: number;
    cropStart: CropRect;
  }>({ type: null, startX: 0, startY: 0, cropStart: { x: 0, y: 0, w: 0, h: 0 } });

  useEffect(() => {
    setMounted(true);
    const today = new Date().toISOString().split("T")[0];
    setDopDate(today);
  }, []);

  const activeDisplayImg = bgRemovedUrl || croppedUrl;

  const getPresetRatio = (p: AspectPreset): string => {
    if (p === "passport") return "3.5 / 4.5";
    if (p === "4:6") return photoOrientation === "portrait" ? "4 / 6" : "6 / 4";
    if (p === "5:7") return photoOrientation === "portrait" ? "5 / 7" : "7 / 5";
    if (p === "8:10") return photoOrientation === "portrait" ? "8 / 10" : "10 / 8";
    if (p === "signature") return "3.5 / 1.5";
    if (p === "card") return "8.5 / 5.5";
    if (p === "a4") return photoOrientation === "portrait" ? "210 / 297" : "297 / 210";
    if (p === "1:1") return "1 / 1";
    return "auto";
  };

  const getTargetDimensions = (p: AspectPreset, orient: "portrait" | "landscape") => {
    let w = 1200;
    let h = 1800;

    if (p === "passport") { w = 413; h = 531; } // 3.5 x 4.5 cm @ 300 DPI
    else if (p === "4:6") { w = 1200; h = 1800; } // 4 x 6 inch @ 300 DPI
    else if (p === "5:7") { w = 1500; h = 2100; } // 5 x 7 inch @ 300 DPI
    else if (p === "8:10") { w = 2400; h = 3000; } // 8 x 10 inch @ 300 DPI
    else if (p === "a4") { w = 2480; h = 3508; } // A4 Sheet @ 300 DPI
    else if (p === "1:1") { w = 1200; h = 1200; }
    else if (p === "card") { w = 1004; h = 650; } // ID / PAN Card
    else if (p === "signature") { w = 413; h = 177; } // Sign 3.5 x 1.5 cm

    if (orient === "landscape" && p !== "1:1") {
      return { width: Math.max(w, h), height: Math.min(w, h) };
    }
    return { width: Math.min(w, h), height: Math.max(w, h) };
  };

  const setJpgDpi300 = (dataUrl: string): string => {
    try {
      const parts = dataUrl.split(",");
      const raw = atob(parts[1]);
      const rawLen = raw.length;
      const bytes = new Uint8Array(rawLen);
      for (let i = 0; i < rawLen; i++) {
        bytes[i] = raw.charCodeAt(i);
      }

      let jfifFound = false;
      for (let i = 0; i < Math.min(bytes.length - 18, 100); i++) {
        if (
          bytes[i] === 0xff &&
          bytes[i + 1] === 0xe0 &&
          bytes[i + 4] === 0x4a &&
          bytes[i + 5] === 0x46 &&
          bytes[i + 6] === 0x49 &&
          bytes[i + 7] === 0x46
        ) {
          bytes[i + 13] = 1;     // DPI unit
          bytes[i + 14] = 0x01;  // 300 DPI
          bytes[i + 15] = 0x2c;
          bytes[i + 16] = 0x01;
          bytes[i + 17] = 0x2c;
          jfifFound = true;
          break;
        }
      }

      let finalBytes = bytes;
      if (!jfifFound && bytes[0] === 0xff && bytes[1] === 0xd8) {
        const jfifHeader = new Uint8Array([
          0xff, 0xe0, 0x00, 0x10,
          0x4a, 0x46, 0x49, 0x46, 0x00,
          0x01, 0x01,
          0x01,
          0x01, 0x2c,
          0x01, 0x2c,
          0x00, 0x00
        ]);

        finalBytes = new Uint8Array(bytes.length + jfifHeader.length);
        finalBytes.set(bytes.subarray(0, 2), 0);
        finalBytes.set(jfifHeader, 2);
        finalBytes.set(bytes.subarray(2), 2 + jfifHeader.length);
      }

      let binary = "";
      const len = finalBytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(finalBytes[i]);
      }
      return "data:image/jpeg;base64," + btoa(binary);
    } catch {
      return dataUrl;
    }
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name.replace(/\.[^/.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setImgUrl(ev.target.result as string);
        setStep("crop");
        setBgRemovedUrl(null);
        setZoomLevel(1);
        applyPreset(preset);
      }
    };
    reader.readAsDataURL(file);
  };

  const applyPreset = (p: AspectPreset) => {
    setPreset(p);
    let ratio = 1;
    if (p === "passport") ratio = 3.5 / 4.5;
    else if (p === "4:6") ratio = 4 / 6;
    else if (p === "5:7") ratio = 5 / 7;
    else if (p === "8:10") ratio = 8 / 10;
    else if (p === "signature") ratio = 3.5 / 1.5;
    else if (p === "card") ratio = 8.5 / 5.5;
    else if (p === "a4") ratio = 210 / 297;
    else if (p === "1:1") ratio = 1;
    else return;

    if (photoOrientation === "landscape" && p !== "1:1" && p !== "free") {
      ratio = 1 / ratio;
    }

    setCrop((prev) => {
      let w = prev.w;
      let h = w / ratio;
      if (h > 90) {
        h = 90;
        w = h * ratio;
      }
      return {
        ...prev,
        w: Math.min(Math.round(w), 90),
        h: Math.min(Math.round(h), 90),
      };
    });
  };

  const toggleAutoEnhance = () => {
    if (!isAutoEnhanced) {
      setBrightness(112);
      setContrast(120);
      setSaturation(118);
      setIsAutoEnhanced(true);
    } else {
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setIsAutoEnhanced(false);
    }
  };

  const onDragStart = (e: React.MouseEvent | React.TouchEvent, type: string) => {
    e.stopPropagation();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragRef.current = {
      type,
      startX: clientX,
      startY: clientY,
      cropStart: { ...crop },
    };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current.type || !containerRef.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      const rect = containerRef.current.getBoundingClientRect();
      const dx = ((clientX - dragRef.current.startX) / rect.width) * 100;
      const dy = ((clientY - dragRef.current.startY) / rect.height) * 100;

      const { cropStart, type } = dragRef.current;
      let newCrop = { ...cropStart };

      if (type === "move") {
        newCrop.x = Math.max(0, Math.min(100 - newCrop.w, cropStart.x + dx));
        newCrop.y = Math.max(0, Math.min(100 - newCrop.h, cropStart.y + dy));
      } else if (type === "se") {
        newCrop.w = Math.max(15, Math.min(100 - newCrop.x, cropStart.w + dx));
        newCrop.h = Math.max(15, Math.min(100 - newCrop.y, cropStart.h + dy));
      } else if (type === "sw") {
        const potentialW = Math.max(15, cropStart.w - dx);
        if (cropStart.x + dx >= 0) {
          newCrop.x = cropStart.x + dx;
          newCrop.w = potentialW;
        }
        newCrop.h = Math.max(15, Math.min(100 - newCrop.y, cropStart.h + dy));
      } else if (type === "ne") {
        newCrop.w = Math.max(15, Math.min(100 - newCrop.x, cropStart.w + dx));
        if (cropStart.y + dy >= 0) {
          newCrop.y = cropStart.y + dy;
          newCrop.h = Math.max(15, cropStart.h - dy);
        }
      } else if (type === "nw") {
        if (cropStart.x + dx >= 0) {
          newCrop.x = cropStart.x + dx;
          newCrop.w = Math.max(15, cropStart.w - dx);
        }
        if (cropStart.y + dy >= 0) {
          newCrop.y = cropStart.y + dy;
          newCrop.h = Math.max(15, cropStart.h - dy);
        }
      }

      setCrop(newCrop);
    };

    const onEnd = () => {
      dragRef.current.type = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onEnd);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, []);

  const confirmCrop = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const sx = (crop.x / 100) * img.naturalWidth;
      const sy = (crop.y / 100) * img.naturalHeight;
      const sw = (crop.w / 100) * img.naturalWidth;
      const sh = (crop.h / 100) * img.naturalHeight;

      canvas.width = sw;
      canvas.height = sh;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      setCroppedUrl(canvas.toDataURL("image/png"));
      setBgRemovedUrl(null);
      setStep("editor");
    };
    img.src = imgUrl;
  };

  const handleRemoveBackground = async () => {
    if (!croppedUrl) return;
    setIsRemovingBg(true);

    try {
      const formData = new FormData();
      const resBlob = await fetch(croppedUrl).then((r) => r.blob());
      formData.append("image_file", resBlob, "photo.png");

      const response = await fetch("/api/remove-bg", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("BG Removal failed");
      const blob = await response.blob();
      setBgRemovedUrl(URL.createObjectURL(blob));
      setBgColor("#ffffff");
    } catch {
      alert("बैकग्राउंड हटाने में समस्या आई। कृपया पुनः प्रयास करें।");
    } finally {
      setIsRemovingBg(false);
    }
  };

  const makeFinalCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (!activeDisplayImg) return null;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }

        const dims = getTargetDimensions(preset, photoOrientation);
        const cw = dims.width;
        const ch = dims.height;

        canvas.width = cw;
        canvas.height = ch;

        ctx.fillStyle = bgColor !== "transparent" ? bgColor : "#ffffff";
        ctx.fillRect(0, 0, cw, ch);

        ctx.save();
        ctx.translate(cw / 2, ch / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

        const filterParts = [
          `brightness(${brightness}%)`,
          `contrast(${contrast}%)`,
          `saturate(${isBw ? 0 : saturation}%)`,
        ];
        if (isBw) filterParts.push("grayscale(100%)");
        ctx.filter = filterParts.join(" ");

        const isRot = rotation % 180 !== 0;
        const srcW = isRot ? img.height : img.width;
        const srcH = isRot ? img.width : img.height;
        const scale = Math.max(cw / srcW, ch / srcH);
        const renderW = img.width * scale;
        const renderH = img.height * scale;

        ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);
        ctx.restore();

        if (editorMode === "photo" && enableStamp) {
          const stampH = Math.max(60, Math.round(ch * 0.16));
          const stampY = ch - stampH;

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, stampY, cw, stampH);

          ctx.strokeStyle = "#94a3b8";
          ctx.lineWidth = Math.max(2, Math.round(cw * 0.004));
          ctx.strokeRect(0, stampY, cw, stampH);

          ctx.fillStyle = "#000000";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          const fontSize = Math.max(16, Math.round(stampH * 0.32));
          ctx.font = `bold ${fontSize}px sans-serif`;

          const formattedDate = dopDate ? dopDate.split("-").reverse().join("-") : "";

          if (candidateName.trim()) {
            ctx.fillText(candidateName.toUpperCase(), cw / 2, stampY + stampH * 0.34);
            ctx.font = `bold ${Math.round(fontSize * 0.88)}px sans-serif`;
            ctx.fillText(`DOP: ${formattedDate}`, cw / 2, stampY + stampH * 0.72);
          } else {
            ctx.fillText(`DOP: ${formattedDate}`, cw / 2, stampY + stampH / 2);
          }
        }

        if (hasBorder) {
          ctx.lineWidth = Math.max(4, Math.round(cw * 0.012));
          ctx.strokeStyle = "#1e293b";
          ctx.strokeRect(0, 0, cw, ch);
        }

        resolve(canvas);
      };
      img.src = activeDisplayImg;
    });
  };

  const handleDownloadJpg = async () => {
    const canvas = await makeFinalCanvas();
    if (!canvas) return;

    let quality = 0.98;
    if (kbMode === "custom") {
      if (customKb <= 30) quality = 0.50;
      else if (customKb <= 60) quality = 0.72;
      else if (customKb <= 120) quality = 0.85;
      else quality = 0.94;
    }

    let data = canvas.toDataURL("image/jpeg", quality);
    data = setJpgDpi300(data);

    const a = document.createElement("a");
    const tag = kbMode === "hd" ? "FullHD" : `${customKb}kb`;
    a.download = `ExamSewa_${fileName}_${preset}_${tag}.jpg`;
    a.href = data;
    a.click();
  };

  const handleDownloadPdf = async () => {
    const canvas = await makeFinalCanvas();
    if (!canvas) return;

    const data = canvas.toDataURL("image/jpeg", 0.95);
    const w = window.open("", "_blank");
    if (!w) return;

    w.document.write(`
      <html>
        <head>
          <title>ExamSewa_${fileName}.pdf</title>
          <style>
            @page { size: auto; margin: 0; }
            body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
            img { max-width: 100%; max-height: 100%; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${data}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    w.document.close();
  };

  const handleShare = async () => {
    const canvas = await makeFinalCanvas();
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `ExamSewa_${fileName}.jpg`, { type: "image/jpeg" });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "ExamSewa File",
            text: "Edited via ExamSewa",
          });
        } catch {
          // ignore
        }
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert("लिंक कॉपी कर दिया गया है!");
      }
    }, "image/jpeg", 0.95);
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-slate-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center font-bold text-slate-600">लोड हो रहा है...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-1 sm:py-2 px-2 sm:px-4 text-slate-800 select-none">
      <div className="w-full max-w-[98%] mx-auto space-y-2">
        {/* इनलाइन हेडर */}
        <div className="flex items-center justify-between py-1 border-b border-slate-200">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-300 transition-all shadow-2xs" href="/">
              ← होम
            </Link>
            <h1 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1">
              <span>ExamSewa</span>
              <span className="text-blue-600">फोटो एवं डॉक्यूमेंट एडिटर</span>
            </h1>
          </div>

          {step !== "upload" && (
            <button
              onClick={() => {
                setStep("upload");
                setImgUrl("");
                setCroppedUrl("");
                setBgRemovedUrl(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-xs font-black text-red-600 bg-white hover:bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-200 transition-all cursor-pointer shadow-2xs"
            >
              ✕ नई फ़ाइल
            </button>
          )}
        </div>

        {/* 1. अपलोड स्क्रीन */}
        {step === "upload" && (
          <div className="bg-white border-2 border-dashed border-blue-400 hover:border-blue-600 rounded-2xl p-4 sm:p-6 text-center shadow-xs transition-all flex flex-col items-center max-w-2xl mx-auto my-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mb-2">
              ✂️
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 mb-1">
              फोटो, साइन व डॉक्यूमेंट क्रॉप और एडिट करें
            </h2>
            <p className="text-xs text-slate-500 font-medium mb-3 max-w-md">
              पासपोर्ट फोटो (3.5×4.5 cm), 4×6, 5×7, 8×10, A4, सिग्नेचर व पैन कार्ड को सही आकार में क्रॉप करें और तुरंत 300 DPI में एडिट करें।
            </p>

            <label className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-200 cursor-pointer transition-all flex items-center justify-center gap-2">
              <span>📁 फोटो या डॉक्यूमेंट चुनें</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 text-center text-[11px] font-bold text-slate-600 w-full">
              <div className="p-2 bg-slate-50 rounded-xl">📷 पासपोर्ट फोटो (3.5×4.5)</div>
              <div className="p-2 bg-slate-50 rounded-xl">✍️ सिग्नेचर (हस्ताक्षर)</div>
              <div className="p-2 bg-slate-50 rounded-xl">💳 पैन / आधार कार्ड</div>
              <div className="p-2 bg-slate-50 rounded-xl">📄 A4 मार्कशीट / डॉक्यूमेंट</div>
            </div>
          </div>
        )}

        {/* 2. क्रॉप स्क्रीन */}
        {step === "crop" && (
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-2 sm:gap-3 items-start pb-8">
            <div className="w-full lg:col-span-9 bg-slate-200/95 rounded-2xl border-2 border-slate-300 shadow-inner p-2 flex flex-col sticky top-11 z-30 h-[48vh] sm:h-[54vh] lg:h-[82vh] shrink-0">
              <div className="w-full flex items-center justify-between mb-1.5 text-xs font-black text-slate-700 px-1">
                <span className="hidden sm:inline">क्रॉप बॉक्स को ड्रैग या कोनों से रीसाइज करें</span>
                <span className="sm:hidden text-[11px]">बॉक्स सेट करें</span>

                <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-xl border border-slate-300 shadow-2xs">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.7, Number((z - 0.2).toFixed(1))))}
                    className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-[10px] font-black w-8 text-center text-slate-600">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(3, Number((z + 0.2).toFixed(1))))}
                    className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs cursor-pointer"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="ml-1 text-[9px] px-1 py-0.5 rounded bg-blue-50 text-blue-600 font-bold"
                  >
                    ↺
                  </button>
                </div>

                <span className="text-blue-600 font-bold uppercase text-[11px] sm:text-xs">{preset}</span>
              </div>

              <div
                ref={containerRef}
                className="relative overflow-hidden rounded-xl bg-white shadow-md border-2 border-slate-400 select-none w-full flex-1 flex items-center justify-center p-2"
              >
                <img
                  src={imgUrl}
                  alt="Source"
                  style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.15s ease-out" }}
                  className="w-auto h-auto max-w-full max-h-full object-contain block pointer-events-none origin-center"
                />

                <div
                  style={{
                    left: `${crop.x}%`,
                    top: `${crop.y}%`,
                    width: `${crop.w}%`,
                    height: `${crop.h}%`,
                  }}
                  onMouseDown={(e) => onDragStart(e, "move")}
                  onTouchStart={(e) => onDragStart(e, "move")}
                  className="absolute border-2 border-blue-600 bg-blue-500/15 cursor-move shadow-[0_0_0_9999px_rgba(0,0,0,0.50)] touch-none select-none"
                >
                  <div
                    onMouseDown={(e) => onDragStart(e, "nw")}
                    onTouchStart={(e) => onDragStart(e, "nw")}
                    className="absolute -top-3 -left-3 w-6 h-6 bg-white border-2 border-blue-600 rounded-full cursor-nwse-resize shadow-md touch-none"
                  />
                  <div
                    onMouseDown={(e) => onDragStart(e, "ne")}
                    onTouchStart={(e) => onDragStart(e, "ne")}
                    className="absolute -top-3 -right-3 w-6 h-6 bg-white border-2 border-blue-600 rounded-full cursor-nesw-resize shadow-md touch-none"
                  />
                  <div
                    onMouseDown={(e) => onDragStart(e, "sw")}
                    onTouchStart={(e) => onDragStart(e, "sw")}
                    className="absolute -bottom-3 -left-3 w-6 h-6 bg-white border-2 border-blue-600 rounded-full cursor-nesw-resize shadow-md touch-none"
                  />
                  <div
                    onMouseDown={(e) => onDragStart(e, "se")}
                    onTouchStart={(e) => onDragStart(e, "se")}
                    className="absolute -bottom-3 -right-3 w-6 h-6 bg-white border-2 border-blue-600 rounded-full cursor-nwse-resize shadow-md touch-none"
                  />
                </div>
              </div>
            </div>

            {/* रेश्यो पैनल */}
            <div className="w-full lg:col-span-3 bg-white rounded-2xl border-2 border-slate-900 shadow-md p-3 space-y-3 flex flex-col justify-between relative z-10 mt-1">
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 pb-2 border-b border-slate-200">
                  📐 क्रॉप रेशियो चुनें
                </h3>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    { id: "passport", label: "पासपोर्ट (3.5×4.5)" },
                    { id: "4:6", label: "4×6 इंच" },
                    { id: "5:7", label: "5×7 इंच" },
                    { id: "8:10", label: "8×10 इंच" },
                    { id: "signature", label: "✍️ हस्ताक्षर (Sign)" },
                    { id: "card", label: "💳 पहचान पत्र" },
                    { id: "a4", label: "📄 A4 साइज" },
                    { id: "1:1", label: "⏹️ 1:1 स्क्वायर" },
                    { id: "free", label: "✂️️ फ्री क्रॉप" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => applyPreset(item.id as AspectPreset)}
                      className={`py-2 px-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        preset === item.id
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={confirmCrop}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>✂️ क्रॉप करें व आगे बढ़ें →</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. मुख्य एडिटर स्क्रीन */}
        {step === "editor" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start pb-8">
            {/* बायाँ प्रीव्यू बॉक्स */}
            <div className="lg:col-span-8 xl:col-span-9 bg-slate-200/95 rounded-2xl border-2 border-slate-300 shadow-inner p-2.5 flex flex-col sticky top-1 z-30 h-[48vh] sm:h-[54vh] lg:h-[82vh]">
              {/* मोड स्विचर */}
              <div className="w-full flex items-center justify-between mb-1.5 px-1 shrink-0">
                <div className="flex bg-white rounded-xl p-0.5 border border-slate-300 shadow-xs">
                  <button
                    onClick={() => setEditorMode("photo")}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      editorMode === "photo"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    📷 फोटो मोड
                  </button>
                  <button
                    onClick={() => setEditorMode("document")}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      editorMode === "document"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    📄 डॉक्यूमेंट मोड
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPhotoOrientation(o => o === "portrait" ? "landscape" : "portrait")}
                    className="text-xs bg-white border border-slate-300 px-2 py-1 rounded-lg font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    {photoOrientation === "portrait" ? "↕️ पोर्ट्रेट" : "↔️ लैंडस्केप"}
                  </button>
                  <button
                    onClick={() => setStep("crop")}
                    className="text-xs text-blue-600 hover:underline font-bold"
                  >
                    ↩ दोबारा क्रॉप
                  </button>
                </div>
              </div>

              {/* फोटो / डॉक्यूमेंट फ्रेम और लाइव प्रीव्यू */}
              <div className="w-full flex-1 flex items-center justify-center p-2 bg-slate-100/70 rounded-xl border border-slate-300/80 shadow-inner overflow-hidden">
                <div
                  style={{
                    backgroundColor: bgColor !== "transparent" ? bgColor : "#ffffff",
                    aspectRatio: getPresetRatio(preset),
                  }}
                  className={`relative rounded-xl shadow-lg overflow-hidden flex flex-col items-center justify-center max-w-full max-h-full transition-all ${
                    hasBorder ? "border-4 border-slate-900 ring-2 ring-slate-900" : "border border-slate-300"
                  }`}
                >
                  <img
                    src={activeDisplayImg}
                    alt="Preview"
                    style={{
                      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${isBw ? 0 : saturation}%) ${
                        isBw ? "grayscale(100%)" : ""
                      }`,
                      transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                    }}
                    className="w-full h-full object-cover block transition-all duration-150"
                  />

                  {/* लाइव Name & DOP स्ट्रिप */}
                  {editorMode === "photo" && enableStamp && (
                    <div className="w-full bg-white border-t-2 border-slate-900 py-1.5 px-2 text-center select-none shrink-0 shadow-xs">
                      {candidateName.trim() ? (
                        <p className="text-xs sm:text-sm font-black text-black uppercase leading-tight tracking-wider font-mono">
                          {candidateName}
                        </p>
                      ) : (
                        <p className="text-xs sm:text-sm font-black text-slate-400 uppercase leading-tight tracking-wider">
                          नाम यहाँ दिखेगा
                        </p>
                      )}
                      <p className="text-[11px] sm:text-xs font-bold text-black leading-tight mt-0.5 font-mono">
                        DOP: {dopDate ? dopDate.split("-").reverse().join("-") : ""}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* दायाँ टूल्स पैनल */}
            <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border-2 border-slate-900 shadow-md p-3 space-y-3 z-10">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <h3 className="text-xs sm:text-sm font-black text-slate-900">
                  {editorMode === "photo" ? "📷 फोटो स्टूडियो टूल्स" : "📄 डॉक्यूमेंट टूल्स"}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  editorMode === "photo" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  सक्रिय मोड
                </span>
              </div>

              {/* 📷 फोटो मोड टूल्स */}
              {editorMode === "photo" && (
                <div className="space-y-3 text-xs font-bold text-slate-700">
                  {/* 1. फोटो साइज़ मानक */}
                  <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1.5">
                    <span className="text-blue-950 font-black text-[11px]">📐 फोटो साइज़ मानक:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: "passport", label: "पासपोर्ट (3.5×4.5)" },
                        { id: "4:6", label: "🖼 4×6 इंच" },
                        { id: "5:7", label: "🖼 5×7 इंच" },
                        { id: "8:10", label: "🖼 8×10 इंच" },
                        { id: "a4", label: "📄 A4 फोटो" },
                        { id: "1:1", label: "⏹️ 1:1 स्क्वायर" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPreset(item.id as AspectPreset)}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-black border transition-all cursor-pointer ${
                            preset === item.id
                              ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. AI बैकग्राउंड रिमूवर और 10 कलर्स */}
                  <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-900 font-black">✨ AI बैकग्राउंड</span>
                      {bgRemovedUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setBgRemovedUrl(null);
                            setBgColor("transparent");
                          }}
                          className="text-[10px] text-red-600 hover:underline cursor-pointer"
                        >
                          मूल बैकग्राउंड लाएं
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveBackground}
                      disabled={isRemovingBg}
                      className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-black rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                    >
                      <span>{isRemovingBg ? "बैकग्राउंड हटाया जा रहा है..." : "✨ 1-क्लिक बैकग्राउंड हटाएँ (AI)"}</span>
                    </button>

                    <div>
                      <span className="text-[11px] font-black text-slate-700 block mb-1">
                        🎨 स्टूडियो बैकग्राउंड कलर्स (10 शेड्स):
                      </span>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[
                          { name: "पारदर्शी", color: "transparent", border: "border-slate-300" },
                          { name: "शुद्ध सफेद", color: "#ffffff", border: "border-slate-300" },
                          { name: "हल्का नीला", color: "#93c5fd", border: "border-blue-300" },
                          { name: "पासपोर्ट नीला", color: "#2563eb", border: "border-blue-700" },
                          { name: "गहरा नेवी", color: "#1e3a8a", border: "border-blue-950" },
                          { name: "हल्का लाल", color: "#fca5a5", border: "border-red-300" },
                          { name: "स्टूडियो ग्रे", color: "#e2e8f0", border: "border-slate-300" },
                          { name: "हल्का हरा", color: "#86efac", border: "border-green-300" },
                          { name: "क्रीम येलो", color: "#fef08a", border: "border-amber-300" },
                          { name: "डार्क ग्रे", color: "#475569", border: "border-slate-600" },
                        ].map((item) => (
                          <button
                            key={item.name}
                            type="button"
                            title={item.name}
                            style={{ backgroundColor: item.color !== "transparent" ? item.color : undefined }}
                            onClick={() => setBgColor(item.color)}
                            className={`h-7 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                              item.border
                            } ${item.color === "transparent" ? "bg-slate-100" : ""} ${
                              bgColor === item.color ? "ring-2 ring-blue-600 scale-105" : "hover:scale-105"
                            }`}
                          >
                            {bgColor === item.color && (
                              <span className="text-[10px] font-black text-slate-800">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. नाम व फोटो की तारीख (DOP) स्टैम्प */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={enableStamp}
                        onChange={(e) => setEnableStamp(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-black text-slate-900">
                        🏷️ नाम और तारीख (DOP) स्टैम्प जोड़ें
                      </span>
                    </label>

                    {enableStamp && (
                      <div className="space-y-2 pt-1.5 border-t border-slate-200">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            अभ्यर्थी का नाम:
                          </label>
                          <input
                            type="text"
                            placeholder="उदा. RAHUL KUMAR"
                            value={candidateName}
                            onChange={(e) => setCandidateName(e.target.value)}
                            className="w-full border border-slate-300 p-1.5 rounded-lg text-xs bg-white uppercase font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            फोटो की तारीख (DOP):
                          </label>
                          <input
                            type="date"
                            value={dopDate}
                            onChange={(e) => setDopDate(e.target.value)}
                            className="w-full border border-slate-300 p-1.5 rounded-lg text-xs bg-white font-bold"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. फोटो बॉर्डर और रोटेट */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setHasBorder(!hasBorder)}
                      className={`py-1.5 rounded-lg border text-xs font-black cursor-pointer transition-all ${
                        hasBorder
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {hasBorder ? "✓ बॉर्डर लगा है" : "🔲 फोटो बॉर्डर"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 font-black cursor-pointer text-xs"
                    >
                      🔄 घुमाएँ ({rotation}°)
                    </button>
                  </div>
                </div>
              )}

              {/* 📄 डॉक्यूमेंट मोड टूल्स */}
              {editorMode === "document" && (
                <div className="space-y-3 text-xs font-bold text-slate-700">
                  {/* 1. डॉक्यूमेंट साइज मानक */}
                  <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1.5">
                    <span className="text-emerald-950 font-black text-[11px]">📐 डॉक्यूमेंट साइज़ मानक:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: "a4", label: "📄 A4 साइज" },
                        { id: "4:6", label: "📑 4×6 साइज" },
                        { id: "card", label: "💳 पहचान पत्र / पैन" },
                        { id: "signature", label: "✍️ हस्ताक्षर (Sign)" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPreset(item.id as AspectPreset)}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-black border transition-all cursor-pointer ${
                            preset === item.id
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                              : "bg-white text-slate-800 border-slate-300 hover:bg-emerald-50"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. स्कैन फिल्टर्स */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-slate-900 font-black text-[11px]">✨ स्कैन व प्रिंट फिल्टर्स:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setBrightness(125);
                          setContrast(160);
                          setSaturation(90);
                          setIsBw(false);
                        }}
                        className="py-1.5 px-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-black shadow-2xs cursor-pointer"
                      >
                        ⚡ ऑटो क्लीन
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBrightness(120);
                          setContrast(165);
                          setSaturation(0);
                          setIsBw(true);
                        }}
                        className="py-1.5 px-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-black shadow-2xs cursor-pointer"
                      >
                        📄 B&W ज़ेरॉक्स
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBrightness(105);
                          setContrast(120);
                          setSaturation(0);
                          setIsBw(true);
                        }}
                        className="py-1.5 px-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-black shadow-2xs cursor-pointer"
                      >
                        📑 ग्रे-स्केल
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBrightness(100);
                          setContrast(100);
                          setSaturation(100);
                          setIsBw(false);
                        }}
                        className="py-1.5 px-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-black shadow-2xs cursor-pointer"
                      >
                        🎨 ओरिजिनल रंग
                      </button>
                    </div>
                  </div>

                  {/* 3. रोटेशन व फ्लिप */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-slate-900 font-black text-[11px]">🔄 ओरिएंटेशन व फ्लिप:</span>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => setRotation((r) => (r + 90) % 360)}
                        className="py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-300 font-black text-[11px] cursor-pointer"
                      >
                        🔄 90° घुमाएँ
                      </button>
                      <button
                        type="button"
                        onClick={() => setFlipH((v) => !v)}
                        className={`py-1.5 rounded-lg border font-black text-[11px] cursor-pointer transition-all ${
                          flipH ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs" : "bg-white text-slate-800 border-slate-300"
                        }`}
                      >
                        ↔️ मिरर H
                      </button>
                      <button
                        type="button"
                        onClick={() => setFlipV((v) => !v)}
                        className={`py-1.5 rounded-lg border font-black text-[11px] cursor-pointer transition-all ${
                          flipV ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs" : "bg-white text-slate-800 border-slate-300"
                        }`}
                      >
                        ↕️ फ्लिप V
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 🎨 मैनुअल ट्यून व एडजस्टमेंट स्लाइडर्स (कॉमन) */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-900 font-black text-[11px]">🎚️ मैनुअल ट्यून (स्लाइडर्स):</span>
                  <button
                    type="button"
                    onClick={toggleAutoEnhance}
                    className={`text-[10px] px-2.5 py-1 rounded-md font-black transition-all cursor-pointer border ${
                      isAutoEnhanced
                        ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                        : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
                    }`}
                  >
                    {isAutoEnhanced ? "✓ ऑटो ऑन (रीसेट)" : "✨ ऑटो टोन"}
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="font-bold text-slate-700">☀️ ब्राइटनेस (उजाला):</span>
                    <span className="font-black text-blue-700">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="160"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="font-bold text-slate-700">🌓 कॉन्ट्रास्ट (शार्पनेस):</span>
                    <span className="font-black text-blue-700">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="160"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="font-bold text-slate-700">🌈 सैचुरेशन (रंग गाढ़ा):</span>
                    <span className="font-black text-blue-700">{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5"
                  />
                </div>
              </div>

              {/* 🎯 डाउनलोड क्वालिटी / KB साइज़ कंट्रोल (कॉमन) */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-[11px] font-black text-slate-800">
                  🎯 डाउनलोड क्वालिटी व KB साइज़:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setKbMode("hd")}
                    className={`py-1.5 rounded-lg border text-xs font-black cursor-pointer transition-all ${
                      kbMode === "hd"
                        ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-300"
                    }`}
                  >
                    ⭐ Full HD (मूल)
                  </button>
                  <button
                    type="button"
                    onClick={() => setKbMode("custom")}
                    className={`py-1.5 rounded-lg border text-xs font-black cursor-pointer transition-all ${
                      kbMode === "custom"
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-300"
                    }`}
                  >
                    🎯 कस्टम KB
                  </button>
                </div>

                <div className={`space-y-1 transition-opacity ${kbMode === "hd" ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
                  <div className="flex justify-between text-[11px]">
                    <span className="font-bold text-slate-600">टारगेट साइज़:</span>
                    <span className="font-black text-blue-700">{customKb} KB</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="800"
                    step="5"
                    disabled={kbMode === "hd"}
                    value={customKb}
                    onChange={(e) => setCustomKb(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                    <span>10 KB</span>
                    <span>400 KB</span>
                    <span>800 KB</span>
                  </div>
                </div>
              </div>

              {/* डाउनलोड बटन्स */}
              <div className="pt-2 space-y-2 border-t border-slate-200">
                <button
                  onClick={handleDownloadJpg}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>📥</span>
                  <span>JPG डाउनलोड ({kbMode === "hd" ? "Full HD" : `${customKb} KB`})</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleDownloadPdf}
                    className="py-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>📄</span>
                    <span>PDF डाउनलोड</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="py-2 bg-slate-800 hover:bg-slate-900 active:scale-98 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>🔗</span>
                    <span>शेयर</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
'''

with open("src/app/tools/photo-crop/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("CLEAN_STABLE_TOOL_WRITTEN")
