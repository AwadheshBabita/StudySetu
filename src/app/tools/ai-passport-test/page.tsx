'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

const BG_COLORS = [
  { id: 'white', name: 'White', hex: '#FFFFFF', border: '#D1D5DB' },
  { id: 'passport-blue', name: 'Passport Blue', hex: '#0066CC', border: '#0284C7' },
  { id: 'sky-blue', name: 'Sky Blue', hex: '#60A5FA', border: '#38BDF8' },
  { id: 'dark-grey', name: 'Dark Grey', hex: '#374151', border: '#4B5563' },
  { id: 'red', name: 'Red', hex: '#DC2626', border: '#B91C1C' },
  { id: 'cream', name: 'Light Cream', hex: '#FDFBF7', border: '#E2E8F0' },
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
  const [activeBottomTool, setActiveBottomTool] = useState<'size-kb' | 'brightness' | 'contrast' | 'namedate' | null>('size-kb');

  // ट्यूनिंग
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);

  // साइज़, DPI और KB कंट्रोल
  const [unit, setUnit] = useState<'px' | 'mm' | 'cm' | 'inch'>('mm');
  const [widthVal, setWidthVal] = useState<number>(35);
  const [heightVal, setHeightVal] = useState<number>(45);
  const [dpi, setDpi] = useState<number>(300);
  const [targetKb, setTargetKb] = useState<number>(50);

  // नेम व डेट
  const [enableNameDate, setEnableNameDate] = useState<boolean>(false);
  const [candidateName, setCandidateName] = useState<string>('');
  const [photoDate, setPhotoDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // फ़ाइल इनपुट रेफ़
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasFinalRef = useRef<HTMLCanvasElement>(null);

  // ड्रैग / रीसाइज
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, box: { x: 0, y: 0, w: 0, h: 0 } });

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

  const loadDemoPhoto = () => {
    setSourceImage('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80');
    setRotation(0);
    setStep(2);
  };

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
      const newW = Math.max(70, dragStart.current.box.w + dx);
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

  // बैकग्राउंड रिमूव कॉल
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
      if (!ctx) throw new Error('कैनवास एरर');

      ctx.save();
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
      alert('एरर: ' + err.message);
    } finally {
      setIsProcessingAI(false);
    }
  };

  // फाइनल कैनवास रेंडर (साइज़, DPI, कलर्स और नेम-डेट)
  const renderFinalCanvas = useCallback(() => {
    if (!cutoutImage || !canvasFinalRef.current) return;
    const canvas = canvasFinalRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = cutoutImage;
    img.onload = () => {
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

      canvas.width = pxW;
      canvas.height = pxH;

      // 1. बैकग्राउंड रंग भरना
      ctx.fillStyle = selectedBg;
      ctx.fillRect(0, 0, pxW, pxH);

      // 2. फिल्टर्स
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

      // 3. कटआउट ड्रा
      ctx.drawImage(img, 0, 0, pxW, pxH);
      ctx.filter = 'none';

      // 4. नेम व डेट बार
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
          ctx.fillText(`DATE: ${photoDate}`, pxW / 2, barY + barHeight * 0.72);
        } else {
          ctx.fillText((candidateName || photoDate).toUpperCase(), pxW / 2, barY + barHeight / 2);
        }
      }
    };
  }, [cutoutImage, selectedBg, brightness, contrast, unit, widthVal, heightVal, dpi, enableNameDate, candidateName, photoDate]);

  useEffect(() => {
    if (step === 3 && cutoutImage) {
      renderFinalCanvas();
    }
  }, [step, cutoutImage, renderFinalCanvas]);

  // डाउनलोड फ़ंक्शन (टारगेट KB लूप के साथ)
  const downloadWithTargetKb = () => {
    const canvas = canvasFinalRef.current;
    if (!canvas) return;

    let quality = 0.95;
    let dataUrl = canvas.toDataURL('image/jpeg', quality);

    // टारगेट केबी संपीड़न
    for (let i = 0; i < 10; i++) {
      const head = 'data:image/jpeg;base64,';
      const curKb = Math.round(((dataUrl.length - head.length) * 3) / 4 / 1024);
      if (curKb <= targetKb || quality <= 0.2) break;
      quality -= 0.08;
      dataUrl = canvas.toDataURL('image/jpeg', quality);
    }

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `passport_${widthVal}x${heightVal}_${targetKb}kb.jpg`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-100 flex flex-col items-center justify-start overflow-y-auto font-sans antialiased select-none">
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl flex flex-col justify-between">
        
        {/* ======================= स्क्रीन 1: इनपुट ======================= */}
        {step === 1 && (
          <div className="flex-1 flex flex-col p-5">
            <div className="flex items-center justify-between pb-4">
              <span className="text-xl font-bold text-slate-800">←</span>
              <div className="text-center">
                <h1 className="text-base font-bold text-blue-900 leading-tight">Passport Photo Maker</h1>
                <p className="text-xs text-slate-500">सिर्फ 3 स्टेप में पासपोर्ट फोटो बनाएं</p>
              </div>
              <span className="w-6 h-6 rounded-full border border-slate-300 text-slate-500 flex items-center justify-center text-xs font-bold">?</span>
            </div>

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
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-md active:scale-95 transition"
                >
                  कैमरा से फोटो लें
                </button>
                <button
                  onClick={() => galleryRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-emerald-700 text-white font-semibold text-xs shadow-md active:scale-95 transition"
                >
                  गैलरी से फोटो चुनें
                </button>
              </div>

              <span className="text-xs text-slate-600 font-medium">या यहाँ फोटो ड्रैग और ड्रॉप करें</span>
              <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, HEIC (Max 10 MB)</span>
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2.5">
                <span className="text-amber-500">💡</span> बेहतर परिणाम के लिए सुझाव
              </h3>
              <ul className="text-[11px] text-slate-600 space-y-1.5">
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">✓</span> चेहरा साफ दिखे</li>
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">✓</span> अच्छी रोशनी में फोटो लें</li>
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">✓</span> सीधे कैमरा की तरफ देखें</li>
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">✓</span> टोपी, चश्मा न पहनें</li>
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">✓</span> सादा बैकग्राउंड बेहतर रहेगा</li>
              </ul>
            </div>

            <button
              onClick={loadDemoPhoto}
              className="mt-4 p-3 rounded-xl border border-blue-200 bg-white hover:bg-blue-50/40 text-blue-700 font-semibold text-xs flex items-center justify-between"
            >
              <span>डेमो फोटो देखें</span>
              <span>›</span>
            </button>

            <input ref={cameraRef} type="file" accept="image/*" capture="user" className="hidden" onChange={onFileLoad} />
            <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={onFileLoad} />
          </div>
        )}

        {/* ======================= स्क्रीन 2: क्रॉप पेज ======================= */}
        {step === 2 && sourceImage && (
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <button onClick={() => setStep(1)} className="text-slate-700 text-lg">←</button>
              <h2 className="text-sm font-bold text-slate-800">फोटो क्रॉप करें</h2>
              <span className="w-6 h-6 rounded-full border border-slate-300 text-slate-500 flex items-center justify-center text-xs">?</span>
            </div>

            <div className="flex-1 flex items-center justify-center bg-slate-900 p-2 overflow-hidden relative min-h-[50vh]">
              <div className="relative">
                <img
                  ref={imgRef}
                  src={sourceImage}
                  alt="Crop preview"
                  className="max-h-[52vh] w-auto object-contain select-none pointer-events-none"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: 'transform 0.05s ease',
                  }}
                />

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
                  <div className="w-full h-full grid grid-cols-3 grid-rows-3 pointer-events-none">
                    <div className="border-b border-r border-white/30" />
                    <div className="border-b border-r border-white/30" />
                    <div className="border-b border-r border-white/30" />
                    <div className="border-b border-r border-white/30" />
                    <div className="border-b border-r border-white/30" />
                    <div className="border-b border-r border-white/30" />
                    <div className="border-r border-white/30" />
                    <div className="border-r border-white/30" />
                    <div />
                  </div>

                  <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-white bg-blue-500" />
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-white bg-blue-500" />
                  <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-white bg-blue-500" />

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

              {/* बटन टेक्स्ट साफ और सटीक */}
              <button
                disabled={isProcessingAI}
                onClick={executeCropAndAI}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
              >
                {isProcessingAI ? (
                  <span>बैकग्राउंड रिमूव हो रहा है...</span>
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
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <button onClick={() => setStep(2)} className="text-slate-700 text-lg">←</button>
              <h2 className="text-sm font-bold text-slate-800">प्रीव्यू और एडजस्ट करें</h2>
              <span className="w-6 h-6 rounded-full border border-slate-300 text-slate-500 flex items-center justify-center text-xs">?</span>
            </div>

            {/* मुख्य प्रीव्यू (बिना किसी साइड पैलेट के बिल्कुल साफ़) */}
            <div className="flex-1 flex flex-col items-center justify-center p-3 bg-slate-50">
              <div className="relative shadow-2xl rounded-lg overflow-hidden border-2 border-slate-200 max-h-[46vh] aspect-[3.5/4.5]">
                <canvas ref={canvasFinalRef} className="w-full h-full object-contain" />
              </div>

              {/* कलर पैलेट - अब फोटो के ठीक नीचे सीधे हॉरिजॉन्टल रो में */}
              <div className="mt-3 flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500">रंग:</span>
                {BG_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedBg(c.hex)}
                    className={`w-7 h-7 rounded-full border-2 transition flex items-center justify-center ${selectedBg === c.hex ? 'scale-110 ring-2 ring-blue-500' : 'opacity-85'}`}
                    style={{ backgroundColor: c.hex, borderColor: c.border }}
                    title={c.name}
                  >
                    {selectedBg === c.hex && (
                      <span className={c.hex === '#FFFFFF' || c.hex === '#FDFBF7' ? 'text-slate-800 text-xs font-bold' : 'text-white text-xs font-bold'}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* निचला स्टूडियो कंट्रोल पैनल */}
            <div className="p-3 bg-white border-t border-slate-100 flex flex-col gap-2.5">
              
              {/* 1. साइज़, पिक्सेल और KB पैनल */}
              {activeBottomTool === 'size-kb' && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2 text-xs">
                  {/* यूनिट्स सेलेक्टर */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">माप इकाई:</span>
                    <div className="flex gap-1 bg-white p-0.5 rounded border border-slate-200">
                      {(['mm', 'px', 'cm', 'inch'] as const).map((u) => (
                        <button
                          key={u}
                          onClick={() => {
                            setUnit(u);
                            if (u === 'mm') { setWidthVal(35); setHeightVal(45); }
                            if (u === 'px') { setWidthVal(350); setHeightVal(450); }
                            if (u === 'cm') { setWidthVal(3.5); setHeightVal(4.5); }
                            if (u === 'inch') { setWidthVal(1.38); setHeightVal(1.77); }
                          }}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${unit === u ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* चौड़ाई, ऊंचाई और DPI */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500">चौड़ाई ({unit})</span>
                      <input
                        type="number"
                        value={widthVal}
                        onChange={(e) => setWidthVal(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 font-semibold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">ऊंचाई ({unit})</span>
                      <input
                        type="number"
                        value={heightVal}
                        onChange={(e) => setHeightVal(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 font-semibold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">DPI (प्रिंट)</span>
                      <select
                        value={dpi}
                        onChange={(e) => setDpi(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-800 font-semibold text-[11px]"
                      >
                        <option value="300">300 DPI</option>
                        <option value="200">200 DPI</option>
                        <option value="72">72 DPI</option>
                      </select>
                    </div>
                  </div>

                  {/* KB स्लाइडर व इनपुट */}
                  <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                    <span className="font-bold text-slate-700">फाइल साइज़ (KB):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="15"
                        max="200"
                        step="5"
                        value={targetKb}
                        onChange={(e) => setTargetKb(Number(e.target.value))}
                        className="w-28 accent-blue-600 h-1.5 bg-slate-200 rounded cursor-pointer"
                      />
                      <input
                        type="number"
                        min="10"
                        max="500"
                        value={targetKb}
                        onChange={(e) => setTargetKb(Number(e.target.value))}
                        className="w-12 bg-white border border-slate-200 rounded px-1 py-0.5 text-center text-blue-600 font-bold text-xs"
                      />
                      <span className="text-slate-400 text-[10px]">KB</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ब्राइटनेस / कॉन्ट्रास्ट स्लाइडर */}
              {(activeBottomTool === 'brightness' || activeBottomTool === 'contrast') && (
                <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold capitalize text-slate-700 w-20">
                    {activeBottomTool === 'brightness' ? 'चमक' : 'कॉन्ट्रास्ट'}:
                  </span>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={activeBottomTool === 'brightness' ? brightness : contrast}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (activeBottomTool === 'brightness') setBrightness(v);
                      if (activeBottomTool === 'contrast') setContrast(v);
                    }}
                    className="flex-1 accent-blue-600 h-1.5 bg-slate-200 rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-600">{activeBottomTool === 'brightness' ? brightness : contrast}%</span>
                </div>
              )}

              {/* 3. नेम व डेट पैनल */}
              {activeBottomTool === 'namedate' && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={enableNameDate}
                      onChange={(e) => setEnableNameDate(e.target.checked)}
                      className="accent-blue-600 w-4 h-4 rounded"
                    />
                    फोटो पर नाम और तारीख जोड़ें
                  </label>
                  {enableNameDate && (
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <input
                        type="text"
                        placeholder="उम्मीदवार का नाम"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                      />
                      <input
                        type="date"
                        value={photoDate}
                        onChange={(e) => setPhotoDate(e.target.value)}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* टूलबार बटन (ज़ूम और रोटेट हटाकर साइज़/KB और नेम-डेट जोड़े गए) */}
              <div className="grid grid-cols-4 gap-1 text-center border-t border-slate-100 pt-1">
                <button
                  onClick={() => setActiveBottomTool('size-kb')}
                  className={`flex flex-col items-center gap-1 text-[10px] py-1 rounded-lg ${activeBottomTool === 'size-kb' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'}`}
                >
                  <span className="text-base">📏</span>
                  <span>साइज़ व KB</span>
                </button>
                <button
                  onClick={() => setActiveBottomTool('brightness')}
                  className={`flex flex-col items-center gap-1 text-[10px] py-1 rounded-lg ${activeBottomTool === 'brightness' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'}`}
                >
                  <span className="text-base">☀️</span>
                  <span>ब्राइटनेस</span>
                </button>
                <button
                  onClick={() => setActiveBottomTool('contrast')}
                  className={`flex flex-col items-center gap-1 text-[10px] py-1 rounded-lg ${activeBottomTool === 'contrast' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'}`}
                >
                  <span className="text-base">◑</span>
                  <span>कॉन्ट्रास्ट</span>
                </button>
                <button
                  onClick={() => setActiveBottomTool('namedate')}
                  className={`flex flex-col items-center gap-1 text-[10px] py-1 rounded-lg ${activeBottomTool === 'namedate' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'}`}
                >
                  <span className="text-base">✍️</span>
                  <span>नेम व डेट</span>
                </button>
              </div>

              {/* डाउनलोड व शेयर बटन */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={downloadWithTargetKb}
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
                      console.log('शेयर रद्द');
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
