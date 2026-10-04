'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

type HandleType = 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w';
type OutputMode = 'default' | 'passport' | 'document';

export default function PhotoDocCropper() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // स्टेप 1: 'crop' | स्टेप 2: 'adjust'
  const [step, setStep] = useState<'crop' | 'adjust'>('crop');

  // फ्री क्रॉपिंग बॉक्स
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 20,
    y: 20,
    width: 35,
    height: 40
  });

  // ओरिजिनल कटी हुई फोटो
  const [rawCroppedImg, setRawCroppedImg] = useState<string | null>(null);
  const [rawNaturalDim, setRawNaturalDim] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // आउटपुट मोड
  const [outputMode, setOutputMode] = useState<OutputMode>('default');

  // स्टेज 2: लाइव GPU कंट्रोल्स
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const isPanningRef = useRef<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number }>({ x: 0, y: 0, startPanX: 0, startPanY: 0 });

  const [rotation, setRotation] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);

  // टारगेट KB
  const [targetKb, setTargetKb] = useState<number>(50);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const activeActionRef = useRef<HandleType | null>(null);
  const startPosRef = useRef<{ clientX: number; clientY: number; box: typeof cropBox }>({
    clientX: 0,
    clientY: 0,
    box: { ...cropBox }
  });

  const handleFileUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      setStep('crop');
      setOutputMode('default');
      setRotation(0);
      setZoom(1);
      setPanX(0);
      setPanY(0);
      setBrightness(100);
      setContrast(100);
      setCropBox({ x: 25, y: 20, width: 30, height: 40 });
    };
    reader.readAsDataURL(file);
  };

  const onPointerDown = (action: HandleType, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    activeActionRef.current = action;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startPosRef.current = {
      clientX,
      clientY,
      box: { ...cropBox }
    };
  };

  const onPointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!activeActionRef.current || !imageContainerRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const rect = imageContainerRef.current.getBoundingClientRect();

    const deltaX = ((clientX - startPosRef.current.clientX) / rect.width) * 100;
    const deltaY = ((clientY - startPosRef.current.clientY) / rect.height) * 100;
    const orig = startPosRef.current.box;
    const action = activeActionRef.current;

    let { x, y, width, height } = orig;

    if (action === 'move') {
      x = Math.max(0, Math.min(100 - width, orig.x + deltaX));
      y = Math.max(0, Math.min(100 - height, orig.y + deltaY));
    } else {
      if (action === 'e' || action === 'se' || action === 'ne') {
        width = Math.max(5, Math.min(100 - orig.x, orig.width + deltaX));
      }
      if (action === 's' || action === 'se' || action === 'sw') {
        height = Math.max(5, Math.min(100 - orig.y, orig.height + deltaY));
      }
      if (action === 'w' || action === 'sw' || action === 'nw') {
        const maxLeft = orig.x + orig.width - 5;
        const newX = Math.max(0, Math.min(maxLeft, orig.x + deltaX));
        width = orig.width - (newX - orig.x);
        x = newX;
      }
      if (action === 'n' || action === 'ne' || action === 'nw') {
        const maxTop = orig.y + orig.height - 5;
        const newY = Math.max(0, Math.min(maxTop, orig.y + deltaY));
        height = orig.height - (newY - orig.y);
        y = newY;
      }
    }

    setCropBox({ x, y, width, height });
  }, []);

  const onPointerUp = useCallback(() => {
    activeActionRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchmove', onPointerMove);
    window.addEventListener('touchend', onPointerUp);
    return () => {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  // स्टेज 1: 1:1 सटीक क्रॉप
  const executeCrop = async () => {
    if (!imageSrc || !imageRef.current) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    await new Promise((res) => { img.onload = res; });

    const srcX = (cropBox.x / 100) * img.naturalWidth;
    const srcY = (cropBox.y / 100) * img.naturalHeight;
    const srcW = (cropBox.width / 100) * img.naturalWidth;
    const srcH = (cropBox.height / 100) * img.naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(srcW);
    canvas.height = Math.round(srcH);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, Math.round(srcW), Math.round(srcH));

    const rawData = canvas.toDataURL('image/png');
    setRawCroppedImg(rawData);
    setRawNaturalDim({ width: Math.round(srcW), height: Math.round(srcH) });
    setPanX(0);
    setPanY(0);
    setZoom(1);
    setRotation(0);
    setStep('adjust');
  };

  const handlePanStart = (e: React.MouseEvent | React.TouchEvent) => {
    isPanningRef.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    panStartRef.current = {
      x: clientX,
      y: clientY,
      startPanX: panX,
      startPanY: panY
    };
  };

  const handlePanMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPanningRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPanX(panStartRef.current.startPanX + (clientX - panStartRef.current.x));
    setPanY(panStartRef.current.startPanY + (clientY - panStartRef.current.y));
  };

  const handlePanEnd = () => {
    isPanningRef.current = false;
  };

  // 💥 100% फुल प्रूफ रिलायबल कंप्रेसर
  const buildOptimizedCanvas = async (targetSizeKb: number): Promise<{ canvas: HTMLCanvasElement; blob: Blob } | null> => {
    if (!rawCroppedImg) return null;

    const img = new Image();
    img.src = rawCroppedImg;
    await new Promise((res) => { img.onload = res; });

    let baseW = rawNaturalDim.width;
    let baseH = rawNaturalDim.height;

    if (outputMode === 'passport') {
      baseW = 413;
      baseH = 531;
    } else if (outputMode === 'document') {
      baseW = 1240;
      baseH = 1754;
    }

    let scale = 1.0;
    if (targetSizeKb > 100 && outputMode === 'passport') {
      scale = targetSizeKb > 150 ? 2.0 : 1.5;
    } else if (targetSizeKb <= 30 && (baseW > 900 || baseH > 900)) {
      scale = 0.72;
    }

    let finalBlob: Blob | null = null;
    let finalCanvas: HTMLCanvasElement | null = null;

    for (let attempt = 0; attempt < 8; attempt++) {
      const curW = Math.max(160, Math.round(baseW * scale));
      const curH = Math.max(160, Math.round(baseH * scale));

      const canvas = document.createElement('canvas');
      canvas.width = curW;
      canvas.height = curH;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return null;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, curW, curH);
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

      ctx.save();
      ctx.translate(curW / 2 + (panX * scale), curH / 2 + (panY * scale));
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      if (outputMode === 'passport' || outputMode === 'document') {
        const imgAspect = img.width / img.height;
        const canvasAspect = curW / curH;
        let drawW = curW;
        let drawH = curH;

        if (imgAspect > canvasAspect) {
          drawW = curW;
          drawH = curW / imgAspect;
        } else {
          drawH = curH;
          drawW = curH * imgAspect;
        }

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      } else {
        ctx.drawImage(img, -curW / 2, -curH / 2, curW, curH);
      }
      ctx.restore();

      let low = targetSizeKb > 100 ? 0.85 : 0.28;
      let high = 0.98;
      let bestB: Blob | null = null;

      for (let i = 0; i < 5; i++) {
        const mid = (low + high) / 2;
        const b: Blob | null = await new Promise(r => canvas.toBlob(r, 'image/jpeg', mid));
        if (b) {
          bestB = b;
          if (Math.round(b.size / 1024) > targetSizeKb) {
            high = mid;
          } else {
            low = mid;
          }
        }
      }

      if (bestB) {
        finalBlob = bestB;
        finalCanvas = canvas;
        const kb = Math.round(bestB.size / 1024);
        if (kb <= targetSizeKb && kb >= targetSizeKb - 15) {
          break;
        }
      }

      if (finalBlob && Math.round(finalBlob.size / 1024) < targetSizeKb - 20 && scale < 3.0) {
        scale *= 1.35;
      } else {
        scale *= 0.84;
      }
    }

    if (finalCanvas && finalBlob) {
      return { canvas: finalCanvas, blob: finalBlob };
    }
    return null;
  };

  // 💥 1. डाउनलोड JPG
  const handleDownloadJpg = async () => {
    setIsProcessing(true);
    try {
      const res = await buildOptimizedCanvas(targetKb);
      if (!res) return;

      const url = URL.createObjectURL(res.blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = outputMode === 'passport' 
        ? `passport_${targetKb}kb.jpg` 
        : outputMode === 'document' 
        ? `document_${targetKb}kb.jpg` 
        : `photo_${targetKb}kb.jpg`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1500);
    } finally {
      setIsProcessing(false);
    }
  };

  // 💥 2. डाउनलोड PDF (शुद्ध A4 स्टैण्डर्ड PDF जनरेटर)
  const handleDownloadPdf = async () => {
    setIsProcessing(true);
    try {
      const res = await buildOptimizedCanvas(Math.max(100, targetKb));
      if (!res) return;

      const imgDataUrl = res.canvas.toDataURL('image/jpeg', 0.92);
      const base64Data = imgDataUrl.split(',')[1];
      const binaryString = atob(base64Data);
      const imgBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        imgBytes[i] = binaryString.charCodeAt(i);
      }

      // मानक A4 PDF 595 x 842 pt
      const pageWidth = 595;
      const pageHeight = 842;
      let imgWidthPt = 535;
      let imgHeightPt = (imgWidthPt * res.canvas.height) / res.canvas.width;

      if (outputMode === 'passport') {
        imgWidthPt = 119; // 3.5 cm in pt
        imgHeightPt = 153; // 4.5 cm in pt
      } else if (imgHeightPt > 782) {
        imgHeightPt = 782;
        imgWidthPt = (imgHeightPt * res.canvas.width) / res.canvas.height;
      }

      const xPt = (pageWidth - imgWidthPt) / 2;
      const yPt = (pageHeight - imgHeightPt) / 2;

      // स्वच्छ सिंगल-पेज PDF स्ट्रक्चर
      const pdfHeader = `%PDF-1.4\n`;
      const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
      const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
      const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`;
      const obj4Header = `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${res.canvas.width} /Height ${res.canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`;
      const obj4Footer = `\nendstream\nendobj\n`;
      const streamContent = `q\n${imgWidthPt.toFixed(2)} 0 0 ${imgHeightPt.toFixed(2)} ${xPt.toFixed(2)} ${yPt.toFixed(2)} cm\n/Im1 Do\nQ`;
      const obj5 = `5 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`;

      const enc = new TextEncoder();
      const pHeader = enc.encode(pdfHeader);
      const pObj1 = enc.encode(obj1);
      const pObj2 = enc.encode(obj2);
      const pObj3 = enc.encode(obj3);
      const pObj4H = enc.encode(obj4Header);
      const pObj4F = enc.encode(obj4Footer);
      const pObj5 = enc.encode(obj5);

      const offset1 = pHeader.length;
      const offset2 = offset1 + pObj1.length;
      const offset3 = offset2 + pObj2.length;
      const offset4 = offset3 + pObj3.length;
      const offset5 = offset4 + pObj4H.length + imgBytes.length + pObj4F.length;
      const xrefOffset = offset5 + pObj5.length;

      const xref = `xref\n0 6\n0000000000 65535 f \n${String(offset1).padStart(10, '0')} 00000 n \n${String(offset2).padStart(10, '0')} 00000 n \n${String(offset3).padStart(10, '0')} 00000 n \n${String(offset4).padStart(10, '0')} 00000 n \n${String(offset5).padStart(10, '0')} 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
      const pXref = enc.encode(xref);

      const totalSize = xrefOffset + pXref.length;
      const finalPdf = new Uint8Array(totalSize);
      let cur = 0;

      finalPdf.set(pHeader, cur); cur += pHeader.length;
      finalPdf.set(pObj1, cur); cur += pObj1.length;
      finalPdf.set(pObj2, cur); cur += pObj2.length;
      finalPdf.set(pObj3, cur); cur += pObj3.length;
      finalPdf.set(pObj4H, cur); cur += pObj4H.length;
      finalPdf.set(imgBytes, cur); cur += imgBytes.length;
      finalPdf.set(pObj4F, cur); cur += pObj4F.length;
      finalPdf.set(pObj5, cur); cur += pObj5.length;
      finalPdf.set(pXref, cur);

      const blob = new Blob([finalPdf], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = outputMode === 'passport' ? 'passport_photo.pdf' : 'document.pdf';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1500);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between select-none">
      
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-slate-500 hover:text-slate-800 text-xs font-bold">
              ← होम
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>✂️</span> फोटो एंड डॉक क्रॉपर
            </span>
          </div>

          <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
            step === 'crop' 
              ? 'bg-blue-100 text-blue-900 border-blue-300' 
              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
          }`}>
            {step === 'crop' ? 'स्टेप 1: सेलेक्ट व क्रॉप' : 'स्टेप 2: ड्रैग व एडजस्ट'}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 flex-1 w-full">
        
        {/* स्टेज 1 */}
        {step === 'crop' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <div className="lg:col-span-8 bg-slate-200/90 p-4 sm:p-6 rounded-3xl border-2 border-slate-300 shadow-inner flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-3 text-xs font-bold text-slate-700">
                <span>
                  {imageSrc ? '✅ किसी भी कोने को खींचकर फोटो/डॉक्यूमेंट पर बॉक्स सेट करें' : 'कृपया पहले इमेज अपलोड करें'}
                </span>
                <span className="text-blue-700 font-black">100% फ्री क्रॉप</span>
              </div>

              {imageSrc ? (
                <div
                  ref={imageContainerRef}
                  className="relative overflow-hidden bg-slate-900 rounded-xl shadow-2xl flex items-center justify-center max-w-full touch-none select-none"
                  style={{ maxHeight: '680px' }}
                >
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt="Master Scan Sheet"
                    className="max-h-[680px] w-auto object-contain pointer-events-none"
                  />

                  <div
                    style={{
                      top: `${cropBox.y}%`,
                      left: `${cropBox.x}%`,
                      width: `${cropBox.width}%`,
                      height: `${cropBox.height}%`
                    }}
                    onMouseDown={(e) => onPointerDown('move', e)}
                    onTouchStart={(e) => onPointerDown('move', e)}
                    className="absolute border-2 border-emerald-400 bg-emerald-400/20 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] cursor-move select-none"
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="text-[10px] bg-slate-950/85 text-white px-2 py-0.5 rounded font-black whitespace-nowrap border border-slate-700">
                        ✂️ सेलेक्टेड एरिया
                      </span>
                    </div>

                    <div onMouseDown={(e) => onPointerDown('nw', e)} onTouchStart={(e) => onPointerDown('nw', e)} className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-emerald-600 rounded-full cursor-nw-resize shadow-md" />
                    <div onMouseDown={(e) => onPointerDown('ne', e)} onTouchStart={(e) => onPointerDown('ne', e)} className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-emerald-600 rounded-full cursor-ne-resize shadow-md" />
                    <div onMouseDown={(e) => onPointerDown('se', e)} onTouchStart={(e) => onPointerDown('se', e)} className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-emerald-600 rounded-full cursor-se-resize shadow-md" />
                    <div onMouseDown={(e) => onPointerDown('sw', e)} onTouchStart={(e) => onPointerDown('sw', e)} className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-emerald-600 rounded-full cursor-sw-resize shadow-md" />

                    <div onMouseDown={(e) => onPointerDown('n', e)} onTouchStart={(e) => onPointerDown('n', e)} className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2.5 bg-white border border-emerald-600 rounded-xs cursor-n-resize" />
                    <div onMouseDown={(e) => onPointerDown('s', e)} onTouchStart={(e) => onPointerDown('s', e)} className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-2.5 bg-white border border-emerald-600 rounded-xs cursor-s-resize" />
                    <div onMouseDown={(e) => onPointerDown('w', e)} onTouchStart={(e) => onPointerDown('w', e)} className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2.5 h-6 bg-white border border-emerald-600 rounded-xs cursor-w-resize" />
                    <div onMouseDown={(e) => onPointerDown('e', e)} onTouchStart={(e) => onPointerDown('e', e)} className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-2.5 h-6 bg-white border border-emerald-600 rounded-xs cursor-e-resize" />
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-96 border-2 border-dashed border-slate-400 bg-white/70 hover:bg-white rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all gap-3"
                >
                  <span className="text-5xl">📄</span>
                  <span className="text-sm font-black text-slate-800">
                    यहाँ क्लिक करके A4 शीट, फोटो या डॉक्यूमेंट चुनें
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    गैलरी या फ़ोल्डर से 15-20 फोटो वाली मास्टर शीट या पासबुक/आईडी कार्ड अपलोड करें
                  </span>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-5 rounded-2xl border-2 border-slate-900 shadow-xs space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  स्टेप 1: सेलेक्ट करें
                </h3>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files?.[0])}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-200 rounded-xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>📁</span>
                  <span>{imageSrc ? 'दूसरी मास्टर शीट बदलें' : 'कंप्यूटर / गैलरी से चुनें'}</span>
                </button>

                {imageSrc && (
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <p className="text-xs text-slate-600 font-medium">
                      बॉक्स को फोटो या कार्ड पर सेट कर लिया? अब नीचे बटन दबाकर इसे अलग निकालें:
                    </p>
                    <button
                      onClick={executeCrop}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all"
                    >
                      <span>✂️</span>
                      <span>यह एरिया क्रॉप करें और प्रिव्यू देखें →</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* स्टेज 2 */}
        {step === 'adjust' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <div className="lg:col-span-8 bg-slate-200/90 p-4 sm:p-6 rounded-3xl border-2 border-slate-300 shadow-inner flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-3 text-xs font-bold text-slate-700">
                <button
                  onClick={() => setStep('crop')}
                  className="text-blue-700 hover:text-blue-900 font-black flex items-center gap-1 cursor-pointer bg-white px-3 py-1 rounded-lg border border-slate-300 shadow-2xs"
                >
                  ← वापस शीट पर जाएँ (री-क्रॉप करें)
                </button>
                <span className="text-emerald-800 font-black">
                  माउस से पकड़कर फोटो को फ्रेम में खिसकाएं (Live Drag)
                </span>
              </div>

              {/* प्रिव्यू कंटेनर */}
              <div
                onMouseDown={handlePanStart}
                onMouseMove={handlePanMove}
                onMouseUp={handlePanEnd}
                onTouchStart={handlePanStart}
                onTouchMove={handlePanMove}
                onTouchEnd={handlePanEnd}
                className="bg-white p-4 rounded-2xl shadow-xl border-2 border-slate-900 flex flex-col items-center justify-center min-h-[440px] max-w-lg w-full cursor-grab active:cursor-grabbing select-none relative overflow-hidden"
              >
                <div
                  className="overflow-hidden border border-slate-300 rounded-lg bg-slate-100 flex items-center justify-center p-2 relative shadow-inner"
                  style={{
                    width: outputMode === 'passport' ? '280px' : outputMode === 'document' ? '280px' : 'auto',
                    height: outputMode === 'passport' ? '360px' : outputMode === 'document' ? '396px' : 'auto',
                    maxWidth: '100%',
                    maxHeight: '380px',
                    aspectRatio: outputMode === 'passport' 
                      ? '3.5 / 4.5' 
                      : outputMode === 'document' 
                      ? '1 / 1.414' 
                      : `${rawNaturalDim.width} / ${rawNaturalDim.height}`
                  }}
                >
                  {rawCroppedImg && (
                    <img
                      src={rawCroppedImg}
                      alt="True Crop Preview"
                      className="max-h-[350px] max-w-full w-auto h-auto object-contain pointer-events-none select-none"
                      style={{
                        transform: `translate(${panX}px, ${panY}px) rotate(${rotation}deg) scale(${zoom})`,
                        filter: `brightness(${brightness}%) contrast(${contrast}%)`
                      }}
                    />
                  )}
                </div>
                
                <div className="mt-4 text-center pointer-events-none">
                  <span className="text-xs font-black text-slate-800 block">
                    {outputMode === 'passport' 
                      ? '📐 पासपोर्ट मोड (3.5×4.5 सेमी)' 
                      : outputMode === 'document' 
                      ? '📑 डॉक्यूमेंट मोड (A4 - फुल कंटेंट)' 
                      : '🔓 डिफ़ॉल्ट ओरिजिनल (अनस्ट्रेच्ड)'}
                  </span>
                  <span className="text-[11px] font-mono font-black text-emerald-700">
                    टारगेट: {targetKb} KB / 300 DPI | ड्रैग (Pan): X:{panX} Y:{panY}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-xs space-y-2.5">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  1. आउटपुट साइज चुनें
                </h3>

                <div className="space-y-2 text-xs font-bold text-slate-800">
                  <label className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    outputMode === 'passport' ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-500' : 'bg-slate-50 border-slate-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={outputMode === 'passport'}
                      onChange={() => setOutputMode(outputMode === 'passport' ? 'default' : 'passport')}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                    <div>
                      <span className="block font-black text-slate-900">📷 पासपोर्ट फोटो (3.5×4.5 सेमी)</span>
                      <span className="text-[10px] text-slate-500 font-medium">चेहरे को सरकारी 300 DPI अनुपात में रखेगा</span>
                    </div>
                  </label>

                  <label className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    outputMode === 'document' ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-500' : 'bg-slate-50 border-slate-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={outputMode === 'document'}
                      onChange={() => setOutputMode(outputMode === 'document' ? 'default' : 'document')}
                      className="w-4 h-4 accent-emerald-600 cursor-pointer"
                    />
                    <div>
                      <span className="block font-black text-slate-900">📑 डॉक्यूमेंट मोड (A4 साइज)</span>
                      <span className="text-[10px] text-slate-500 font-medium">पूरा डॉक्यूमेंट बिना कटे A4 में सुरक्षित करेगा</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 0ms इंस्टेंट एडजस्टमेंट */}
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    2. फोटो / कार्ड एडजस्टमेंट
                  </h3>
                  <button
                    onClick={() => { setPanX(0); setPanY(0); setZoom(1); setRotation(0); }}
                    className="text-[10px] text-blue-600 font-black hover:underline cursor-pointer"
                  >
                    रीसेट ड्रैग
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-black text-slate-700 mb-1">
                    <span>सीधा करें (Rotate)</span>
                    <span className="font-mono text-blue-700">{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-black text-slate-700 mb-1">
                    <span>ज़ूम (Zoom)</span>
                    <span className="font-mono text-blue-700">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="2.0"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex justify-between text-[10px] font-black text-slate-700 mb-1">
                      <span>चमक (Brightness)</span>
                      <span>{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="140"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-black text-slate-700 mb-1">
                      <span>गहराई (Contrast)</span>
                      <span>{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="140"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 💥 डाउनलोड पैनल: दो 50-50 बटन (JPG + PDF) */}
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-xs space-y-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  3. टारगेट फ़ाइल साइज़ व डाउनलोड
                </h3>

                <div>
                  <div className="flex justify-between text-[11px] font-black text-slate-900 mb-1">
                    <span>टारगेट फ़ाइल साइज़</span>
                    <span className="text-emerald-700 font-mono font-black">{targetKb} KB</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="250"
                    step="5"
                    value={targetKb}
                    onChange={(e) => setTargetKb(Number(e.target.value))}
                    className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                {/* 50-50 ग्रिड में दो समर्पित डाउनलोड बटन */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    onClick={handleDownloadJpg}
                    disabled={isProcessing}
                    className={`py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-98 ${
                      isProcessing ? 'opacity-70 cursor-wait' : ''
                    }`}
                  >
                    <span>🖼️</span>
                    <span>{isProcessing ? 'प्रोसेसिंग...' : 'डाउनलोड JPG'}</span>
                  </button>

                  <button
                    onClick={handleDownloadPdf}
                    disabled={isProcessing}
                    className={`py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-98 ${
                      isProcessing ? 'opacity-70 cursor-wait' : ''
                    }`}
                  >
                    <span>📄</span>
                    <span>{isProcessing ? 'प्रोसेसिंग...' : 'डाउनलोड PDF'}</span>
                  </button>
                </div>

                <button
                  onClick={() => setStep('crop')}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>🔄</span>
                  <span>शीट से अगली फोटो / डॉक्यूमेंट काटें</span>
                </button>
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
