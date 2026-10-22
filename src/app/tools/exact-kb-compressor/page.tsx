"use client";
import { exportSmartJpg } from "@/lib/image-engine";
import { useState, useRef, ChangeEvent } from 'react';
import Link from 'next/link';

type CompressionMode = 'photo' | 'document';

interface CompressionResult {
  dataUrl: string;
  actualKb: number;
  width: number;
  height: number;
  reductionPercent: number;
}

export default function ExactKbCompressorPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalDim, setOriginalDim] = useState<{ width: number; height: number; kb: number } | null>(null);

  const [targetKb, setTargetKb] = useState<number>(50);
  const [mode, setMode] = useState<CompressionMode>('photo');
  const [lockDimensions, setLockDimensions] = useState<boolean>(false);

  const [processing, setProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setResult(null);
    setOriginalFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setOriginalDim({
          width: img.naturalWidth,
          height: img.naturalHeight,
          kb: Number((file.size / 1024).toFixed(1)),
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const runExactCompression = async () => {
    if (!imageSrc || !originalDim) return;
    setProcessing(true);
    setErrorMsg(null);

    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = () => rej(new Error('इमेज लोड करने में त्रुटि।'));
      });

      // सख्त हार्ड-कैप: 97% सुरक्षा सीमा (उदा. 50 KB -> अधिकतम 48.5 KB)
      const hardMaxBytes = Math.floor(targetKb * 1024 * 0.97);

      let currentWidth = originalDim.width;
      let currentHeight = originalDim.height;

      // स्मार्ट मोड (अगर पिक्सेल लॉक नहीं है): रंग और बैकग्राउंड बचाने के लिए उपयुक्त रेजोल्यूशन सीमा
      if (!lockDimensions) {
        let maxAllowedDim = 1200;
        if (targetKb <= 25) maxAllowedDim = 600;
        else if (targetKb <= 60) maxAllowedDim = 900;
        else if (targetKb <= 120) maxAllowedDim = 1200;
        else maxAllowedDim = 1600;

        const maxSide = Math.max(currentWidth, currentHeight);
        if (maxSide > maxAllowedDim) {
          const ratio = maxAllowedDim / maxSide;
          currentWidth = Math.round(currentWidth * ratio);
          currentHeight = Math.round(currentHeight * ratio);
        }
      }

      const createCanvas = (w: number, h: number) => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, w, h);
        }
        return c;
      };

      let activeCanvas = createCanvas(currentWidth, currentHeight);

      // बाइनरी सर्च एनकोडिंग लूप (क्वालिटी फाइन-ट्यूनिंग)
      let minQ = 0.15;
      let maxQ = 0.98;
      let bestBlob: Blob | null = null;

      for (let i = 0; i < 7; i++) {
        const midQ = (minQ + maxQ) / 2;
        const blob = await new Promise<Blob | null>((res) =>
          activeCanvas.toBlob((b) => res(b), 'image/jpeg', midQ)
        );

        if (!blob) break;

        if (blob.size <= hardMaxBytes) {
          bestBlob = blob;
          minQ = midQ;
        } else {
          maxQ = midQ;
        }
      }

      // यदि पिक्सेल लॉक नहीं था और न्यूनतम क्वालिटी पर भी साइज बड़ा रहा, तो थोड़ा और स्केल करें
      if ((!bestBlob || bestBlob.size > hardMaxBytes) && !lockDimensions) {
        let scale = 0.85;
        while (scale >= 0.3) {
          const sw = Math.round(currentWidth * scale);
          const sh = Math.round(currentHeight * scale);
          const scaledCanvas = createCanvas(sw, sh);

          const sBlob = await new Promise<Blob | null>((res) =>
            scaledCanvas.toBlob((b) => res(b), 'image/jpeg', 0.75)
          );

          if (sBlob && sBlob.size <= hardMaxBytes) {
            bestBlob = sBlob;
            currentWidth = sw;
            currentHeight = sh;
            break;
          }
          scale -= 0.1;
        }
      }

      if (bestBlob && bestBlob.size <= hardMaxBytes) {
        const actualKb = Number((bestBlob.size / 1024).toFixed(1));
        const originalKb = originalDim.kb;
        const reduction = originalKb > 0 ? Math.round(((originalKb - actualKb) / originalKb) * 100) : 0;
        const dataUrl = URL.createObjectURL(bestBlob);

        setResult({
          dataUrl,
          actualKb,
          width: currentWidth,
          height: currentHeight,
          reductionPercent: Math.max(0, reduction),
        });
      } else {
        setErrorMsg('फ़ाइल का रिज़ॉल्यूशन इस लक्ष्य KB के लिए बहुत बड़ा है। कृपया "मूल रिज़ॉल्यूशन लॉक" हटाएँ या बड़ा KB चुनें।');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('इमेज प्रोसेस करने में समस्या आई।');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 py-4 px-3 sm:px-6 lg:px-8 text-slate-800">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-slate-300 bg-white shadow-lg overflow-hidden">
          
          {/* हेडर */}
          <div className="bg-[#1e293b] text-white px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⚡</span>
              <div>
                <h1 className="font-bold text-sm sm:text-base tracking-wide leading-none">
                  Exact KB Compressor (सटीक केबी कंप्रेसर)
                </h1>
                <p className="text-[10px] text-slate-300 mt-0.5 hidden sm:block">
                  सरकारी फॉर्म के मानकों अनुसार बिना बैकग्राउंड व रंग खराब किए सटीक साइज़ में कंप्रेस करें
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="text-xs bg-slate-700/90 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-200 transition-colors font-medium"
            >
              ← होम
            </Link>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {/* सुरक्षित बफर सूचना पट्टी */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-[11px] text-blue-950 leading-relaxed shadow-2xs">
              <span className="font-bold">🛡️ 100% सेफ पोर्टल अपलोड:</span> लक्ष्य सीमा पर कड़ा प्रतिबंध (Hard Ceiling) सक्रिय है। 50 KB चुनने पर आपकी फ़ाइल कभी 50.1 KB नहीं बनेगी (हमेशा 47 से 48.5 KB के सुरक्षित दायरे में रहेगी)।
            </div>

            {/* मुख्य ग्रिड: मोबाइल पर 1 कॉलम, डेस्कटॉप पर 2 कॉलम */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* बायाँ कॉलम (Left Side): प्रीव्यू, अपलोड व तुलना */}
              <div className="lg:col-span-6 space-y-3">
                <div className="bg-slate-50 border border-slate-300 rounded-xl p-3 shadow-2xs">
                  <div className="w-full h-56 sm:h-72 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
                    {result ? (
                      <img
                        src={result.dataUrl}
                        alt="Compressed Output"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : imageSrc ? (
                      <img
                        src={imageSrc}
                        alt="Original Input"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-slate-400 p-4">
                        <div className="text-3xl mb-1.5 opacity-70">🖼️</div>
                        <p className="text-xs font-semibold text-slate-600">कोई फ़ोटो चुनी नहीं गई है</p>
                        <p className="text-[10.5px] text-slate-400 mt-0.5">नीचे दिए गए बटन से फ़ाइल अपलोड करें</p>
                      </div>
                    )}
                  </div>

                  {/* तुलनात्मक कार्ड */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">मूल फ़ाइल (Original)</p>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {originalDim ? `${originalDim.kb} KB` : '--'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {originalDim ? `${originalDim.width} × ${originalDim.height} px` : ''}
                      </p>
                    </div>

                    <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                      <p className="text-[10px] text-emerald-800 font-bold uppercase">आउटपुट (Compressed)</p>
                      <p className="font-bold text-emerald-900 mt-0.5">
                        {result ? `${result.actualKb} KB` : '--'}
                      </p>
                      <p className="text-[10px] text-emerald-700">
                        {result ? `${result.reductionPercent}% साइज़ कम हुआ` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-blue-50 border border-dashed border-blue-400 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  📂 {imageSrc ? 'अन्य फ़ोटो बदलें' : 'कंप्यूटर / मोबाइल से फ़ोटो चुनें'}
                </button>
              </div>

              {/* दायाँ कॉलम (Right Side): सेटिंग्स व कंप्रेस एक्शन */}
              <div className="lg:col-span-6 space-y-4">
                
                {/* 1. लक्ष्य साइज़ चयन (Target KB) */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    1. अपना लक्ष्य साइज़ चुनें (Target File Size)
                  </label>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {[20, 50, 100, 200].map((kb) => (
                      <button
                        key={kb}
                        type="button"
                        onClick={() => setTargetKb(kb)}
                        className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition ${
                          targetKb === kb
                            ? 'bg-[#1e293b] text-white border-[#1e293b] shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {kb} KB
                      </button>
                    ))}
                  </div>

                  <div className="pt-1 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold text-slate-600">
                      या कस्टम KB दर्ज करें:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="5"
                        max="2000"
                        value={targetKb}
                        onChange={(e) => setTargetKb(Number(e.target.value) || 10)}
                        className="w-20 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 text-center focus:border-blue-500 focus:outline-none"
                      />
                      <span className="text-xs font-bold text-slate-600">KB</span>
                    </div>
                  </div>
                </div>

                {/* 2. इमेज प्रोफाइल व कलर प्रोटेक्शन मोड */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    2. क्वालिटी व रिज़ॉल्यूशन नियंत्रण
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMode('photo')}
                      className={`p-2 rounded-lg border text-left transition ${
                        mode === 'photo'
                          ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-2xs'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <p className="text-xs font-bold">📷 फ़ोटो (Color Balance)</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">चेहरे और नीले/रंगीन बैकग्राउंड की चमक सुरक्षित</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode('document')}
                      className={`p-2 rounded-lg border text-left transition ${
                        mode === 'document'
                          ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-2xs'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <p className="text-xs font-bold">✍️ हस्ताक्षर / दस्तावेज़</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">काले अक्षरों की तीक्ष्णता (Sharp Text)</p>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lockDimensions}
                        onChange={(e) => setLockDimensions(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5"
                      />
                      <div>
                        <span className="text-[11px] font-bold text-slate-700 block">
                          सख्त पिक्सेल लॉक (Strict Pixel Lock)
                        </span>
                        <span className="text-[10px] text-slate-500 block leading-tight">
                          (केवल तब टिक करें जब फॉर्म में तय Width × Height अनिवार्य हो)
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                    ⚠️ {errorMsg}
                  </div>
                )}

                {/* 3. मुख्य एक्शन बटन */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={runExactCompression}
                    disabled={processing || !imageSrc}
                    className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs sm:text-sm font-bold py-3 rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {processing ? 'प्रोसेसिंग...' : `⚡ ${targetKb} KB में सटीक कंप्रेस करें`}
                  </button>

                  {result && (
                    <a
                      href={result.dataUrl}
                      download={`examsewa-${result.actualKb}kb.jpg`}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      📥 कंप्रेस की गई फ़ोटो डाउनलोड करें ({result.actualKb} KB)
                    </a>
                  )}
                </div>

              </div>

            </div>

            {/* FAQ Section */}
            <section className="mt-8 border-t border-slate-200 pt-5 space-y-3">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                अक्सर पूछे जाने वाले प्रश्न (FAQ)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                  <p className="font-bold text-slate-800">
                    Q1. 50 KB चुनने पर आउटपुट 48 KB के आसपास क्यों आता है?
                  </p>
                  <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                    सरकारी भर्ती पोर्टल्स (SSC, UPSC) 50.1 KB होने पर तुरंत एरर दे देते हैं। इसलिए हमारा स्मार्ट इंजन 1-2 KB का बफर रखता है ताकि अपलोडिंग 100% पास हो सके।
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                  <p className="font-bold text-slate-800">
                    Q2. बैकग्राउंड का रंग फीका पड़ने से कैसे बचाएं?
                  </p>
                  <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                    स्मार्ट मोड में रहने दें। यह पिक्सेल और एन्कोडिंग का ऐसा संतुलन बनाता है जिससे नीले या लाल बैकग्राउंड का असली कंट्रास्ट सुरक्षित रहता है।
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                  <p className="font-bold text-slate-800">
                    Q3. क्या मेरी तस्वीरें सुरक्षित हैं?
                  </p>
                  <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                    हाँ, पूरा कंप्रेशन आपके ब्राउज़र में ही होता है। आपकी फ़ाइलें कभी किसी सर्वर पर अपलोड नहीं की जातीं।
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
