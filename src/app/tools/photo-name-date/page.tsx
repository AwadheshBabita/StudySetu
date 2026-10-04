'use client';
import { exportSmartJpg } from "@/lib/image-engine";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';

// बाइनरी स्तर पर सटीक DPI (300 आदि) और सुरक्षित KB पैडिंग इंजेक्ट करने वाला मास्टर फ़ंक्शन
function buildAccurateJpeg(rawBase64: string, dpi: number, targetBytes: number): string {
  const pureBase64 = rawBase64.replace(/^data:image\/jpeg;base64,/, '');
  const rawBinary = atob(pureBase64);
  const rawLen = rawBinary.length;
  const rawBytes = new Uint8Array(rawLen);
  for (let i = 0; i < rawLen; i++) {
    rawBytes[i] = rawBinary.charCodeAt(i);
  }

  // 18-बाइट मानक JFIF हेडर (विंडोज़ और सरकारी पोर्टल के लिए 100% मान्य)
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

export default function PhotoNameDatePage() {
  const [sizeMode, setSizeMode] = useState<'default' | 'custom'>('default');

  // कस्टम साइज़ इनपुट्स
  const [customUnit, setCustomUnit] = useState<'cm' | 'mm' | 'px' | 'inch'>('cm');
  const [cmWidthStr, setCmWidthStr] = useState<string>('3.5');
  const [cmHeightStr, setCmHeightStr] = useState<string>('4.5');
  const [mmWidthStr, setMmWidthStr] = useState<string>('35');
  const [mmHeightStr, setMmHeightStr] = useState<string>('45');
  const [pxWidthStr, setPxWidthStr] = useState<string>('350');
  const [pxHeightStr, setPxHeightStr] = useState<string>('450');
  const [inchWidthStr, setInchWidthStr] = useState<string>('1.38');
  const [inchHeightStr, setInchHeightStr] = useState<string>('1.77');
  const [dpiStr, setDpiStr] = useState<string>('300');

  // इमेज व ट्रांसफॉर्म स्टेट्स
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // नाम और तारीख
  const [includeNameDate, setIncludeNameDate] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>('YOUR NAME');
  const [dateText, setDateText] = useState<string>('DOP: 23/09/2026');
  const [fontSize, setFontSize] = useState<number>(16);

  // ब्राइटनेस व कंट्रास्ट
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);

  // KB नियंत्रण (10 से 200 KB)
  const [targetKb, setTargetKb] = useState<number>(50);
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

  // पिक्सल और डायमेंशन की सटीक गणना (DPI के आधार पर)
  const getCalculatedDimensions = useCallback((): { width: number; height: number; label: string; currentDpi: number } => {
    if (sizeMode === 'default') {
      // 3.5 x 4.5 cm @ 300 DPI = 413 x 531 px (मानक सरकारी)
      const wPx = Math.round((3.5 / 2.54) * 300);
      const hPx = Math.round((4.5 / 2.54) * 300);
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
      const parsedW = Math.max(40, parseInt(pxWidthStr, 10) || 350);
      const parsedH = Math.max(40, parseInt(pxHeightStr, 10) || 450);
      return { width: parsedW, height: parsedH, label: `${parsedW}×${parsedH} px (${currentDpi} DPI)`, currentDpi };
    }
  }, [sizeMode, customUnit, cmWidthStr, cmHeightStr, mmWidthStr, mmHeightStr, inchWidthStr, inchHeightStr, pxWidthStr, pxHeightStr, dpiStr]);

  // सटीक पिक्सल कैनवास रेंडरर
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

    // नाम और तारीख पट्टी
    if (includeNameDate) {
      const stripH = Math.round(outH * 0.22);
      const stripY = outH - stripH;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, stripY, outW, stripH);

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, stripY);
      ctx.lineTo(outW, stripY);
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const scaleFont = outW / 350;
      const calculatedFontSize = Math.round(fontSize * scaleFont);
      ctx.font = `bold ${calculatedFontSize}px sans-serif`;

      if (userName && dateText) {
        ctx.fillText(userName.toUpperCase(), outW / 2, stripY + stripH * 0.35);
        ctx.font = `bold ${Math.round(calculatedFontSize * 0.88)}px sans-serif`;
        ctx.fillText(dateText, outW / 2, stripY + stripH * 0.72);
      } else if (userName) {
        ctx.fillText(userName.toUpperCase(), outW / 2, stripY + stripH / 2);
      } else if (dateText) {
        ctx.fillText(dateText, outW / 2, stripY + stripH / 2);
      }
    }

    // बाहरी काला बॉर्डर
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, outW, outH);

    return canvas;
  }, [getCalculatedDimensions, rotation, zoomLevel, panOffset, brightness, contrast, includeNameDate, fontSize, userName, dateText]);

  // स्मार्ट कोर इंजन (नाम, तारीख और फॉन्ट 100% क्रिस्प व सुरक्षित)
  const processPhoto = useCallback(async () => {
    if (!cachedImgRef.current) return;
    setIsProcessing(true);

    const canvas = renderCanvas();
    if (!canvas) {
      setIsProcessing(false);
      return;
    }

    try {
      const res = await exportSmartJpg(canvas, {
        targetKb: targetKb,
        isDocument: false,
        minQuality: 0.15,
        maxQuality: 0.98,
      });

      setOutputUrl(res.dataUrl);
      setOutputKb(res.actualKb);
    } catch (err) {
      console.error("Smart Export Error:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [targetKb, renderCanvas]);

  useEffect(() => {
    if (imageSrc) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        processPhoto();
      }, 50);
    }
  }, [imageSrc, sizeMode, customUnit, cmWidthStr, cmHeightStr, mmWidthStr, mmHeightStr, inchWidthStr, inchHeightStr, pxWidthStr, pxHeightStr, dpiStr, rotation, zoomLevel, panOffset, brightness, contrast, includeNameDate, fontSize, userName, dateText, targetKb, processPhoto]);

  const downloadJpg = () => {
    if (!outputUrl) return;
    const a = document.createElement('a');
    a.href = outputUrl;
    a.download = `Photo_${includeNameDate ? 'With_Name_Date' : 'Passport'}_${outputKb}KB.jpg`;
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
      pdf.save(`Photo_${includeNameDate ? 'With_Name_Date' : 'Passport'}_${outputKb}KB.pdf`);
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

      {/* 2. नाम और तारीख टॉगल */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
          <input
            type="checkbox"
            checked={includeNameDate}
            onChange={(e) => setIncludeNameDate(e.target.checked)}
            className="w-4 h-4 accent-blue-600 cursor-pointer"
          />
          <div className="flex-1">
            <span className="text-xs font-black text-slate-800 block">
              फोटो पर नाम और तारीख जोड़ें
            </span>
            <span className="text-[9px] text-slate-500 block">
              (सादी फोटो के लिए अनटिक करें)
            </span>
          </div>
        </label>

        {includeNameDate && (
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-600 block mb-0.5">उम्मीदवार का नाम</span>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="YOUR NAME"
                className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-bold uppercase"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-600 block mb-0.5">फोटो की तारीख (DOP)</span>
              <input
                type="text"
                value={dateText}
                onChange={(e) => setDateText(e.target.value)}
                placeholder="DOP: 23/09/2026"
                className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-bold"
              />
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-0.5">
                <span>अक्षर साइज़ (Font Size)</span>
                <span className="text-blue-700 font-bold">{fontSize}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="26"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. रोटेशन, ज़ूम, ब्राइटनेस व कंट्रास्ट */}
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

      {/* 4. डिफ़ॉल्ट बनाम कस्टम साइज़ पैनल */}
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
              (SSC, UP Police, रेलवे, NTA आदि 95% सरकारी फॉर्म्स का मानक)
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
                    placeholder="350"
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
                    placeholder="450"
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

      {/* 5. KB स्लाइडर (10 से 200 KB) */}
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

      {/* 6. डाउनलोड बटन्स */}
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
            पासपोर्ट फोटो रिसाइज़र व नाम-तारीख मेकर
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">
            उम्मीदवार का नाम व तारीख जोड़ें या हटाएँ, मानक 3.5×4.5 सेमी या कस्टम CM/MM/Px/DPI में सटीक साइज़ व KB बनाएँ।
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

        {/* --- 1. मोबाइल लेआउट (ऊपर स्थिर प्रीव्यू + नीचे स्क्रॉलेबल एडजस्टमेंट टूलबॉक्स) --- */}
        <div className="block lg:hidden space-y-3">
          <div className="sticky top-2 z-30 shadow-md rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200/80 p-1">
            {CanvasSection}
          </div>
          <div className="pt-1">
            {ControlsSidebar}
          </div>
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
      
      {/* ================= SEO & KNOWLEDGE SECTION (FULL WIDTH) ================= */}
      <article className="col-span-full w-full max-w-6xl mx-auto mt-14 mb-20 px-4 sm:px-6 lg:px-8 text-slate-800 space-y-12 border-t border-slate-200 pt-10">
        
        {/* 1. मुख्य हेडिंग और कीवर्ड रिच परिचय */}
        <header className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            फोटो पर नाम और तारीख जोड़ें (Photo with Name and Date Maker Online for SSC, RRB & Govt Exams)
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-slate-600">
            सरकारी परीक्षाओं जैसे <strong>SSC (CGL, CHSL, GD, MTS)</strong>, <strong>Railway (RRB ALP, Technician, Group D)</strong>, पुलिस भर्ती और राज्य लोक सेवा आयोग के फॉर्म भरते समय पासपोर्ट साइज फोटो पर उम्मीदवार का नाम और फोटो खींचने की तारीख (Date of Photo - DOP) लिखना अनिवार्य होता है। <strong>ExamSewa Photo Name & Date Generator</strong> बिना किसी जटिल सॉफ्टवेयर के कुछ ही सेकंड में फोटो पर सफेद पट्टी के साथ स्पष्ट नाम व तारीख जोड़कर 20 KB से 50 KB में तैयार करता है।
          </p>
        </header>

        {/* 2. प्रमुख सरकारी परीक्षाओं के फोटो व DOP नियम (Table) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              विभिन्न सरकारी परीक्षाओं के लिए फोटो पर नाम व तारीख के आधिकारिक नियम
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            फॉर्म रिजेक्ट होने से बचने के लिए संबंधित भर्ती बोर्ड के अनुसार सही प्रारूप की जांच करें:
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm border-collapse bg-white">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-800">
                  <th className="py-3.5 px-4 font-bold">परीक्षा बोर्ड</th>
                  <th className="py-3.5 px-4 font-bold">तारीख का प्रकार (DOP / DOB)</th>
                  <th className="py-3.5 px-4 font-bold">मानक फाइल साइज़</th>
                  <th className="py-3.5 px-4 font-bold">फोटो का बैकग्राउंड</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-800">SSC (Staff Selection Commission)</td>
                  <td className="py-3 px-4 font-medium text-slate-900">Date of Photo (अधिसूचना से 3 महीने पुरानी न हो)</td>
                  <td className="py-3 px-4 font-bold text-blue-600">20 KB – 50 KB</td>
                  <td className="py-3 px-4">सफेद या हल्का बैकग्राउंड (Light BG)</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-800">Railway Recruitment Board (RRB)</td>
                  <td className="py-3 px-4 font-medium text-slate-900">उम्मीदवार का पूरा नाम व DOP</td>
                  <td className="py-3 px-4 font-bold text-blue-600">30 KB – 70 KB</td>
                  <td className="py-3 px-4">सादा सफेद बैकग्राउंड</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-800">UP Police / UPSSSC</td>
                  <td className="py-3 px-4 font-medium text-slate-900">स्पष्ट पासपोर्ट फोटो (मांगे जाने पर DOP)</td>
                  <td className="py-3 px-4 font-bold text-blue-600">20 KB – 50 KB</td>
                  <td className="py-3 px-4">हल्का ग्रे या सफेद बैकग्राउंड</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-800">BPSC / State PSCs</td>
                  <td className="py-3 px-4 font-medium text-slate-900">नाम और फोटो खिंचवाने का दिनांक</td>
                  <td className="py-3 px-4 font-bold text-blue-600">25 KB – 100 KB</td>
                  <td className="py-3 px-4">एक समान सादा बैकग्राउंड</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. चरण-दर-चरण मार्गदर्शिका (How-to Guide) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              फोटो पर नाम और तारीख कैसे जोड़ें? (How to Add Name and Date)
            </h3>
          </div>
          <ol className="list-decimal list-outside ml-5 space-y-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            <li>
              <strong>पासपोर्ट फोटो चुनें:</strong> गैलरी से अपनी पासपोर्ट साइज फोटो अपलोड करें या कैमरे से नई फोटो खींचें।
            </li>
            <li>
              <strong>उम्मीदवार का नाम दर्ज करें:</strong> <em>"उम्मीदवार का नाम"</em> बॉक्स में अपना वही नाम लिखें जो आपके 10वीं के सर्टिफिकेट या आधार कार्ड में दर्ज है।
            </li>
            <li>
              <strong>फोटो खींचने की तारीख (DOP) चुनें:</strong> कैलेंडर से वह तारीख चुनें जिस दिन फोटो ली गई है (ध्यान रहे कि यह नोटिफिकेशन से 3 महीने से ज्यादा पुरानी न हो)।
            </li>
            <li>
              <strong>पट्टी और फॉन्ट समायोजित करें:</strong> नीचे दी गई सफेद पट्टी और टेक्स्ट फॉन्ट साइज को अपनी पसंद के अनुसार एडजस्ट करें।
            </li>
            <li>
              <strong>डाउनलोड करें:</strong> 20 KB से 50 KB के सटीक सरकारी परीक्षा मानक के साथ उच्च गुणवत्ता वाली JPG फोटो डाउनलोड करें।
            </li>
          </ol>
        </section>

        {/* 4. महत्वपूर्ण सावधानियाँ (Exam Dos & Don'ts) */}
        <section className="space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>⚠️</span> फॉर्म रिजेक्ट होने से बचने के लिए जरूरी सावधानियाँ
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600">
            <li className="flex items-start gap-2.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
              <span className="text-emerald-600 font-bold">✔</span>
              <span><strong>दोनों कान और चेहरा साफ दिखें:</strong> सिर सीधा रखें और दोनों कान स्पष्ट दिखने चाहिए।</span>
            </li>
            <li className="flex items-start gap-2.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
              <span className="text-emerald-600 font-bold">✔</span>
              <span><strong>टोपी या चश्मा न पहनें:</strong> धूप का चश्मा (Goggles) या मफलर/टोपी लगी फोटो तुरंत रिजेक्ट हो जाती है।</span>
            </li>
            <li className="flex items-start gap-2.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
              <span className="text-emerald-600 font-bold">✔</span>
              <span><strong>DOB की जगह DOP का ध्यान रखें:</strong> जब तक विज्ञापन में जन्मतिथि न मांगी जाए, हमेशा फोटो खींचने की तारीख (Date of Photo) ही डालें।</span>
            </li>
            <li className="flex items-start gap-2.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
              <span className="text-emerald-600 font-bold">✔</span>
              <span><strong>100% सुरक्षित और निजी:</strong> आपकी फोटो किसी भी सर्वर पर अपलोड नहीं होती, सारा काम आपके फोन या कंप्यूटर पर ही प्रोसेस होता है।</span>
            </li>
          </ul>
        </section>

        {/* 5. अक्सर पूछे जाने वाले सवाल (FAQ Section) */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">❓</span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              अक्सर पूछे जाने वाले सवाल (Frequently Asked Questions - FAQs)
            </h3>
          </div>
          <div className="divide-y divide-slate-200 text-sm">
            <div className="py-4 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-base">Q1. फोटो पर DOP (Date of Photo) लिखना क्यों जरूरी है?</h4>
              <p className="text-slate-600 leading-relaxed">
                SSC और कई राज्य आयोग यह सुनिश्चित करने के लिए DOP मांगते हैं कि फोटो हाल ही की (3 महीने के भीतर खींची गई) है और परीक्षा केंद्र पर आपकी वर्तमान पहचान से मेल खाती है।
              </p>
            </div>
            <div className="py-4 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-base">Q2. क्या फोटो पर जन्मतिथि (Date of Birth) लिखनी चाहिए?</h4>
              <p className="text-slate-600 leading-relaxed">
                सामान्यतः आयोग फोटो खींचने की तारीख (DOP) मांगते हैं, न कि जन्मतिथि। कृपया अपने परीक्षा नोटिफिकेशन को पढ़ें—यदि उसमें स्पष्ट रूप से जन्मतिथि मांगी गई हो तभी DOB डालें, अन्यथा फोटो खिंचवाने का दिनांक ही मान्य होता है।
              </p>
            </div>
            <div className="py-4 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-base">Q3. क्या नाम और तारीख जोड़ने के बाद फोटो का साइज 20 से 50 KB के बीच रहेगा?</h4>
              <p className="text-slate-600 leading-relaxed">
                हाँ। हमारा स्मार्ट इमेज इंजन टेक्स्ट और स्ट्रिप जोड़ने के बाद फोटो को ऑटोमैटिकली 20 KB से 50 KB के आधिकारिक परीक्षा दायरे में अनुकूलित (Optimize) कर देता है।
              </p>
            </div>
          </div>
        </section>

      </article>
      {/* ================= SEO & KNOWLEDGE SECTION END ================= */}
</div>
    </div>
  );
}
