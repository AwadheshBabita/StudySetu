'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

type PaperType = '4x6' | 'a4';
type LayoutCount4x6 = 1 | 8 | 9 | 12;
type LayoutCountA4 = 1 | 10 | 24 | 30 | 36;
type Orientation = 'portrait' | 'landscape';

// 300 DPI: 1 inch = 25.4mm = 300px => 1mm = 11.8110236 px
const MM_TO_PX = 300 / 25.4;

export default function PassportPhotoSheetMaker() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [paperType, setPaperType] = useState<PaperType>('4x6');
  
  const [count4x6, setCount4x6] = useState<LayoutCount4x6>(8);
  const [countA4, setCountA4] = useState<LayoutCountA4>(30);
  
  const [orientation, setOrientation] = useState<Orientation>('landscape');
  const [photoRotation, setPhotoRotation] = useState<number>(0);
  
  const [fitTheCell, setFitTheCell] = useState<boolean>(false);
  const [disabledCells, setDisabledCells] = useState<number[]>([]);

  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [showBorder, setShowBorder] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setDisabledCells([]);
      setPhotoRotation(0);
    };
    reader.readAsDataURL(file);
  };

  const toggleCell = (index: number) => {
    if (disabledCells.includes(index)) {
      setDisabledCells(disabledCells.filter((i) => i !== index));
    } else {
      setDisabledCells([...disabledCells, index]);
    }
  };

  const handle4x6CountChange = (cnt: LayoutCount4x6) => {
    setCount4x6(cnt);
    if (cnt === 8) {
      setOrientation('landscape');
    } else {
      setOrientation('portrait');
    }
  };

  const handleA4CountChange = (cnt: LayoutCountA4) => {
    setCountA4(cnt);
    setOrientation('portrait');
  };

  const rotateLeft = () => {
    setPhotoRotation((prev) => (prev - 90 + 360) % 360);
  };

  const rotateRight = () => {
    setPhotoRotation((prev) => (prev + 90) % 360);
  };

  // सटीक मिलीमीटर लेआउट कॉन्फ़िगरेशन
  const getLayoutSpec = () => {
    // पेपर की कुल चौड़ाई व ऊँचाई मिमी (mm) में
    let sheetW_mm = paperType === '4x6' ? 101.6 : 210.0;
    let sheetH_mm = paperType === '4x6' ? 152.4 : 297.0;

    if (orientation === 'landscape') {
      const temp = sheetW_mm;
      sheetW_mm = sheetH_mm;
      sheetH_mm = temp;
    }

    let cols = 1;
    let rows = 1;
    let photoW_mm = sheetW_mm - 10;
    let photoH_mm = sheetH_mm - 10;
    let gapX_mm = 0;
    let gapY_mm = 0;

    if (paperType === '4x6') {
      if (count4x6 === 1) {
        cols = 1; rows = 1;
        photoW_mm = sheetW_mm - 8;
        photoH_mm = sheetH_mm - 8;
      } else if (count4x6 === 8) {
        // 8 फोटो: 3.5 x 4.5 cm (35 x 45 mm)
        if (orientation === 'landscape') {
          cols = 4; rows = 2;
          photoW_mm = 35; photoH_mm = 45;
          gapX_mm = 2.0; gapY_mm = 2.0;
        } else {
          cols = 2; rows = 4;
          photoW_mm = 35; photoH_mm = 45;
          gapX_mm = 2.0; gapY_mm = 2.0;
        }
      } else if (count4x6 === 9) {
        cols = 3; rows = 3;
        photoW_mm = 30; photoH_mm = 40;
        gapX_mm = 2.0; gapY_mm = 2.0;
      } else if (count4x6 === 12) {
        cols = 3; rows = 4;
        photoW_mm = 28; photoH_mm = 34;
        gapX_mm = 2.0; gapY_mm = 2.0;
      }
    } else {
      // A4 पेपर (210 x 297 mm)
      if (countA4 === 1) {
        cols = 1; rows = 1;
        photoW_mm = sheetW_mm - 16;
        photoH_mm = sheetH_mm - 16;
      } else if (countA4 === 10) {
        // विज़िटिंग कार्ड: 88 x 54 mm
        if (orientation === 'portrait') {
          cols = 2; rows = 5;
          photoW_mm = 88; photoH_mm = 54;
          gapX_mm = 3.0; gapY_mm = 3.0;
        } else {
          cols = 5; rows = 2;
          photoW_mm = 54; photoH_mm = 88;
          gapX_mm = 3.0; gapY_mm = 3.0;
        }
      } else if (countA4 === 24) {
        // 24 खुला पासपोर्ट: 35 x 45 mm
        if (orientation === 'portrait') {
          cols = 4; rows = 6;
          photoW_mm = 35; photoH_mm = 45;
          gapX_mm = 6.0; gapY_mm = 2.5;
        } else {
          cols = 6; rows = 4;
          photoW_mm = 45; photoH_mm = 35;
          gapX_mm = 4.0; gapY_mm = 6.0;
        }
      } else if (countA4 === 30) {
        // 30 मानक पासपोर्ट: 35 x 45 mm
        if (orientation === 'portrait') {
          cols = 5; rows = 6;
          photoW_mm = 35; photoH_mm = 45;
          gapX_mm = 2.0; gapY_mm = 2.0;
        } else {
          cols = 6; rows = 5;
          photoW_mm = 45; photoH_mm = 35;
          gapX_mm = 2.0; gapY_mm = 2.0;
        }
      } else if (countA4 === 36) {
        // 36 स्टाम्प/मिनी फोटो: 30 x 40 mm
        cols = 6; rows = 6;
        photoW_mm = 30; photoH_mm = 40;
        gapX_mm = 2.0; gapY_mm = 2.0;
      }
    }

    const total = cols * rows;
    return { sheetW_mm, sheetH_mm, cols, rows, total, photoW_mm, photoH_mm, gapX_mm, gapY_mm };
  };

  const spec = getLayoutSpec();
  const { cols, rows, total } = spec;

  // 300 DPI पर मिलीमीटर आधारित कैनवास निर्माण
  const generateCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (!imageSrc) return null;

    const img = new Image();
    img.src = imageSrc;
    await new Promise((res) => { img.onload = res; });

    const sheetW = Math.round(spec.sheetW_mm * MM_TO_PX);
    const sheetH = Math.round(spec.sheetH_mm * MM_TO_PX);

    const canvas = document.createElement('canvas');
    canvas.width = sheetW;
    canvas.height = sheetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, sheetW, sheetH);

    const photoW = spec.photoW_mm * MM_TO_PX;
    const photoH = spec.photoH_mm * MM_TO_PX;
    const gapX = spec.gapX_mm * MM_TO_PX;
    const gapY = spec.gapY_mm * MM_TO_PX;

    // संपूर्ण ग्रिड का कुल विस्तार
    const totalGridW = (spec.cols * photoW) + ((spec.cols - 1) * gapX);
    const totalGridH = (spec.rows * photoH) + ((spec.rows - 1) * gapY);

    // 💥 ऑटो-सेंटरिंग (Auto-Centering): चारों तरफ बिल्कुल बराबर मार्जिन
    const startX = Math.max(0, (sheetW - totalGridW) / 2);
    const startY = Math.max(0, (sheetH - totalGridH) / 2);

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    for (let i = 0; i < total; i++) {
      if (disabledCells.includes(i)) continue;

      const c = i % spec.cols;
      const r = Math.floor(i / spec.cols);

      const cellX = startX + c * (photoW + gapX);
      const cellY = startY + r * (photoH + gapY);

      let targetW = photoW;
      let targetH = photoH;

      // Fit the Cell लॉजिक (बिना फोटो कटे बॉक्स में सटीक फिट)
      if (fitTheCell && img.width && img.height) {
        const isRotated = photoRotation === 90 || photoRotation === 270;
        const srcW = isRotated ? img.height : img.width;
        const srcH = isRotated ? img.width : img.height;
        const scale = Math.min(photoW / srcW, photoH / srcH);
        targetW = srcW * scale;
        targetH = srcH * scale;
      }

      const centerX = cellX + photoW / 2;
      const centerY = cellY + photoH / 2;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((photoRotation * Math.PI) / 180);

      const isRotated90or270 = photoRotation === 90 || photoRotation === 270;
      const drawW = isRotated90or270 ? targetH : targetW;
      const drawH = isRotated90or270 ? targetW : targetH;

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

      // सॉलिड ब्लैक बॉर्डर
      if (showBorder) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = total === 1 ? 4 : 2.5;
        ctx.strokeRect(-drawW / 2, -drawH / 2, drawW, drawH);
      }

      ctx.restore();
    }

    return canvas;
  };

  const handleDownload = async (format: 'jpg' | 'pdf') => {
    setIsProcessing(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;

      if (format === 'jpg') {
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `sheet_${paperType}_${total}photos.jpg`;
          a.click();
          URL.revokeObjectURL(url);
        }, 'image/jpeg', 0.98);
      } else {
        const imgDataUrl = canvas.toDataURL('image/jpeg', 0.96);
        const base64Data = imgDataUrl.split(',')[1];
        const binaryString = atob(base64Data);
        const imgBytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          imgBytes[i] = binaryString.charCodeAt(i);
        }

        // PDF Points (72 pt per inch => mm * 72 / 25.4)
        const pW = (spec.sheetW_mm * 72) / 25.4;
        const pH = (spec.sheetH_mm * 72) / 25.4;

        const pdfHeader = `%PDF-1.4\n`;
        const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
        const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
        const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pW} ${pH}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`;
        const obj4H = `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`;
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

        const blob = new Blob([finalPdf], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sheet_${paperType}_${total}photos.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // 💥 100% स्केल प्रिंट (Absolute Scale, Zero Margin)
  const handlePrint = async () => {
    setIsProcessing(true);
    try {
      const canvas = await generateCanvas();
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

      const pageSizeRule = paperType === '4x6' ? '4in 6in' : 'A4';

      printDoc.open();
      printDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Passport Sheet</title>
            <style>
              @page {
                size: ${pageSizeRule} ${orientation};
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
    <div className="h-screen bg-slate-100 text-slate-900 flex flex-col justify-between overflow-hidden select-none">
      
      {/* हेडर */}
      <header className="border-b border-slate-200 bg-white px-4 h-11 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-500 hover:text-slate-900 text-xs font-bold">
            ← होम
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
            <span>🖨️</span> 4×6 व A4 पासपोर्ट शीट स्टूडियो
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
            {paperType === '4x6' ? '4×6 शीट' : 'A4 शीट'} ({total} {total === 10 ? 'कार्ड/फ़ोटो' : 'फ़ोटो'})
          </span>
        </div>
      </header>

      {/* मुख्य कार्यक्षेत्र */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden p-2.5 gap-2.5">
        
        {/* बायाँ भाग: प्रीव्यू */}
        <div className="flex-1 bg-slate-200/90 rounded-2xl border-2 border-slate-300 shadow-inner p-2.5 flex flex-col items-center justify-center relative overflow-hidden">
          
          <div className="w-full flex items-center justify-between mb-1 text-[11px] font-bold text-slate-700 px-2 shrink-0">
            <span>
              कागज़: {paperType === '4x6' ? '4×6 इंच' : 'A4 बड़ा पेपर'} 
              <span className="text-blue-700 font-black ml-1.5">
                ({orientation === 'portrait' ? 'पोर्ट्रेट' : 'लैंडस्केप'})
              </span>
              <span className="text-emerald-700 font-black ml-1.5">
                • {spec.photoW_mm}×{spec.photoH_mm} mm
              </span>
            </span>
            <span className="text-slate-600 font-bold">सेल पर क्लिक करके फोटो हटाएँ/जोड़ें</span>
          </div>

          <div className="w-full flex-1 flex items-center justify-center overflow-hidden p-1">
            <div
              className="bg-white rounded-xl shadow-xl border-2 border-slate-900 transition-all flex flex-col justify-center max-h-[calc(100vh-125px)] max-w-full p-2.5"
              style={{
                aspectRatio: `${spec.sheetW_mm} / ${spec.sheetH_mm}`,
                height: '92%'
              }}
            >
              {/* वास्तविक आनुपातिक ग्रिड */}
              <div
                className="w-full h-full grid gap-1.5 place-content-center"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
                }}
              >
                {Array.from({ length: total }).map((_, idx) => {
                  const isDisabled = disabledCells.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCell(idx)}
                      className={`relative rounded-sm flex items-center justify-center overflow-hidden cursor-pointer transition-all ${
                        isDisabled
                          ? 'bg-slate-100 border-dashed border border-slate-300 opacity-40'
                          : showBorder 
                          ? 'bg-slate-50 border-2 border-black shadow-2xs' 
                          : 'bg-slate-50 border border-slate-300'
                      }`}
                      style={{
                        aspectRatio: `${spec.photoW_mm} / ${spec.photoH_mm}`
                      }}
                    >
                      <span className="absolute top-0.5 left-0.5 text-[8px] font-mono font-black bg-slate-900/70 text-white px-1 rounded z-10 pointer-events-none">
                        #{idx + 1}
                      </span>

                      {imageSrc && !isDisabled ? (
                        <div
                          className="w-full h-full flex items-center justify-center overflow-hidden pointer-events-none"
                          style={{
                            transform: `rotate(${photoRotation}deg)`,
                            transition: 'transform 0.15s ease'
                          }}
                        >
                          <img
                            src={imageSrc}
                            alt="Cell Photo"
                            className={`w-full h-full ${fitTheCell ? 'object-contain' : 'object-cover'}`}
                            style={{
                              filter: `brightness(${brightness}%) contrast(${contrast}%)`
                            }}
                          />
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs font-bold">
                          {isDisabled ? 'खाली' : '+'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

        </div>

        {/* दायाँ भाग: साइडबार */}
        <div className="w-full lg:w-80 bg-white rounded-2xl border-2 border-slate-900 shadow-xs p-3 flex flex-col justify-between overflow-y-auto shrink-0 space-y-2.5">
          
          <div className="space-y-2.5">
            
            {/* 1. फोटो चुनें */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files?.[0])}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-200 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-98"
            >
              <span>📷</span>
              <span>{imageSrc ? 'दूसरी फोटो बदलें' : 'कंप्यूटर / गैलरी से फोटो चुनें'}</span>
            </button>

            {/* 2. पेपर का साइज़ */}
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">
                कागज़ का साइज़
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => { setPaperType('4x6'); handle4x6CountChange(8); }}
                  className={`py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    paperType === '4x6' 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  4×6 फोटो पेपर
                </button>
                <button
                  onClick={() => { setPaperType('a4'); handleA4CountChange(30); }}
                  className={`py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    paperType === 'a4' 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  A4 बड़ा पेपर
                </button>
              </div>
            </div>

            {/* 3. फोटो संख्या */}
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">
                शीट पर संख्या
              </span>
              
              {paperType === '4x6' ? (
                <div className="grid grid-cols-4 gap-1">
                  {([1, 8, 9, 12] as LayoutCount4x6[]).map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => handle4x6CountChange(cnt)}
                      className={`py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                        count4x6 === cnt 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-1">
                  {([1, 10, 24, 30, 36] as LayoutCountA4[]).map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => handleA4CountChange(cnt)}
                      className={`py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                        countA4 === cnt 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. दिशा (पोर्ट्रेट/लैंडस्केप) + रोटेट (↺ ↻) */}
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">
                दिशा व रोटेट
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setOrientation('portrait')}
                  className={`flex-1 py-1.5 text-xs font-black rounded-lg cursor-pointer transition-all ${
                    orientation === 'portrait' 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'bg-white text-slate-700 border border-slate-300'
                  }`}
                >
                  पोर्ट्रेट
                </button>
                <button
                  onClick={() => setOrientation('landscape')}
                  className={`flex-1 py-1.5 text-xs font-black rounded-lg cursor-pointer transition-all ${
                    orientation === 'landscape' 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'bg-white text-slate-700 border border-slate-300'
                  }`}
                >
                  लैंडस्केप
                </button>

                <button
                  onClick={rotateLeft}
                  title="90° बाएँ घुमाएँ"
                  className="w-8 h-7.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-sm font-black flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-2xs shrink-0"
                >
                  ↺
                </button>
                <button
                  onClick={rotateRight}
                  title="90° दाएँ घुमाएँ"
                  className="w-8 h-7.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-sm font-black flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-2xs shrink-0"
                >
                  ↻
                </button>
              </div>
            </div>

            {/* 5. टोन, कटिंग बॉर्डर व Fit the Cell */}
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
                    checked={fitTheCell}
                    onChange={(e) => setFitTheCell(e.target.checked)}
                    className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                  />
                  <span className="text-[11px] font-black text-blue-900">
                    Fit the Cell (सेल में फिट)
                  </span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBorder}
                    onChange={(e) => setShowBorder(e.target.checked)}
                    className="w-3.5 h-3.5 accent-black cursor-pointer"
                  />
                  <span className="text-[11px] font-black text-slate-900">
                    काली बॉर्डर
                  </span>
                </label>
              </div>
            </div>

          </div>

          {/* 6. डाउनलोड सेक्शन: 3 बटन (JPG | PDF | प्रिंट) */}
          <div className="pt-1.5 border-t border-slate-200 space-y-1">
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleDownload('jpg')}
                disabled={!imageSrc || isProcessing}
                className={`py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  !imageSrc || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>🖼️</span>
                <span>JPG</span>
              </button>

              <button
                onClick={() => handleDownload('pdf')}
                disabled={!imageSrc || isProcessing}
                className={`py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  !imageSrc || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>📄</span>
                <span>PDF</span>
              </button>

              <button
                onClick={handlePrint}
                disabled={!imageSrc || isProcessing}
                className={`py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  !imageSrc || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>🖨️</span>
                <span>प्रिंट</span>
              </button>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
