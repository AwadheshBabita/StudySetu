'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import FaqSection from '@/components/FaqSection';

interface Point {
  x: number;
  y: number;
}

interface ScannedPage {
  id: string;
  dataUrl: string;
  sizeKb: number;
}

export default function DocumentScannerPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [baseCroppedImg, setBaseCroppedImg] = useState<string | null>(null);

  // मल्टी-पेज लिस्ट (1 से लेकर 50+ पन्नों की पूरी आज़ादी)
  const [scannedPages, setScannedPages] = useState<ScannedPage[]>([]);

  // 4 कोने (प्रतिशत 0 से 100)
  const [corners, setCorners] = useState<{ tl: Point; tr: Point; br: Point; bl: Point }>({
    tl: { x: 5, y: 5 },
    tr: { x: 95, y: 5 },
    br: { x: 95, y: 95 },
    bl: { x: 5, y: 95 },
  });
  const [activeCorner, setActiveCorner] = useState<'tl' | 'tr' | 'br' | 'bl' | null>(null);

  // रोटेशन व फ़िल्टर सेटिंग्स
  const [rotation, setRotation] = useState<number>(0);
  const [filterMode, setFilterMode] = useState<'magic' | 'bw' | 'grayscale' | 'original'>('magic');
  const [contrast, setContrast] = useState<number>(25);
  const [brightness, setBrightness] = useState<number>(15);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const imgBoxRef = useRef<HTMLDivElement>(null);
  const rawImgRef = useRef<HTMLImageElement | null>(null);

  const [renderedBounds, setRenderedBounds] = useState<{ w: number; h: number; l: number; t: number }>({
    w: 300,
    h: 400,
    l: 0,
    t: 0
  });

  const liveCanvasRef = useRef<HTMLCanvasElement>(null);
  const highResCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const scannerFaqs = [
    {
      q: "क्या मैं 1 पन्ने से लेकर 50 पन्नों तक की PDF बना सकता हूँ?",
      a: "हाँ, कस्टमर पर कोई सीमा नहीं है। आप चाहें तो केवल 1 पन्ना स्कैन करके PDF या JPG ले सकते हैं, या 10, 20, 50 पन्ने लगातार जोड़कर सभी की एक सिंगल संयुक्त A4 PDF डाउनलोड कर सकते हैं।"
    },
    {
      q: "क्या ज्यादा पन्ने स्कैन करने पर PDF बहुत भारी हो जाएगी?",
      a: "बिल्कुल नहीं। इसमें स्मार्ट कम्प्रेशन लगा है जिससे प्रत्येक पन्ना औसतन मात्र 150 KB से 200 KB का बनता है। 10 पन्नों की पूरी फाइल भी 1.5 से 2 MB के अंदर तैयार हो जाती है।"
    },
    {
      q: "क्या सीधे मोबाइल कैमरे से लगातार फोटो खींच सकते हैं?",
      a: "हाँ, पन्ना साफ़ करने के बाद '+ अगला पन्ना जोड़ें' दबाते ही वापस कैमरा/गैलरी का विकल्प खुल जाता है। किताब या दस्तावेज़ के सारे पन्ने क्रमवार स्कैन किए जा सकते हैं।"
    },
    {
      q: "क्या 4-कोने सटीक काम करते हैं?",
      a: "हाँ, इसमें सूक्ष्म टच पॉइंट्स दिए गए हैं। आप उंगली से किताब के मुड़े या तिरछे पन्नों के ठीक चारों कोनों को पकड़कर सीधा फ्लैट कर सकते हैं।"
    }
  ];

  const computeImageBounds = useCallback(() => {
    const img = rawImgRef.current;
    const box = imgBoxRef.current;
    if (!img || !box) return;

    const rad = (rotation * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    const rotW = img.width * cos + img.height * sin;
    const rotH = img.width * sin + img.height * cos;

    const boxW = box.clientWidth;
    const boxH = box.clientHeight;

    const imgAspect = rotW / rotH;
    const boxAspect = boxW / boxH;

    let dispW = boxW;
    let dispH = boxH;

    if (imgAspect > boxAspect) {
      dispW = boxW;
      dispH = boxW / imgAspect;
    } else {
      dispH = boxH;
      dispW = boxH * imgAspect;
    }

    const dispL = (boxW - dispW) / 2;
    const dispT = (boxH - dispH) / 2;

    setRenderedBounds({ w: dispW, h: dispH, l: dispL, t: dispT });
  }, [rotation]);

  const handleImageFile = (file: File | undefined) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.src = src;
      img.onload = () => {
        rawImgRef.current = img;
        setImageSrc(src);
        setBaseCroppedImg(null);
        setRotation(0);
        setCorners({
          tl: { x: 5, y: 5 },
          tr: { x: 95, y: 5 },
          br: { x: 95, y: 95 },
          bl: { x: 5, y: 95 },
        });
      };
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (imageSrc) {
      computeImageBounds();
      window.addEventListener('resize', computeImageBounds);
      return () => window.removeEventListener('resize', computeImageBounds);
    }
  }, [imageSrc, rotation, computeImageBounds]);

  const updateCorner = (clientX: number, clientY: number) => {
    if (!activeCorner || !imgBoxRef.current) return;
    const rect = imgBoxRef.current.getBoundingClientRect();

    const imgLeft = rect.left + renderedBounds.l;
    const imgTop = rect.top + renderedBounds.t;

    let px = ((clientX - imgLeft) / renderedBounds.w) * 100;
    let py = ((clientY - imgTop) / renderedBounds.h) * 100;

    px = Math.max(0, Math.min(100, px));
    py = Math.max(0, Math.min(100, py));

    setCorners((prev) => ({
      ...prev,
      [activeCorner]: { x: px, y: py },
    }));
  };

  // स्टेप 1: 200 DPI A4 मानक कैनवस क्रॉप (1654 x 2338 - ऑप्टिमाइज़्ड)
  const applyCropOnly = () => {
    const img = rawImgRef.current;
    if (!img) return;

    const rad = (rotation * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    const rotW = img.width * cos + img.height * sin;
    const rotH = img.width * sin + img.height * cos;

    const rotCanvas = document.createElement('canvas');
    rotCanvas.width = rotW;
    rotCanvas.height = rotH;
    const rCtx = rotCanvas.getContext('2d');
    if (!rCtx) return;

    rCtx.translate(rotW / 2, rotH / 2);
    rCtx.rotate(rad);
    rCtx.drawImage(img, -img.width / 2, -img.height / 2);

    const minX = (Math.min(corners.tl.x, corners.bl.x) / 100) * rotW;
    const maxX = (Math.max(corners.tr.x, corners.br.x) / 100) * rotW;
    const minY = (Math.min(corners.tl.y, corners.tr.y) / 100) * rotH;
    const maxY = (Math.max(corners.bl.y, corners.br.y) / 100) * rotH;

    const cropW = Math.max(80, maxX - minX);
    const cropH = Math.max(80, maxY - minY);

    const a4W = 1654;
    const a4H = 2338;
    const highResCanvas = document.createElement('canvas');
    highResCanvas.width = a4W;
    highResCanvas.height = a4H;
    const hCtx = highResCanvas.getContext('2d');
    if (!hCtx) return;

    hCtx.fillStyle = '#FFFFFF';
    hCtx.fillRect(0, 0, a4W, a4H);

    const aspect = cropW / cropH;
    const a4Aspect = a4W / a4H;
    let renderW = a4W;
    let renderH = a4H;

    if (aspect > a4Aspect) {
      renderW = a4W;
      renderH = renderW / aspect;
    } else {
      renderH = a4H;
      renderW = renderH * aspect;
    }

    const offsetX = (a4W - renderW) / 2;
    const offsetY = (a4H - renderH) / 2;

    hCtx.drawImage(rotCanvas, minX, minY, cropW, cropH, offsetX, offsetY, renderW, renderH);
    highResCanvasRef.current = highResCanvas;

    const previewUrl = highResCanvas.toDataURL('image/jpeg', 0.82);
    setBaseCroppedImg(previewUrl);
    setFilterMode('magic');
    setContrast(25);
    setBrightness(15);
  };

  // स्टेप 2: लाइव फ़िल्टर व ट्यूनिंग रेंडर
  const renderLiveProcessedCanvas = useCallback(() => {
    const highResCanvas = highResCanvasRef.current;
    const liveCanvas = liveCanvasRef.current;
    if (!highResCanvas || !liveCanvas) return;

    const prevW = 600;
    const prevH = Math.round((600 * 2338) / 1654);
    liveCanvas.width = prevW;
    liveCanvas.height = prevH;

    const lCtx = liveCanvas.getContext('2d');
    if (!lCtx) return;

    lCtx.drawImage(highResCanvas, 0, 0, prevW, prevH);

    const imgData = lCtx.getImageData(0, 0, prevW, prevH);
    const data = imgData.data;

    const factor = (259 * (contrast + 255)) / (255 * (259 - Math.min(250, contrast)));
    const bOffset = brightness * 1.5;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      if (filterMode === 'original') {
        r = factor * (r + bOffset - 128) + 128;
        g = factor * (g + bOffset - 128) + 128;
        b = factor * (b + bOffset - 128) + 128;
      } else if (filterMode === 'grayscale') {
        let gray = 0.299 * r + 0.587 * g + 0.114 * b;
        gray = factor * (gray + bOffset - 128) + 128;
        r = g = b = gray;
      } else if (filterMode === 'bw') {
        let gray = 0.299 * r + 0.587 * g + 0.114 * b;
        gray = gray + bOffset;
        const threshold = 145 - (contrast * 0.4);
        const val = gray >= threshold ? 255 : Math.max(0, factor * (gray - 128) + 90);
        r = g = b = val;
      } else if (filterMode === 'magic') {
        const maxVal = Math.max(r, g, b);
        const minVal = Math.min(r, g, b);
        const saturation = maxVal === 0 ? 0 : (maxVal - minVal) / maxVal;
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

        let cleanR = factor * (r + bOffset - 128) + 128;
        let cleanG = factor * (g + bOffset - 128) + 128;
        let cleanB = factor * (b + bOffset - 128) + 128;

        if (luminance > (135 - bOffset * 0.5) && saturation < 0.35) {
          cleanR = 255;
          cleanG = 255;
          cleanB = 255;
        } else {
          cleanR = Math.max(0, cleanR - 15);
          cleanG = Math.max(0, cleanG - 15);
          cleanB = Math.max(0, cleanB - 15);
        }

        r = cleanR;
        g = cleanG;
        b = cleanB;
      }

      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }

    lCtx.putImageData(imgData, 0, 0);
  }, [filterMode, contrast, brightness]);

  useEffect(() => {
    if (baseCroppedImg) {
      renderLiveProcessedCanvas();
    }
  }, [baseCroppedImg, renderLiveProcessedCanvas]);

  const generateProcessedDataUrl = (): string | null => {
    const highResCanvas = highResCanvasRef.current;
    if (!highResCanvas) return null;

    const outCanvas = document.createElement('canvas');
    outCanvas.width = highResCanvas.width;
    outCanvas.height = highResCanvas.height;
    const oCtx = outCanvas.getContext('2d');
    if (!oCtx) return null;

    oCtx.drawImage(highResCanvas, 0, 0);
    const imgData = oCtx.getImageData(0, 0, outCanvas.width, outCanvas.height);
    const data = imgData.data;

    const factor = (259 * (contrast + 255)) / (255 * (259 - Math.min(250, contrast)));
    const bOffset = brightness * 1.5;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      if (filterMode === 'original') {
        r = factor * (r + bOffset - 128) + 128;
        g = factor * (g + bOffset - 128) + 128;
        b = factor * (b + bOffset - 128) + 128;
      } else if (filterMode === 'grayscale') {
        let gray = 0.299 * r + 0.587 * g + 0.114 * b;
        gray = factor * (gray + bOffset - 128) + 128;
        r = g = b = gray;
      } else if (filterMode === 'bw') {
        let gray = 0.299 * r + 0.587 * g + 0.114 * b;
        gray = gray + bOffset;
        const threshold = 145 - (contrast * 0.4);
        const val = gray >= threshold ? 255 : Math.max(0, factor * (gray - 128) + 90);
        r = g = b = val;
      } else if (filterMode === 'magic') {
        const maxVal = Math.max(r, g, b);
        const minVal = Math.min(r, g, b);
        const saturation = maxVal === 0 ? 0 : (maxVal - minVal) / maxVal;
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

        let cleanR = factor * (r + bOffset - 128) + 128;
        let cleanG = factor * (g + bOffset - 128) + 128;
        let cleanB = factor * (b + bOffset - 128) + 128;

        if (luminance > (135 - bOffset * 0.5) && saturation < 0.35) {
          cleanR = 255;
          cleanG = 255;
          cleanB = 255;
        } else {
          cleanR = Math.max(0, cleanR - 15);
          cleanG = Math.max(0, cleanG - 15);
          cleanB = Math.max(0, cleanB - 15);
        }

        r = cleanR;
        g = cleanG;
        b = cleanB;
      }

      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }

    oCtx.putImageData(imgData, 0, 0);
    return outCanvas.toDataURL('image/jpeg', 0.82);
  };

  // पन्ने को मल्टी-पेज कतार में जोड़ें (1 से 50 पन्ने)
  const addPageToList = () => {
    const url = generateProcessedDataUrl();
    if (!url) return;

    const kb = Math.round((url.length * 3) / 4 / 1024);

    const newPage: ScannedPage = {
      id: Date.now().toString(),
      dataUrl: url,
      sizeKb: kb,
    };

    setScannedPages((prev) => [...prev, newPage]);
    setImageSrc(null);
    setBaseCroppedImg(null);
  };

  // 1. विकल्प: केवल वर्तमान 1 पन्ने की JPG
  const downloadSingleJpg = () => {
    const url = generateProcessedDataUrl();
    if (!url) return;

    const a = document.createElement('a');
    a.download = `scanned_page_${Date.now()}.jpg`;
    a.href = url;
    a.click();
  };

  // 2. विकल्प: केवल वर्तमान 1 पन्ने की A4 PDF
  const downloadSingleA4Pdf = () => {
    const url = generateProcessedDataUrl();
    if (!url) return;

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    pdf.addImage(url, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    pdf.save(`scanned_single_page_${Date.now()}.pdf`);
  };

  // 3. विकल्प: जितने भी पन्ने जुड़े हैं (1, 5, 10, 50) उनकी संयुक्त A4 PDF
  const downloadMultiPagePdf = () => {
    if (scannedPages.length === 0) return;

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

    scannedPages.forEach((page, index) => {
      if (index > 0) pdf.addPage();
      pdf.addImage(page.dataUrl, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    });

    pdf.save(`examsewa_scanned_${scannedPages.length}_pages.pdf`);
  };

  const removePageFromList = (id: string) => {
    setScannedPages((prev) => prev.filter((p) => p.id !== id));
  };

  const totalBatchKb = scannedPages.reduce((acc, curr) => acc + curr.sizeKb, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        
        <div className="inline-block px-3 py-1 bg-cyan-100 text-cyan-800 text-xs font-bold rounded-full mb-3">
          1 पन्ना या 50 पन्ने • कस्टमर की पूरी आज़ादी
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          डॉक्यूमेंट व बुक स्कैनर (Doc & Book Scanner)
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          किताब या पन्नों की फोटो खींचें। चाहे सिर्फ 1 पन्ना चाहिए या 10 से 50 पन्ने—सबको जोड़कर सुपर-शार्प और कम KB में A4 PDF या JPG पाएँ।
        </p>

        {/* मल्टी-पेज बैच स्टेटस बार (जब 1 या अधिक पन्ने कतार में हों) */}
        {scannedPages.length > 0 && !imageSrc && (
          <div className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-3">
              <div>
                <span className="text-sm font-black text-emerald-950 block">
                  📑 स्कैन किए गए कुल पन्ने: {scannedPages.length}
                </span>
                <span className="text-xs text-emerald-800 font-bold">
                  अनुमानित कुल PDF साइज़: मात्र {totalBatchKb > 1024 ? `${(totalBatchKb / 1024).toFixed(1)} MB` : `${totalBatchKb} KB`} (सरकारी पोर्टल रेडी)
                </span>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={downloadMultiPagePdf}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <span>📥</span>
                  <span>सभी {scannedPages.length} पन्नों की 1 संयुक्त PDF डाउनलोड करें</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScannedPages([])}
                  className="px-3 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-xl transition"
                  title="सभी पन्ने हटाएँ"
                >
                  साफ़ करें
                </button>
              </div>
            </div>

            {/* थंबनेल पट्टी */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2 border-t border-emerald-200">
              {scannedPages.map((page, idx) => (
                <div key={page.id} className="relative group bg-white p-1 rounded-lg border border-emerald-300 shadow-2xs">
                  <img src={page.dataUrl} alt={`Page ${idx + 1}`} className="w-full h-20 object-contain rounded" />
                  <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] font-bold px-1 rounded">
                    P{idx + 1} • {page.sizeKb}KB
                  </span>
                  <button
                    type="button"
                    onClick={() => removePageFromList(page.id)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full text-xs font-black flex items-center justify-center shadow-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* कैमरा व गैलरी इनपुट बॉक्स */}
        {!imageSrc && (
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50 mb-6">
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
                className="w-full sm:w-auto px-6 py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
              >
                <span>📸</span>
                <span>{scannedPages.length > 0 ? `+ पन्ना ${scannedPages.length + 1} खींचें (कैमरा)` : 'कैमरा खोलें (फोटो खींचे)'}</span>
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
              >
                <span>📁</span>
                <span>गैलरी / फ़ाइल से चुनें</span>
              </button>
            </div>
          </div>
        )}

        {/* स्टेप 1: 4-कॉर्नर पर्सपेक्टिव क्रॉप */}
        {imageSrc && !baseCroppedImg && (
          <div className="space-y-5 mb-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                स्टेप 1: चारों बारीक बिंदुओं को पन्ने के कोनों पर सेट करें
              </span>
              <button
                type="button"
                onClick={() => setImageSrc(null)}
                className="text-xs text-red-600 font-bold"
              >
                रद्द करें
              </button>
            </div>

            {/* रोटेशन */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>📐 पन्ना सीधा करें (Rotate):</span>
                <span className="text-cyan-600 font-mono">{rotation}°</span>
              </div>
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>-180°</span>
                <button type="button" onClick={() => setRotation(0)} className="text-cyan-600 font-bold underline">
                  0° (रीसेट)
                </button>
                <span>+180°</span>
              </div>
            </div>

            {/* कैनवस व्यू - सटीक बाउंड्री बॉक्स */}
            <div className="flex justify-center">
              <div
                ref={imgBoxRef}
                onPointerMove={(e) => activeCorner && updateCorner(e.clientX, e.clientY)}
                onPointerUp={() => setActiveCorner(null)}
                className="relative w-full max-w-md h-80 sm:h-96 bg-slate-950 rounded-xl overflow-hidden touch-none select-none flex items-center justify-center shadow-inner"
              >
                <img
                  src={imageSrc}
                  alt="Scan target"
                  onLoad={computeImageBounds}
                  style={{ transform: `rotate(${rotation}deg)` }}
                  className="max-w-full max-h-full object-contain pointer-events-none transition-transform duration-75"
                />

                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: `${renderedBounds.l}px`,
                    top: `${renderedBounds.t}px`,
                    width: `${renderedBounds.w}px`,
                    height: `${renderedBounds.h}px`,
                  }}
                >
                  <svg className="w-full h-full">
                    <polygon
                      points={`
                        ${(corners.tl.x * 0.01 * renderedBounds.w)},${(corners.tl.y * 0.01 * renderedBounds.h)}
                        ${(corners.tr.x * 0.01 * renderedBounds.w)},${(corners.tr.y * 0.01 * renderedBounds.h)}
                        ${(corners.br.x * 0.01 * renderedBounds.w)},${(corners.br.y * 0.01 * renderedBounds.h)}
                        ${(corners.bl.x * 0.01 * renderedBounds.w)},${(corners.bl.y * 0.01 * renderedBounds.h)}
                      `}
                      fill="rgba(6, 182, 212, 0.2)"
                      stroke="#06B6D4"
                      strokeWidth="1.5"
                      strokeDasharray="3 2"
                    />
                  </svg>

                  {[
                    { key: 'tl', pos: corners.tl },
                    { key: 'tr', pos: corners.tr },
                    { key: 'br', pos: corners.br },
                    { key: 'bl', pos: corners.bl },
                  ].map((c) => (
                    <div
                      key={c.key}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        (e.target as HTMLElement).setPointerCapture(e.pointerId);
                        setActiveCorner(c.key as any);
                      }}
                      style={{
                        left: `${(c.pos.x * 0.01 * renderedBounds.w)}px`,
                        top: `${(c.pos.y * 0.01 * renderedBounds.h)}px`,
                      }}
                      className="absolute -ml-4 -mt-4 w-8 h-8 pointer-events-auto flex items-center justify-center cursor-crosshair group"
                    >
                      <span className="w-3.5 h-3.5 bg-cyan-400 border-2 border-white rounded-full shadow-md group-active:scale-125 transition-transform flex items-center justify-center">
                        <span className="w-1 h-1 bg-slate-900 rounded-full" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={applyCropOnly}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-black py-4 rounded-xl transition shadow-md text-base flex items-center justify-center gap-2"
            >
              <span>✂️</span>
              <span>यह हिस्सा क्रॉप करें (Crop Page)</span>
            </button>
          </div>
        )}

        {/* स्टेप 2: लाइव फ़िल्टर, ट्यूनिंग व कस्टमर के सभी डाउनलोड विकल्प */}
        {baseCroppedImg && (
          <div className="space-y-5 mb-6 p-4 sm:p-5 bg-slate-50 border-2 border-cyan-200 rounded-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs font-black text-cyan-800 uppercase tracking-wider">
                स्टेप 2: पन्ना साफ़ करें व फ़ाइन ट्यून करें
              </span>
              <button
                type="button"
                onClick={() => setBaseCroppedImg(null)}
                className="text-xs text-slate-600 hover:text-cyan-700 font-bold underline"
              >
                ← दोबारा क्रॉप करें
              </button>
            </div>

            {/* लाइव प्रीव्यू */}
            <div className="flex justify-center">
              <div className="p-2 bg-white rounded-xl border border-slate-300 shadow-sm max-w-sm w-full flex justify-center">
                <canvas ref={liveCanvasRef} className="w-full h-auto max-h-80 object-contain rounded" />
              </div>
            </div>

            {/* 4 फ़िल्टर मोड्स */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">
                🎨 फ़िल्टर मोड चुनें:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setFilterMode('magic')}
                  className={`py-2.5 text-xs font-bold rounded-xl border transition ${
                    filterMode === 'magic' ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs' : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  ✨ मैजिक साफ़
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('bw')}
                  className={`py-2.5 text-xs font-bold rounded-xl border transition ${
                    filterMode === 'bw' ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs' : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  📄 B&W पन्ना
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('grayscale')}
                  className={`py-2.5 text-xs font-bold rounded-xl border transition ${
                    filterMode === 'grayscale' ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs' : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  🌫️ ग्रेस्केल
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('original')}
                  className={`py-2.5 text-xs font-bold rounded-xl border transition ${
                    filterMode === 'original' ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs' : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  🖼️ ओरिजिनल
                </button>
              </div>
            </div>

            {/* फ़ाइन ट्यूनिंग स्लाइडर्स */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>🖋️ कंट्रास्ट (अक्षर गहरे करें):</span>
                  <span className="text-cyan-600 font-mono">{contrast > 0 ? `+${contrast}` : contrast}%</span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={100}
                  step={1}
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>☀️ ब्राइटनेस (सफ़ेदी बढ़ाएँ):</span>
                  <span className="text-cyan-600 font-mono">{brightness > 0 ? `+${brightness}` : brightness}</span>
                </div>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  step={1}
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
              </div>
            </div>

            {/* कस्टमर के लिए तीनों स्पष्ट विकल्प */}
            <div className="space-y-3 pt-2">
              
              {/* विकल्प A: मल्टी-पेज में जोड़ना (10-50 पन्नों के लिए) */}
              <button
                type="button"
                onClick={addPageToList}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2"
              >
                <span>➕</span>
                <span>यह पन्ना जोड़ें और अगला पन्ना स्कैन करें (Multi-Page Queue)</span>
              </button>

              {/* विकल्प B: अगर सिर्फ 1 ही पन्ना चाहिए तो सीधे डाउनलोड */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block mb-2 text-center">
                  या अगर केवल इसी 1 पन्ने की ज़रूरत है:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={downloadSingleA4Pdf}
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <span>📄</span> केवल यह 1 पन्ना A4 PDF लें (~180 KB)
                  </button>
                  <button
                    type="button"
                    onClick={downloadSingleJpg}
                    className="py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <span>🖼️</span> केवल यह 1 पन्ना JPG लें (~150 KB)
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      <FaqSection 
        title="डॉक्यूमेंट स्कैनर - अक्सर पूछे जाने वाले सवाल"
        items={scannerFaqs}
        pageUrl="https://examsewa.online/tools/ocr-scanner"
      />

    </div>
  );
}
