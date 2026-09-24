'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

type PaperType = 'a4' | '4x6';
type LayoutMode = 'vertical' | 'side-by-side';
type FilterMode = 'original' | 'document' | 'bw';
type ActiveTarget = 'front' | 'back' | null;

interface Point {
  x: number;
  y: number;
}

const MM_TO_PX = 300 / 25.4;

export default function IdCardJoinerPage() {
  const [frontCropped, setFrontCropped] = useState<string | null>(null);
  const [backCropped, setBackCropped] = useState<string | null>(null);

  const [paperType, setPaperType] = useState<PaperType>('a4');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('side-by-side');
  const [showBorder, setShowBorder] = useState<boolean>(true);
  const [cardGapMm, setCardGapMm] = useState<number>(6);

  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [filterMode, setFilterMode] = useState<FilterMode>('original');

  const [targetKb, setTargetKb] = useState<number>(150);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // क्रॉपर स्टेट
  const [cropTarget, setCropTarget] = useState<ActiveTarget>(null);
  const [cropImgSrc, setCropImgSrc] = useState<string | null>(null);
  const [corners, setCorners] = useState<Point[]>([
    { x: 30, y: 30 },
    { x: 250, y: 30 },
    { x: 250, y: 170 },
    { x: 30, y: 170 },
  ]);
  const [activeCorner, setActiveCorner] = useState<number | null>(null);
  const [cropImgDims, setCropImgDims] = useState<{ width: number; height: number }>({ width: 300, height: 200 });

  const fileInputFrontRef = useRef<HTMLInputElement>(null);
  const fileInputBackRef = useRef<HTMLInputElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (file: File | undefined, target: 'front' | 'back') => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setCropImgSrc(src);
      setCropTarget(target);
    };
    reader.readAsDataURL(file);
  };

  const handleCropImageLoaded = () => {
    if (!cropImageRef.current) return;
    const { clientWidth, clientHeight } = cropImageRef.current;
    setCropImgDims({ width: clientWidth, height: clientHeight });
    const padX = clientWidth * 0.08;
    const padY = clientHeight * 0.08;
    setCorners([
      { x: padX, y: padY },
      { x: clientWidth - padX, y: padY },
      { x: clientWidth - padX, y: clientHeight - padY },
      { x: padX, y: clientHeight - padY },
    ]);
  };

  const updateActiveCornerPos = (clientX: number, clientY: number) => {
    if (activeCorner === null || !cropContainerRef.current) return;
    const rect = cropContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

    setCorners((prev) => {
      const next = [...prev];
      next[activeCorner] = { x, y };
      return next;
    });
  };

  const handlePointerDown = (index: number) => {
    setActiveCorner(index);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (activeCorner !== null) {
      updateActiveCornerPos(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = () => {
    setActiveCorner(null);
  };

  const applyPerspectiveCrop = async () => {
    if (!cropImgSrc || !cropImageRef.current || cropTarget === null) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = cropImgSrc;
      await new Promise((res) => { img.onload = res; });

      const scaleX = img.naturalWidth / cropImgDims.width;
      const scaleY = img.naturalHeight / cropImgDims.height;

      const p = corners.map((pt) => ({
        x: pt.x * scaleX,
        y: pt.y * scaleY,
      }));

      const outW = 1011;
      const outH = 638;

      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const srcCanvas = document.createElement('canvas');
      srcCanvas.width = img.naturalWidth;
      srcCanvas.height = img.naturalHeight;
      const sCtx = srcCanvas.getContext('2d');
      if (!sCtx) return;
      sCtx.drawImage(img, 0, 0);

      const srcImgData = sCtx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
      const dstImgData = ctx.createImageData(outW, outH);

      const sData = srcImgData.data;
      const dData = dstImgData.data;
      const sW = img.naturalWidth;
      const sH = img.naturalHeight;

      for (let y = 0; y < outH; y++) {
        const v = y / (outH - 1);
        const leftX = p[0].x + v * (p[3].x - p[0].x);
        const leftY = p[0].y + v * (p[3].y - p[0].y);
        const rightX = p[1].x + v * (p[2].x - p[1].x);
        const rightY = p[1].y + v * (p[2].y - p[1].y);

        for (let x = 0; x < outW; x++) {
          const u = x / (outW - 1);
          const srcX = Math.round(leftX + u * (rightX - leftX));
          const srcY = Math.round(leftY + u * (rightY - leftY));

          const dstIdx = (y * outW + x) * 4;

          if (srcX >= 0 && srcX < sW && srcY >= 0 && srcY < sH) {
            const srcIdx = (srcY * sW + srcX) * 4;
            dData[dstIdx] = sData[srcIdx];
            dData[dstIdx + 1] = sData[srcIdx + 1];
            dData[dstIdx + 2] = sData[srcIdx + 2];
            dData[dstIdx + 3] = 255;
          } else {
            dData[dstIdx] = 255;
            dData[dstIdx + 1] = 255;
            dData[dstIdx + 2] = 255;
            dData[dstIdx + 3] = 255;
          }
        }
      }

      ctx.putImageData(dstImgData, 0, 0);
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.98);

      if (cropTarget === 'front') {
        setFrontCropped(croppedDataUrl);
      } else {
        setBackCropped(croppedDataUrl);
      }

      setCropTarget(null);
      setCropImgSrc(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const spec = {
    sheetW_mm: paperType === '4x6' ? 101.6 : 210.0,
    sheetH_mm: paperType === '4x6' ? 152.4 : 297.0,
    cardW_mm: 85.6,
    cardH_mm: 54.0,
  };

  const generateSheetCanvas = async (scaleMultiplier: number = 1): Promise<HTMLCanvasElement | null> => {
    if (!frontCropped && !backCropped) return null;

    const sheetW = Math.round(spec.sheetW_mm * MM_TO_PX * scaleMultiplier);
    const sheetH = Math.round(spec.sheetH_mm * MM_TO_PX * scaleMultiplier);

    const canvas = document.createElement('canvas');
    canvas.width = sheetW;
    canvas.height = sheetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, sheetW, sheetH);

    const cardW = Math.round(spec.cardW_mm * MM_TO_PX * scaleMultiplier);
    const cardH = Math.round(spec.cardH_mm * MM_TO_PX * scaleMultiplier);
    const gap = Math.round(cardGapMm * MM_TO_PX * scaleMultiplier);

    let filterString = `brightness(${brightness}%) contrast(${contrast}%)`;
    if (filterMode === 'document') {
      filterString += ' contrast(135%) brightness(108%) saturate(115%)';
    } else if (filterMode === 'bw') {
      filterString += ' grayscale(100%) contrast(150%) brightness(105%)';
    }
    ctx.filter = filterString;

    let totalBlockW = cardW;
    let totalBlockH = cardH;

    if (layoutMode === 'vertical') {
      totalBlockW = cardW;
      totalBlockH = backCropped ? (cardH * 2 + gap) : cardH;
    } else {
      totalBlockW = backCropped ? (cardW * 2 + gap) : cardW;
      totalBlockH = cardH;
    }

    const startX = Math.round((sheetW - totalBlockW) / 2);
    
    let startY = Math.round((sheetH - totalBlockH) / 2);
    if (paperType === 'a4') {
      const topMarginMm = 12.0;
      startY = Math.round(topMarginMm * MM_TO_PX * scaleMultiplier);
    }

    const drawCard = (imgEl: HTMLImageElement, x: number, y: number) => {
      ctx.drawImage(imgEl, x, y, cardW, cardH);
      if (showBorder) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(1.5, 3 * scaleMultiplier);
        ctx.strokeRect(x, y, cardW, cardH);
      }
    };

    if (frontCropped) {
      const frontImg = new Image();
      frontImg.src = frontCropped;
      await new Promise((res) => { frontImg.onload = res; });
      drawCard(frontImg, startX, startY);
    }

    if (backCropped) {
      const backImg = new Image();
      backImg.src = backCropped;
      await new Promise((res) => { backImg.onload = res; });

      const backX = layoutMode === 'vertical' ? startX : (startX + cardW + gap);
      const backY = layoutMode === 'vertical' ? (startY + cardH + gap) : startY;
      drawCard(backImg, backX, backY);
    }

    return canvas;
  };

  // 💥 अल्ट्रा-शार्प 40KB कंप्रेसर
  const getCompressedBlob = async (targetSizeKb: number): Promise<Blob | null> => {
    // 40KB में भी रिज़ॉल्यूशन को ज़्यादा नहीं गिराएंगे ताकि टेक्स्ट एकदम साफ़ रहे
    let scale = 1.0;
    if (targetSizeKb < 35) scale = 0.65;
    else if (targetSizeKb < 80) scale = 0.85;

    let canvas = await generateSheetCanvas(scale);
    if (!canvas) return null;

    let minQuality = 0.08;
    let maxQuality = 0.98;
    let bestBlob: Blob | null = null;

    for (let iter = 0; iter < 8; iter++) {
      const midQuality = (minQuality + maxQuality) / 2;
      const blob: Blob | null = await new Promise((res) => {
        canvas?.toBlob((b) => res(b), 'image/jpeg', midQuality);
      });

      if (!blob) break;

      const curKb = blob.size / 1024;
      bestBlob = blob;

      if (Math.abs(curKb - targetSizeKb) <= targetSizeKb * 0.05) {
        break;
      }

      if (curKb > targetSizeKb) {
        maxQuality = midQuality;
      } else {
        minQuality = midQuality;
      }
    }

    return bestBlob;
  };

  const handleDownload = async (format: 'jpg' | 'pdf') => {
    setIsProcessing(true);
    try {
      if (format === 'jpg') {
        const blob = await getCompressedBlob(targetKb);
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `id_card_${targetKb}kb.jpg`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = await getCompressedBlob(targetKb);
        if (!blob) return;

        const arrayBuffer = await blob.arrayBuffer();
        const imgBytes = new Uint8Array(arrayBuffer);

        const pW = (spec.sheetW_mm * 72) / 25.4;
        const pH = (spec.sheetH_mm * 72) / 25.4;

        const pdfHeader = `%PDF-1.4\n`;
        const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
        const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
        const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pW} ${pH}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`;
        const obj4H = `4 0 obj\n<< /Type /XObject /Subtype /Image /Width 1400 /Height 1980 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`;
        const obj4F = `\nendstream\nendobj\n`;
        const streamC = `q\n${pW} 0 0 ${pH} 0 0 cm\n/Im1 Do\nQ`;
        const obj5 = `5 0 obj\n<< /Length ${streamC.length} >>\nstream\n${streamC}\nendstream\nendobj\n`;

        const enc = new TextEncoder();
        const bHeader = enc.encode(pdfHeader);
        const bObj1 = enc.encode(obj1);
        const bObj2 = enc.encode(obj2);
        const bObj3 = enc.encode(obj3);
        const bObj4H = enc.encode(obj4H);
        const bObj4F = enc.encode(obj4F);
        const bObj5 = enc.encode(obj5);

        const off1 = bHeader.length;
        const off2 = off1 + bObj1.length;
        const off3 = off2 + bObj2.length;
        const off4 = off3 + bObj3.length;
        const off5 = off4 + bObj4H.length + imgBytes.length + bObj4F.length;
        const xrefOff = off5 + bObj5.length;

        const xref = `xref\n0 6\n0000000000 65535 f \n${String(off1).padStart(10, '0')} 00000 n \n${String(off2).padStart(10, '0')} 00000 n \n${String(off3).padStart(10, '0')} 00000 n \n${String(off4).padStart(10, '0')} 00000 n \n${String(off5).padStart(10, '0')} 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOff}\n%%EOF`;
        const bXref = enc.encode(xref);

        const finalPdf = new Uint8Array(xrefOff + bXref.length);
        let cur = 0;
        finalPdf.set(bHeader, cur); cur += bHeader.length;
        finalPdf.set(bObj1, cur); cur += bObj1.length;
        finalPdf.set(bObj2, cur); cur += bObj2.length;
        finalPdf.set(bObj3, cur); cur += bObj3.length;
        finalPdf.set(bObj4H, cur); cur += bObj4H.length;
        finalPdf.set(imgBytes, cur); cur += imgBytes.length;
        finalPdf.set(bObj4F, cur); cur += bObj4F.length;
        finalPdf.set(bObj5, cur); cur += bObj5.length;
        finalPdf.set(bXref, cur);

        const pdfBlob = new Blob([finalPdf], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `id_card_${targetKb}kb.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = async () => {
    setIsProcessing(true);
    try {
      const canvas = await generateSheetCanvas(1.0);
      if (!canvas) return;

      const dataUrl = canvas.toDataURL('image/jpeg', 0.98);

      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      document.body.appendChild(printIframe);

      const printDoc = printIframe.contentWindow?.document;
      if (!printDoc) return;

      const pageSizeRule = paperType === '4x6' ? '4in 6in portrait' : 'A4 portrait';

      printDoc.open();
      printDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print ID Card Sheet</title>
            <style>
              @page {
                size: ${pageSizeRule};
                margin: 0mm !important;
              }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                width: 100%;
                height: 100%;
                background: #FFFFFF;
                overflow: hidden;
              }
              .print-container {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                display: block;
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <img src="${dataUrl}" onload="setTimeout(() => { window.print(); }, 250);" />
            </div>
          </body>
        </html>
      `);
      printDoc.close();

      setTimeout(() => {
        if (document.body.contains(printIframe)) {
          document.body.removeChild(printIframe);
        }
      }, 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen bg-slate-100 text-slate-900 flex flex-col overflow-hidden select-none">
      
      {/* 1. हेडर */}
      <header className="border-b border-slate-200 bg-white px-3 sm:px-4 h-11 flex items-center justify-between shrink-0 shadow-xs z-30">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="text-slate-500 hover:text-slate-900 text-xs font-bold">
            ← होम
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1">
            <span>🪪</span> ID कार्ड जॉइनर
          </span>
        </div>

        {/* 💥 ऊपर हेडर में KB टारगेट लाइव इंडिकेटर वापस जोड़ा गया */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono shadow-2xs">
            आउटपुट: ~{targetKb} KB
          </span>
        </div>
      </header>

      {/* 2. मुख्य कार्यक्षेत्र */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden p-2 sm:p-2.5 gap-2 sm:gap-2.5">
        
        {/* 💥 टॉप फिक्स प्रीव्यू */}
        <div className="h-[40vh] lg:h-auto lg:flex-1 bg-slate-200/90 rounded-2xl border-2 border-slate-300 shadow-inner p-2 flex flex-col items-center justify-center relative shrink-0 overflow-hidden z-10">
          
          <div className="w-full flex items-center justify-between mb-1 text-[10px] sm:text-[11px] font-bold text-slate-700 px-2 shrink-0">
            <span>
              शीट: {paperType === '4x6' ? '4×6' : 'A4'} • 
              <span className="text-blue-700 font-black ml-1">
                {layoutMode === 'vertical' ? 'ऊपर-नीचे' : 'अगल-बगल'}
              </span>
            </span>
            {/* 💥 प्रीव्यू बार के ऊपर भी साफ़ KB इंडिकेटर */}
            <span className="text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              टारगेट: ~{targetKb} KB में सुरक्षित
            </span>
          </div>

          <div className="w-full flex-1 flex items-center justify-center overflow-hidden p-1">
            <div
              className={`bg-white rounded-xl shadow-lg border-2 border-slate-900 transition-all flex flex-col items-center max-h-full max-w-full p-2 relative ${
                paperType === 'a4' ? 'justify-start pt-3' : 'justify-center'
              }`}
              style={{
                aspectRatio: `${spec.sheetW_mm} / ${spec.sheetH_mm}`,
                height: '96%'
              }}
            >
              <div
                className={`flex items-center justify-center gap-2 transition-all max-h-full max-w-full ${
                  layoutMode === 'vertical' ? 'flex-col' : 'flex-row'
                }`}
              >
                {/* फ्रंट कार्ड */}
                <div
                  className={`rounded-xs overflow-hidden flex items-center justify-center bg-slate-50 transition-all ${
                    showBorder ? 'border-2 border-black shadow-xs' : 'border border-dashed border-slate-300'
                  }`}
                  style={{
                    width: layoutMode === 'vertical' ? '120px' : '90px',
                    height: layoutMode === 'vertical' ? '76px' : '57px',
                  }}
                >
                  {frontCropped ? (
                    <img
                      src={frontCropped}
                      alt="Front"
                      className="w-full h-full object-fill"
                      style={{
                        filter: `brightness(${brightness}%) contrast(${contrast}%) ${
                          filterMode === 'document' ? 'contrast(135%) brightness(108%) saturate(115%)' : filterMode === 'bw' ? 'grayscale(100%) contrast(150%)' : ''
                        }`
                      }}
                    />
                  ) : (
                    <span className="text-[9px] font-black text-slate-400 text-center px-1">
                      Front
                    </span>
                  )}
                </div>

                {/* बैक कार्ड */}
                <div
                  className={`rounded-xs overflow-hidden flex items-center justify-center bg-slate-50 transition-all ${
                    showBorder ? 'border-2 border-black shadow-xs' : 'border border-dashed border-slate-300'
                  }`}
                  style={{
                    width: layoutMode === 'vertical' ? '120px' : '90px',
                    height: layoutMode === 'vertical' ? '76px' : '57px',
                  }}
                >
                  {backCropped ? (
                    <img
                      src={backCropped}
                      alt="Back"
                      className="w-full h-full object-fill"
                      style={{
                        filter: `brightness(${brightness}%) contrast(${contrast}%) ${
                          filterMode === 'document' ? 'contrast(135%) brightness(108%) saturate(115%)' : filterMode === 'bw' ? 'grayscale(100%) contrast(150%)' : ''
                        }`
                      }}
                    />
                  ) : (
                    <span className="text-[9px] font-black text-slate-400 text-center px-1">
                      Back
                    </span>
                  )}
                </div>
              </div>

              {paperType === 'a4' && (
                <div className="w-full border-t border-dashed border-slate-300 mt-4 pt-1 flex items-center justify-center pointer-events-none">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                    ✂ शेष खाली A4 कागज़ (पुनः उपयोग योग्य)
                  </span>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* 💥 निचला स्क्रोलिंग टूलबॉक्स */}
        <div className="flex-1 lg:flex-none lg:w-80 bg-white rounded-2xl border-2 border-slate-900 shadow-md p-3 overflow-y-auto z-20 space-y-3 pb-32">
          
          <div className="lg:hidden flex flex-col items-center justify-center -mt-1 pb-1">
            <div className="w-12 h-1.5 bg-slate-400 rounded-full" />
            <span className="text-[10px] font-black text-blue-700 mt-1">
              ↕ टूल्स व डाउनलोड के लिए ऊपर स्क्रॉल करें
            </span>
          </div>

          {/* 1. फ्रंट व बैक अपलोड */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="file"
                ref={fileInputFrontRef}
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files?.[0], 'front')}
                className="hidden"
              />
              <button
                onClick={() => fileInputFrontRef.current?.click()}
                className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border-2 border-blue-200 rounded-xl font-black text-xs flex flex-col items-center justify-center gap-0.5 cursor-pointer shadow-2xs transition-all active:scale-98"
              >
                <span>📷 Front (आगे)</span>
                <span className="text-[9px] font-semibold text-blue-600">
                  {frontCropped ? 'बदलें / रीक्रॉप' : '+ अपलोड'}
                </span>
              </button>
            </div>

            <div>
              <input
                type="file"
                ref={fileInputBackRef}
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files?.[0], 'back')}
                className="hidden"
              />
              <button
                onClick={() => fileInputBackRef.current?.click()}
                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-2 border-indigo-200 rounded-xl font-black text-xs flex flex-col items-center justify-center gap-0.5 cursor-pointer shadow-2xs transition-all active:scale-98"
              >
                <span>📷 Back (पीछे)</span>
                <span className="text-[9px] font-semibold text-indigo-600">
                  {backCropped ? 'बदलें / रीक्रॉप' : '+ अपलोड'}
                </span>
              </button>
            </div>
          </div>

          {/* 2. पेपर का साइज़ */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">
              कागज़ का साइज़
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setPaperType('a4')}
                className={`py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  paperType === 'a4' 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                A4 बड़ा पेपर
              </button>
              <button
                onClick={() => setPaperType('4x6')}
                className={`py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  paperType === '4x6' 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                4×6 फोटो पेपर
              </button>
            </div>
          </div>

          {/* 3. लेआउट */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">
              कार्ड लेआउट
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setLayoutMode('side-by-side')}
                className={`py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  layoutMode === 'side-by-side' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                अगल - बगल (मानक)
              </button>
              <button
                onClick={() => setLayoutMode('vertical')}
                className={`py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  layoutMode === 'vertical' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                ऊपर - नीचे
              </button>
            </div>
          </div>

          {/* 4. फ़िल्टर */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">
              दस्तावेज़ फ़िल्टर
            </span>
            <div className="grid grid-cols-3 gap-1">
              {(['original', 'document', 'bw'] as FilterMode[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterMode(f)}
                  className={`py-1 text-[11px] font-black rounded-lg transition-all cursor-pointer ${
                    filterMode === f 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'bg-white text-slate-700 border border-slate-300'
                  }`}
                >
                  {f === 'original' ? 'साधारण' : f === 'document' ? 'डॉक्युमेंट' : 'B&W'}
                </button>
              ))}
            </div>
          </div>

          {/* 5. KB स्लाइडर */}
          <div className="bg-emerald-50/70 p-2.5 rounded-xl border-2 border-emerald-300 space-y-1.5 shadow-2xs">
            <div className="flex justify-between items-center text-xs font-black text-emerald-950">
              <span className="flex items-center gap-1">
                <span>⚡</span> फ़ाइल साइज़ (KB लिमिट):
              </span>
              <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full font-mono text-[11px]">
                {targetKb} KB
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="500"
              step="5"
              value={targetKb}
              onChange={(e) => setTargetKb(Number(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-emerald-200 rounded cursor-pointer"
            />

            <div className="flex justify-between text-[9px] font-bold text-emerald-800">
              <span>10 KB (सरकारी फॉर्म)</span>
              <span>250 KB</span>
              <span>500 KB</span>
            </div>
          </div>

          {/* 6. ब्राइटनेस व कंट्रास्ट */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between text-[10px] font-black text-slate-700">
              <span>ब्राइटनेस</span>
              <span className="text-blue-700">{brightness}%</span>
            </div>
            <input
              type="range"
              min="80"
              max="130"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded cursor-pointer"
            />

            <div className="flex justify-between text-[10px] font-black text-slate-700 pt-0.5">
              <span>कंट्रास्ट</span>
              <span className="text-blue-700">{contrast}%</span>
            </div>
            <input
              type="range"
              min="80"
              max="130"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded cursor-pointer"
            />

            <div className="pt-1 border-t border-slate-200 flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBorder}
                  onChange={(e) => setShowBorder(e.target.checked)}
                  className="w-3.5 h-3.5 accent-black cursor-pointer"
                />
                <span className="text-[11px] font-black text-slate-900">
                  काली कटिंग बॉर्डर
                </span>
              </label>

              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black text-slate-600">गैप:</span>
                <input
                  type="number"
                  min="2"
                  max="15"
                  value={cardGapMm}
                  onChange={(e) => setCardGapMm(Number(e.target.value))}
                  className="w-12 text-center text-xs font-black border border-slate-300 rounded bg-white py-0.5"
                />
                <span className="text-[10px] font-black text-slate-500">mm</span>
              </div>
            </div>
          </div>

          {/* 7. डाउनलोड सेक्शन */}
          <div className="pt-2 border-t-2 border-slate-300 space-y-1.5">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block text-center">
              आउटपुट डाउनलोड व प्रिंट
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleDownload('jpg')}
                disabled={(!frontCropped && !backCropped) || isProcessing}
                className={`py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  (!frontCropped && !backCropped) || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>🖼️</span>
                <span>JPG</span>
              </button>

              <button
                onClick={() => handleDownload('pdf')}
                disabled={(!frontCropped && !backCropped) || isProcessing}
                className={`py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  (!frontCropped && !backCropped) || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>📄</span>
                <span>PDF</span>
              </button>

              <button
                onClick={handlePrint}
                disabled={(!frontCropped && !backCropped) || isProcessing}
                className={`py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  (!frontCropped && !backCropped) || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>🖨️</span>
                <span>प्रिंट</span>
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* 4-कॉर्नर पर्सपेक्टिव क्रॉपर मोडल */}
      {cropTarget && cropImgSrc && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-between p-3 select-none">
          
          <div className="w-full max-w-xl flex items-center justify-between text-white py-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-black">
                📐 चारों कोनों को कार्ड पर बैठाएँ ({cropTarget === 'front' ? 'Front Side' : 'Back Side'})
              </span>
            </div>
            <button
              onClick={() => { setCropTarget(null); setCropImgSrc(null); }}
              className="text-xs bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg font-bold cursor-pointer"
            >
              रद्द करें
            </button>
          </div>

          <div className="flex-1 w-full max-w-xl flex items-center justify-center overflow-hidden relative">
            <div
              ref={cropContainerRef}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="relative inline-block border-2 border-blue-500 rounded-lg shadow-2xl overflow-hidden touch-none"
            >
              <img
                ref={cropImageRef}
                src={cropImgSrc}
                alt="Crop Target"
                onLoad={handleCropImageLoaded}
                className="max-h-[68vh] max-w-full block pointer-events-none"
              />

              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <polygon
                  points={corners.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="rgba(59, 130, 246, 0.2)"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />
              </svg>

              {corners.map((p, idx) => (
                <div
                  key={idx}
                  onPointerDown={() => handlePointerDown(idx)}
                  className="absolute w-7 h-7 -ml-3.5 -mt-3.5 bg-blue-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-20 transition-transform active:scale-125"
                  style={{ left: `${p.x}px`, top: `${p.y}px` }}
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              ))}

              {activeCorner !== null && (
                <div
                  className="absolute w-24 h-24 rounded-full border-3 border-white shadow-2xl overflow-hidden pointer-events-none z-30 bg-white"
                  style={{
                    left: `${corners[activeCorner].x - 48}px`,
                    top: `${corners[activeCorner].y - 115}px`,
                  }}
                >
                  <div
                    className="w-full h-full relative"
                    style={{
                      backgroundImage: `url(${cropImgSrc})`,
                      backgroundPosition: `-${(corners[activeCorner].x / cropImgDims.width) * (cropImageRef.current?.naturalWidth || 1) * 2 - 48}px -${(corners[activeCorner].y / cropImgDims.height) * (cropImageRef.current?.naturalHeight || 1) * 2 - 48}px`,
                      backgroundSize: `${(cropImageRef.current?.naturalWidth || 1) * 2}px ${(cropImageRef.current?.naturalHeight || 1) * 2}px`,
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-full h-0.5 bg-red-500/80" />
                      <div className="absolute h-full w-0.5 bg-red-500/80" />
                      <div className="w-2 h-2 border border-red-500 rounded-full" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-full max-w-xl py-2 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400 font-semibold">
              💡 उँगली से चारों नीले बिंदुओं को कार्ड के 4 कोनों पर सटीक मिलाएँ।
            </span>
            <button
              onClick={applyPerspectiveCrop}
              disabled={isProcessing}
              className="py-2.5 px-6 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all active:scale-98 shrink-0"
            >
              {isProcessing ? 'सीधा हो रहा है...' : '✓ कार्ड सीधा व क्रॉप करें'}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
