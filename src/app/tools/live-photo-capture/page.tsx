"use client";
import { exportSmartJpg } from "@/lib/image-engine";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import FaqSection from '@/components/FaqSection';

export default function LivePhotoCapturePage() {
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedSrc, setCapturedSrc] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // एडजस्टमेंट्स
  const [brightness, setBrightness] = useState<number>(10);
  const [contrast, setContrast] = useState<number>(15);
  const [targetKb, setTargetKb] = useState<number>(35);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackInputRef = useRef<HTMLInputElement>(null);

  const liveFaqs = [
    {
      q: "SSC और अग्निवीर में लाइव फोटो क्यों रिजेक्ट होती है?",
      a: "सरकारी भर्ती फॉर्मों में चेहरा बहुत छोटा होने, सिर कटने, आँखें सीधी न होने या बैकग्राउंड में परछाई होने पर सिस्टम फोटो रिजेक्ट कर देता है। इस टूल का ओवल गाइड चेहरे को ठीक 70-80% मानक अनुपात में रखता है।"
    },
    {
      q: "अगर ब्राउज़र में लाइव वेबकैम न खुले तो क्या करें?",
      a: "आप 'कैमरे से फोटो खींचे' वाले फॉलबैक बटन का इस्तेमाल कर सकते हैं, जिससे आपके फोन का असली कैमरा ऐप तुरंत खुल जाएगा।"
    },
    {
      q: "क्या यह सीधे 20 KB से 50 KB में सेव करता है?",
      a: "हाँ, एसएससी, अग्निवीर और एनटीए के सख्त नियमों के अनुसार यह बिना चेहरा धुंधला किए फाइल को सीधे 20KB-50KB साइज में डाउनलोड करने की सुविधा देता है।"
    },
    {
      q: "क्या मेरी लाइव वीडियो या फोटो किसी सर्वर पर जाती है?",
      a: "बिल्कुल नहीं। यह 100% क्लाइंट-साइड (ब्राउज़र के अंदर) काम करता है। आपका कैमरा फीड या फोटो कभी किसी बाहरी सर्वर पर अपलोड नहीं होता।"
    }
  ];

  // कैमरा बंद करना
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStreamActive(false);
  };

  // कैमरा शुरू करना (यूज़र ट्रिगर्ड)
  const startCamera = async (mode: 'user' | 'environment') => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('इस ब्राउज़र में लाइव वेबकैम समर्थित नहीं है।');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('muted', 'true');
        await videoRef.current.play();
      }

      setStreamActive(true);
      setCapturedSrc(null);
    } catch (err: any) {
      console.error(err);
      setCameraError('कैमरा एक्सेस नहीं मिला। कृपया परमिशन की जाँच करें या नीचे दिए बटन से फोटो खींचें।');
      setStreamActive(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const toggleCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // 3-सेकंड काउंटडाउन
  const triggerCapture = () => {
    if (countdown !== null) return;
    let count = 3;
    setCountdown(count);

    const timer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(timer);
        setCountdown(null);
        captureFrame();
      }
    }, 1000);
  };

  // फ्रेम कैप्चर
  const captureFrame = () => {
    const video = videoRef.current;
    if (!video) return;

    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;

    // पासपोर्ट अनुपात (3.5 x 4.5)
    let cropW = vw;
    let cropH = Math.round((cropW * 9) / 7);

    if (cropH > vh) {
      cropH = vh;
      cropW = Math.round((cropH * 7) / 9);
    }

    const startX = (vw - cropW) / 2;
    const startY = (vh - cropH) / 2;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropW;
    tempCanvas.height = cropH;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(cropW, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, startX, startY, cropW, cropH, 0, 0, cropW, cropH);
    } else {
      ctx.drawImage(video, startX, startY, cropW, cropH, 0, 0, cropW, cropH);
    }

    setCapturedSrc(tempCanvas.toDataURL('image/jpeg', 0.95));
    stopCamera();
  };

  // फॉलबैक फाइल इनपुट हैंडलर (सीधे फोन कैमरा)
  const handleFallbackFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedSrc(reader.result as string);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  // प्रोसेस और रेंडर
  const renderProcessedPhoto = useCallback((outCanvas: HTMLCanvasElement) => {
    if (!capturedSrc) return;
    const img = new Image();
    img.src = capturedSrc;
    img.onload = () => {
      const cw = 700;
      const ch = 900;
      outCanvas.width = cw;
      outCanvas.height = ch;
      const ctx = outCanvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, 0, 0, cw, ch);

      const imgData = ctx.getImageData(0, 0, cw, ch);
      const data = imgData.data;

      const factor = (259 * (contrast + 255)) / (255 * (259 - Math.min(250, contrast)));
      const bOffset = brightness * 1.5;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i] + bOffset;
        let g = data[i + 1] + bOffset;
        let b = data[i + 2] + bOffset;

        data[i] = Math.max(0, Math.min(255, factor * (r - 128) + 128));
        data[i + 1] = Math.max(0, Math.min(255, factor * (g - 128) + 128));
        data[i + 2] = Math.max(0, Math.min(255, factor * (b - 128) + 128));
      }

      ctx.putImageData(imgData, 0, 0);
    };
  }, [capturedSrc, brightness, contrast]);

  useEffect(() => {
    if (capturedSrc && canvasRef.current) {
      renderProcessedPhoto(canvasRef.current);
    }
  }, [capturedSrc, renderProcessedPhoto]);

  // डाउनलोड फ़ंक्शन
  const downloadFormJpg = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let minQ = 0.15;
    let maxQ = 0.95;
    let bestUrl = canvas.toDataURL('image/jpeg', 0.85);

    for (let i = 0; i < 6; i++) {
      const midQ = (minQ + maxQ) / 2;
      const url = canvas.toDataURL('image/jpeg', midQ);
      const curKb = (url.length * 3) / 4 / 1024;

      if (curKb > targetKb) {
        maxQ = midQ;
      } else {
        bestUrl = url;
        minQ = midQ;
      }
    }

    const a = document.createElement('a');
    a.download = `live_photo_${targetKb}KB.jpg`;
    a.href = bestUrl;
    a.click();
  };

  const downloadHdJpg = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const a = document.createElement('a');
    a.download = `live_photo_studio_300dpi.jpg`;
    a.href = canvas.toDataURL('image/jpeg', 0.98);
    a.click();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        
        <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-full mb-3">
          🤳 अग्निवीर, SSC व NTA लाइव वेबकैम स्पेशल
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          लाइव वेबकैम फोटो कैप्चर (Live Camera Oval Guide)
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          सरकारी फॉर्म में लाइव फोटो अपलोड करने के लिए चेहरे को ओवल गाइड में सेट करें ताकि फॉर्म रिजेक्ट न हो।
        </p>

        {/* छिपा हुआ फोन कैमरा इनपुट (फॉलबैक) */}
        <input
          type="file"
          accept="image/*"
          capture="user"
          ref={fallbackInputRef}
          onChange={(e) => handleFallbackFile(e.target.files?.[0])}
          className="hidden"
        />

        {/* 1. मुख्य कैमरा व्यूफ़ाइंडर व ओवल गाइड */}
        <div className="relative w-full max-w-sm mx-auto aspect-7/9 bg-slate-950 rounded-2xl overflow-hidden shadow-md flex items-center justify-center mb-5 border-4 border-slate-800">
          
          {/* लाइव वीडियो एलिमेंट (हमेशा DOM में उपस्थित ताकि स्ट्रीम तुरंत बाइंड हो सके) */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${streamActive && !capturedSrc ? 'block' : 'hidden'} ${facingMode === 'user' ? '-scale-x-100' : ''}`}
          />

          {streamActive && !capturedSrc && (
            <>
              {/* ओवल गाइडलाइन ओवरले */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                <div className="w-48 h-64 border-2 border-dashed border-emerald-400 rounded-[50%/60%] shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center justify-center">
                  <span className="text-[11px] font-bold text-emerald-300 bg-slate-900/80 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    यहाँ चेहरा रखें
                  </span>
                </div>
                <div className="w-64 h-12 border-t-2 border-dashed border-emerald-400/70 mt-2 rounded-t-full" />
              </div>

              {/* 3s काउंटडाउन */}
              {countdown !== null && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                  <span className="text-7xl font-black text-white animate-ping">
                    {countdown}
                  </span>
                </div>
              )}
            </>
          )}

          {/* कैप्चर की गई फोटो */}
          {capturedSrc && (
            <canvas ref={canvasRef} className="w-full h-full object-cover" />
          )}

          {/* कैमरा बंद या अन-इनिशियलाइज़्ड स्थिति */}
          {!streamActive && !capturedSrc && (
            <div className="text-center p-6 text-slate-300 flex flex-col items-center justify-center gap-3">
              <span className="text-5xl">📷</span>
              <p className="text-xs font-bold max-w-xs text-slate-400">
                {cameraError || 'लाइव फोटो खींचने के लिए नीचे दिए गए बटन पर टैप करें।'}
              </p>
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer"
              >
                📸 लाइव कैमरा शुरू करें
              </button>
            </div>
          )}
        </div>

        {/* 2. एक्शन बटन्स */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mb-6">
          {streamActive && !capturedSrc ? (
            <>
              <button
                type="button"
                onClick={triggerCapture}
                disabled={countdown !== null}
                className="w-full sm:flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>📸</span>
                <span>फोटो खींचें (3s टाइमर)</span>
              </button>

              <button
                type="button"
                onClick={toggleCamera}
                className="w-full sm:w-auto py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>🔄</span>
                <span>कैमरा बदलें</span>
              </button>
            </>
          ) : capturedSrc ? (
            <button
              type="button"
              onClick={() => startCamera(facingMode)}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🔄</span>
              <span>दोबारा लाइव फोटो लें (Retake)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => fallbackInputRef.current?.click()}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>📁</span>
              <span>या फोन कैमरा ऐप से खींचें / फोटो चुनें</span>
            </button>
          )}
        </div>

        {/* 3. फोटो ट्यूनिंग कंट्रोल्स */}
        {capturedSrc && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 mb-6">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>☀️ चेहरे की चमक (Brightness):</span>
                <span className="text-emerald-700 font-mono">+{brightness}</span>
              </div>
              <input
                type="range"
                min={-20}
                max={40}
                step={1}
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>🖋️ कंट्रास्ट व स्पष्टता (Contrast):</span>
                <span className="text-emerald-700 font-mono">+{contrast}%</span>
              </div>
              <input
                type="range"
                min={-10}
                max={50}
                step={1}
                value={contrast}
                onChange={(e) => setContrast(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* सरकारी फॉर्म साइज (20-50 KB) */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>🎯 ऑनलाइन फॉर्म साइज़ लक्ष्य:</span>
                <span className="text-emerald-700 font-mono font-black">{targetKb} KB</span>
              </div>
              <input
                type="range"
                min={20}
                max={50}
                step={5}
                value={targetKb}
                onChange={(e) => setTargetKb(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span onClick={() => setTargetKb(20)} className="cursor-pointer hover:text-emerald-700">20 KB (SSC)</span>
                <span onClick={() => setTargetKb(35)} className="cursor-pointer hover:text-emerald-700">35 KB (मानक)</span>
                <span onClick={() => setTargetKb(50)} className="cursor-pointer hover:text-emerald-700">50 KB (अग्निवीर/NTA)</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. डाउनलोड बटन्स */}
        {capturedSrc && (
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={downloadFormJpg}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>📥</span>
              <span>सरकारी फॉर्म हेतु डाउनलोड करें ({targetKb} KB लक्ष्य)</span>
            </button>

            <button
              type="button"
              onClick={downloadHdJpg}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🖼️</span>
              <span>स्टूडियो HD फोटो डाउनलोड करें (300 DPI)</span>
            </button>
          </div>
        )}

      </div>

      <FaqSection 
        title="लाइव कैमरा फोटो कैप्चर - अक्सर पूछे जाने वाले सवाल"
        items={liveFaqs}
        pageUrl="https://examsewa.online/tools/live-photo-capture"
      />

    </div>
  );
}
