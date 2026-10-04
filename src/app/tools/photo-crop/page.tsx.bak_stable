"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

type AspectPreset = "free" | "1:1" | "passport" | "4:6" | "5:7" | "signature" | "card" | "a4";
type EditorMode = "photo" | "document";

export default function PhotoDocEditorPage() {
  const [step, setStep] = useState<"upload" | "crop" | "editor">("upload");
  const [editorMode, setEditorMode] = useState<EditorMode>("photo");

  const [imgUrl, setImgUrl] = useState<string>("");
  const [fileName, setFileName] = useState<string>("photo");
  const [croppedUrl, setCroppedUrl] = useState<string>("");
  const [bgRemovedUrl, setBgRemovedUrl] = useState<string | null>(null);

  // क्रॉप स्टेट्स
  const [crop, setCrop] = useState<CropRect>({ x: 15, y: 15, w: 70, h: 70 });
  const [preset, setPreset] = useState<AspectPreset>("passport");
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const [dragging, setDragging] = useState<boolean>(false);
  const [dragMode, setDragMode] = useState<string | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [startCrop, setStartCrop] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 });

  // फोटो एडजस्टमेंट्स
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [isBw, setIsBw] = useState<boolean>(false);
  const [hasBorder, setHasBorder] = useState<boolean>(false);
  const [bgColor, setBgColor] = useState<string>("#1e3a8a");
  const [rotation, setRotation] = useState<number>(0);
  const [targetKb, setTargetKb] = useState<number | "hd">("hd");
  const [isRemovingBg, setIsRemovingBg] = useState<boolean>(false);
  const [bgProgress, setBgProgress] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const sourceImgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name.replace(/\.[^/.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setImgUrl(ev.target.result as string);
        setStep("crop");
        setCrop({ x: 15, y: 15, w: 70, h: 70 });
        setRotation(0);
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setIsBw(false);
        setHasBorder(false);
        setBgRemovedUrl(null);
        setBgColor("#1e3a8a");
        setZoomLevel(1);
        setTargetKb("hd");
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
    else if (p === "signature") ratio = 3.5 / 1.5;
    else if (p === "card") ratio = 8.5 / 5.5;
    else if (p === "a4") ratio = 210 / 297;
    else if (p === "1:1") ratio = 1;
    else return;

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

  const onDragStart = (e: React.MouseEvent | React.TouchEvent, mode: string) => {
    e.stopPropagation();
    if ("touches" in e && e.cancelable) {
      e.preventDefault();
    }
    setDragging(true);
    setDragMode(mode);
    const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
    const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
    setStartPos({ x: cx, y: cy });
    setStartCrop({ ...crop });
  };

  const onDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!dragging || !containerRef.current) return;
      if (e.cancelable) e.preventDefault();

      const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
      const cy = "touches" in e ? e.touches[0].clientY : e.clientY;

      const rect = containerRef.current.getBoundingClientRect();
      const dx = ((cx - startPos.x) / rect.width) * 100;
      const dy = ((cy - startPos.y) / rect.height) * 100;

      setCrop(() => {
        let { x, y, w, h } = startCrop;

        if (dragMode === "move") {
          x = Math.max(0, Math.min(100 - w, x + dx));
          y = Math.max(0, Math.min(100 - h, y + dy));
        } else if (dragMode === "se") {
          w = Math.max(8, Math.min(100 - x, w + dx));
          h = Math.max(8, Math.min(100 - y, h + dy));
        } else if (dragMode === "sw") {
          const nw = Math.max(8, w - dx);
          x = Math.max(0, x + (w - nw));
          w = nw;
          h = Math.max(8, Math.min(100 - y, h + dy));
        } else if (dragMode === "ne") {
          w = Math.max(8, Math.min(100 - x, w + dx));
          const nh = Math.max(8, h - dy);
          y = Math.max(0, y + (h - nh));
          h = nh;
        } else if (dragMode === "nw") {
          const nw = Math.max(8, w - dx);
          const nh = Math.max(8, h - dy);
          x = Math.max(0, x + (w - nw));
          y = Math.max(0, y + (h - nh));
          w = nw;
          h = nh;
        }
        return { x, y, w, h };
      });
    },
    [dragging, dragMode, startPos, startCrop]
  );

  const onDragEnd = useCallback(() => {
    setDragging(false);
    setDragMode(null);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", onDragMove);
      window.addEventListener("mouseup", onDragEnd);
      window.addEventListener("touchmove", onDragMove, { passive: false });
      window.addEventListener("touchend", onDragEnd);
    }
    return () => {
      window.removeEventListener("mousemove", onDragMove);
      window.removeEventListener("mouseup", onDragEnd);
      window.removeEventListener("touchmove", onDragMove);
      window.removeEventListener("touchend", onDragEnd);
    };
  }, [dragging, onDragMove, onDragEnd]);

  const confirmCrop = () => {
    const img = sourceImgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const imgRect = img.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const renderedLeft = imgRect.left - containerRect.left;
    const renderedTop = imgRect.top - containerRect.top;
    const renderedWidth = imgRect.width;
    const renderedHeight = imgRect.height;

    const cropPixelX = (crop.x / 100) * containerRect.width;
    const cropPixelY = (crop.y / 100) * containerRect.height;
    const cropPixelW = (crop.w / 100) * containerRect.width;
    const cropPixelH = (crop.h / 100) * containerRect.height;

    const relX = Math.max(0, cropPixelX - renderedLeft);
    const relY = Math.max(0, cropPixelY - renderedTop);
    const relW = Math.min(cropPixelW, renderedWidth - relX);
    const relH = Math.min(cropPixelH, renderedHeight - relY);

    const scaleX = img.naturalWidth / renderedWidth;
    const scaleY = img.naturalHeight / renderedHeight;

    const sourceX = Math.round(relX * scaleX);
    const sourceY = Math.round(relY * scaleY);
    const sourceW = Math.round(relW * scaleX);
    const sourceH = Math.round(relH * scaleY);

    if (sourceW <= 0 || sourceH <= 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = sourceW;
    canvas.height = sourceH;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, sourceW, sourceH);
    ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);

    setCroppedUrl(canvas.toDataURL("image/jpeg", 0.98));
    setBgRemovedUrl(null);
    setStep("editor");
  };

  const handleRemoveBackground = async () => {
    if (!croppedUrl) return;
    setIsRemovingBg(true);
    setBgProgress(5);

    const timer = setInterval(() => {
      setBgProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.floor(Math.random() * 8) + 3;
      });
    }, 350);

    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(croppedUrl, {
        progress: (key, current, total) => {
          if (total > 0) {
            const p = Math.round((current / total) * 100);
            setBgProgress((prev) => Math.max(prev, Math.min(95, p)));
          }
        },
      });

      clearInterval(timer);
      setBgProgress(100);

      const rawUrl = URL.createObjectURL(blob);
      const cleanImg = new Image();
      cleanImg.src = rawUrl;
      await new Promise((r) => (cleanImg.onload = r));

      const c = document.createElement("canvas");
      c.width = cleanImg.width;
      c.height = cleanImg.height;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(cleanImg, 0, 0);
        const imgData = ctx.getImageData(0, 0, c.width, c.height);
        const d = imgData.data;

        for (let i = 0; i < d.length; i += 4) {
          const alpha = d[i + 3];
          if (alpha > 0 && alpha < 235) {
            if (d[i] > 190 && d[i + 1] > 190 && d[i + 2] > 190) {
              d[i + 3] = Math.round(alpha * 0.45);
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
        setBgRemovedUrl(c.toDataURL("image/png"));
      } else {
        setBgRemovedUrl(rawUrl);
      }

      setBgColor("#1e3a8a");
    } catch {
      alert("बैकग्राउंड हटाने में समस्या आई। कृपया दोबारा प्रयास करें।");
    } finally {
      clearInterval(timer);
      setTimeout(() => {
        setIsRemovingBg(false);
        setBgProgress(0);
      }, 300);
    }
  };

  const handleAutoEnhance = () => {
    setBrightness(110);
    setContrast(115);
    setSaturation(105);
    setIsBw(false);
  };

  const handleResetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setIsBw(false);
  };

  const activeDisplayImg = bgRemovedUrl || croppedUrl;

  const makeFinalCanvas = (): Promise<HTMLCanvasElement | null> => {
    return new Promise((resolve) => {
      if (!activeDisplayImg) return resolve(null);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const isRotated = rotation === 90 || rotation === 270;
        const cw = isRotated ? img.height : img.width;
        const ch = isRotated ? img.width : img.height;

        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);

        if (bgColor !== "transparent") {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, cw, ch);
        } else {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, cw, ch);
        }

        ctx.save();
        ctx.translate(cw / 2, ch / 2);
        ctx.rotate((rotation * Math.PI) / 180);

        const filterParts = [
          `brightness(${brightness}%)`,
          `contrast(${contrast}%)`,
          `saturate(${isBw ? 0 : saturation}%)`,
        ];
        if (isBw) filterParts.push("grayscale(100%)");
        ctx.filter = filterParts.join(" ");

        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();

        if (hasBorder) {
          ctx.lineWidth = Math.max(3, Math.round(cw * 0.012));
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
    if (targetKb === 20) quality = 0.55;
    else if (targetKb === 50) quality = 0.78;
    else if (targetKb === 100) quality = 0.88;

    const data = canvas.toDataURL("image/jpeg", quality);
    const a = document.createElement("a");
    a.download = `ExamSewa_${fileName}_${targetKb === "hd" ? "HD" : targetKb + "kb"}.jpg`;
    a.href = data;
    a.click();
  };

  const handleDownloadPdf = async () => {
    const canvas = await makeFinalCanvas();
    if (!canvas) return;

    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    const pdfWindow = window.open("", "_blank");
    if (!pdfWindow) {
      alert("कृपया पॉप-अप की अनुमति दें।");
      return;
    }

    pdfWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ExamSewa_${fileName}.pdf</title>
          <style>
            @page { size: auto; margin: 0; }
            body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
            img { max-width: 95%; max-height: 95%; object-contain: contain; }
          </style>
        </head>
        <body>
          <img src="${imgData}" onload="window.print();" />
        </body>
      </html>
    `);
    pdfWindow.document.close();
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
            title: "ExamSewa फोटो",
            text: "ExamSewa से तैयार की गई फोटो",
            files: [file],
          });
        } catch {
          handleDownloadJpg();
        }
      } else {
        handleDownloadJpg();
      }
    }, "image/jpeg", 0.98);
  };

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
              पासपोर्ट फोटो (3.5×4.5 cm), 4×6, 5×7, सिग्नेचर, पैन कार्ड या मार्कशीट को सही आकार में क्रॉप करें और ब्राइटनेस व KB साइज सेट करें।
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
              <div className="p-2 bg-slate-50 rounded-xl">📄 A4 मार्कशीट</div>
            </div>
          </div>
        )}

        {/* 2. क्रॉप स्क्रीन */}
        {step === "crop" && (
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-2 sm:gap-3 items-start pb-8">
            {/* 1. क्रॉप बॉक्स - मोबाइल पर 100% स्टिकी और हेडर के नीचे सुरक्षित */}
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
                  {zoomLevel !== 1 && (
                    <button
                      onClick={() => setZoomLevel(1)}
                      className="ml-1 text-[9px] px-1 py-0.5 rounded bg-blue-50 text-blue-600 font-bold"
                    >
                      ↺
                    </button>
                  )}
                </div>

                <span className="text-blue-600 font-bold uppercase text-[11px] sm:text-xs">{preset}</span>
              </div>

              <div
                ref={containerRef}
                className="relative overflow-hidden rounded-xl bg-white shadow-md border-2 border-slate-400 select-none w-full flex-1 flex items-center justify-center p-2"
              >
                <img
                  ref={sourceImgRef}
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
                  <button
                    onClick={() => applyPreset("passport")}
                    className={`py-2 px-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      preset === "passport"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    📷 पासपोर्ट (3.5×4.5)
                  </button>
                  <button
                    onClick={() => applyPreset("4:6")}
                    className={`py-2 px-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      preset === "4:6"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    🖼️️ 4×6 साइज़
                  </button>
                  <button
                    onClick={() => applyPreset("5:7")}
                    className={`py-2 px-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      preset === "5:7"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    🖼️ 5×7 साइज़
                  </button>
                  <button
                    onClick={() => applyPreset("signature")}
                    className={`py-2 px-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      preset === "signature"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    ✍️ सिग्नेचर
                  </button>
                  <button
                    onClick={() => applyPreset("card")}
                    className={`py-2 px-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      preset === "card"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    💳 कार्ड / आईडी
                  </button>
                  <button
                    onClick={() => applyPreset("a4")}
                    className={`py-2 px-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      preset === "a4"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    📄 A4 पेज
                  </button>
                  <button
                    onClick={() => applyPreset("1:1")}
                    className={`py-2 px-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      preset === "1:1"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    ⏹️ 1:1 स्क्वायर
                  </button>
                  <button
                    onClick={() => applyPreset("free")}
                    className={`py-2 px-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      preset === "free"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    🔓 फ़्री क्रॉप
                  </button>
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
            {/* बायाँ प्रीव्यू बॉक्स - बड़ा और स्टिकी */}
            <div className="lg:col-span-8 xl:col-span-9 bg-slate-200/95 rounded-2xl border-2 border-slate-300 shadow-inner p-2.5 flex flex-col sticky top-1 z-30 h-[48vh] sm:h-[54vh] lg:h-[82vh]">
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

                <button
                  onClick={() => setStep("crop")}
                  className="text-xs text-blue-600 hover:underline font-bold"
                >
                  ↩ दोबारा क्रॉप
                </button>
              </div>

              {/* फोटो फ्रेम */}
              <div className="w-full flex-1 flex items-center justify-center p-2 bg-slate-100/70 rounded-xl border border-slate-300/80 shadow-inner overflow-hidden">
                <div
                  style={{ backgroundColor: bgColor !== "transparent" ? bgColor : "#ffffff" }}
                  className={`relative p-1 rounded-xl shadow-lg border overflow-hidden flex items-center justify-center max-w-full max-h-full transition-colors ${
                    hasBorder ? "border-slate-800 ring-2 ring-slate-800" : "border-slate-300"
                  }`}
                >
                  <img
                    src={activeDisplayImg}
                    alt="Cropped Preview"
                    style={{
                      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${
                        isBw ? 0 : saturation
                      }%) ${isBw ? "grayscale(100%)" : ""}`,
                      transform: `rotate(${rotation}deg)`,
                    }}
                    className="max-h-[38vh] sm:max-h-[46vh] lg:max-h-[70vh] max-w-[82vw] lg:max-w-[48vw] w-auto h-auto object-contain rounded block transition-all duration-150"
                  />
                </div>
              </div>
            </div>

            {/* दायाँ टूल्स पैनल */}
            <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border-2 border-slate-900 shadow-md p-3 space-y-3 z-10">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <h3 className="text-xs sm:text-sm font-black text-slate-900">
                  {editorMode === "photo" ? "📷 फोटो स्टूडियो टूल्स" : "📄 डॉक्यूमेंट टूल्स"}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Active
                </span>
              </div>

              {/* 📷 फोटो मोड टूल्स */}
              {editorMode === "photo" && (
                <div className="space-y-3 text-xs font-bold text-slate-700">
                  {/* 1. AI बैकग्राउंड रिमूवर और 10 कलर पैलेट्स */}
                  <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-900 font-black">✨ AI बैकग्राउंड</span>
                      {bgRemovedUrl && (
                        <button
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
                      onClick={handleRemoveBackground}
                      disabled={isRemovingBg}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 text-white font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs relative overflow-hidden"
                    >
                      {isRemovingBg ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>बैकग्राउंड बदल रहा है... ({bgProgress}%)</span>
                          <span
                            style={{ width: `${bgProgress}%` }}
                            className="absolute bottom-0 left-0 h-1 bg-amber-400 transition-all duration-200"
                          />
                        </>
                      ) : (
                        <>
                          <span>✂️</span>
                          <span>बैकग्राउंड बदलें</span>
                        </>
                      )}
                    </button>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-black text-slate-700">रंग चुनें (10 शेड्स):</span>
                        <span className="text-[10px] text-blue-600 font-bold uppercase">
                          {bgColor === "transparent" ? "पारदर्शी" : bgColor}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-2 p-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                        {[
                          { name: "पारदर्शी", color: "transparent", border: "border-slate-300" },
                          { name: "सफ़ेद (व्हाइट)", color: "#ffffff", border: "border-slate-300" },
                          { name: "हल्का नीला", color: "#93c5fd", border: "border-blue-300" },
                          { name: "नेवी ब्लू", color: "#1e3a8a", border: "border-blue-900" },
                          { name: "हल्का ग्रे", color: "#e2e8f0", border: "border-slate-300" },
                          { name: "गहरा लाल", color: "#b91c1c", border: "border-red-700" },
                          { name: "गहरा हरा", color: "#15803d", border: "border-emerald-700" },
                          { name: "हल्का पीला", color: "#fef08a", border: "border-amber-300" },
                          { name: "डार्क ग्रे", color: "#475569", border: "border-slate-600" },
                          { name: "सॉफ्ट क्रीम", color: "#fef3c7", border: "border-amber-200" },
                        ].map((item) => (
                          <button
                            key={item.color}
                            onClick={() => setBgColor(item.color)}
                            title={item.name}
                            style={{ backgroundColor: item.color !== "transparent" ? item.color : undefined }}
                            className={`h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer relative shadow-2xs ${
                              item.color === "transparent"
                                ? "bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:6px_6px] bg-slate-100"
                                : ""
                            } ${item.border} ${
                              bgColor === item.color
                                ? "ring-2 ring-blue-600 ring-offset-1 scale-105"
                                : "hover:scale-105 opacity-90 hover:opacity-100"
                            }`}
                          >
                            {bgColor === item.color && (
                              <span
                                className={`text-[11px] font-black leading-none ${
                                  ["#ffffff", "#93c5fd", "#e2e8f0", "#fef08a", "#fef3c7", "transparent"].includes(item.color)
                                    ? "text-slate-900"
                                    : "text-white"
                                }`}
                              >
                                ✓
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 2. क्विक मोड्स */}
                  <div>
                    <span className="block mb-1 text-slate-800">क्विक टोन व फ़िल्टर:</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={handleResetAdjustments}
                        className={`py-1.5 px-1 rounded-lg border text-[11px] font-black cursor-pointer transition-all ${
                          !isBw && brightness === 100 && contrast === 100
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        🎨 ओरिजिनल
                      </button>
                      <button
                        onClick={() => setIsBw(!isBw)}
                        className={`py-1.5 px-1 rounded-lg border text-[11px] font-black cursor-pointer transition-all ${
                          isBw
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        ⚫ B&W
                      </button>
                      <button
                        onClick={handleAutoEnhance}
                        className="py-1.5 px-1 rounded-lg border bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 text-[11px] font-black cursor-pointer transition-all shadow-2xs"
                      >
                        ✨ ऑटो ग्लो
                      </button>
                    </div>
                  </div>

                  {/* 3. कस्टम स्लाइडर्स */}
                  <div className="space-y-2 pt-1 border-t border-slate-200">
                    <div>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span>ब्राइटनेस (उजाला):</span>
                        <span>{brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="160"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer h-1.5"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span>कॉन्ट्रास्ट (शार्पनेस):</span>
                        <span>{contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min="60"
                        max="150"
                        value={contrast}
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer h-1.5"
                      />
                    </div>

                    {!isBw && (
                      <div>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span>सैचुरेशन (कलर टोन):</span>
                          <span>{saturation}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="180"
                          value={saturation}
                          onChange={(e) => setSaturation(Number(e.target.value))}
                          className="w-full accent-blue-600 cursor-pointer h-1.5"
                        />
                      </div>
                    )}
                  </div>

                  {/* 4. बॉर्डर व रोटेट */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-200">
                    <button
                      onClick={() => setHasBorder(!hasBorder)}
                      className={`py-1.5 rounded-lg border text-xs font-black cursor-pointer transition-all ${
                        hasBorder
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {hasBorder ? "✓ बॉर्डर लगा है" : "🔲 बॉर्डर जोड़ें"}
                    </button>
                    <button
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 font-black cursor-pointer text-xs"
                    >
                      🔄 घुमाएँ ({rotation}°)
                    </button>
                  </div>

                  {/* 5. टारगेट साइज़ */}
                  <div className="pt-1 border-t border-slate-200">
                    <label className="block mb-1 text-[11px]">डाउनलोड क्वालिटी / साइज़:</label>
                    <div className="grid grid-cols-4 gap-1">
                      {[20, 50, 100].map((kb) => (
                        <button
                          key={kb}
                          onClick={() => setTargetKb(kb)}
                          className={`py-1 rounded-lg border text-xs font-black cursor-pointer transition-all ${
                            targetKb === kb
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {kb} KB
                        </button>
                      ))}
                      <button
                        onClick={() => setTargetKb("hd")}
                        className={`py-1 rounded-lg border text-xs font-black cursor-pointer transition-all ${
                          targetKb === "hd"
                            ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                            : "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100"
                        }`}
                      >
                        ✨ HD
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 📄 डॉक्यूमेंट मोड टूल्स */}
              {editorMode === "document" && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                  <span className="text-2xl">📄</span>
                  <p className="text-xs text-slate-600 font-bold">डॉक्यूमेंट मोड टूल्स</p>
                  <p className="text-[11px] text-slate-500">
                    व्हाइट बैकग्राउंड क्लीनर, टेक्स्ट शार्पनिंग और A4 ऑटो-सेटअप।
                  </p>
                </div>
              )}

              {/* डाउनलोड बटन्स */}
              <div className="pt-2 space-y-2 border-t border-slate-200">
                <button
                  onClick={handleDownloadJpg}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>📥</span>
                  <span>JPG डाउनलोड ({targetKb === "hd" ? "Full HD" : targetKb + " KB"})</span>
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
                    <span>शेयर करें</span>
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
