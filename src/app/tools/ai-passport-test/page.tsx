'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface CropBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const BG_COLORS = [
  { name: 'Pure White', hex: '#FFFFFF', border: '#D1D5DB' },
  { name: 'Sky Blue', hex: '#87CEEB', border: '#38BDF8' },
  { name: 'Passport Blue', hex: '#0066CC', border: '#0284C7' },
  { name: 'Light Grey', hex: '#E5E7EB', border: '#9CA3AF' },
  { name: 'Red', hex: '#DC2626', border: '#B91C1C' },
  { name: 'Cream', hex: '#FDFBF7', border: '#E2E8F0' },
];

export default function PassportStudioTool() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // स्टेप 1
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // स्टेप 2: स्मूथ क्रॉप और टूल्स
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<CropBox>({ x: 30, y: 30, w: 220, h: 280 });
  const [activeAdjust, setActiveAdjust] = useState<'brightness' | 'contrast' | 'saturation' | null>(null);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [zoom, setZoom] = useState<number>(1);
  const [isDraggingBox, setIsDraggingBox] = useState<boolean>(false);
  const [isResizingBox, setIsResizingBox] = useState<boolean>(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; box: CropBox }>({ mouseX: 0, mouseY: 0, box: { x: 0, y: 0, w: 0, h: 0 } });

  // AI बैकग्राउंड स्टेट्स
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [transparentCutout, setTransparentCutout] = useState<string | null>(null);
  const [selectedBgColor, setSelectedBgColor] = useState<string>('#FFFFFF');

  // स्टेप 3: फिनिश व डाउनलोड
  const [enableNameDate, setEnableNameDate] = useState<boolean>(false);
  const [candidateName, setCandidateName] = useState<string>('');
  const [photoDate, setPhotoDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [unit, setUnit] = useState<'px' | 'mm' | 'cm' | 'inch'>('mm');
  const [widthVal, setWidthVal] = useState<number>(35);
  const [heightVal, setHeightVal] = useState<number>(45);
  const [dpi, setDpi] = useState<number>(300);
  const [targetKb, setTargetKb] = useState<number>(50);
  const [isGeneratingFinal, setIsGeneratingFinal] = useState<boolean>(false);
  const [finalPreviewUrl, setFinalPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setOriginalImage(ev.target?.result as string);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTouchStartMove = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = { mouseX: clientX, mouseY: clientY, box: { ...crop } };
    setIsDraggingBox(true);
  };

  const handleTouchStartResize = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = { mouseX: clientX, mouseY: clientY, box: { ...crop } };
    setIsResizingBox(true);
  };

  const handlePointerMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isDraggingBox && !isResizingBox) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    const dx = clientX - dragStartRef.current.mouseX;
    const dy = clientY - dragStartRef.current.mouseY;

    if (isDraggingBox) {
      setCrop({
        ...dragStartRef.current.box,
        x: Math.max(0, dragStartRef.current.box.x + dx),
        y: Math.max(0, dragStartRef.current.box.y + dy),
      });
    } else if (isResizingBox) {
      const newW = Math.max(70, dragStartRef.current.box.w + dx);
      const newH = Math.round(newW * (4.5 / 3.5));
      setCrop({
        ...dragStartRef.current.box,
        w: newW,
        h: newH,
      });
    }
  }, [isDraggingBox, isResizingBox]);

  const handlePointerEnd = useCallback(() => {
    setIsDraggingBox(false);
    setIsResizingBox(false);
  }, []);

  useEffect(() => {
    if (isDraggingBox || isResizingBox) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerEnd);
      window.addEventListener('touchmove', handlePointerMove, { passive: false });
      window.addEventListener('touchend', handlePointerEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerEnd);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerEnd);
    };
  }, [isDraggingBox, isResizingBox, handlePointerMove, handlePointerEnd]);

  const processCropAndAI = async () => {
    if (!imgRef.current) return;
    setIsProcessingAI(true);

    try {
      const img = imgRef.current;
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(crop.w * scaleX);
      canvas.height = Math.round(crop.h * scaleY);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas Context Error');

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx.drawImage(
        img,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.w * scaleX,
        crop.h * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.95);

      const res = await fetch('/api/ai-bg-remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: croppedBase64 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'कटिंग विफल रही');

      setTransparentCutout(data.image);
      setStep(3);
    } catch (err: any) {
      alert('AI प्रोसेसिंग एरर: ' + err.message);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const generateFinalPhoto = useCallback(async () => {
    if (!transparentCutout) return;
    setIsGeneratingFinal(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = transparentCutout;
      await new Promise((resolve) => { img.onload = resolve; });

      let pxW = 413;
      let pxH = 531;

      if (unit === 'px') {
        pxW = widthVal;
        pxH = heightVal;
      } else if (unit === 'mm') {
        pxW = Math.round((widthVal / 25.4) * dpi);
        pxH = Math.round((heightVal / 25.4) * dpi);
      } else if (unit === 'cm') {
        pxW = Math.round(((widthVal * 10) / 25.4) * dpi);
        pxH = Math.round(((heightVal * 10) / 25.4) * dpi);
      } else if (unit === 'inch') {
        pxW = Math.round(widthVal * dpi);
        pxH = Math.round(heightVal * dpi);
      }

      const canvas = document.createElement('canvas');
      canvas.width = pxW;
      canvas.height = pxH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = selectedBgColor;
      ctx.fillRect(0, 0, pxW, pxH);
      ctx.drawImage(img, 0, 0, pxW, pxH);

      if (enableNameDate) {
        const barHeight = Math.round(pxH * 0.18);
        const barY = pxH - barHeight;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, barY, pxW, barHeight);

        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const fontSize = Math.max(12, Math.round(barHeight * 0.32));
        ctx.font = `bold ${fontSize}px sans-serif`;

        if (candidateName && photoDate) {
          ctx.fillText(candidateName.toUpperCase(), pxW / 2, barY + barHeight * 0.32);
          ctx.font = `600 ${Math.round(fontSize * 0.85)}px sans-serif`;
          ctx.fillText(`DOB/DATE: ${photoDate}`, pxW / 2, barY + barHeight * 0.72);
        } else {
          ctx.fillText((candidateName || photoDate).toUpperCase(), pxW / 2, barY + barHeight / 2);
        }
      }

      let quality = 0.95;
      let finalDataUrl = canvas.toDataURL('image/jpeg', quality);
      let attempts = 0;

      while (attempts < 10) {
        const head = 'data:image/jpeg;base64,';
        const curKb = Math.round(((finalDataUrl.length - head.length) * 3) / 4 / 1024);
        if (curKb <= targetKb || quality <= 0.2) break;
        quality -= 0.08;
        finalDataUrl = canvas.toDataURL('image/jpeg', quality);
        attempts++;
      }

      setFinalPreviewUrl(finalDataUrl);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingFinal(false);
    }
  }, [transparentCutout, selectedBgColor, enableNameDate, candidateName, photoDate, unit, widthVal, heightVal, dpi, targetKb]);

  useEffect(() => {
    if (step === 3 && transparentCutout) {
      generateFinalPhoto();
    }
  }, [step, transparentCutout, generateFinalPhoto]);

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-y-auto">
      {/* शीर्ष हेडर */}
      <header className="h-14 border-b border-slate-800 bg-slate-900 px-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <span className="font-black text-blue-500 tracking-wider text-base">STUDIO PRO</span>
          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono border border-blue-500/30">AI PASSPORT</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className={step === 1 ? 'text-blue-400 font-bold' : 'text-slate-500'}>1. अपलोड</span>
          <span className="text-slate-700">•</span>
          <span className={step === 2 ? 'text-blue-400 font-bold' : 'text-slate-500'}>2. क्रॉप</span>
          <span className="text-slate-700">•</span>
          <span className={step === 3 ? 'text-blue-400 font-bold' : 'text-slate-500'}>3. फिनिश</span>
        </div>
      </header>

      {/* कार्यक्षेत्र */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 relative">
        {/* चरण 1: इनपुट */}
        {step === 1 && (
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-1">पासपोर्ट फोटो अपलोड करें</h2>
            <p className="text-slate-400 text-xs mb-6">कैमरे से सीधी फोटो लें या डिवाइस से सेलेक्ट करें</p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2.5 p-5 rounded-xl border border-slate-700 bg-slate-800/80 hover:border-blue-500 transition active:scale-95"
              >
                <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <span className="text-xs font-semibold">कैमरा खोलें</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2.5 p-5 rounded-xl border border-slate-700 bg-slate-800/80 hover:border-blue-500 transition active:scale-95"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <span className="text-xs font-semibold">गैलरी / फाइल</span>
              </button>
            </div>

            <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileSelect} />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          </div>
        )}

        {/* चरण 2: स्मूथ क्रॉप और टूल्स */}
        {step === 2 && originalImage && (
          <div className="w-full max-w-md flex flex-col items-center">
            <div className="relative bg-black border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center max-h-[55vh]">
              <img
                ref={imgRef}
                src={originalImage}
                alt="Upload preview"
                className="max-h-[55vh] w-auto object-contain pointer-events-none"
                style={{
                  filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
                  transform: `scale(${zoom})`,
                  transition: 'transform 0.1s ease',
                }}
              />

              {/* कस्टम स्मूथ क्रॉप बॉक्स */}
              <div
                className="absolute border-2 border-blue-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] cursor-move touch-none"
                style={{
                  left: `${crop.x}px`,
                  top: `${crop.y}px`,
                  width: `${crop.w}px`,
                  height: `${crop.h}px`,
                }}
                onMouseDown={handleTouchStartMove}
                onTouchStart={handleTouchStartMove}
              >
                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-blue-500 rounded-sm" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-sm" />
                <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-blue-500 rounded-sm" />

                {/* नीचे दाएँ कोने का बड़ा ब्लू ड्रैग हैंडल */}
                <div
                  className="absolute -bottom-3 -right-3 w-7 h-7 bg-blue-600 hover:bg-blue-500 border-2 border-white rounded shadow-lg cursor-nwse-resize flex items-center justify-center touch-none z-30"
                  onMouseDown={handleTouchStartResize}
                  onTouchStart={handleTouchStartResize}
                >
                  <div className="w-2 h-2 bg-white rounded-sm" />
                </div>
              </div>
            </div>

            {/* टूलबार */}
            <div className="mt-3 w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col gap-2">
              <div className="flex items-center justify-around border-b border-slate-800 pb-2">
                <button onClick={() => setZoom((z) => Math.min(z + 0.1, 2))} className="p-2 hover:bg-slate-800 rounded text-slate-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>
                </button>
                <button onClick={() => setZoom((z) => Math.max(z - 0.1, 0.6))} className="p-2 hover:bg-slate-800 rounded text-slate-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
                </button>
                <button 
                  onClick={() => setActiveAdjust(activeAdjust === 'brightness' ? null : 'brightness')}
                  className={`p-2 rounded ${activeAdjust === 'brightness' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </button>
                <button 
                  onClick={() => setActiveAdjust(activeAdjust === 'saturation' ? null : 'saturation')}
                  className={`p-2 rounded ${activeAdjust === 'saturation' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </button>
                <button 
                  onClick={() => setActiveAdjust(activeAdjust === 'contrast' ? null : 'contrast')}
                  className={`p-2 rounded ${activeAdjust === 'contrast' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" /></svg>
                </button>
              </div>

              {activeAdjust && (
                <div className="flex items-center gap-2 px-2 py-1 bg-slate-950 rounded">
                  <span className="text-[11px] capitalize text-slate-300 w-16">{activeAdjust}:</span>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={activeAdjust === 'brightness' ? brightness : activeAdjust === 'contrast' ? contrast : saturation}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (activeAdjust === 'brightness') setBrightness(v);
                      if (activeAdjust === 'contrast') setContrast(v);
                      if (activeAdjust === 'saturation') setSaturation(v);
                    }}
                    className="flex-1 accent-blue-500 h-1.5 bg-slate-700 rounded cursor-pointer"
                  />
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-1">
                <button onClick={() => setStep(1)} className="px-3 py-2 rounded border border-slate-700 hover:bg-slate-800 text-xs font-semibold">
                  बैक
                </button>
                <button
                  disabled={isProcessingAI}
                  onClick={processCropAndAI}
                  className="flex-1 py-2.5 rounded bg-blue-600 hover:bg-blue-500 font-semibold text-xs tracking-wide shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
                >
                  {isProcessingAI ? 'AI बैकग्राउंड कटिंग हो रही है...' : 'क्रॉप और AI बैकग्राउंड'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* चरण 3: फिनिश व एक्सपोर्ट */}
        {step === 3 && (
          <div className="w-full max-w-xl flex flex-col md:flex-row gap-4 items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-[180px] h-[230px] bg-black border border-slate-700 rounded-lg shadow-2xl overflow-hidden flex items-center justify-center">
                {isGeneratingFinal || !finalPreviewUrl ? (
                  <span className="text-xs text-blue-400 animate-pulse">प्रोसेसिंग...</span>
                ) : (
                  <img src={finalPreviewUrl} alt="Passport Final" className="w-full h-full object-contain" />
                )}
              </div>
              <span className="text-[11px] text-slate-400 mt-2 font-mono">
                {widthVal}x{heightVal} {unit} | ~{targetKb} KB
              </span>
            </div>

            <div className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">बैकग्राउंड कलर चुनें:</label>
                <div className="flex items-center gap-2.5">
                  {BG_COLORS.map((col) => (
                    <button
                      key={col.hex}
                      onClick={() => setSelectedBgColor(col.hex)}
                      className={`w-7 h-7 rounded-full border-2 transition ${selectedBgColor === col.hex ? 'scale-110 ring-2 ring-blue-500' : 'opacity-80'}`}
                      style={{ backgroundColor: col.hex, borderColor: col.border }}
                      title={col.name}
                    />
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-2.5">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={enableNameDate}
                    onChange={(e) => setEnableNameDate(e.target.checked)}
                    className="accent-blue-500 w-4 h-4 rounded"
                  />
                  फोटो पर नाम और तारीख (Name & Date) लिखें
                </label>

                {enableNameDate && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="नाम लिखें"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-blue-500"
                    />
                    <input
                      type="date"
                      value={photoDate}
                      onChange={(e) => setPhotoDate(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800 pt-2.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">इकाई (Unit):</span>
                  <div className="flex gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
                    {(['mm', 'cm', 'px', 'inch'] as const).map((u) => (
                      <button
                        key={u}
                        onClick={() => {
                          setUnit(u);
                          if (u === 'mm') { setWidthVal(35); setHeightVal(45); }
                          if (u === 'cm') { setWidthVal(3.5); setHeightVal(4.5); }
                          if (u === 'px') { setWidthVal(350); setHeightVal(450); }
                          if (u === 'inch') { setWidthVal(1.38); setHeightVal(1.77); }
                        }}
                        className={`px-2 py-0.5 rounded ${unit === u ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400">चौड़ाई ({unit})</span>
                    <input
                      type="number"
                      value={widthVal}
                      onChange={(e) => setWidthVal(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 mt-0.5"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">ऊंचाई ({unit})</span>
                    <input
                      type="number"
                      value={heightVal}
                      onChange={(e) => setHeightVal(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 mt-0.5"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">DPI</span>
                    <select
                      value={dpi}
                      onChange={(e) => setDpi(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-slate-200 mt-0.5"
                    >
                      <option value="300">300 DPI</option>
                      <option value="200">200 DPI</option>
                      <option value="72">72 DPI</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-300">फाइल साइज (KB):</span>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={targetKb}
                    onChange={(e) => setTargetKb(Number(e.target.value))}
                    className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-center text-blue-400 font-bold"
                  />
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="5"
                  value={targetKb}
                  onChange={(e) => setTargetKb(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button onClick={() => setStep(2)} className="px-3 py-2.5 rounded border border-slate-700 hover:bg-slate-800 text-slate-300">
                  बैक
                </button>
                <button
                  onClick={() => {
                    if (!finalPreviewUrl) return;
                    const a = document.createElement('a');
                    a.href = finalPreviewUrl;
                    a.download = `passport_${candidateName || 'photo'}_${widthVal}x${heightVal}.jpg`;
                    a.click();
                  }}
                  className="flex-1 py-2.5 rounded bg-green-600 hover:bg-green-500 font-bold text-white text-center shadow-lg shadow-green-600/30"
                >
                  JPEG डाउनलोड करें
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
