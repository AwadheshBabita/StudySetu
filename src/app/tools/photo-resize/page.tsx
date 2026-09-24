'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';

// बाइनरी स्तर पर सटीक DPI (300, 600 आदि) और सटीक KB पैडिंग इंजेक्ट करने वाला मास्टर फ़ंक्शन
function buildAccurateJpeg(rawBase64: string, dpi: number, targetBytes: number): string {
  const pureBase64 = rawBase64.replace(/^data:image\/jpeg;base64,/, '');
  const rawBinary = atob(pureBase64);
  const rawLen = rawBinary.length;
  const rawBytes = new Uint8Array(rawLen);
  for (let i = 0; i < rawLen; i++) {
    rawBytes[i] = rawBinary.charCodeAt(i);
  }

  // मानक 18-बाइट JFIF हेडर (DPI को 100% विंडोज़/सरकारी पोर्टल में मान्यता दिलाने के लिए)
  const jfifHeader = new Uint8Array([
    0xff, 0xe0, // APP0 Marker
    0x00, 0x10, // Length = 16 bytes
    0x4a, 0x46, 0x49, 0x46, 0x00, // "JFIF\0"
    0x01, 0x01, // Version 1.1
    0x01,       // 1 = Dots Per Inch (DPI)
    (dpi >> 8) & 0xff, dpi & 0xff, // X DPI
    (dpi >> 8) & 0xff, dpi & 0xff, // Y DPI
    0x00, 0x00  // Thumbnail size = 0
  ]);

  // पुराना हेडर हटाकर बॉडी निकालना
  let bodyStart = 2; // FF D8 के बाद
  if (rawBytes[2] === 0xff && (rawBytes[3] === 0xe0 || rawBytes[3] === 0xe1)) {
    const blockLen = (rawBytes[4] << 8) + rawBytes[5];
    bodyStart = 4 + blockLen;
  }

  const bodyBytes = rawBytes.slice(bodyStart);

  // टारगेट KB के लिए सुरक्षित JPEG Comment (0xFF 0xFE) पैडिंग
  let paddingChunk = new Uint8Array(0);
  const currentTotal = 2 + jfifHeader.length + bodyBytes.length;
  if (currentTotal < targetBytes) {
    const needed = targetBytes - currentTotal;
    if (needed > 4) {
      const padLen = Math.min(65533, needed - 2);
      paddingChunk = new Uint8Array(padLen + 2);
      paddingChunk[0] = 0xff;
      paddingChunk[1] = 0xfe; // COM Marker
      paddingChunk[2] = (padLen >> 8) & 0xff;
      paddingChunk[3] = padLen & 0xff;
      for (let p = 4; p < padLen + 2; p++) {
        paddingChunk[p] = 0x20; // Safe Space Filler
      }
    }
  }

  // फाइनल बाइनरी जोड़ना: SOI + JFIF + Padding + Body
  const finalLen = 2 + jfifHeader.length + paddingChunk.length + bodyBytes.length;
  const finalBytes = new Uint8Array(finalLen);
  finalBytes[0] = 0xff;
  finalBytes[1] = 0xd8; // SOI
  finalBytes.set(jfifHeader, 2);
  finalBytes.set(paddingChunk, 2 + jfifHeader.length);
  finalBytes.set(bodyBytes, 2 + jfifHeader.length + paddingChunk.length);

  let binaryStr = '';
  const chunk = 8192;
  for (let i = 0; i < finalLen; i += chunk) {
    binaryStr += String.fromCharCode.apply(null, Array.from(finalBytes.subarray(i, i + chunk)));
  }

  return 'data:image/jpeg;base64,' + btoa(binaryStr);
}

export default function PhotoResizePage() {
  const [sizeMode, setSizeMode] = useState<'default' | 'custom'>('default');

  const [customUnit, setCustomUnit] = useState<'cm' | 'mm' | 'px' | 'inch'>('cm');
  const [cmWidthStr, setCmWidthStr] = useState<string>('3.5');
  const [cmHeightStr, setCmHeightStr] = useState<string>('4.5');
  const [mmWidthStr, setMmWidthStr] = useState<string>('35');
  const [mmHeightStr, setMmHeightStr] = useState<string>('45');
  const [pxWidthStr, setPxWidthStr] = useState<string>('413');
  const [pxHeightStr, setPxHeightStr] = useState<string>('531');
  const [inchWidthStr, setInchWidthStr] = useState<string>('1.38');
  const [inchHeightStr, setInchHeightStr] = useState<string>('1.77');
  const [dpiStr, setDpiStr] = useState<string>('300');

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);

  const [targetKb, setTargetKb] = useState<number>(35);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputKb, setOutputKb] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const cachedImgRef = useRef<HTMLImageElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUri = ev.target?.result as string;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          cachedImgRef.current = img;
          setImageSrc(dataUri);
          setRotation(0);
          setZoomLevel(1);
          setPanOffset({ x: 0, y: 0 });
        };
        img.src = dataUri;
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handlePointerDown = (clientX: number, clientY: number) => {
    if (!imageSrc) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: clientX - panOffset.x,
      y: clientY - panOffset.y
    };
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setPanOffset({
      x: clientX - dragStartRef.current.x,
      y: clientY - dragStartRef.current.y
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const getCalculatedDimensions = useCallback((): { width: number; height: number; label: string; currentDpi: number } => {
    if (sizeMode === 'default') {
      const wPx = Math.round((3.5 / 2.54) * 300); // 413 px
      const hPx = Math.round((4.5 / 2.54) * 300); // 531 px
      return { width: wPx, height: hPx, label: 'पासपोर्ट (3.5×4.5 cm @ 300 DPI)', currentDpi: 300 };
    }

    const currentDpi = Math.max(72, Math.min(600, parseInt(dpiStr, 10) || 300));

    if (customUnit === 'cm') {
      const parsedW = parseFloat(cmWidthStr) || 3.5;
      const parsedH = parseFloat(cmHeightStr) || 4.5;
      const wPx = Math.max(40, Math.round((parsedW / 2.54) * currentDpi));
      const hPx = Math.max(40, Math.round((parsedH / 2.54) * currentDpi));
      return { width: wPx, height: hPx, label: `${parsedW}×${parsedH} cm (${currentDpi} DPI)`, currentDpi };
    } else if (customUnit === 'mm') {
      const parsedW = parseFloat(mmWidthStr) || 35;
      const parsedH = parseFloat(mmHeightStr) || 45;
      const wPx = Math.max(40, Math.round((parsedW / 25.4) * currentDpi));
      const hPx = Math.max(40, Math.round((parsedH / 25.4) * currentDpi));
      return { width: wPx, height: hPx, label: `${parsedW}×${parsedH} mm (${currentDpi} DPI)`, currentDpi };
    } else if (customUnit === 'inch') {
      const parsedW = parseFloat(inchWidthStr) || 1.38;
      const parsedH = parseFloat(inchHeightStr) || 1.77;
      const wPx = Math.max(40, Math.round(parsedW * currentDpi));
      const hPx = Math.max(40, Math.round(parsedH * currentDpi));
      return { width: wPx, height: hPx, label: `${parsedW}×${parsedH} inch (${currentDpi} DPI)`, currentDpi };
    } else {
      const parsedW = Math.max(30, parseInt(pxWidthStr, 10) || 413);
      const parsedH = Math.max(30, parseInt(pxHeightStr, 10) || 531);
      return { width: parsedW, height: parsedH, label: `${parsedW}×${parsedH} px (${currentDpi} DPI)`, currentDpi };
    }
  }, [sizeMode, customUnit, cmWidthStr, cmHeightStr, mmWidthStr, mmHeightStr, inchWidthStr, inchHeightStr, pxWidthStr, pxHeightStr, dpiStr]);

  const renderCanvas = useCallback((): HTMLCanvasElement | null => {
    const img = cachedImgRef.current;
    if (!img) return null;

    const { width: outW, height: outH } = getCalculatedDimensions();

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outW, outH);

    ctx.save();
    ctx.translate(outW / 2 + panOffset.x, outH / 2 + panOffset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoomLevel, zoomLevel);

    const imgAspect = img.width / img.height;
    const boxAspect = outW / outH;
    let dW, dH;

    if (imgAspect > boxAspect) {
      dH = outH;
      dW = dH * imgAspect;
    } else {
      dW = outW;
      dH = dW / imgAspect;
    }

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.drawImage(img, -dW / 2, -dH / 2, dW, dH);
    ctx.filter = 'none';
    ctx.restore();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, outW, outH);

    return canvas;
  }, [getCalculatedDimensions, rotation, zoomLevel, panOffset, brightness, contrast]);

  const processPhoto = useCallback(() => {
    if (!cachedImgRef.current) return;
    setIsProcessing(true);

    const canvas = renderCanvas();
    if (!canvas) {
      setIsProcessing(false);
      return;
    }

    const { currentDpi } = getCalculatedDimensions();
    const targetBytes = targetKb * 1024;
    let minQ = 0.02;
    let maxQ = 0.99;
    let bestQ = 0.85;
    let bestData = canvas.toDataURL('image/jpeg', bestQ);

    for (let step = 0; step < 9; step++) {
      const midQ = (minQ + maxQ) / 2;
      const dUrl = canvas.toDataURL('image/jpeg', midQ);
      const head = 'data:image/jpeg;base64,';
      const bytes = Math.round(((dUrl.length - head.length) * 3) / 4);

      if (bytes > targetBytes) {
        maxQ = midQ;
      } else {
        bestQ = midQ;
        bestData = dUrl;
        minQ = midQ;
      }
    }

    // सटीक बाइनरी DPI और सेफ पैडिंग इंजेक्शन
    const finalData = buildAccurateJpeg(bestData, currentDpi, targetBytes);
    const pure = finalData.replace(/^data:image\/jpeg;base64,/, '');
    const actualKb = Math.round((pure.length * 3) / 4 / 1024);

    setOutputUrl(finalData);
    setOutputKb(actualKb);
    setIsProcessing(false);
  }, [targetKb, renderCanvas, getCalculatedDimensions]);

  useEffect(() => {
    if (imageSrc) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        processPhoto();
      }, 50);
    }
  }, [imageSrc, sizeMode, customUnit, cmWidthStr, cmHeightStr, mmWidthStr, mmHeightStr, inchWidthStr, inchHeightStr, pxWidthStr, pxHeightStr, dpiStr, rotation, zoomLevel, panOffset, brightness, contrast, targetKb, processPhoto]);

  const downloadJpg = () => {
    if (!outputUrl) return;
    const a = document.createElement('a');
    a.href = outputUrl;
    a.download = `Photo_${sizeMode === 'default' ? 'Passport_3.5x4.5cm' : customUnit}_${outputKb}KB.jpg`;
    a.click();
  };

  const downloadPdf = () => {
    if (!outputUrl) return;
    try {
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const imgProps = pdf.getImageProperties(outputUrl);
      const pdfW = pdf.internal.pageSize.getWidth();
      const photoW = 35;
      const photoH = (imgProps.height * photoW) / imgProps.width;
      const x = (pdfW - photoW) / 2;
      const y = 40;

      pdf.addImage(outputUrl, 'JPEG', x, y, photoW, photoH);
      pdf.save(`Photo_${sizeMode === 'default' ? 'Passport_3.5x4.5cm' : customUnit}_${outputKb}KB.pdf`);
    } catch (e) {
      console.error(e);
      alert('PDF डाउनलोड करने में समस्या आई।');
    }
  };

  const currentDimensions = getCalculatedDimensions();

  // 1. मुख्य कैनवास / लाइव प्रीव्यू ब्लॉक
  const CanvasSection = (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs text-center h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black text-slate-700 uppercase">
            मुख्य कैनवास प्रीव्यू
          </span>
          {imageSrc && (
            <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
              ✋ पकड़कर खिसकाएँ
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {isProcessing && (
            <span className="text-[11px] text-amber-600 animate-pulse font-bold">
              ⚡ प्रोसेसिंग...
            </span>
          )}
          {outputKb > 0 && (
            <span className="text-xs font-extrabold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
              {outputKb} KB | {currentDimensions.label}
            </span>
          )}
        </div>
      </div>

      <div
        onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
        onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={(e) => {
          if (e.touches[0]) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchMove={(e) => {
          if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={handlePointerUp}
        className={`bg-slate-200 p-2 sm:p-6 rounded-xl border border-slate-300 flex items-center justify-center flex-1 min-h-[220px] sm:min-h-[280px] lg:min-h-[580px] overflow-hidden select-none ${
          imageSrc ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''
        }`}
      >
        {outputUrl ? (
          <div className="bg-white p-2 rounded-xl shadow-2xl border border-slate-300 flex items-center justify-center max-w-[240px] sm:max-w-[320px] lg:max-w-[420px] pointer-events-none">
            <img
              src={outputUrl}
              alt="Photo Preview"
              className="w-full max-h-[210px] sm:max-h-[270px] lg:max-h-[520px] object-contain block mx-auto rounded"
            />
          </div>
        ) : (
          <div className="text-slate-400 text-xs sm:text-sm font-medium py-16">
            कृपया दाईं तरफ से फोटो खींचें या अपलोड करें
          </div>
        )}
      </div>
    </div>
  );

  // 2. साइडबार कंट्रोल्स
  const ControlsSidebar = (
    <div className="flex flex-col gap-3">
      {/* 1. अपलोड / कैमरा */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        {!imageSrc ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="p-3 rounded-xl border-2 border-dashed border-blue-500/60 bg-blue-50/50 hover:bg-blue-100/60 text-center flex flex-col items-center justify-center cursor-pointer transition-all"
            >
              <span className="text-2xl mb-0.5">📷</span>
              <span className="text-xs font-black text-blue-900">कैमरा खोलें</span>
              <span className="text-[9px] text-blue-700">फोटो खींचें</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-center flex flex-col items-center justify-center cursor-pointer transition-all"
            >
              <span className="text-2xl mb-0.5">📁</span>
              <span className="text-xs font-black text-slate-800">गैलरी / फाइल्स</span>
              <span className="text-[9px] text-slate-500">मेमोरी से चुनें</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <span className="text-green-600 font-bold">✔</span> फोटो लोड है
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="text-blue-700 font-bold hover:underline cursor-pointer"
              >
                📷 कैमरा
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-slate-700 font-bold hover:underline cursor-pointer"
              >
                📁 फाइल्स
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. रोटेशन व ज़ूम */}
      {imageSrc && (
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black text-slate-700 uppercase">
                🔄 रोटेशन: {rotation > 0 ? `+${rotation}° दाएँ` : rotation < 0 ? `${rotation}° बाएँ` : `0° (सीधा)`}
              </span>
              {rotation !== 0 && (
                <button
                  type="button"
                  onClick={() => setRotation(0)}
                  className="text-[9px] text-red-600 font-bold hover:underline cursor-pointer"
                >
                  रीसेट (0°)
                </button>
              )}
            </div>
            <input
              type="range"
              min="-90"
              max="90"
              step="1"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-1.5"
            />
            <div className="flex justify-between text-[8px] font-bold text-slate-400 mt-0.5">
              <span onClick={() => setRotation(-90)} className="cursor-pointer hover:text-blue-600">-90°</span>
              <span onClick={() => setRotation(0)} className="cursor-pointer text-blue-700 font-black">0°</span>
              <span onClick={() => setRotation(90)} className="cursor-pointer hover:text-blue-600">+90°</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black text-slate-700 uppercase">
                🔍 ज़ूम: {zoomLevel.toFixed(1)}x
              </span>
              {(panOffset.x !== 0 || panOffset.y !== 0 || zoomLevel !== 1) && (
                <button
                  type="button"
                  onClick={() => {
                    setPanOffset({ x: 0, y: 0 });
                    setZoomLevel(1);
                  }}
                  className="text-[9px] text-blue-700 font-bold hover:underline cursor-pointer"
                >
                  🎯 सेंटर रीसेट
                </button>
              )}
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="0.1"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-100">
            <div>
              <div className="flex justify-between text-[9px] font-bold text-slate-600 mb-0.5">
                <span>सफेदी (Light)</span>
                <span className="text-blue-700 font-bold">{brightness}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5"
              />
            </div>
            <div>
              <div className="flex justify-between text-[9px] font-bold text-slate-600 mb-0.5">
                <span>कंट्रास्ट (Sharp)</span>
                <span className="text-blue-700 font-bold">{contrast}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="150"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. डिफ़ॉल्ट बनाम कस्टम साइज़ पैनल */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-700 uppercase">
            फोटो साइज़ सेटिंग्स
          </span>
          <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setSizeMode('default')}
              className={`px-2.5 py-1 text-[10px] font-black rounded cursor-pointer transition-all ${
                sizeMode === 'default' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              डिफ़ॉल्ट पासपोर्ट
            </button>
            <button
              type="button"
              onClick={() => setSizeMode('custom')}
              className={`px-2.5 py-1 text-[10px] font-black rounded cursor-pointer transition-all ${
                sizeMode === 'custom' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚙️ कस्टम साइज़
            </button>
          </div>
        </div>

        {sizeMode === 'default' ? (
          <div className="bg-blue-50/60 p-2.5 rounded-lg border border-blue-200 text-center">
            <span className="text-xs font-black text-blue-900 block">
              मानक पासपोर्ट फोटो: 3.5 × 4.5 सेमी @ 300 DPI
            </span>
            <span className="text-[10px] text-blue-700 block mt-0.5">
              (SSC, UP Police, रेलवे, UPSC आदि 95% सरकारी फॉर्म्स का मानक)
            </span>
          </div>
        ) : (
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-600 uppercase">इकाई चुनें:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setCustomUnit('cm')}
                  className={`px-2 py-0.5 text-[10px] font-black rounded cursor-pointer ${
                    customUnit === 'cm' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  सेंटीमीटर (CM)
                </button>
                <button
                  type="button"
                  onClick={() => setCustomUnit('mm')}
                  className={`px-2 py-0.5 text-[10px] font-black rounded cursor-pointer ${
                    customUnit === 'mm' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  मिलीमीटर (MM)
                </button>
                <button
                  type="button"
                  onClick={() => setCustomUnit('px')}
                  className={`px-2 py-0.5 text-[10px] font-black rounded cursor-pointer ${
                    customUnit === 'px' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  पिक्सेल (Px)
                </button>
                <button
                  type="button"
                  onClick={() => setCustomUnit('inch')}
                  className={`px-2 py-0.5 text-[10px] font-black rounded cursor-pointer ${
                    customUnit === 'inch' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  इंच (Inch)
                </button>
              </div>
            </div>

            {/* सेंटीमीटर (CM) */}
            {customUnit === 'cm' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-600 block mb-0.5">चौड़ाई (CM)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={cmWidthStr}
                    onChange={(e) => setCmWidthStr(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="3.5"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-600 block mb-0.5">ऊँचाई (CM)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={cmHeightStr}
                    onChange={(e) => setCmHeightStr(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="4.5"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-bold"
                  />
                </div>
              </div>
            )}

            {/* मिलीमीटर (MM) */}
            {customUnit === 'mm' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-600 block mb-0.5">चौड़ाई (MM)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={mmWidthStr}
                    onChange={(e) => setMmWidthStr(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="35"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-600 block mb-0.5">ऊँचाई (MM)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={mmHeightStr}
                    onChange={(e) => setMmHeightStr(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="45"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-bold"
                  />
                </div>
              </div>
            )}

            {/* पिक्सेल (Px) */}
            {customUnit === 'px' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-600 block mb-0.5">चौड़ाई (Px)</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={pxWidthStr}
                    onChange={(e) => setPxWidthStr(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="413"
                    className="w-full px-2.5 py-1.5 text-xs border border-blue-400 bg-blue-50/20 rounded font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-600 block mb-0.5">ऊँचाई (Px)</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={pxHeightStr}
                    onChange={(e) => setPxHeightStr(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="531"
                    className="w-full px-2.5 py-1.5 text-xs border border-blue-400 bg-blue-50/20 rounded font-bold"
                  />
                </div>
              </div>
            )}

            {/* इंच (Inch) */}
            {customUnit === 'inch' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-600 block mb-0.5">चौड़ाई (Inch)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={inchWidthStr}
                    onChange={(e) => setInchWidthStr(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="1.38"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-600 block mb-0.5">ऊँचाई (Inch)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={inchHeightStr}
                    onChange={(e) => setInchHeightStr(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="1.77"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-bold"
                  />
                </div>
              </div>
            )}

            {/* प्रिंट रेज़ोल्यूशन (DPI) */}
            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-600">प्रिंट रेज़ोल्यूशन (DPI):</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  inputMode="numeric"
                  value={dpiStr}
                  onChange={(e) => setDpiStr(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="300"
                  className="w-16 px-2 py-1 text-xs text-center border border-blue-400 bg-blue-50/20 rounded font-bold"
                />
                <span className="text-[9px] text-slate-400">मानक: 200 / 300 / 600</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. KB स्लाइडर (10 से 200 KB) */}
      {imageSrc && (
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black text-slate-700 uppercase">
              टारगेट फ़ाइल साइज (KB)
            </span>
            <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              {targetKb} KB
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="200"
            step="1"
            value={targetKb}
            onChange={(e) => setTargetKb(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer h-1.5"
          />
          <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-1">
            <span>10 KB</span>
            <span className="text-blue-700 font-bold">10 KB से 200 KB तक पूरी रेंज</span>
            <span>200 KB</span>
          </div>
        </div>
      )}

      {/* 5. डाउनलोड बटन्स */}
      {imageSrc && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={downloadJpg}
            disabled={!outputUrl || isProcessing}
            className="py-3 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          >
            <span>🖼️ JPG ({outputKb} KB)</span>
          </button>
          <button
            onClick={downloadPdf}
            disabled={!outputUrl || isProcessing}
            className="py-3 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          >
            <span>📄 A4 PDF</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 py-3 px-3 sm:px-6 select-none">
      <div className="max-w-[1500px] mx-auto">
        <div className="mb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
          >
            ← मुख्य होमपेज
          </Link>
        </div>

        <div className="bg-white py-2 px-4 rounded-xl border border-slate-200 shadow-xs mb-3 text-center">
          <h1 className="text-base sm:text-xl font-black text-slate-800">
            एग्जाम स्पेशल फोटो रिसाइज़र (Photo Pro)
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">
            मानक 3.5×4.5 सेमी पासपोर्ट फोटो या कस्टम CM / MM / Px / DPI में सटीक साइज़ व KB बनाएँ।
          </p>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFile}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFile}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        {/* --- 1. मोबाइल लेआउट --- */}
        <div className="block lg:hidden space-y-3">
          {CanvasSection}
          {ControlsSidebar}
        </div>

        {/* --- 2. कंप्यूटर लेआउट (2/3 + 1/3) --- */}
        <div className="hidden lg:grid grid-cols-12 gap-5 items-start">
          <div className="col-span-8 sticky top-3">
            {CanvasSection}
          </div>
          <div className="col-span-4">
            {ControlsSidebar}
          </div>
        </div>
      </div>
    </div>
  );
}
