'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { exportSmartJpg } from '@/lib/image-engine';

type TabMode = 'crop' | 'bg' | 'suit' | 'export';

interface SuitItem {
  id: string;
  name: string;
  src: string;
}

const SUIT_LIST: SuitItem[] = [
  { id: 'none', name: 'कोई नहीं (None)', src: '' },
  { id: 'suit-1', name: 'क्लासिक ब्लैक कोट', src: '/assets/suits/suit-1.svg' },
  { id: 'suit-2', name: 'रॉयल ब्लू ब्लेज़र', src: '/assets/suits/suit-2.svg' },
];

export default function PassportStudioProPage() {
  const [activeTab, setActiveTab] = useState<TabMode>('crop');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
  // बैकग्राउंड सेटिंग्स
  const [bgColor, setBgColor] = useState<string>('original'); // 'original', '#ffffff', '#e0f2fe', '#f1f5f9'
  
  // सूट ओवरले स्टेट्स
  const [selectedSuit, setSelectedSuit] = useState<string>('none');
  const [suitScale, setSuitScale] = useState<number>(1.0);
  const [suitOffsetY, setSuitOffsetY] = useState<number>(0);
  const [suitOffsetX, setSuitOffsetX] = useState<number>(0);

  // नाम व तारीख
  const [addNameDate, setAddNameDate] = useState<boolean>(false);
  const [candidateName, setCandidateName] = useState<string>('');
  const [photoDate, setPhotoDate] = useState<string>('');

  // एक्सपोर्ट स्टेट्स
  const [targetKb, setTargetKb] = useState<number>(50);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [finalDataUrl, setFinalDataUrl] = useState<string | null>(null);
  const [actualKb, setActualKb] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const suitImgRef = useRef<HTMLImageElement | null>(null);

  // सूट इमेज प्रीलोड
  useEffect(() => {
    if (selectedSuit === 'none') {
      suitImgRef.current = null;
      return;
    }
    const suit = SUIT_LIST.find((s) => s.id === selectedSuit);
    if (suit && suit.src) {
      const img = new Image();
      img.src = suit.src;
      img.onload = () => {
        suitImgRef.current = img;
        renderCanvas();
      };
    }
  }, [selectedSuit]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setActiveTab('crop');
    };
    reader.readAsDataURL(file);
  };

  // मास्टर कैनवास रेंडरर
  const renderCanvas = useCallback(async () => {
    if (!imageSrc) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // पासपोर्ट 3.5cm x 4.5cm मानक (413 x 531 पिक्सल)
    const outW = 413;
    const outH = 531;
    canvas.width = outW;
    canvas.height = outH;

    // बैकग्राउंड भरना
    if (bgColor !== 'original') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, outW, outH);
    }

    // मूल फोटो लोड और ड्रा
    const baseImg = new Image();
    baseImg.src = imageSrc;
    await new Promise((res) => { baseImg.onload = res; });

    // सेन्टर-फिट क्रॉप
    const imgRatio = baseImg.width / baseImg.height;
    const targetRatio = outW / outH;
    let sW = baseImg.width;
    let sH = baseImg.height;
    let sX = 0;
    let sY = 0;

    if (imgRatio > targetRatio) {
      sW = baseImg.height * targetRatio;
      sX = (baseImg.width - sW) / 2;
    } else {
      sH = baseImg.width / targetRatio;
      sY = (baseImg.height - sH) / 2;
    }

    ctx.drawImage(baseImg, sX, sY, sW, sH, 0, 0, outW, outH);

    // सूट ओवरले ड्रा करना
    if (suitImgRef.current && selectedSuit !== 'none') {
      const suit = suitImgRef.current;
      const sWidth = outW * 0.95 * suitScale;
      const sHeight = (sWidth * suit.height) / suit.width;
      const posX = (outW - sWidth) / 2 + suitOffsetX;
      const posY = outH - sHeight * 0.75 + suitOffsetY;

      ctx.drawImage(suit, posX, posY, sWidth, sHeight);
    }

    // नाम और तारीख स्ट्रिप
    if (addNameDate && (candidateName || photoDate)) {
      const stripH = 65;
      const stripY = outH - stripH;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, stripY, outW, stripH);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, stripY);
      ctx.lineTo(outW, stripY);
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';

      if (candidateName && photoDate) {
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(candidateName.toUpperCase(), outW / 2, stripY + 24);
        ctx.font = '600 13px sans-serif';
        ctx.fillText(`DOB/DOP: ${photoDate}`, outW / 2, stripY + 48);
      } else if (candidateName) {
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(candidateName.toUpperCase(), outW / 2, stripY + 38);
      } else if (photoDate) {
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(`DATE: ${photoDate}`, outW / 2, stripY + 38);
      }
    }
  }, [imageSrc, bgColor, selectedSuit, suitScale, suitOffsetX, suitOffsetY, addNameDate, candidateName, photoDate]);

  useEffect(() => {
    if (imageSrc) {
      renderCanvas();
    }
  }, [imageSrc, renderCanvas]);

  // स्मार्ट कोर इंजन द्वारा एक्सपोर्ट
  const handleExport = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsProcessing(true);
    try {
      const res = await exportSmartJpg(canvas, {
        targetKb: targetKb,
        isDocument: false,
        minQuality: 0.15,
        maxQuality: 0.98,
      });
      setFinalDataUrl(res.dataUrl);
      setActualKb(res.actualKb);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col items-center p-3 sm:p-6 select-none">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* हेडर */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <Link href="/" className="text-xs font-bold text-slate-500 hover:text-slate-800">
            ← होम
          </Link>
          <h1 className="text-sm font-black text-blue-700 uppercase tracking-wide">
            पासपोर्ट स्टूडियो प्रो (डेमो लैब)
          </h1>
          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
            Beta
          </span>
        </div>

        {/* फ़ोटो अपलोड नहीं है तो ड्रॉपज़ोन */}
        {!imageSrc ? (
          <div className="p-8 text-center flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-3xl mb-3 shadow-inner">
              📷
            </div>
            <h2 className="text-base font-bold text-slate-700">अपनी कोई भी फोटो अपलोड करें</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              कैजुअल शर्ट या टी-शर्ट वाली फोटो भी चलेगी, हम इसे पासपोर्ट साइज और सूट में बदल देंगे।
            </p>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition text-sm"
            >
              गैलरी से फोटो चुनें
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Pi7 स्टाइल टॉप टैब विज़ार्ड */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
              <button
                onClick={() => setActiveTab('crop')}
                className={`flex-1 py-2.5 flex flex-col items-center gap-1 border-b-2 transition ${
                  activeTab === 'crop' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent hover:text-slate-900'
                }`}
              >
                <span>✂️</span>
                <span>फ्रेम</span>
              </button>
              <button
                onClick={() => setActiveTab('bg')}
                className={`flex-1 py-2.5 flex flex-col items-center gap-1 border-b-2 transition ${
                  activeTab === 'bg' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent hover:text-slate-900'
                }`}
              >
                <span>🎨</span>
                <span>बैकग्राउंड</span>
              </button>
              <button
                onClick={() => setActiveTab('suit')}
                className={`flex-1 py-2.5 flex flex-col items-center gap-1 border-b-2 transition ${
                  activeTab === 'suit' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent hover:text-slate-900'
                }`}
              >
                <span>👔</span>
                <span>सूट/ड्रेस</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('export');
                  handleExport();
                }}
                className={`flex-1 py-2.5 flex flex-col items-center gap-1 border-b-2 transition ${
                  activeTab === 'export' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent hover:text-slate-900'
                }`}
              >
                <span>💾</span>
                <span>डाउनलोड</span>
              </button>
            </div>

            {/* लाइव कैनवास प्रीव्यू एरिया */}
            <div className="p-4 bg-slate-200/60 flex items-center justify-center relative min-h-[360px]">
              <canvas
                ref={canvasRef}
                className="w-[200px] h-[257px] bg-white rounded-lg shadow-xl border-2 border-white object-cover"
              />
            </div>

            {/* टैब कंट्रोल्स */}
            <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-3 min-h-[160px]">
              {/* 1. क्रॉप व फ्रेम */}
              {activeTab === 'crop' && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-500">
                    फोटो का ऑटो सेंटर-क्रॉप 3.5×4.5 cm (मानक पासपोर्ट रेशियो) पर सेट है।
                  </p>
                  <button
                    onClick={() => setActiveTab('bg')}
                    className="w-full bg-blue-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-blue-700 transition"
                  >
                    आगे बढ़ें: बैकग्राउंड चुनें →
                  </button>
                </div>
              )}

              {/* 2. बैकग्राउंड रंग */}
              {activeTab === 'bg' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700">बैकग्राउंड रंग चुनें:</span>
                  <div className="flex gap-2">
                    {[
                      { label: 'ओरिजिनल', val: 'original', bg: 'bg-slate-200' },
                      { label: 'सफेद', val: '#ffffff', bg: 'bg-white border' },
                      { label: 'हल्का नीला', val: '#e0f2fe', bg: 'bg-sky-100' },
                      { label: 'हल्का ग्रे', val: '#f1f5f9', bg: 'bg-slate-100' },
                    ].map((c) => (
                      <button
                        key={c.val}
                        onClick={() => setBgColor(c.val)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition ${
                          bgColor === c.val ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${c.bg} border`} />
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveTab('suit')}
                    className="w-full bg-blue-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-blue-700 transition mt-2"
                  >
                    आगे बढ़ें: सूट लगाएं →
                  </button>
                </div>
              )}

              {/* 3. सूट ओवरले */}
              {activeTab === 'suit' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {SUIT_LIST.map((suit) => (
                      <button
                        key={suit.id}
                        onClick={() => setSelectedSuit(suit.id)}
                        className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-bold transition ${
                          selectedSuit === suit.id ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        {suit.name}
                      </button>
                    ))}
                  </div>

                  {selectedSuit !== 'none' && (
                    <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span>सूट का साइज़:</span>
                        <input
                          type="range"
                          min="0.7"
                          max="1.5"
                          step="0.02"
                          value={suitScale}
                          onChange={(e) => setSuitScale(Number(e.target.value))}
                          className="w-40 accent-blue-600"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>ऊपर/नीचे सेट करें:</span>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={suitOffsetY}
                          onChange={(e) => setSuitOffsetY(Number(e.target.value))}
                          className="w-40 accent-blue-600"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>बाएं/दाएं सेट करें:</span>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          value={suitOffsetX}
                          onChange={(e) => setSuitOffsetX(Number(e.target.value))}
                          className="w-40 accent-blue-600"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setActiveTab('export');
                      handleExport();
                    }}
                    className="w-full bg-blue-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-blue-700 transition"
                  >
                    फाइनल करें व डाउनलोड टैब में जाएं →
                  </button>
                </div>
              )}

              {/* 4. नाम-तारीख व एक्सपोर्ट */}
              {activeTab === 'export' && (
                <div className="space-y-3">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addNameDate}
                        onChange={(e) => setAddNameDate(e.target.checked)}
                        className="rounded accent-blue-600"
                      />
                      <span className="text-xs font-bold text-slate-700">फोटो पर नाम और तारीख जोड़ें</span>
                    </label>

                    {addNameDate && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="अभ्यर्थी का नाम"
                          value={candidateName}
                          onChange={(e) => setCandidateName(e.target.value)}
                          className="border border-slate-300 p-1.5 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          placeholder="तारीख (DD/MM/YYYY)"
                          value={photoDate}
                          onChange={(e) => setPhotoDate(e.target.value)}
                          className="border border-slate-300 p-1.5 rounded-lg text-xs"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">KB लक्ष्य (Target KB):</span>
                    <div className="flex gap-1">
                      {[20, 50, 100].map((kb) => (
                        <button
                          key={kb}
                          onClick={() => {
                            setTargetKb(kb);
                            setTimeout(handleExport, 50);
                          }}
                          className={`text-[11px] px-2.5 py-0.5 rounded font-bold border ${
                            targetKb === kb ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          {kb} KB
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleExport}
                    disabled={isProcessing}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    {isProcessing ? 'तैयार हो रहा है...' : `डाउनलोड JPG (${actualKb || targetKb} KB)`}
                  </button>

                  {finalDataUrl && (
                    <a
                      href={finalDataUrl}
                      download={`passport_photo_${actualKb}kb.jpg`}
                      className="text-center block text-xs font-bold text-blue-600 underline"
                    >
                      सीधा डाउनलोड लिंक क्लिक करें
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
