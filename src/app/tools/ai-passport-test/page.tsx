'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

// बैकग्राउंड कलर्स
const BG_COLORS = [
  { id: 'white', hex: '#FFFFFF', border: '#E2E8F0' },
  { id: 'passport-blue', hex: '#0066CC', border: '#0284C7' },
  { id: 'dark-grey', hex: '#374151', border: '#4B5563' },
  { id: 'red', hex: '#DC2626', border: '#B91C1C' },
  { id: 'sky-blue', hex: '#60A5FA', border: '#3B82F6' },
];

export default function PassportApp() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // स्टेट्स
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [cropBox, setCropBox] = useState({ x: 30, y: 30, w: 220, h: 290 });

  // AI और प्रीव्यू
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [cutoutImage, setCutoutImage] = useState<string | null>(null);
  const [selectedBg, setSelectedBg] = useState<string>('#0066CC');
  const [activeBottomTool, setActiveBottomTool] = useState<string>('bg-change');
  
  // ट्यूनिंग
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [zoom, setZoom] = useState<number>(1);

  // फ़ाइल इनपुट रेफ़
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasFinalRef = useRef<HTMLCanvasElement>(null);

  // ड्रैग / रीसाइज
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, box: { x: 0, y: 0, w: 0, h: 0 } });

  // इमेज लोड
  const onFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSourceImage(ev.target?.result as string);
        setRotation(0);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  // डेमो फोटो लोड
  const loadDemoPhoto = () => {
    setSourceImage('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80');
    setRotation(0);
    setStep(2);
  };

  // क्रॉप बॉक्स ड्रैग / रीसाइज़ इवेंट्स
  const startDrag = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStart.current = { mouseX: cx, mouseY: cy, box: { ...cropBox } };
    setIsDragging(true);
  };

  const startResize = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStart.current = { mouseX: cx, mouseY: cy, box: { ...cropBox } };
    setIsResizing(true);
  };

  const onPointerMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isDragging && !isResizing) return;
    const cx = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    const dx = cx - dragStart.current.mouseX;
    const dy = cy - dragStart.current.mouseY;

    if (isDragging) {
      setCropBox({
        ...dragStart.current.box,
        x: Math.max(0, dragStart.current.box.x + dx),
        y: Math.max(0, dragStart.current.box.y + dy),
      });
    } else if (isResizing) {
      const newW = Math.max(80, dragStart.current.box.w + dx);
      const newH = Math.round(newW * (4.5 / 3.5));
      setCropBox({
        ...dragStart.current.box,
        w: newW,
        h: newH,
      });
    }
  }, [isDragging, isResizing]);

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('touchend', onPointerUp);
    }
    return () => {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, [isDragging, isResizing, onPointerMove, onPointerUp]);

  // क्रॉप करके AI कटिंग करना
  const executeCropAndAI = async () => {
    if (!imgRef.current) return;
    setIsProcessingAI(true);

    try {
      const img = imgRef.current;
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(cropBox.w * scaleX);
      canvas.height = Math.round(cropBox.h * scaleY);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('कैनवास त्रुटि');

      ctx.save();
      // यदि रोटेशन हो
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      ctx.drawImage(
        img,
        cropBox.x * scaleX,
        cropBox.y * scaleY,
        cropBox.w * scaleX,
        cropBox.h * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );
      ctx.restore();

      const croppedB64 = canvas.toDataURL('image/jpeg', 0.95);

      // AI बैकग्राउंड रिमूवल कॉल
      const res = await fetch('/api/ai-bg-remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: croppedB64 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'कटिंग विफल रही');

      setCutoutImage(data.image);
      setStep(3);
    } catch (err: any) {
      alert('AI प्रोसेसिंग एरर: ' + err.message);
    } finally {
      setIsProcessingAI(false);
    }
  };

  // फाइनल इमेज रेंडर
  const renderFinalCanvas = useCallback(() => {
    if (!cutoutImage || !canvasFinalRef.current) return;
    const canvas = canvasFinalRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = cutoutImage;
    img.onload = () => {
      canvas.width = 413;
      canvas.height = 531;

      // 1. बैकग्राउंड रंग
      ctx.fillStyle = selectedBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. फिल्टर्स
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

      // 3. कटआउट ड्रा
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  }, [cutoutImage, selectedBg, brightness, contrast]);

  useEffect(() => {
    if (step === 3 && cutoutImage) {
      renderFinalCanvas();
    }
  }, [step, cutoutImage, renderFinalCanvas]);

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-100 flex flex-col items-center justify-start overflow-y-auto font-sans antialiased select-none">
      
      {/* मोबाइल जैसा क्लीन कंटेनर */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl flex flex-col justify-between">
        
        {/* ======================= स्क्रीन 1: इनपुट ======================= */}
        {step === 1 && (
          <div className="flex-1 flex flex-col p-5">
            {/* शीर्ष पट्टी */}
            <div className="flex items-center justify-between pb-4">
              <span className="text-xl font-bold text-slate-800">←</span>
              <div className="text-center">
                <h1 className="text-base font-bold text-blue-900 leading-tight">Passport Photo Maker</h1>
                <p className="text-xs text-slate-500">सिर्फ 3 स्टेप में पासपोर्ट फोटो बनाएं</p>
              </div>
              <span className="w-6 h-6 rounded-full border border-slate-300 text-slate-500 flex items-center justify-center text-xs font-bold">?</span>
            </div>

            {/* अपलोड बॉक्स */}
            <div className="mt-4 border-2 border-dashed border-blue-200 rounded-2xl p-6 bg-blue-50/30 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-14 h-14 rounded-xl bg-blue-100/60 text-blue-600 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div className="w-14 h-14 rounded-xl bg-blue-100/60 text-blue-600 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => cameraRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                  कैमरा से फोटो लें
                </button>
                <button
                  onClick={() => galleryRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  गैलरी से फोटो चुनें
                </button>
              </div>

              <span className="text-xs text-slate-600 font-medium">या यहाँ फोटो ड्रैग और ड्रॉप करें</span>
              <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, HEIC (Max 10 MB)</span>
            </div>

            {/* बेहतर परिणाम के लिए सुझाव */}
            <div className="mt-5 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2.5">
                <span className="text-amber-500">💡</span> बेहतर परिणाम के लिए सुझाव
              </h3>
              <ul className="text-[11px] text-slate-600 space-y-1.5">
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">✓</span> चेहरा साफ दिखे</li>
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">✓</span> अच्छी रोशनी में फोटो लें</li>
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">✓</span> सीधे कैमरा की तरफ देखें</li>
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">✓</span> टोपी, चश्मा न पहनें (जब तक आवश्यक न हो)</li>
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">✓</span> सादा बैकग्राउंड बेहतर रहेगा</li>
              </ul>
            </div>

            {/* डेमो फोटो बटन */}
            <button
              onClick={loadDemoPhoto}
              className="mt-4 p-3 rounded-xl border border-blue-200 bg-white hover:bg-blue-50/40 text-blue-700 font-semibold text-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                डेमो फोटो देखें
              </div>
              <span>›</span>
            </button>

            <input ref={cameraRef} type="file" accept="image/*" capture="user" className="hidden" onChange={onFileLoad} />
            <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={onFileLoad} />
          </div>
        )}

        {/* ======================= स्क्रीन 2: क्रॉप पेज ======================= */}
        {step === 2 && sourceImage && (
          <div className="flex-1 flex flex-col justify-between">
            {/* शीर्ष पट्टी */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <button onClick={() => setStep(1)} className="text-slate-700 text-lg">←</button>
              <h2 className="text-sm font-bold text-slate-800">फोटो क्रॉप करें</h2>
              <span className="w-6 h-6 rounded-full border border-slate-300 text-slate-500 flex items-center justify-center text-xs">?</span>
            </div>

            {/* क्रॉप कार्यक्षेत्र */}
            <div className="flex-1 flex items-center justify-center bg-slate-900 p-2 overflow-hidden relative min-h-[50vh]">
              <div className="relative">
                <img
                  ref={imgRef}
                  src={sourceImage}
                  alt="Crop preview"
                  className="max-h-[52vh] w-auto object-contain select-none pointer-events-none"
                  style={{
                    transform: `rotate(${rotation}deg) scale(${zoom})`,
                    transition: 'transform 0.05s ease',
                  }}
                />

                {/* क्रॉप फ्रेम (9-ग्रिड लाइनों के साथ) */}
                <div
                  className="absolute border-2 border-blue-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] cursor-move touch-none"
                  style={{
                    left: `${cropBox.x}px`,
                    top: `${cropBox.y}px`,
                    width: `${cropBox.w}px`,
                    height: `${cropBox.h}px`,
                  }}
                  onMouseDown={startDrag}
                  onTouchStart={startDrag}
                >
                  {/* 3x3 ग्रिड */}
                  <div className="w-full h-full grid grid-cols-3 grid-rows-3 pointer-events-none">
                    <div className="border-b border-r border-white/30" />
                    <div className="border-b border-r border-white/30" />
                    <div className="border-b border-white/30" />
                    <div className="border-b border-r border-white/30" />
                    <div className="border-b border-r border-white/30" />
                    <div className="border-b border-white/30" />
                    <div className="border-r border-white/30" />
                    <div className="border-r border-white/30" />
                    <div />
                  </div>

                  {/* नीले कॉर्नर हैंडल्स */}
                  <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-white bg-blue-500" />
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-white bg-blue-500" />
                  <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-white bg-blue-500" />

                  {/* मुख्य बड़ा नीला रीसाइज़ हैंडल */}
                  <div
                    className="absolute -bottom-2.5 -right-2.5 w-6 h-6 bg-blue-600 border-2 border-white rounded cursor-nwse-resize flex items-center justify-center touch-none z-30"
                    onMouseDown={startResize}
                    onTouchStart={startResize}
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* रोटेशन डायल और स्लाइडर */}
            <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-3">
              <div className="flex items-center justify-between px-2">
                <button
                  onClick={() => setRotation((r) => r - 90)}
                  className="w-9 h-9 rounded-full border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 active:scale-95"
                >
                  ↺
                </button>

                <div className="flex flex-col items-center flex-1 px-4">
                  <span className="text-xs font-bold text-slate-700 mb-1">{rotation}°</span>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="w-full flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
                    <span>| | | |</span>
                    <span>•</span>
                    <span>| | | |</span>
                  </div>
                </div>

                <button
                  onClick={() => setRotation((r) => r + 90)}
                  className="w-9 h-9 rounded-full border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 active:scale-95"
                >
                  ↻
                </button>
              </div>

              {/* आगे बढ़ें बटन */}
              <button
                disabled={isProcessingAI}
                onClick={executeCropAndAI}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
              >
                {isProcessingAI ? (
                  <span>AI बैकग्राउंड कटिंग हो रही है...</span>
                ) : (
                  <>क्रॉप करें और आगे बढ़ें →</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ======================= स्क्रीन 3: प्रीव्यू और डाउनलोड ======================= */}
        {step === 3 && (
          <div className="flex-1 flex flex-col justify-between">
            {/* शीर्ष पट्टी */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <button onClick={() => setStep(2)} className="text-slate-700 text-lg">←</button>
              <h2 className="text-sm font-bold text-slate-800">प्रीव्यू और एडजस्ट करें</h2>
              <span className="w-6 h-6 rounded-full border border-slate-300 text-slate-500 flex items-center justify-center text-xs">?</span>
            </div>

            {/* मुख्य कैनवास प्रीव्यू + साइड कलर पैलेट */}
            <div className="flex-1 flex items-center justify-center p-3 relative bg-slate-50">
              <div className="relative shadow-2xl rounded-lg overflow-hidden border-2 border-slate-200 max-h-[46vh] aspect-[3.5/4.5]">
                <canvas ref={canvasFinalRef} className="w-full h-full object-contain" />
              </div>

              {/* दाएँ हाथ का वर्टिकल बैकग्राउंड पैलेट */}
              <div className="absolute right-3 top-6 flex flex-col items-center gap-2.5 bg-white/95 p-2 rounded-2xl shadow-lg border border-slate-100">
                <span className="text-[9px] font-bold text-slate-500">बैकग्राउंड</span>
                {BG_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedBg(c.hex)}
                    className={`w-7 h-7 rounded-full border-2 transition flex items-center justify-center ${selectedBg === c.hex ? 'ring-2 ring-blue-500 scale-105' : ''}`}
                    style={{ backgroundColor: c.hex, borderColor: c.border }}
                  >
                    {selectedBg === c.hex && (
                      <span className={c.hex === '#FFFFFF' ? 'text-slate-800 text-xs' : 'text-white text-xs'}>✓</span>
                    )}
                  </button>
                ))}
                <span className="text-[8px] text-slate-400 mt-0.5">और रंग</span>
              </div>
            </div>

            {/* प्रीव्यू थंबनेल स्ट्रिप */}
            <div className="px-4 py-2 border-t border-slate-100 bg-white flex items-center gap-2 overflow-x-auto">
              {BG_COLORS.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedBg(c.hex)}
                  className={`w-14 h-16 rounded-lg overflow-hidden border-2 cursor-pointer flex-shrink-0 relative ${selectedBg === c.hex ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200'}`}
                  style={{ backgroundColor: c.hex }}
                >
                  {cutoutImage && <img src={cutoutImage} alt="Thumb" className="w-full h-full object-cover" />}
                </div>
              ))}
            </div>

            {/* निचला टूलबार */}
            <div className="p-3 bg-white border-t border-slate-100 flex flex-col gap-3">
              {/* स्लाइडर (यदि कोई एक्टिव हो) */}
              {(activeBottomTool === 'brightness' || activeBottomTool === 'contrast' || activeBottomTool === 'zoom') && (
                <div className="flex items-center gap-3 px-2 py-1 bg-slate-50 rounded-lg">
                  <span className="text-xs font-semibold capitalize text-slate-700 w-16">{activeBottomTool}:</span>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={activeBottomTool === 'brightness' ? brightness : activeBottomTool === 'contrast' ? contrast : zoom * 100}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (activeBottomTool === 'brightness') setBrightness(v);
                      if (activeBottomTool === 'contrast') setContrast(v);
                      if (activeBottomTool === 'zoom') setZoom(v / 100);
                    }}
                    className="flex-1 accent-blue-600 h-1.5 bg-slate-200 rounded cursor-pointer"
                  />
                </div>
              )}

              {/* 6 मुख्य टूल्स */}
              <div className="grid grid-cols-6 gap-1 text-center">
                <button
                  onClick={() => { setCutoutImage(null); setStep(2); }}
                  className="flex flex-col items-center gap-1 text-[10px] text-slate-600 hover:text-blue-600"
                >
                  <span className="text-base">✂️</span>
                  <span>बैकग्राउंड हटाएं</span>
                </button>
                <button
                  onClick={() => setActiveBottomTool('bg-change')}
                  className={`flex flex-col items-center gap-1 text-[10px] ${activeBottomTool === 'bg-change' ? 'text-blue-600 font-bold' : 'text-slate-600'}`}
                >
                  <span className="text-base">🖼️</span>
                  <span>बैकग्राउंड बदलें</span>
                </button>
                <button
                  onClick={() => setActiveBottomTool('brightness')}
                  className={`flex flex-col items-center gap-1 text-[10px] ${activeBottomTool === 'brightness' ? 'text-blue-600 font-bold' : 'text-slate-600'}`}
                >
                  <span className="text-base">☀️</span>
                  <span>ब्राइटनेस</span>
                </button>
                <button
                  onClick={() => setActiveBottomTool('contrast')}
                  className={`flex flex-col items-center gap-1 text-[10px] ${activeBottomTool === 'contrast' ? 'text-blue-600 font-bold' : 'text-slate-600'}`}
                >
                  <span className="text-base">◑</span>
                  <span>कॉन्ट्रास्ट</span>
                </button>
                <button
                  onClick={() => setActiveBottomTool('zoom')}
                  className={`flex flex-col items-center gap-1 text-[10px] ${activeBottomTool === 'zoom' ? 'text-blue-600 font-bold' : 'text-slate-600'}`}
                >
                  <span className="text-base">🔍</span>
                  <span>ज़ूम</span>
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="flex flex-col items-center gap-1 text-[10px] text-slate-600 hover:text-blue-600"
                >
                  <span className="text-base">🔄</span>
                  <span>रोटेट</span>
                </button>
              </div>

              {/* डाउनलोड व शेयर बटन */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => {
                    const canvas = canvasFinalRef.current;
                    if (!canvas) return;
                    const a = document.createElement('a');
                    a.href = canvas.toDataURL('image/jpeg', 0.95);
                    a.download = 'passport-photo.jpg';
                    a.click();
                  }}
                  className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition"
                >
                  <span>⬇️</span> डाउनलोड करें
                </button>
                <button
                  onClick={async () => {
                    const canvas = canvasFinalRef.current;
                    if (!canvas) return;
                    try {
                      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg'));
                      if (blob && navigator.share) {
                        const file = new File([blob], 'passport.jpg', { type: 'image/jpeg' });
                        await navigator.share({ files: [file], title: 'Passport Photo' });
                      }
                    } catch (e) {
                      console.log('Share canceled');
                    }
                  }}
                  className="py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition"
                >
                  <span>🔗</span> शेयर करें
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
