'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import FaqSection from '@/components/FaqSection';

type SheetType = '4x6_12' | '4x6_8' | 'a4_30' | 'a4_36';

export default function PassportGridMakerPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // कंट्रोल्स
  const [zoom, setZoom] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);

  // शीट कॉन्फ़िगरेशन
  const [sheetType, setSheetType] = useState<SheetType>('4x6_8');
  const [showBorder, setShowBorder] = useState<boolean>(true);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const loadedImgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const gridFaqs = [
    {
      q: "क्या यह 4x6 ग्लॉसी फोटो पेपर पर सही साइज में प्रिंट होगा?",
      a: "हाँ, यह 300 DPI स्टूडियो मानक (1800 x 1200 पिक्सल) पर तैयार होता है। इसे Epson, Canon या HP फोटो प्रिंटर से 4x6 पेपर पर बिना बॉर्डर खींचे (Borderless) 100% सटीक साइज में प्रिंट किया जा सकता है।"
    },
    {
      q: "A4 शीट पर कितनी फोटो एक साथ निकल सकती हैं?",
      a: "A4 पेपर के लिए आप 30 फोटो (5x6 ग्रिड) या 36 फोटो (6x6 ग्रिड) चुन सकते हैं। पूरे पेज पर कटिंग लाइन्स के साथ सभी फोटो प्रिंट हो जाएँगी।"
    },
    {
      q: "क्या कटिंग गाइड लाइन्स दी गई हैं?",
      a: "हाँ, हर फोटो के चारों ओर एक सूक्ष्म कटिंग लाइन होती है, जिससे कैंची या पेपर कटर से फोटो काटते समय साइज बिल्कुल एक समान रहता है।"
    },
    {
      q: "क्या सीधे मोबाइल कैमरे से फोटो खींची जा सकती है?",
      a: "हाँ, 'कैमरा खोलें' दबाकर आप लाइव फोटो ले सकते हैं और ड्रैग/ज़ूम से चेहरे को सटीक अनुपात में सेट कर सकते हैं।"
    }
  ];

  const handleImageFile = (file: File | undefined) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedImgRef.current = img;
        setImageSrc(src);
        setZoom(1.0);
        setRotation(0);
        setOffset({ x: 0, y: 0 });
      };
    };
    reader.readAsDataURL(file);
  };

  // सिंगल फोटो कैनवस ड्रा इंजन (3.5 x 4.5 सेमी अनुपात + ब्राइटनेस/कंट्रास्ट ट्यूनर)
  const drawSinglePhoto = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const img = loadedImgRef.current;
    if (!img) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w / 2 + (offset.x * w) / 280, h / 2 + (offset.y * h) / 360);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const imgAspect = img.width / img.height;
    let rW = w * 1.05;
    let rH = rW / imgAspect;

    ctx.drawImage(img, -rW / 2, -rH / 2, rW, rH);
    ctx.restore();

    // ब्राइटनेस और कंट्रास्ट पिक्सल ट्यूनिंग
    if (brightness !== 0 || contrast !== 0) {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      const factor = (259 * (contrast + 255)) / (255 * (259 - Math.min(250, contrast)));
      const bOffset = brightness * 1.4;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i] + bOffset;
        let g = data[i + 1] + bOffset;
        let b = data[i + 2] + bOffset;

        data[i] = Math.max(0, Math.min(255, factor * (r - 128) + 128));
        data[i + 1] = Math.max(0, Math.min(255, factor * (g - 128) + 128));
        data[i + 2] = Math.max(0, Math.min(255, factor * (b - 128) + 128));
      }
      ctx.putImageData(imgData, 0, 0);
    }

    // केवल शुद्ध और ठोस काली आउटलाइन (कोई डॉट या सिलेक्शन नहीं)
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = Math.max(1, Math.round(w * 0.005));
    ctx.strokeRect(0, 0, w, h);
  }, [zoom, rotation, offset, brightness, contrast]);

  // लाइव प्रीव्यू कैनवस
  useEffect(() => {
    if (!imageSrc) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 280;
    canvas.height = 360;
    drawSinglePhoto(ctx, 280, 360);
  }, [imageSrc, drawSinglePhoto]);

  // ड्रैग हैंडल्स
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = () => setIsDragging(false);

  // मास्टर 300 DPI शीट जनरेटर (4x6 या A4)
  const generateSheetCanvas = (): { canvas: HTMLCanvasElement; isA4: boolean } | null => {
    const img = loadedImgRef.current;
    if (!img) return null;

    const sheetCanvas = document.createElement('canvas');
    let sw = 1800;
    let sh = 1200;
    let isA4 = false;

    // शीट विनिर्देश (300 DPI)
    let cols = 4;
    let rows = 2;
    let pw = 380;
    let ph = 490;
    let startX = 60;
    let startY = 80;
    let gapX = 45;
    let gapY = 45;

    if (sheetType === '4x6_12') {
      // 4x6 इंच पर 12 फोटो: 3 पंक्तियाँ x 4 कॉलम (फुल पेपर यूटिलाइज़ेशन)
      cols = 4;
      rows = 3;
      pw = 380;
      ph = 330;
      startX = 60;
      startY = 50;
      gapX = 45;
      gapY = 35;
    } else if (sheetType === '4x6_8') {
      // 4x6 इंच पर 8 फोटो: 3.2cm x 4.2cm साइबर कैफ़े कम्पैक्ट (375 x 482 px)
      cols = 4;
      rows = 2;
      pw = 375;
      ph = 482;
      startX = 75;
      startY = 85;
      gapX = 40;
      gapY = 45;
    } else if (sheetType === 'a4_30') {
      // A4 शीट पर 30 फोटो: शुद्ध 3.5cm x 4.5cm @ 300 DPI (413 x 531 px)
      isA4 = true;
      sw = 2480;
      sh = 3508;
      cols = 5;
      rows = 6;
      pw = 413;
      ph = 531;
      startX = 110;
      startY = 100;
      gapX = 50;
      gapY = 35;
    } else if (sheetType === 'a4_36') {
      // A4 शीट पर 36 फोटो: बल्क ग्रिड (360 x 463 px)
      isA4 = true;
      sw = 2480;
      sh = 3508;
      cols = 6;
      rows = 6;
      pw = 360;
      ph = 463;
      startX = 80;
      startY = 120;
      gapX = 40;
      gapY = 45;
    }

    sheetCanvas.width = sw;
    sheetCanvas.height = sh;
    const sCtx = sheetCanvas.getContext('2d');
    if (!sCtx) return null;

    sCtx.fillStyle = '#FFFFFF';
    sCtx.fillRect(0, 0, sw, sh);

    // सिंगल फोटो टेम्पलेट तैयार करें
    const singleCanvas = document.createElement('canvas');
    singleCanvas.width = pw;
    singleCanvas.height = ph;
    const pCtx = singleCanvas.getContext('2d');
    if (!pCtx) return null;
    drawSinglePhoto(pCtx, pw, ph);

    // ग्रिड पर फोटो ड्रा करें
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * (pw + gapX);
        const y = startY + r * (ph + gapY);

        sCtx.drawImage(singleCanvas, x, y, pw, ph);

        // फोटो के चारों ओर केवल एक शुद्ध, ठोस काली आउटलाइन (प्लेन व्हाइट मार्जिन के साथ)
        if (showBorder) {
          sCtx.strokeStyle = '#000000';
          sCtx.lineWidth = 2;
          sCtx.strokeRect(x, y, pw, ph);
        }
      }
    }

    return { canvas: sheetCanvas, isA4 };
  };

  // 1. 300 DPI शीट JPG डाउनलोड
  const downloadSheetJpg = () => {
    const result = generateSheetCanvas();
    if (!result) return;

    const a = document.createElement('a');
    a.download = `passport_grid_${sheetType}_300dpi.jpg`;
    a.href = result.canvas.toDataURL('image/jpeg', 0.98);
    a.click();
  };

  // 2. डायरेक्ट प्रिंटेबल PDF डाउनलोड
  const downloadSheetPdf = () => {
    const result = generateSheetCanvas();
    if (!result) return;

    const imgData = result.canvas.toDataURL('image/jpeg', 0.98);

    if (result.isA4) {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      pdf.save(`passport_sheet_A4_${Date.now()}.pdf`);
    } else {
      // 4x6 इंच = 101.6 x 152.4 मिमी (लैंडस्केप 152.4 x 101.6)
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [101.6, 152.4] });
      pdf.addImage(imgData, 'JPEG', 0, 0, 152.4, 101.6, undefined, 'FAST');
      pdf.save(`passport_sheet_4x6_${Date.now()}.pdf`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        
        <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-900 text-xs font-bold rounded-full mb-3">
          🖨️ 4x6 व A4 शीट • 300 DPI स्टूडियो प्रिंट
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          पासपोर्ट फोटो ग्रिड शीट मेकर (Passport Photo Grid)
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          1 फोटो से तुरंत 6 या 8 फोटो की 4x6 शीट (8 या 12 फोटो) और 30 फोटो की A4 प्रिंटेबल शीट कटिंग बॉर्डर के साथ 300 DPI में तैयार करें।
        </p>

        {/* 1. कैमरा व गैलरी इनपुट */}
        <div className="border-2 border-dashed border-indigo-300 rounded-2xl p-5 text-center bg-indigo-50/40 mb-6">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={(e) => handleImageFile(e.target.files?.[0])}
            className="hidden"
          />
          <input
            type="file"
            accept="image/*"
            ref={galleryInputRef}
            onChange={(e) => handleImageFile(e.target.files?.[0])}
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>📸</span>
              <span>कैमरा खोलें (लाइव फोटो खींचे)</span>
            </button>

            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-sm font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>📁</span>
              <span>गैलरी से सिंगल फोटो चुनें</span>
            </button>
          </div>
        </div>

        {/* 2. लाइव पासपोर्ट अलाइनमेंट प्रीव्यू */}
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-600 mb-2 flex items-center justify-between">
            <span>👇 चेहरे को सही अनुपात में लाने के लिए फोटो को ड्रैग करें:</span>
            <span className="text-[11px] text-indigo-700 font-mono">3.5 × 4.5 सेमी</span>
          </p>

          <div className="flex justify-center">
            <div className="border-4 border-slate-800 rounded-2xl p-2 bg-white shadow-md">
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="relative w-56 h-72 bg-slate-100 rounded-xl overflow-hidden touch-none select-none flex items-center justify-center cursor-move"
              >
                {imageSrc ? (
                  <canvas ref={previewCanvasRef} className="w-full h-full object-contain pointer-events-none" />
                ) : (
                  <div className="text-center p-4 text-slate-400">
                    <span className="text-3xl block mb-1">👤</span>
                    <span className="text-xs font-bold">ऊपर से फोटो खींचें या चुनें</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. ज़ूम और रोटेशन */}
        {imageSrc && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 mb-6">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>🔍 फ़ोटो ज़ूम (Zoom):</span>
                <span className="text-indigo-700 font-mono">{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.5}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* ब्राइटनेस और कंट्रास्ट स्लाइडर */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>☀️ चेहरे की चमक (Brightness):</span>
                <span className="text-indigo-700 font-mono">{brightness > 0 ? `+${brightness}` : brightness}</span>
              </div>
              <input
                type="range"
                min={-30}
                max={50}
                step={1}
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>🖋️ कंट्रास्ट / गाढ़ापन (Contrast):</span>
                <span className="text-indigo-700 font-mono">{contrast > 0 ? `+${contrast}%` : `${contrast}%`}</span>
              </div>
              <input
                type="range"
                min={-20}
                max={60}
                step={1}
                value={contrast}
                onChange={(e) => setContrast(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <button type="button" onClick={() => { setBrightness(0); setContrast(0); }} className="text-indigo-700 underline font-bold cursor-pointer">
                  डिफ़ॉल्ट रिसेट
                </button>
                <button type="button" onClick={() => { setBrightness(12); setContrast(16); }} className="text-emerald-700 underline font-bold cursor-pointer">
                  ⚡ ऑटो-स्टूडियो लाइटिंग
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>📐 सीधा करें (Rotate):</span>
                <span className="text-indigo-700 font-mono">{rotation}°</span>
              </div>
              <input
                type="range"
                min={-45}
                max={45}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>-45°</span>
                <button type="button" onClick={() => setRotation(0)} className="text-indigo-700 underline font-bold cursor-pointer">
                  0° रीसेट
                </button>
                <span>+45°</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. शीट फॉर्मेट चयन (4x6 या A4) */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-6">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            🖨️ प्रिंटेबल शीट का प्रकार चुनें:
          </label>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { id: '4x6_8', title: '4x6 इंच - 8 फोटो', desc: 'सर्वाधिक लोकप्रिय (4x2 ग्रिड)' },
              { id: '4x6_12', title: '4x6 इंच - 12 फोटो', desc: 'पोर्ट्रेट शीट (3x4 ग्रिड - अधिकतम फोटो)' },
              { id: 'a4_30', title: 'A4 शीट - 30 फोटो', desc: 'मानक A4 प्रिंट (5x6 ग्रिड)' },
              { id: 'a4_36', title: 'A4 शीट - 36 फोटो', desc: 'अधिकतम संख्या (6x6 ग्रिड)' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSheetType(st.id as SheetType)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  sheetType === st.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-800 border-slate-300 hover:border-indigo-400'
                }`}
              >
                <div className="text-xs font-black">{st.title}</div>
                <div className={`text-[10px] mt-0.5 ${sheetType === st.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {st.desc}
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
            <input
              type="checkbox"
              id="cuttingBorder"
              checked={showBorder}
              onChange={(e) => setShowBorder(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-600"
            />
            <label htmlFor="cuttingBorder" className="text-xs font-bold text-slate-700 cursor-pointer">
              ✂️ कटिंग गाइड बॉर्डर शामिल करें (कैंची से बराबर काटने हेतु)
            </label>
          </div>
        </div>

        {/* 5. डाउनलोड बटन्स */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={downloadSheetJpg}
            disabled={!imageSrc}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
          >
            <span>🖼️</span>
            <span>300 DPI शीट JPG डाउनलोड करें (फोटो प्रिंटर हेतु)</span>
          </button>

          <button
            type="button"
            onClick={downloadSheetPdf}
            disabled={!imageSrc}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
          >
            <span>📄</span>
            <span>प्रिंटेबल PDF डाउनलोड करें (डायरेक्ट प्रिंट)</span>
          </button>
        </div>

      </div>

      <FaqSection 
        title="पासपोर्ट फोटो ग्रिड शीट - अक्सर पूछे जाने वाले सवाल"
        items={gridFaqs}
        pageUrl="https://examsewa.online/tools/passport-grid-maker"
      />

    </div>
  );
}
