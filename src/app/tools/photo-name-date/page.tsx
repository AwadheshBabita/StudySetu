'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import FaqSection from '@/components/FaqSection';

export default function PhotoNameDatePage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // फॉर्म इनपुट्स
  const [candidateName, setCandidateName] = useState<string>('RAHUL SHARMA');
  const [dateOfPhoto, setDateOfPhoto] = useState<string>('');

  // अलाइनमेंट और स्टाइल
  const [zoom, setZoom] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [targetKb, setTargetKb] = useState<number>(35);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const loadedImgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    setDateOfPhoto(`${dd}/${mm}/${yyyy}`);
  }, []);

  const dopFaqs = [
    {
      q: "फोटो पर नाम और तारीख (DOP) लिखना क्यों जरूरी है?",
      a: "SSC (CGL, CHSL, GD), UPSC, रेलवे और कई राज्य पुलिस भर्तियों में स्पष्ट नियम होता है कि फोटो पर उम्मीदवार का नाम और फोटो खिंचवाने की तारीख (Date of Photo - DOP) लिखी होनी चाहिए, अन्यथा फॉर्म रिजेक्ट हो जाता है।"
    },
    {
      q: "क्या यह टूल 300 DPI प्रिंटिंग और 4x6 शीट सपोर्ट करता है?",
      a: "हाँ, आप ऑनलाइन फॉर्म के लिए 20KB-50KB का साइज भी डाउनलोड कर सकते हैं और स्टूडियो प्रिंटिंग हेतु 300 DPI HD फोटो या 6/8 फोटो वाली 4x6 इंच प्रिंटेबल शीट भी 1-क्लिक में पा सकते हैं।"
    },
    {
      q: "क्या मोबाइल कैमरे से तुरंत फोटो खींचकर नाम-डेट जोड़ सकते हैं?",
      a: "हाँ, 'कैमरा खोलें' बटन दबाकर आप सीधे लाइव फोटो खींच सकते हैं, चेहरे को ज़ूम/ड्रैग करके सेट कर सकते हैं और नीचे अपना नाम व तारीख स्टैम्प कर सकते हैं।"
    },
    {
      q: "क्या मेरा डेटा सुरक्षित है?",
      a: "यह टूल 100% क्लाइंट-साइड (ब्राउज़र के अंदर) प्रोसेस होता है। आपकी फोटो या नाम किसी बाहरी सर्वर पर अपलोड नहीं होता।"
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

  const drawPhotoOnCanvas = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const img = loadedImgRef.current;
    if (!img) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2 + (offset.x * width) / 350, (height * 0.42) + (offset.y * height) / 450);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const imgAspect = img.width / img.height;
    let renderW = width * 1.1;
    let renderH = renderW / imgAspect;

    ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);
    ctx.restore();

    const stripHeight = height * 0.21;
    const stripY = height - stripHeight;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, stripY, width, stripHeight);

    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = Math.max(1, Math.round(width / 350));
    ctx.beginPath();
    ctx.moveTo(0, stripY);
    ctx.lineTo(width, stripY);
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const nameFontSize = Math.round(width * 0.072);
    const dateFontSize = Math.round(width * 0.062);

    ctx.font = `bold ${nameFontSize}px Arial, sans-serif`;
    const cleanName = candidateName.trim().toUpperCase() || 'YOUR NAME';
    ctx.fillText(cleanName, width / 2, stripY + stripHeight * 0.35);

    ctx.font = `bold ${dateFontSize}px Arial, sans-serif`;
    const cleanDate = dateOfPhoto.trim() ? `DOP: ${dateOfPhoto.trim()}` : 'DOP: DD/MM/YYYY';
    ctx.fillText(cleanDate, width / 2, stripY + stripHeight * 0.74);
  }, [candidateName, dateOfPhoto, zoom, rotation, offset]);

  useEffect(() => {
    if (!imageSrc) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 350;
    canvas.height = 450;
    drawPhotoOnCanvas(ctx, 350, 450);
  }, [imageSrc, drawPhotoOnCanvas]);

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

  const downloadOnlineFormJpg = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 420;
    canvas.height = 540;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawPhotoOnCanvas(ctx, 420, 540);

    let minQ = 0.15;
    let maxQ = 0.95;
    let bestUrl = canvas.toDataURL('image/jpeg', 0.85);

    for (let i = 0; i < 6; i++) {
      const midQ = (minQ + maxQ) / 2;
      const url = canvas.toDataURL('image/jpeg', midQ);
      const curKb = (url.length * 3) / 4 / 1024;

      if (curKb > targetKb) {
        maxQ = midQ;
      } else {
        bestUrl = url;
        minQ = midQ;
      }
    }

    const a = document.createElement('a');
    a.download = `${candidateName.replace(/\s+/g, '_')}_photo_${targetKb}KB.jpg`;
    a.href = bestUrl;
    a.click();
  };

  const downloadStudioSingleJpg = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1050;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawPhotoOnCanvas(ctx, 1050, 1350);

    const a = document.createElement('a');
    a.download = `${candidateName.replace(/\s+/g, '_')}_studio_300dpi.jpg`;
    a.href = canvas.toDataURL('image/jpeg', 0.98);
    a.click();
  };

  const download4x6PrintSheet = () => {
    const sheetCanvas = document.createElement('canvas');
    const sw = 1800;
    const sh = 1200;
    sheetCanvas.width = sw;
    sheetCanvas.height = sh;
    const sCtx = sheetCanvas.getContext('2d');
    if (!sCtx) return;

    sCtx.fillStyle = '#FFFFFF';
    sCtx.fillRect(0, 0, sw, sh);

    const pw = 380;
    const ph = 490;
    const singleCanvas = document.createElement('canvas');
    singleCanvas.width = pw;
    singleCanvas.height = ph;
    const pCtx = singleCanvas.getContext('2d');
    if (!pCtx) return;
    drawPhotoOnCanvas(pCtx, pw, ph);

    const cols = 4;
    const rows = 2;
    const startX = 60;
    const startY = 80;
    const gapX = 50;
    const gapY = 50;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * (pw + gapX);
        const y = startY + r * (ph + gapY);

        sCtx.drawImage(singleCanvas, x, y, pw, ph);
        sCtx.strokeStyle = '#E2E8F0';
        sCtx.lineWidth = 1;
        sCtx.strokeRect(x, y, pw, ph);
      }
    }

    const a = document.createElement('a');
    a.download = `${candidateName.replace(/\s+/g, '_')}_4x6_print_sheet.jpg`;
    a.href = sheetCanvas.toDataURL('image/jpeg', 0.98);
    a.click();
  };

  const setTodayDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    setDateOfPhoto(`${dd}/${mm}/${yyyy}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full mb-3">
          🏪 CSC & साइबर कैफ़े स्पेशल • DOP मास्टर
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          फोटो पर नाम और तारीख मेकर (Name & Date on Photo)
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          सरकारी फॉर्म (SSC, UPSC, Police) हेतु 20KB-50KB फोटो बनाएँ या कलर प्रिंट निकालने के लिए 300 DPI 4x6 प्रिंटेबल शीट पाएँ।
        </p>

        <div className="border-2 border-dashed border-amber-300 rounded-2xl p-5 text-center bg-amber-50/40 mb-6">
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
              className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <span>📸</span>
              <span>कैमरा खोलें (लाइव फोटो खींचे)</span>
            </button>

            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-sm font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <span>📁</span>
              <span>गैलरी से चुनें</span>
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-6 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              उम्मीदवार का नाम (Candidate Name):
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="उदा. RAHUL SHARMA"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold uppercase focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">
                फोटो खींचने की तारीख (Date of Photo - DOP):
              </label>
              <button
                type="button"
                onClick={setTodayDate}
                className="text-xs text-amber-700 font-bold underline"
              >
                ⚡ आज की तारीख डालें
              </button>
            </div>
            <input
              type="text"
              value={dateOfPhoto}
              onChange={(e) => setDateOfPhoto(e.target.value)}
              placeholder="DD/MM/YYYY (उदा. 19/09/2026)"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold text-slate-600 mb-2 flex items-center justify-between">
            <span>👇 चेहरे को केंद्र में रखने के लिए फोटो को ड्रैग करें:</span>
            <span className="text-[11px] text-amber-700 font-mono">मानक 3.5cm × 4.5cm</span>
          </p>

          <div className="flex justify-center">
            <div className="border-4 border-slate-800 rounded-2xl p-2 bg-white shadow-md">
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="relative w-64 h-80 bg-slate-100 rounded-xl overflow-hidden touch-none select-none flex items-center justify-center cursor-move"
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

        {imageSrc && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 mb-6">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>🔍 फ़ोटो ज़ूम (Zoom):</span>
                <span className="text-amber-700 font-mono">{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.5}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>📐 सीधा करें (Rotate):</span>
                <span className="text-amber-700 font-mono">{rotation}°</span>
              </div>
              <input
                type="range"
                min={-45}
                max={45}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>-45°</span>
                <button type="button" onClick={() => setRotation(0)} className="text-amber-700 underline font-bold">
                  0° रीसेट
                </button>
                <span>+45°</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>🎯 ऑनलाइन फॉर्म साइज़ लक्ष्य:</span>
                <span className="text-amber-700 font-mono">{targetKb} KB</span>
              </div>
              <input
                type="range"
                min={20}
                max={50}
                step={5}
                value={targetKb}
                onChange={(e) => setTargetKb(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span onClick={() => setTargetKb(20)} className="cursor-pointer hover:text-amber-700">20 KB (SSC)</span>
                <span onClick={() => setTargetKb(35)} className="cursor-pointer hover:text-amber-700">35 KB (मानक)</span>
                <span onClick={() => setTargetKb(50)} className="cursor-pointer hover:text-amber-700">50 KB (UPSC)</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={downloadOnlineFormJpg}
            disabled={!imageSrc}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <span>📥</span>
            <span>ऑनलाइन फॉर्म हेतु डाउनलोड करें ({targetKb} KB लक्ष्य)</span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={downloadStudioSingleJpg}
              disabled={!imageSrc}
              className="py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <span>🖼️</span>
              <span>स्टूडियो प्रिंट HD फोटो (300 DPI)</span>
            </button>

            <button
              type="button"
              onClick={download4x6PrintSheet}
              disabled={!imageSrc}
              className="py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <span>🖨️</span>
              <span>4x6 प्रिंटेबल शीट (8 फोटो ग्रिड)</span>
            </button>
          </div>
        </div>

      </div>

      <FaqSection 
        title="फोटो पर नाम व तारीख मेकर - अक्सर पूछे जाने वाले सवाल"
        items={dopFaqs}
        pageUrl="https://examsewa.online/tools/photo-name-date"
      />

    </div>
  );
}
