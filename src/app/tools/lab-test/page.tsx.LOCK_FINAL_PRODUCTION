"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";

export default function LabTestOptimizer() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [quality, setQuality] = useState<number>(80);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [smartScale, setSmartScale] = useState<boolean>(true);
  const [fileName, setFileName] = useState<string>("optimized-image");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  const origBoxRef = useRef<HTMLDivElement>(null);
  const compBoxRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef<boolean>(false);

  // Mouse Drag to Pan (PC Hand Tool) State
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const scrollLeftRef = useRef<number>(0);
  const scrollTopRef = useRef<number>(0);

  const syncScroll = (source: HTMLDivElement | null, target: HTMLDivElement | null) => {
    if (!source || !target || isSyncingRef.current) return;
    isSyncingRef.current = true;
    target.scrollTop = source.scrollTop;
    target.scrollLeft = source.scrollLeft;
    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - ref.current.offsetLeft;
    startYRef.current = e.pageY - ref.current.offsetTop;
    scrollLeftRef.current = ref.current.scrollLeft;
    scrollTopRef.current = ref.current.scrollTop;
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    sourceRef: React.RefObject<HTMLDivElement | null>,
    targetRef: React.RefObject<HTMLDivElement | null>
  ) => {
    if (!isDraggingRef.current || !sourceRef.current) return;
    e.preventDefault();
    const x = e.pageX - sourceRef.current.offsetLeft;
    const y = e.pageY - sourceRef.current.offsetTop;
    const walkX = x - startXRef.current;
    const walkY = y - startYRef.current;

    sourceRef.current.scrollLeft = scrollLeftRef.current - walkX;
    sourceRef.current.scrollTop = scrollTopRef.current - walkY;

    if (targetRef.current) {
      targetRef.current.scrollLeft = sourceRef.current.scrollLeft;
      targetRef.current.scrollTop = sourceRef.current.scrollTop;
    }
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  const handleBackToUpload = () => {
    setOriginalImage(null);
    setCompressedImage(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setZoomLevel(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOriginalSize(file.size);
    setFileName(file.name.replace(/\.[^/.]+$/, ""));
    setZoomLevel(1);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        imageElementRef.current = img;
        setOriginalImage(event.target?.result as string);
        runEngine(img, quality, smartScale);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // 2-Step Core Engine: Smart Resample + Compression
  const runEngine = (img: HTMLImageElement, q: number, enableSmartScale: boolean) => {
    let targetWidth = img.naturalWidth || img.width;
    let targetHeight = img.naturalHeight || img.height;

    if (enableSmartScale) {
      const maxDimension = 1600;
      if (targetWidth > maxDimension || targetHeight > maxDimension) {
        if (targetWidth > targetHeight) {
          targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
          targetWidth = maxDimension;
        } else {
          targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
          targetHeight = maxDimension;
        }
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const factor = Math.max(0.01, Math.min(1.0, q / 100));
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setCompressedSize(blob.size);
        const newUrl = URL.createObjectURL(blob);
        setCompressedImage((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return newUrl;
        });
      },
      "image/jpeg",
      factor
    );
  };

  const handleQualityChange = (newQ: number) => {
    setQuality(newQ);
    if (imageElementRef.current) {
      runEngine(imageElementRef.current, newQ, smartScale);
    }
  };

  const toggleSmartScale = (checked: boolean) => {
    setSmartScale(checked);
    if (imageElementRef.current) {
      runEngine(imageElementRef.current, quality, checked);
    }
  };

  const resetZoom = () => {
    setZoomLevel(1);
    if (origBoxRef.current) {
      origBoxRef.current.scrollTop = 0;
      origBoxRef.current.scrollLeft = 0;
    }
    if (compBoxRef.current) {
      compBoxRef.current.scrollTop = 0;
      compBoxRef.current.scrollLeft = 0;
    }
  };

  const downloadJPG = () => {
    if (!compressedImage) return;
    const a = document.createElement("a");
    a.href = compressedImage;
    a.download = `${fileName}-optimized.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadPDF = () => {
    if (!compressedImage) return;
    const w = window.open("");
    if (w) {
      w.document.write(`<img src="${compressedImage}" style="max-width:100%;" onload="window.print();"/>`);
      w.document.close();
    }
  };

  const handleShare = async () => {
    if (!compressedImage) return;
    try {
      const res = await fetch(compressedImage);
      const blob = await res.blob();
      const file = new File([blob], `${fileName}.jpg`, { type: "image/jpeg" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Optimized Photo" });
      } else {
        alert("फ़ाइल डाउनलोड करके शेयर करें।");
      }
    } catch (e) {}
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 KB";
    return (bytes / 1024).toFixed(1) + " KB";
  };

  return (
    <div className="min-h-screen bg-[#dbeafe]/30 text-slate-800 flex flex-col p-2 sm:p-3 md:p-4 font-sans select-none">
      {/* Header */}
      <header className="flex items-center justify-between pb-2 border-b border-slate-300 max-w-[1360px] mx-auto w-full">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition">
            <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Live Image Optimizer</h1>
            <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-full font-mono font-bold">TEST LAB</span>
          </div>
        </div>

        {originalImage && (
          <button
            onClick={handleBackToUpload}
            className="flex items-center gap-1.5 text-xs bg-white hover:bg-slate-50 px-3 py-1 rounded-lg border border-slate-300 text-slate-700 font-bold shadow-sm active:scale-95 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
            </svg>
            <span>← बैक</span>
          </button>
        )}
      </header>

      {/* Main Area */}
      <main className="max-w-[1360px] mx-auto w-full flex-1 flex flex-col justify-start pt-2">
        {!originalImage ? (
          /* CLEAN UPLOAD CONTAINER WITH BRAND TITLE */
          <div className="max-w-5xl mx-auto w-full bg-white rounded-3xl p-4 sm:p-6 md:p-7 border border-slate-200 shadow-xl shadow-blue-500/5 flex flex-col gap-5">
            
            {/* Top Brand Header: Exam Sewa Image Optimizer */}
            <div className="flex items-center justify-center sm:justify-start gap-3 pb-1 border-b border-slate-100">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30 flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11v6m0-6l-2 2m2-2l2 2" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                  Exam Sewa Image Optimizer
                </h2>
                <p className="text-xs text-slate-500 font-medium">सरकारी फ़ॉर्म व फ़ोटो के लिए लाइव रिसाइज़ व कम्प्रेशन</p>
              </div>
            </div>

            {/* Dotted Upload Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-400/90 hover:border-blue-600 rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-blue-50/20 to-slate-50/30 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              <div className="relative mb-3 flex items-center justify-center">
                <div className="absolute -left-12 -top-1 bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow rotate-[-12deg] group-hover:rotate-0 transition">
                  PDF
                </div>
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 group-hover:scale-105 transition duration-300">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="absolute -right-12 -top-1 bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow rotate-[12deg] group-hover:rotate-0 transition">
                  JPG
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-0.5">यहाँ फ़ाइल को खींचकर छोड़ें</h3>
              <p className="text-xs text-slate-400 font-medium mb-3">— या —</p>

              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-7 py-2.5 rounded-full shadow-lg shadow-blue-600/30 group-hover:shadow-blue-600/50 transition-all duration-200 active:scale-95">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="text-sm">फ़ाइल चुनें</span>
                <span className="w-5 h-5 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-sm">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-3 font-medium">
                सपोर्टेड फ़ॉर्मेट: JPG, PNG, PDF, WebP | अधिकतम साइज़: 10 MB
              </p>
            </div>

            {/* 4 Cards Grid */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 rounded-full bg-purple-600"></span>
                  <h4 className="text-sm font-bold text-slate-900">अपलोड की गई फ़ाइलें (4)</h4>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div onClick={() => fileInputRef.current?.click()} className="relative bg-white border border-slate-200 rounded-2xl p-2.5 flex flex-col cursor-pointer transition shadow-sm hover:shadow-md">
                  <div className="w-full h-20 rounded-xl overflow-hidden mb-2 bg-sky-200 flex items-end justify-center relative">
                    <svg className="w-full h-full object-cover" viewBox="0 0 160 90" preserveAspectRatio="none">
                      <rect width="160" height="90" fill="#38bdf8"/>
                      <circle cx="130" cy="20" r="10" fill="#fef08a" />
                      <polygon points="10,65 50,25 90,65" fill="#475569"/>
                      <polygon points="65,65 110,18 155,65" fill="#334155"/>
                      <rect x="0" y="60" width="160" height="10" fill="#15803d"/>
                      <rect x="0" y="70" width="160" height="20" fill="#0284c7"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-slate-800 block truncate">photo.jpg</span>
                    <span className="text-[11px] text-slate-400 font-mono">245 KB</span>
                  </div>
                </div>

                <div onClick={() => fileInputRef.current?.click()} className="relative bg-white border border-slate-200 rounded-2xl p-2.5 flex flex-col cursor-pointer transition shadow-sm hover:shadow-md">
                  <div className="w-full h-20 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-2">
                    <div className="w-12 h-16 bg-white border border-slate-200 rounded p-1 flex flex-col items-center">
                      <div className="bg-rose-600 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded">PDF</div>
                      <div className="w-full h-0.5 bg-slate-300 mt-2"></div>
                      <div className="w-3/4 h-0.5 bg-slate-200 mt-1"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-slate-800 block truncate">document.pdf</span>
                    <span className="text-[11px] text-slate-400 font-mono">1.2 MB</span>
                  </div>
                </div>

                <div onClick={() => fileInputRef.current?.click()} className="relative bg-white border border-slate-200 rounded-2xl p-2.5 flex flex-col cursor-pointer transition shadow-sm hover:shadow-md">
                  <div className="w-full h-20 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-2">
                    <div className="w-11 h-13 bg-gradient-to-tr from-blue-700 to-sky-500 rounded flex items-center justify-center text-white font-extrabold text-2xl font-serif">W</div>
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-slate-800 block truncate">form.docx</span>
                    <span className="text-[11px] text-slate-400 font-mono">560 KB</span>
                  </div>
                </div>

                <div onClick={() => fileInputRef.current?.click()} className="relative bg-white border border-slate-200 rounded-2xl p-2.5 flex flex-col cursor-pointer transition shadow-sm hover:shadow-md">
                  <div className="w-full h-20 rounded-xl overflow-hidden mb-2 bg-[#064e3b] flex items-center justify-center relative">
                    <svg className="w-full h-full object-cover" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="18" fill="#e11d48"/>
                      <circle cx="50" cy="50" r="5" fill="#facc15"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-slate-800 block truncate">image.png</span>
                    <span className="text-[11px] text-slate-400 font-mono">320 KB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* WORKSPACE */
          <div className="flex flex-col gap-2">
            <div className="bg-white border-2 border-slate-300 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row">
              {/* Part 1: Original */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex justify-between items-center px-3 py-1 bg-slate-50 border-b border-slate-200 text-xs font-mono">
                  <span className="text-slate-600 font-bold">मूल फोटो (Original)</span>
                  <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.2 rounded border border-amber-200">
                    {formatSize(originalSize)}
                  </span>
                </div>
                <div
                  ref={origBoxRef}
                  onScroll={() => syncScroll(origBoxRef.current, compBoxRef.current)}
                  onMouseDown={(e) => handleMouseDown(e, origBoxRef)}
                  onMouseMove={(e) => handleMouseMove(e, origBoxRef, compBoxRef)}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                  className={`h-[210px] sm:h-[260px] md:h-[310px] p-1.5 bg-slate-50/50 overflow-auto select-none ${zoomLevel > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
                >
                  <div style={{ width: `${zoomLevel * 100}%`, margin: "0 auto" }}>
                    <img
                      src={originalImage}
                      alt="Original"
                      className="w-full h-auto object-contain object-top pointer-events-none block select-none"
                      draggable={false}
                    />
                  </div>
                </div>
              </div>

              {/* Blue Divider Line */}
              <div className="h-[2px] w-full md:h-auto md:w-[2px] bg-blue-500"></div>

              {/* Part 2: Compressed Preview */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex justify-between items-center px-3 py-1 bg-blue-50/50 border-b border-blue-100 text-xs font-mono">
                  <span className="text-blue-600 font-bold">👁️ लाइव प्रीव्यू</span>
                  <span className="bg-blue-600 text-white px-2 py-0.2 rounded font-bold shadow-sm">
                    {formatSize(compressedSize)}
                  </span>
                </div>
                <div
                  ref={compBoxRef}
                  onScroll={() => syncScroll(compBoxRef.current, origBoxRef.current)}
                  onMouseDown={(e) => handleMouseDown(e, compBoxRef)}
                  onMouseMove={(e) => handleMouseMove(e, compBoxRef, origBoxRef)}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                  className={`h-[210px] sm:h-[260px] md:h-[310px] p-1.5 bg-slate-50/50 overflow-auto select-none ${zoomLevel > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
                >
                  <div style={{ width: `${zoomLevel * 100}%`, margin: "0 auto" }}>
                    {compressedImage && (
                      <img
                        key={compressedImage}
                        src={compressedImage}
                        alt="Preview"
                        className="w-full h-auto object-contain object-top pointer-events-none block select-none"
                        draggable={false}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls Deck */}
            <div className="bg-white border border-slate-300 rounded-xl p-2.5 sm:p-3 flex flex-col gap-2 shadow-sm">
              <div
                onClick={() => toggleSmartScale(!smartScale)}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg border transition cursor-pointer select-none ${smartScale ? "bg-blue-50/90 border-blue-300" : "bg-slate-100 border-slate-300 text-slate-500"}`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={smartScale}
                    onChange={(e) => toggleSmartScale(e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 text-blue-600 accent-blue-600 rounded cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm font-semibold">
                    ⚡ 2-चरण स्मार्ट स्केल (बड़ी फोटो के लिए बेस्ट क्वालिटी)
                  </span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${smartScale ? "bg-white text-blue-700 border-blue-200" : "bg-white text-slate-500 border-slate-200"}`}>
                  {smartScale ? "ON" : "OFF"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* 1. Zoom Slider */}
                <div className="flex flex-col gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      🔍 ज़ूम (तुलना सिंक):
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                        {zoomLevel.toFixed(1)}x
                      </span>
                      {zoomLevel > 1 && (
                        <button
                          onClick={resetZoom}
                          className="text-[10px] text-amber-600 font-bold hover:underline"
                        >
                          रीसेट (1x)
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.1"
                    value={zoomLevel}
                    onChange={(e) => setZoomLevel(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded"
                  />
                </div>

                {/* 2. Quality Slider with Live KB Badge */}
                <div className="flex flex-col gap-1 bg-blue-50/40 px-2.5 py-1.5 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">🎯 साइज़ व क्वालिटी:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs bg-blue-600 text-white font-bold px-2 py-0.5 rounded shadow-sm">
                        {formatSize(compressedSize)}
                      </span>
                      <span className="font-mono text-xs text-blue-700 font-bold">
                        ({quality}%)
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="100"
                    value={quality}
                    onChange={(e) => handleQualityChange(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded"
                  />
                </div>
              </div>

              {/* Action Buttons: Clean JPG Download Without Extra KB */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200">
                <button
                  onClick={downloadJPG}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-sm active:scale-95 transition truncate"
                >
                  📥 JPG डाउनलोड करें
                </button>
                <button
                  onClick={downloadPDF}
                  className="bg-slate-700 hover:bg-slate-800 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-sm active:scale-95 transition truncate"
                >
                  📄 PDF में सेव करें
                </button>
                <button
                  onClick={handleShare}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs sm:text-sm border border-slate-300 active:scale-95 transition truncate"
                >
                  🔗 शेयर करें
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
