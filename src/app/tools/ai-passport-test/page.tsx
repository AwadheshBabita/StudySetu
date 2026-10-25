'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, Upload, ZoomIn, ZoomOut, Sun, Contrast, 
  Droplets, ArrowLeft, ArrowRight, Download, Share2, 
  RotateCcw, Check, RefreshCw
} from 'lucide-react';

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
  { name: 'Cream / Off-White', hex: '#FDFBF7', border: '#E2E8F0' },
];

export default function PassportStudioTool() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // स्टेप 1: इनपुट
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // स्टेप 2: क्रॉप व एडजस्टमेंट
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [crop, setCrop] = useState<CropBox>({ x: 40, y: 30, w: 220, h: 280 });
  const [activeAdjust, setActiveAdjust] = useState<'brightness' | 'contrast' | 'saturation' | null>(null);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [zoom, setZoom] = useState<number>(1);
  const [isDraggingBox, setIsDraggingBox] = useState<boolean>(false);
  const [isResizingBox, setIsResizingBox] = useState<boolean>(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; box: CropBox }>({ mouseX: 0, mouseY: 0, box: { x: 0, y: 0, w: 0, h: 0 } });

  // AI बैकग्राउंड स्टेट
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [transparentCutout, setTransparentCutout] = useState<string | null>(null);
  const [selectedBgColor, setSelectedBgColor] = useState<string>('#FFFFFF');

  // स्टेप 3: फिनिश व डाउनलोड
  const [enableNameDate, setEnableNameDate] = useState<boolean>(false);
  const [candidateName, setCandidateName] = useState<string>('');
  const [photoDate, setPhotoDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [unit, setUnit] = useState<'px' | 'mm' | 'cm' | 'inch'>('mm');
  const [widthVal, setWidthVal] = useState<number>(35);
  const [heightVal, setHeightVal] = useState<number>(45);
  const [dpi, setDpi] = useState<number>(300);
  const [targetKb, setTargetKb] = useState<number>(50);
  const [isGeneratingFinal, setIsGeneratingFinal] = useState<boolean>(false);
  const [finalPreviewUrl, setFinalPreviewUrl] = useState<string | null>(null);

  // इमेज लोड हैंडलर
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

  // क्रॉप बॉक्स ड्रैग व रिसाइज इवेंट्स
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
      const newW = Math.max(80, dragStartRef.current.box.w + dx);
      // पासपोर्ट आस्पेक्ट रेशियो लगभग 3.5 : 4.5
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

  // क्रॉप कैनवास तैयार करके AI सर्वर को भेजना
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

      // फिल्टर अप्लाई करना
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

      // AI बैकग्राउंड रिमूवल API कॉल
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

  // स्टेप 3: अंतिम फोटो (रंग, नेम-डेट, केबी) रेंडर करना
  const generateFinalPhoto = useCallback(async () => {
    if (!transparentCutout) return;
    setIsGeneratingFinal(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = transparentCutout;
      await new Promise((resolve) => { img.onload = resolve; });

      // यूनिट्स के अनुसार फाइनल पिक्सेल कैलकुलेशन
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

      // 1. बैकग्राउंड रंग भरना
      ctx.fillStyle = selectedBgColor;
      ctx.fillRect(0, 0, pxW, pxH);

      // 2. कटआउट इमेज ड्रा करना
      ctx.drawImage(img, 0, 0, pxW, pxH);

      // 3. नेम व डेट बार (यदि इनेबल हो)
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

      // 4. टारगेट केबी संपीड़न (Compression Loop)
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
    } catch (e: any) {
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none">
      {/* क्लीन स्टूडियो हेडर */}
      <header className="h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-blue-500 tracking-wider text-lg">STUDIO</span>
          <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">AI Passport v2</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className={step === 1 ? 'text-blue-400 font-bold' : 'text-slate-500'}>1. इनपुट</span>
          <span className="text-slate-700">/</span>
          <span className={step === 2 ? 'text-blue-400 font-bold' : 'text-slate-500'}>2. क्रॉप व टोन</span>
          <span className="text-slate-700">/</span>
          <span className={step === 3 ? 'text-blue-400 font-bold' : 'text-slate-500'}>3. फिनिश व एक्सपोर्ट</span>
        </div>
      </header>

      {/* मुख्य कार्यक्षेत्र */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 relative overflow-hidden">
        {/* चरण 1: इनपुट स्क्रीन */}
        {step === 1 && (
          <div className="max-w-md w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-6 text-center shadow-2xl backdrop-blur">
            <h2 className="text-xl font-bold text-white mb-2">पासपोर्ट फोटो अपलोड करें</h2>
            <p className="text-slate-400 text-xs mb-6">मोबाइल कैमरे से सीधे फोटो लें या गैलरी से सेलेक्ट करें</p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-blue-600/10 hover:border-blue-500 transition active:scale-95 text-slate-200"
              >
                <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Camera size={26} />
                </div>
                <span className="text-sm font-semibold">कैमरा खोलें</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-blue-600/10 hover:border-blue-500 transition active:scale-95 text-slate-200"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Upload size={26} />
                </div>
                <span className="text-sm font-semibold">गैलरी / फाइल</span>
              </button>
            </div>

            <input 
              ref={cameraInputRef} 
              type="file" 
              accept="image/*" 
              capture="user" 
              className="hidden" 
              onChange={handleFileSelect} 
            />
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileSelect} 
            />
          </div>
        )}

        {/* चरण 2: स्मूथ क्रॉप और एडजस्टमेंट स्क्रीन */}
        {step === 2 && originalImage && (
          <div className="w-full max-w-lg flex flex-col items-center">
            <div 
              ref={containerRef}
              className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center"
              style={{ maxHeight: '60vh' }}
            >
              <img
                ref={imgRef}
                src={originalImage}
                alt="Upload preview"
                className="max-h-[60vh] w-auto object-contain pointer-events-none"
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
                {/* कोनों के इंडिकेटर्स */}
                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-blue-500 rounded-sm" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-sm" />
                <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-blue-500 rounded-sm" />

                {/* नीचे दाएँ कोने का मुख्य बड़ा ब्लू ड्रैग हैंडल */}
                <div
                  className="absolute -bottom-3 -right-3 w-7 h-7 bg-blue-600 hover:bg-blue-500 border-2 border-white rounded shadow-lg cursor-nwse-resize flex items-center justify-center touch-none z-30"
                  onMouseDown={handleTouchStartResize}
                  onTouchStart={handleTouchStartResize}
                >
                  <div className="w-2.5 h-2.5 bg-white/80 rounded-sm" />
                </div>
              </div>
            </div>

            {/* एडजस्टमेंट टूलबार (स्क्रीनशॉट जैसा) */}
            <div className="mt-3 w-full bg-slate-800/90 border border-slate-700/80 rounded-xl p-2.5 flex flex-col gap-2">
              <div className="flex items-center justify-around border-b border-slate-700 pb-2">
                <button 
                  onClick={() => setZoom((z) => Math.min(z + 0.1, 2))}
                  className="p-2 hover:bg-slate-700 rounded-lg text-slate-300"
                  title="Zoom In"
                >
                  <ZoomIn size={20} />
                </button>
                <button 
                  onClick={() => setZoom((z) => Math.max(z - 0.1, 0.6))}
                  className="p-2 hover:bg-slate-700 rounded-lg text-slate-300"
                  title="Zoom Out"
                >
                  <ZoomOut size={20} />
                </button>
                <button 
                  onClick={() => setActiveAdjust(activeAdjust === 'brightness' ? null : 'brightness')}
                  className={`p-2 rounded-lg ${activeAdjust === 'brightness' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}
                  title="Brightness"
                >
                  <Sun size={20} />
                </button>
                <button 
                  onClick={() => setActiveAdjust(activeAdjust === 'saturation' ? null : 'saturation')}
                  className={`p-2 rounded-lg ${activeAdjust === 'saturation' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}
                  title="Saturation"
                >
                  <Droplets size={20} />
                </button>
                <button 
                  onClick={() => setActiveAdjust(activeAdjust === 'contrast' ? null : 'contrast')}
                  className={`p-2 rounded-lg ${activeAdjust === 'contrast' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}
                  title="Contrast"
                >
                  <Contrast size={20} />
                </button>
              </div>

              {/* सक्रिय स्लाइडर */}
              {activeAdjust && (
                <div className="flex items-center gap-3 px-2 py-1 bg-slate-900/60 rounded-lg">
                  <span className="text-xs capitalize font-medium text-slate-300 w-20">{activeAdjust}:</span>
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
                    className="flex-1 accent-blue-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <button 
                    onClick={() => {
                      if (activeAdjust === 'brightness') setBrightness(100);
                      if (activeAdjust === 'contrast') setContrast(100);
                      if (activeAdjust === 'saturation') setSaturation(100);
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              )}

              {/* नेविगेशन बटन */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700 text-xs font-semibold"
                >
                  <ArrowLeft size={16} /> बैक
                </button>

                <button
                  disabled={isProcessingAI}
                  onClick={processCropAndAI}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-xs tracking-wide shadow-lg shadow-blue-600/30 active:scale-98 transition disabled:opacity-50"
                >
                  {isProcessingAI ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> AI कटिंग हो रही है...
                    </>
                  ) : (
                    <>
                      क्रॉप और AI बैकग्राउंड <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* चरण 3: फिनिश व एक्सपोर्ट स्क्रीन */}
        {step === 3 && (
          <div className="w-full max-w-xl flex flex-col md:flex-row gap-4 items-center justify-center">
            {/* लाइव प्रीव्यू बॉक्स */}
            <div className="flex flex-col items-center">
              <div className="w-[180px] h-[230px] bg-slate-950 border border-slate-700 rounded-lg shadow-2xl overflow-hidden flex items-center justify-center relative">
                {isGeneratingFinal || !finalPreviewUrl ? (
                  <RefreshCw size={24} className="animate-spin text-blue-500" />
                ) : (
                  <img src={finalPreviewUrl} alt="Passport Final" className="w-full h-full object-contain" />
                )}
              </div>
              <span className="text-[11px] text-slate-400 mt-2 font-mono">
                {unit === 'mm' ? `${widthVal}x${heightVal} mm` : `${widthVal}x${heightVal} ${unit}`} | ~{targetKb} KB
              </span>
            </div>

            {/* स्टूडियो कंट्रोल पैनल */}
            <div className="flex-1 w-full bg-slate-800/90 border border-slate-700 rounded-xl p-4 flex flex-col gap-3.5 text-xs">
              {/* बैकग्राउंड कलर्स */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">बैकग्राउंड कलर चुनें:</label>
                <div className="flex items-center gap-2.5">
                  {BG_COLORS.map((col) => (
                    <button
                      key={col.hex}
                      onClick={() => setSelectedBgColor(col.hex)}
                      className={`w-7 h-7 rounded-full border-2 transition flex items-center justify-center ${selectedBgColor === col.hex ? 'scale-110 ring-2 ring-blue-500' : 'opacity-80'}`}
                      style={{ backgroundColor: col.hex, borderColor: col.border }}
                      title={col.name}
                    >
                      {selectedBgColor === col.hex && (
                        <Check size={14} className={col.hex === '#FFFFFF' || col.hex === '#FDFBF7' ? 'text-black' : 'text-white'} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* नेम व डेट विकल्प */}
              <div className="border-t border-slate-700/80 pt-2.5">
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
                      placeholder="पूरा नाम"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-blue-500"
                    />
                    <input
                      type="date"
                      value={photoDate}
                      onChange={(e) => setPhotoDate(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* साइज़िंग व यूनिट्स */}
              <div className="border-t border-slate-700/80 pt-2.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">इकाई (Unit):</span>
                  <div className="flex gap-1 bg-slate-900 p-0.5 rounded border border-slate-700">
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
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 mt-0.5"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">ऊंचाई ({unit})</span>
                    <input
                      type="number"
                      value={heightVal}
                      onChange={(e) => setHeightVal(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 mt-0.5"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">DPI</span>
                    <select
                      value={dpi}
                      onChange={(e) => setDpi(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200 mt-0.5"
                    >
                      <option value="300">300 (Print)</option>
                      <option value="200">200</option>
                      <option value="72">72 (Web)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* फाइल साइज (KB) कंट्रोल */}
              <div className="border-t border-slate-700/80 pt-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-300">फाइल साइज़ सीमा (KB):</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="10"
                      max="500"
                      value={targetKb}
                      onChange={(e) => setTargetKb(Number(e.target.value))}
                      className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center text-blue-400 font-bold"
                    />
                    <span className="text-slate-400">KB</span>
                  </div>
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

              {/* एक्सपोर्ट और एक्शन बटन */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                <button
                  onClick={() => setStep(2)}
                  className="p-2.5 rounded-lg border border-slate-600 hover:bg-slate-700 text-slate-300"
                  title="फिर से क्रॉप करें"
                >
                  <ArrowLeft size={16} />
                </button>

                <button
                  onClick={() => {
                    if (!finalPreviewUrl) return;
                    const a = document.createElement('a');
                    a.href = finalPreviewUrl;
                    a.download = `passport_${candidateName || 'photo'}_${widthVal}x${heightVal}.jpg`;
                    a.click();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 font-semibold text-white shadow-lg shadow-green-600/30 active:scale-98 transition"
                >
                  <Download size={16} /> JPEG डाउनलोड
                </button>

                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={async () => {
                      if (!finalPreviewUrl) return;
                      try {
                        const blob = await (await fetch(finalPreviewUrl)).blob();
                        const file = new File([blob], 'passport_photo.jpg', { type: 'image/jpeg' });
                        await navigator.share({
                          files: [file],
                          title: 'Passport Photo',
                        });
                      } catch (e) {
                        console.log('Share canceled');
                      }
                    }}
                    className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                    title="शेयर करें"
                  >
                    <Share2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
