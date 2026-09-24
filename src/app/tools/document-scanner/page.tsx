'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Point {
  x: number;
  y: number;
}

export default function DocumentScannerPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'crop' | 'enhance'>('upload');

  // ओरिएंटेशन व एनहांसर सेटिंग्स
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [filterMode, setFilterMode] = useState<'bw' | 'magic' | 'original'>('bw');
  const [brightness, setBrightness] = useState<number>(115);
  const [contrast, setContrast] = useState<number>(140);
  const [targetKb, setTargetKb] = useState<number>(200);

  // आउटपुट
  const [croppedBaseUrl, setCroppedBaseUrl] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSizeKb, setOutputSizeKb] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // रेफ़रेंसेस
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgObjRef = useRef<HTMLImageElement | null>(null);

  // 4 कोने (कैनवास पिक्सल में)
  const cornersRef = useRef<Point[]>([
    { x: 40, y: 40 },
    { x: 300, y: 40 },
    { x: 300, y: 400 },
    { x: 40, y: 400 }
  ]);
  const activeCornerRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // फ़ोटो अपलोड हैंडलर
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        setImageSrc(src);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = src;
        img.onload = () => {
          imgObjRef.current = img;
          setStep('crop');
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // कैनवास पर बेस इमेज, 4 हरी लाइनें और ओरिजिनल इमेज वाला क्रिस्टल क्लियर मैग्नीफायर लेंस
  const redrawCropCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cW = canvas.width;
    const cH = canvas.height;

    // 1. बेस इमेज ड्रा करें
    ctx.clearRect(0, 0, cW, cH);
    ctx.drawImage(img, 0, 0, cW, cH);

    const pts = cornersRef.current;

    // 2. सिलेक्टेड एरिया के अंदर पारदर्शी हरा रंग
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.lineTo(pts[2].x, pts[2].y);
    ctx.lineTo(pts[3].x, pts[3].y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(34, 197, 94, 0.22)';
    ctx.fill();

    // 3. चारों कोनों को आपस में जोड़ने वाली सॉलिड हरी लाइनें
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();

    // 4. चारों कोने के हैंडल
    pts.forEach((pt) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 6;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#16a34a';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();
    });

    // 5. मैग्नीफायर लेंस: सीधे ओरिजिनल इमेज से 3x शार्प जूम (बिंदु कभी नहीं दिखेगा)
    if (activeCornerRef.current !== null && isDraggingRef.current) {
      const activePt = pts[activeCornerRef.current];
      const loupeRadius = 48;
      const zoom = 3.0;

      let loupeX = activePt.x;
      let loupeY = activePt.y - 75;
      if (loupeY < loupeRadius + 10) loupeY = activePt.y + 75;
      if (loupeX < loupeRadius + 10) loupeX = loupeRadius + 10;
      if (loupeX > cW - loupeRadius - 10) loupeX = cW - loupeRadius - 10;

      ctx.save();
      ctx.beginPath();
      ctx.arc(loupeX, loupeY, loupeRadius, 0, Math.PI * 2);
      ctx.clip();

      const scaleX = img.naturalWidth / cW;
      const scaleY = img.naturalHeight / cH;
      const realX = activePt.x * scaleX;
      const realY = activePt.y * scaleY;

      const sampleW = (loupeRadius * 2 * scaleX) / zoom;
      const sampleH = (loupeRadius * 2 * scaleY) / zoom;
      const sx = Math.max(0, Math.min(img.naturalWidth - sampleW, realX - sampleW / 2));
      const sy = Math.max(0, Math.min(img.naturalHeight - sampleH, realY - sampleH / 2));

      ctx.drawImage(
        img,
        sx,
        sy,
        sampleW,
        sampleH,
        loupeX - loupeRadius,
        loupeY - loupeRadius,
        loupeRadius * 2,
        loupeRadius * 2
      );

      // लाल सटीक क्रॉसहेयर (+)
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(loupeX, loupeY - loupeRadius);
      ctx.lineTo(loupeX, loupeY + loupeRadius);
      ctx.moveTo(loupeX - loupeRadius, loupeY);
      ctx.lineTo(loupeX + loupeRadius, loupeY);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(loupeX, loupeY, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // लेंस की बाहरी हरी रिंग
      ctx.save();
      ctx.beginPath();
      ctx.arc(loupeX, loupeY, loupeRadius, 0, Math.PI * 2);
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();
    }
  };

  useEffect(() => {
    if (step === 'crop' && imgObjRef.current && canvasRef.current) {
      const img = imgObjRef.current;
      const canvas = canvasRef.current;

      const maxW = Math.min(window.innerWidth - 40, 480);
      const scale = maxW / img.naturalWidth;
      const maxH = Math.round(img.naturalHeight * scale);

      canvas.width = maxW;
      canvas.height = maxH;

      cornersRef.current = [
        { x: Math.round(maxW * 0.1), y: Math.round(maxH * 0.1) },
        { x: Math.round(maxW * 0.9), y: Math.round(maxH * 0.1) },
        { x: Math.round(maxW * 0.9), y: Math.round(maxH * 0.9) },
        { x: Math.round(maxW * 0.1), y: Math.round(maxH * 0.9) }
      ];

      redrawCropCanvas();
    }
  }, [step, imageSrc]);

  const getPointerPos = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPointerPos(e);
    const pts = cornersRef.current;
    const threshold = 36;

    let closestIdx = -1;
    let minDist = Infinity;

    pts.forEach((pt, idx) => {
      const dist = Math.hypot(pt.x - pos.x, pt.y - pos.y);
      if (dist < threshold && dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });

    if (closestIdx !== -1) {
      activeCornerRef.current = closestIdx;
      isDraggingRef.current = true;
      redrawCropCanvas();
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current || activeCornerRef.current === null || !canvasRef.current) return;
    const pos = getPointerPos(e);
    const cW = canvasRef.current.width;
    const cH = canvasRef.current.height;

    cornersRef.current[activeCornerRef.current] = {
      x: Math.max(0, Math.min(cW, pos.x)),
      y: Math.max(0, Math.min(cH, pos.y))
    };

    redrawCropCanvas();
  };

  const handlePointerUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      activeCornerRef.current = null;
      redrawCropCanvas();
    }
  };

  // त्रिभुज आधार पर सटीक 4-पॉइंट पर्सपेक्टिव वार्प
  const warpTriangle = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    src: [Point, Point, Point],
    dst: [Point, Point, Point]
  ) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(dst[0].x, dst[0].y);
    ctx.lineTo(dst[1].x, dst[1].y);
    ctx.lineTo(dst[2].x, dst[2].y);
    ctx.closePath();
    ctx.clip();

    const [x0, y0] = [src[0].x, src[0].y];
    const [x1, y1] = [src[1].x, src[1].y];
    const [x2, y2] = [src[2].x, src[2].y];

    const [u0, v0] = [dst[0].x, dst[0].y];
    const [u1, v1] = [dst[1].x, dst[1].y];
    const [u2, v2] = [dst[2].x, dst[2].y];

    const delta = x0 * (y1 - y2) - x1 * (y0 - y2) + x2 * (y0 - y1);
    if (Math.abs(delta) < 0.0001) {
      ctx.restore();
      return;
    }

    const a = (u0 * (y1 - y2) - u1 * (y0 - y2) + u2 * (y0 - y1)) / delta;
    const b = (u0 * (x2 - x1) + u1 * (x0 - x2) + u2 * (x1 - x0)) / delta;
    const c = (u0 * (x1 * y2 - x2 * y1) - u1 * (x0 * y2 - x2 * y0) + u2 * (x0 * y1 - x1 * y0)) / delta;

    const d = (v0 * (y1 - y2) - v1 * (y0 - y2) + v2 * (y0 - y1)) / delta;
    const e = (v0 * (x2 - x1) + v1 * (x0 - x2) + v2 * (x1 - x0)) / delta;
    const f = (v0 * (x1 * y2 - x2 * y1) - v1 * (x0 * y2 - x2 * y0) + v2 * (x0 * y1 - x1 * y0)) / delta;

    ctx.transform(a, d, b, e, c, f);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  };

  // क्रॉप और A4 में सीधा करना
  const applyPerspectiveCrop = () => {
    const img = imgObjRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const pts = cornersRef.current;
    const scaleX = img.naturalWidth / canvas.width;
    const scaleY = img.naturalHeight / canvas.height;
    const srcPts: Point[] = pts.map(p => ({ x: p.x * scaleX, y: p.y * scaleY }));

    // मानक A4 डायमेंशन (तेज़ और सटीक)
    const outW = orientation === 'portrait' ? 1240 : 1754;
    const outH = orientation === 'portrait' ? 1754 : 1240;

    const outCanvas = document.createElement('canvas');
    outCanvas.width = outW;
    outCanvas.height = outH;
    const ctx = outCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outW, outH);

    const dstPts: Point[] = [
      { x: 0, y: 0 },
      { x: outW, y: 0 },
      { x: outW, y: outH },
      { x: 0, y: outH }
    ];

    warpTriangle(ctx, img, [srcPts[0], srcPts[1], srcPts[2]], [dstPts[0], dstPts[1], dstPts[2]]);
    warpTriangle(ctx, img, [srcPts[0], srcPts[2], srcPts[3]], [dstPts[0], dstPts[2], dstPts[3]]);

    const croppedData = outCanvas.toDataURL('image/jpeg', 0.92);
    setCroppedBaseUrl(croppedData);
    setStep('enhance');
  };

  // सुपर-फास्ट अडैप्टिव KB कंप्रेशन (10 KB पर सच में 10 KB बनेगा)
  const generateFinalCompressedImage = useCallback(() => {
    if (!croppedBaseUrl) return;
    setIsCompressing(true);

    const img = new Image();
    img.src = croppedBaseUrl;
    img.onload = () => {
      // 10-40 KB के लिए स्मार्ट अडैप्टिव रीसाइजिंग ताकि फाइल 10 KB तक सच में गिरे
      let scale = 1.0;
      if (targetKb <= 30) scale = 0.55;       // ~680 x 960 px
      else if (targetKb <= 60) scale = 0.75;  // ~930 x 1315 px
      else if (targetKb <= 120) scale = 0.88;

      const finalW = Math.round(img.width * scale);
      const finalH = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = finalW;
      canvas.height = finalH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // ब्राइटनेस व कंट्रास्ट
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.drawImage(img, 0, 0, finalW, finalH);
      ctx.filter = 'none';

      // ज़ेरॉक्स / मैजिक मोड
      if (filterMode === 'bw') {
        const imgData = ctx.getImageData(0, 0, finalW, finalH);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          if (gray > 165) {
            d[i] = 255;
            d[i + 1] = 255;
            d[i + 2] = 255;
          } else {
            d[i] = Math.max(0, d[i] - 50);
            d[i + 1] = Math.max(0, d[i] - 50);
            d[i + 2] = Math.max(0, d[i] - 50);
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } else if (filterMode === 'magic') {
        const imgData = ctx.getImageData(0, 0, finalW, finalH);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          if (gray > 195) {
            d[i] = 255;
            d[i + 1] = 255;
            d[i + 2] = 255;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // सटीक 8-स्टेप बाइनरी सर्च
      const targetBytes = targetKb * 1024;
      let minQ = 0.01;
      let maxQ = 0.98;
      let bestQ = 0.85;
      let bestData = canvas.toDataURL('image/jpeg', bestQ);

      for (let i = 0; i < 8; i++) {
        const midQ = (minQ + maxQ) / 2;
        const dUrl = canvas.toDataURL('image/jpeg', midQ);
        const head = 'data:image/jpeg;base64,';
        const currentBytes = Math.round((dUrl.length - head.length) * 3 / 4);

        if (currentBytes > targetBytes) {
          maxQ = midQ;
        } else {
          bestQ = midQ;
          bestData = dUrl;
          minQ = midQ;
        }
      }

      const head = 'data:image/jpeg;base64,';
      const finalKb = Math.max(5, Math.round(((bestData.length - head.length) * 3 / 4) / 1024));

      setOutputUrl(bestData);
      setOutputSizeKb(finalKb);
      setIsCompressing(false);
    };
  }, [croppedBaseUrl, targetKb, brightness, contrast, filterMode]);

  // डिबाउंस्ड इफेक्ट: जब यूजर स्लाइडर हिलाना बंद करेगा, तभी सिर्फ 1 बार तेजी से कंप्रेस होगा
  useEffect(() => {
    if (croppedBaseUrl && step === 'enhance') {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        generateFinalCompressedImage();
      }, 120); // मात्र 120ms का डिबाउंस (Zero Lag)
    }
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [croppedBaseUrl, step, filterMode, brightness, contrast, targetKb, generateFinalCompressedImage]);

  useEffect(() => {
    if (step === 'enhance') {
      applyPerspectiveCrop();
    }
  }, [orientation]);

  // JPG डाउनलोड
  const downloadJpg = () => {
    if (!outputUrl) return;
    const a = document.createElement('a');
    a.href = outputUrl;
    a.download = `Scanned_Doc_${orientation}_${outputSizeKb}KB.jpg`;
    a.click();
  };

  // A4 PDF डाउनलोड
  const downloadPdf = () => {
    if (!outputUrl) return;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>A4 Scanned Document</title>
            <style>
              @page { size: ${orientation === 'portrait' ? 'A4 portrait' : 'A4 landscape'}; margin: 0; }
              body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #ffffff; }
              img { width: 100%; height: 100%; object-fit: contain; }
            </style>
          </head>
          <body>
            <img src="${outputUrl}" onload="window.print();" />
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 py-6 px-3 select-none">
      <div className="max-w-xl mx-auto">
        <div className="mb-3">
          <Link href="/" className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full hover:bg-green-200 transition-colors">
            ← मुख्य होमपेज
          </Link>
        </div>

        {/* हेडर */}
        <div className="bg-white py-3 px-4 rounded-xl border border-slate-200 shadow-xs mb-3 text-center">
          <h1 className="text-lg font-black text-slate-800">
            Doc Scanner & Enhancer (A4 स्कैनर)
          </h1>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            फास्ट 4-कॉर्नर क्रॉप, लेंस ज़ूम और 10 KB से 800 KB तक सटीक आउटपुट।
          </p>
        </div>

        <div className="space-y-3">
          {/* 1. अपलोड बॉक्स */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileChange}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            {!imageSrc ? (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-3 rounded-lg border-2 border-dashed border-green-500/60 bg-green-50/40 hover:bg-green-50 text-center flex flex-col items-center justify-center cursor-pointer"
                >
                  <span className="text-2xl mb-0.5">📷</span>
                  <span className="text-xs font-black text-green-800">डॉक्यूमेंट स्कैन करें</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-lg border-2 border-dashed border-blue-500/60 bg-blue-50/40 hover:bg-blue-50 text-center flex flex-col items-center justify-center cursor-pointer"
                >
                  <span className="text-2xl mb-0.5">📁</span>
                  <span className="text-xs font-black text-blue-800">गैलरी / फाइल से लें</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <span className="text-green-600 font-bold">✔</span> डॉक्यूमेंट लोड हो गया
                </span>
                <div className="flex items-center gap-2 font-bold">
                  <button onClick={() => cameraInputRef.current?.click()} className="text-green-700 hover:underline">कैमरा 📷</button>
                  <span className="text-slate-300">|</span>
                  <button onClick={() => fileInputRef.current?.click()} className="text-blue-700 hover:underline">गैलरी 📁</button>
                </div>
              </div>
            )}
          </div>

          {/* 2. स्टेप: क्रॉप व मैग्नीफायर लेंस */}
          {imageSrc && step === 'crop' && (
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-800 uppercase">
                  चारों कोनों को खींचकर कागज़ सेट करें
                </span>
                <span className="text-[10px] text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded-full">
                  🔍 3x HD लेंस एक्टिव
                </span>
              </div>

              <div className="bg-slate-900 rounded-lg p-2 flex items-center justify-center overflow-hidden touch-none border border-slate-300">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  onTouchStart={handlePointerDown}
                  onTouchMove={handlePointerMove}
                  onTouchEnd={handlePointerUp}
                  className="block rounded max-w-full cursor-crosshair shadow-lg"
                />
              </div>

              <button
                onClick={applyPerspectiveCrop}
                className="w-full mt-3 py-3.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>✂️ क्रॉप करें और A4 में सीधा करें →</span>
              </button>
            </div>
          )}

          {/* 3. स्टेप: सुपर-फास्ट एनहांसर व रियल-टाइम 10-800 KB स्लाइडर */}
          {step === 'enhance' && (
            <div className="space-y-3">
              {/* लाइव प्रीव्यू (CSS Hardware-Accelerated) */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-center">
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <span className="text-[11px] font-black text-slate-700 uppercase">
                    A4 प्रीव्यू ({orientation === 'portrait' ? 'पोर्ट्रेट' : 'लैंडस्केप'})
                  </span>
                  <div className="flex items-center gap-1">
                    {isCompressing && <span className="text-[10px] text-amber-600 animate-pulse font-bold">⚡ अपडेटिंग...</span>}
                    <span className="text-[11px] font-extrabold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      {outputSizeKb} KB तैयार
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-dashed border-slate-300 min-h-[220px] flex items-center justify-center">
                  {outputUrl ? (
                    <img
                      src={outputUrl}
                      alt="Scanned Output"
                      style={{
                        filter: `brightness(${brightness}%) contrast(${contrast}%)`
                      }}
                      className={`shadow-md border border-slate-400 max-h-[260px] object-contain block mx-auto transition-all ${orientation === 'landscape' ? 'w-full' : ''}`}
                    />
                  ) : (
                    <div className="text-slate-400 text-xs">प्रोसेस हो रहा है...</div>
                  )}
                </div>

                <button
                  onClick={() => setStep('crop')}
                  className="mt-2 text-[11px] text-slate-600 hover:text-green-700 font-bold underline cursor-pointer"
                >
                  ← कोनों को दोबारा एडजस्ट करें (Recrop)
                </button>
              </div>

              {/* ओरिएंटेशन */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <label className="block text-xs font-black text-slate-700 mb-2 uppercase">
                  A4 ओरिएंटेशन चुनें
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrientation('portrait')}
                    className={`py-2 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                      orientation === 'portrait'
                        ? 'bg-green-600 text-white border-green-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    📄 पोर्ट्रेट (सीधा A4)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation('landscape')}
                    className={`py-2 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                      orientation === 'landscape'
                        ? 'bg-green-600 text-white border-green-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    📑 लैंडस्केप (आड़ा A4)
                  </button>
                </div>
              </div>

              {/* फ़िल्टर्स: B&W Xerox, Magic, Original */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <label className="block text-xs font-black text-slate-700 mb-2 uppercase">
                  स्कैनर मोड चुनें
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setFilterMode('bw'); setBrightness(115); setContrast(145); }}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      filterMode === 'bw'
                        ? 'bg-green-50 border-green-600 text-green-800 font-extrabold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 text-xs'
                    }`}
                  >
                    <div className="text-sm mb-0.5">🖨️</div>
                    <div className="text-[11px] font-bold leading-tight">B&W ज़ेरॉक्स</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setFilterMode('magic'); setBrightness(105); setContrast(120); }}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      filterMode === 'magic'
                        ? 'bg-green-50 border-green-600 text-green-800 font-extrabold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 text-xs'
                    }`}
                  >
                    <div className="text-sm mb-0.5">✨</div>
                    <div className="text-[11px] font-bold leading-tight">मैजिक कलर</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setFilterMode('original'); setBrightness(100); setContrast(100); }}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      filterMode === 'original'
                        ? 'bg-green-50 border-green-600 text-green-800 font-extrabold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 text-xs'
                    }`}
                  >
                    <div className="text-sm mb-0.5">🖼️</div>
                    <div className="text-[11px] font-bold leading-tight">ओरिजिनल</div>
                  </button>
                </div>

                {/* रियल-टाइम फास्ट ब्राइटनेस व कंट्रास्ट स्लाइडर्स */}
                <div className="grid grid-cols-2 gap-3 mt-3 pt-2.5 border-t border-slate-100">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-0.5">
                      <span>सफेदी (Brightness)</span>
                      <span className="text-green-700 font-bold">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="80"
                      max="150"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-green-600 cursor-pointer h-1.5"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-0.5">
                      <span>कंट्रास्ट (Dark Text)</span>
                      <span className="text-green-700 font-bold">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="90"
                      max="180"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-green-600 cursor-pointer h-1.5"
                    />
                  </div>
                </div>
              </div>

              {/* 10 KB से 800 KB स्लाइडर (अब 10 KB पर सच में 10 KB बनेगा) */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-xs font-black text-slate-700 uppercase block">
                      टारगेट फाइल साइज
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      (10 KB से 800 KB - सटीक ऑटो-कंप्रेशन)
                    </span>
                  </div>
                  <span className="text-xs font-black text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                    टारगेट: {targetKb} KB
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="800"
                  step="5"
                  value={targetKb}
                  onChange={(e) => setTargetKb(Number(e.target.value))}
                  className="w-full accent-green-600 cursor-pointer h-2"
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-1">
                  <span>10 KB (अति हल्का)</span>
                  <span className="text-green-700 font-bold">100-300 KB (सरकारी पोर्टल)</span>
                  <span>800 KB (हाई क्वालिटी)</span>
                </div>
              </div>

              {/* डुअल डाउनलोड */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={downloadJpg}
                  disabled={!outputUrl || isCompressing}
                  className="py-3.5 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                >
                  <span>🖼️ JPG डाउनलोड ({outputSizeKb} KB)</span>
                </button>

                <button
                  onClick={downloadPdf}
                  disabled={!outputUrl || isCompressing}
                  className="py-3.5 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                >
                  <span>📄 A4 PDF डाउनलोड</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
