'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function PhotoNameDatePage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
  // नाम और तारीख टॉगल टिक-मार्क
  const [enableNameDate, setEnableNameDate] = useState<boolean>(true);
  const [candidateName, setCandidateName] = useState<string>('');
  const [dopDate, setDopDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dateType, setDateType] = useState<'DOP' | 'DOB'>('DOP');

  // एडजस्टमेंट्स: ब्राइटनेस, कंट्रास्ट, ज़ूम और रोटेट
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [zoom, setZoom] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);

  // ड्रैगिंग / पैनिंग कोऑर्डिनेट्स
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // साइज 10 से 200 KB
  const [targetKb, setTargetKb] = useState<number>(35);

  // आउटपुट स्टेट
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSizeKb, setOutputSizeKb] = useState<number>(0);
  const [processing, setProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
        setDragOffset({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  // माउस ड्रैग
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // टच ड्रैग
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - dragOffset.x,
        y: e.touches[0].clientY - dragOffset.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setDragOffset({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  const processPhoto = () => {
    if (!imageSrc) return;
    setProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 350;
      const height = 450;
      canvas.width = width;
      canvas.height = height;

      // 1. बैकग्राउंड
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // 2. ब्राइटनेस व कंट्रास्ट
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

      // 3. स्मार्ट सेंटर + ड्रैग + रोटेशन + ज़ूम
      const photoZoneHeight = enableNameDate ? height * 0.82 : height;
      const imgAspect = img.width / img.height;
      const targetAspect = width / photoZoneHeight;

      let baseW, baseH;
      if (imgAspect > targetAspect) {
        baseH = photoZoneHeight;
        baseW = photoZoneHeight * imgAspect;
      } else {
        baseW = width;
        baseH = width / imgAspect;
      }

      const drawW = baseW * zoom;
      const drawH = baseH * zoom;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, width, photoZoneHeight);
      ctx.clip();

      ctx.translate(width / 2 + dragOffset.x, photoZoneHeight / 2 + dragOffset.y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      ctx.filter = 'none';

      // 4. नाम और तारीख की पट्टी
      if (enableNameDate) {
        const stripY = photoZoneHeight;
        const stripHeight = height - photoZoneHeight;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, stripY, width, stripHeight);

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, stripY);
        ctx.lineTo(width, stripY);
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const fontSize = Math.round(stripHeight * 0.36);
        ctx.font = `bold ${fontSize}px sans-serif`;

        const nameY = stripY + stripHeight * 0.32;
        const dateY = stripY + stripHeight * 0.74;

        ctx.fillText(candidateName.trim() ? candidateName.toUpperCase() : "YOUR NAME", width / 2, nameY);

        const formattedDate = dopDate ? dopDate.split('-').reverse().join('/') : '';
        ctx.fillText(`${dateType}: ${formattedDate}`, width / 2, dateY);
      }

      // 5. सटीक KB बाइनरी सर्च
      const targetBytes = targetKb * 1024;
      let minQ = 0.01;
      let maxQ = 1.0;
      let bestQ = 0.85;
      let bestData = canvas.toDataURL('image/jpeg', bestQ);

      for (let i = 0; i < 10; i++) {
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
      const finalKb = Math.max(1, Math.round(((bestData.length - head.length) * 3 / 4) / 1024));

      setOutputUrl(bestData);
      setOutputSizeKb(finalKb);
      setProcessing(false);
    };
  };

  useEffect(() => {
    if (imageSrc) {
      processPhoto();
    }
  }, [imageSrc, enableNameDate, candidateName, dopDate, dateType, targetKb, brightness, contrast, zoom, rotation, dragOffset]);

  const downloadPhoto = () => {
    if (!outputUrl) return;
    const a = document.createElement('a');
    a.href = outputUrl;
    a.download = `Exam_Photo_${candidateName ? candidateName.replace(/\s+/g, '_') : 'Name_Date'}_${outputSizeKb}KB.jpg`;
    a.click();
  };

  return (
    <div 
      className="min-h-screen bg-slate-100 text-slate-900 py-6 px-3 select-none"
      onMouseUp={handleMouseUp}
    >
      <div className="max-w-xl mx-auto">
        <div className="mb-3">
          <Link href="/" className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full hover:bg-green-200 transition-colors">
            ← मुख्य होमपेज
          </Link>
        </div>

        {/* कॉम्पैक्ट हेडर */}
        <div className="bg-white py-3 px-4 rounded-xl border border-slate-200 shadow-xs mb-3 text-center">
          <h1 className="text-lg font-black text-slate-800">
            फोटो रिसाइज़र व नाम-तारीख (Name & DOP)
          </h1>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            10KB से 200KB में सटीक फोटो तैयार करें।
          </p>
        </div>

        <div className="space-y-3">
          {/* 1. कैमरा व गैलरी इनपुट */}
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
              capture="user"
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
                  <span className="text-xs font-black text-green-800">कैमरा से लें</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-lg border-2 border-dashed border-blue-500/60 bg-blue-50/40 hover:bg-blue-50 text-center flex flex-col items-center justify-center cursor-pointer"
                >
                  <span className="text-2xl mb-0.5">📁</span>
                  <span className="text-xs font-black text-blue-800">गैलरी से चुनें</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <span className="text-green-600 font-bold">✔</span> फोटो लोड हो गई
                </span>
                <div className="flex items-center gap-2 font-bold">
                  <button onClick={() => cameraInputRef.current?.click()} className="text-green-700 hover:underline">कैमरा 📷</button>
                  <span className="text-slate-300">|</span>
                  <button onClick={() => fileInputRef.current?.click()} className="text-blue-700 hover:underline">गैलरी 📁</button>
                </div>
              </div>
            )}
          </div>

          {/* 2. लाइव प्रीव्यू (साफ़ व कॉम्पैक्ट) */}
          {imageSrc && (
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-center">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[11px] font-black text-slate-700 uppercase">
                  लाइव प्रीव्यू (फोटो को छूकर खिसकाएँ 👆)
                </span>
                {outputSizeKb > 0 && (
                  <span className="text-[11px] font-extrabold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    {outputSizeKb} KB | 350×450px
                  </span>
                )}
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-dashed border-slate-300 min-h-[210px] flex items-center justify-center touch-none">
                {outputUrl ? (
                  <div 
                    className={`inline-block border-2 border-slate-800 shadow-md bg-white select-none ${isDragging ? 'ring-2 ring-green-500' : ''}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <img
                      src={outputUrl}
                      alt="Preview"
                      draggable={false}
                      className="max-h-[200px] object-contain block mx-auto pointer-events-none"
                    />
                  </div>
                ) : (
                  <div className="text-slate-400 text-xs">प्रोसेस हो रहा है...</div>
                )}
              </div>

              {(dragOffset.x !== 0 || dragOffset.y !== 0) && (
                <button
                  onClick={() => setDragOffset({ x: 0, y: 0 })}
                  className="mt-1.5 text-[11px] text-slate-600 hover:text-green-700 font-bold underline cursor-pointer"
                >
                  फोटो पोज़ीशन रीसेट करें
                </button>
              )}
            </div>
          )}

          {/* 3. फोटो एडजस्टमेंट्स (एकदम स्लिम और नो-वेस्ट स्पेस) */}
          {imageSrc && (
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                {/* ब्राइटनेस */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-0.5">
                    <span>ब्राइटनेस</span>
                    <span className="text-green-700 font-extrabold">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="140"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-green-600 cursor-pointer h-1.5"
                  />
                </div>

                {/* कंट्रास्ट */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-0.5">
                    <span>कंट्रास्ट</span>
                    <span className="text-green-700 font-extrabold">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="140"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-green-600 cursor-pointer h-1.5"
                  />
                </div>

                {/* ज़ूम */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-0.5">
                    <span>ज़ूम</span>
                    <span className="text-green-700 font-extrabold">{zoom.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-green-600 cursor-pointer h-1.5"
                  />
                </div>

                {/* रोटेट */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-0.5">
                    <span>रोटेट (सीधा करें)</span>
                    <span className="text-green-700 font-extrabold">{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    step="1"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full accent-green-600 cursor-pointer h-1.5"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. नाम और तारीख सेक्शन */}
          {imageSrc && (
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase block">
                    नाम और तारीख की पट्टी जोड़ें?
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">
                    (पट्टी जोड़ने के लिए टिक लगा रहने दें)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enableNameDate}
                  onChange={(e) => setEnableNameDate(e.target.checked)}
                  className="w-4 h-4 accent-green-600 rounded cursor-pointer"
                />
              </div>

              {enableNameDate && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2.5 mt-2 border-t border-slate-100">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">छात्र का नाम</label>
                    <input
                      type="text"
                      placeholder="उदा. ROHIT SHARMA"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-300 rounded-lg uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">प्रकार</label>
                    <select
                      value={dateType}
                      onChange={(e) => setDateType(e.target.value as any)}
                      className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-300 rounded-lg"
                    >
                      <option value="DOP">DOP (तारीख)</option>
                      <option value="DOB">DOB (जन्म तिथि)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">तारीख चुनें</label>
                    <input
                      type="date"
                      value={dopDate}
                      onChange={(e) => setDopDate(e.target.value)}
                      className="w-full text-xs font-bold p-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. 10 से 200 KB स्लाइडर (नो एक्स्ट्रा टेक्स्ट) */}
          {imageSrc && (
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-black text-slate-700 uppercase">
                  टारगेट साइज (KB)
                </label>
                <span className="text-xs font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
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
                className="w-full accent-green-600 cursor-pointer h-2"
              />
            </div>
          )}

          {/* 6. डाउनलोड बटन */}
          {imageSrc && (
            <div className="pt-1">
              <button
                onClick={downloadPhoto}
                disabled={!outputUrl || processing}
                className="w-full py-3.5 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-slate-300 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                {processing ? (
                  <span>⏳ फोटो तैयार की जा रही है...</span>
                ) : (
                  <span>⬇️ फोटो डाउनलोड करें ({outputSizeKb} KB)</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
