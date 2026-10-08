with open("src/app/tools/id-card-joiner-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write('''"use client";

import React, { useState, useRef } from "react";
import ScannerCropModal from "./ScannerCropModal";

export default function IdCardJoinerDemo() {
  const [layoutMode, setLayoutMode] = useState<"horizontal" | "vertical">("horizontal");
  const [targetKb, setTargetKb] = useState<number>(150);

  // दोनों साइड के फ़ाइनल क्रॉप्ड इमेज
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);

  // करंट एक्टिव साइड ('front' या 'back')
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");

  // व्यू स्क्रीन: 'main' (A4 प्रीव्यू व टूल), 'picker' (स्मार्ट स्कैनर का कैमरा/गैलरी पेज), 'camera' (लाइव कैमरा व्यू)
  const [currentView, setCurrentView] = useState<"main" | "picker" | "camera">("main");

  // क्रॉपर के लिए इमेज
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);

  // लाइव कैमरा संदर्भ
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 1. बटन टच करने पर स्मार्ट स्कैनर के सेलेक्टर पेज पर जाना
  const handleStartSlot = (side: "front" | "back") => {
    setActiveSide(side);
    setCurrentView("picker");
  };

  // 2. गैलरी से फ़ाइल चुनना
  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawImageForCrop(ev.target?.result as string);
      setCurrentView("main"); // पिकर बंद, क्रॉपर मोडल खुलेगा
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // 3. कैमरा चालू करना
  const handleOpenLiveCamera = async () => {
    setCurrentView("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error(err);
      alert("कैमरा शुरू नहीं हो सका। कृपया गैलरी से चुनें।");
      setCurrentView("picker");
    }
  };

  // 4. कैमरा से फ़ोटो खींचना
  const handleCapturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, w, h);
    const snapUrl = canvas.toDataURL("image/jpeg", 0.95);

    // कैमरा बंद
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    setRawImageForCrop(snapUrl);
    setCurrentView("main");
  };

  const handleCloseCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCurrentView("picker");
  };

  // 5. क्रॉपर से फ़ोटो मिलने पर संबंधित बॉक्स में सेट करना
  const handleCropDone = (croppedData: string) => {
    if (activeSide === "front") {
      setFrontImage(croppedData);
    } else {
      setBackImage(croppedData);
    }
    setRawImageForCrop(null);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-200 flex flex-col font-sans select-none">
      
      {/* ==================== स्क्रीन 1: मुख्य A4 प्रीव्यू + टूल बॉक्स ==================== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* ऊपरी स्थिर A4 प्रीव्यू बॉक्स (52% स्क्रीन) */}
        <div className="h-[52%] shrink-0 bg-slate-100 border-b-2 border-slate-300 flex flex-col p-2 items-center justify-between shadow-xs relative z-10">
          <div className="w-full max-w-sm flex items-center justify-between text-[11px] font-bold px-1 mb-1">
            <span className="text-slate-700">
              शीट: A4 • {layoutMode === "horizontal" ? "अगल-बगल" : "ऊपर-नीचे"}
            </span>
            <span className="text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded text-[10px]">
              टारगेट: ~{targetKb} KB में सुरक्षित
            </span>
          </div>

          <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
            <div className="h-full aspect-[210/297] bg-white rounded-xl border-2 border-slate-800 shadow-md p-2.5 flex flex-col items-center justify-between">
              
              <div
                className={`w-full flex justify-center gap-1.5 transition-all ${
                  layoutMode === "horizontal" ? "flex-row items-center pt-1" : "flex-col items-center pt-1 gap-1.5"
                }`}
              >
                {/* आगे का कार्ड स्लॉट */}
                <div
                  className={`aspect-[85.6/54] border border-slate-900 rounded-md overflow-hidden bg-white flex items-center justify-center transition-all ${
                    layoutMode === "horizontal" ? "w-[48%]" : "w-[66%]"
                  }`}
                >
                  {frontImage ? (
                    <img src={frontImage} alt="आगे का भाग" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">आगे का भाग (Front)</span>
                  )}
                </div>

                {/* पीछे का कार्ड स्लॉट */}
                <div
                  className={`aspect-[85.6/54] border border-slate-900 rounded-md overflow-hidden bg-white flex items-center justify-center transition-all ${
                    layoutMode === "horizontal" ? "w-[48%]" : "w-[66%]"
                  }`}
                >
                  {backImage ? (
                    <img src={backImage} alt="पीछे का भाग" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">पीछे का भाग (Back)</span>
                  )}
                </div>
              </div>

              <div className="w-full pt-1.5 border-t border-dashed border-slate-300 text-center">
                <span className="text-[9px] text-slate-400 font-medium">
                  ✂ शेष खाली A4 कागज़ (पुनः उपयोग योग्य)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* निचला स्क्रॉलेबल टूल बॉक्स (48% स्क्रीन) */}
        <div className="flex-1 overflow-y-auto bg-white p-3 space-y-3.5 scroll-smooth">
          <div className="max-w-sm mx-auto space-y-3.5 pb-10">
            
            <div className="text-center pt-1">
              <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-1"></div>
              <p className="text-[10px] font-bold text-blue-600 tracking-tight">
                ↓ टूल बॉक्स (नीचे स्क्रॉल करें)
              </p>
            </div>

            {/* मुख्य कार्ड स्लॉट बटन (आगे / पीछे) */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleStartSlot("front")}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition shadow-xs active:scale-98 ${
                  frontImage
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                    : "bg-blue-50/70 hover:bg-blue-100 border-blue-200 text-blue-900"
                }`}
              >
                <span className="text-xs font-black">
                  {frontImage ? "✓ आगे का भाग (Front)" : "📷 आगे का भाग (Front)"}
                </span>
                <span className="text-[10px] font-bold text-blue-600">
                  {frontImage ? "बदलने के लिए टच करें" : "+ फोटो चुनें"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleStartSlot("back")}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition shadow-xs active:scale-98 ${
                  backImage
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                    : "bg-blue-50/70 hover:bg-blue-100 border-blue-200 text-blue-900"
                }`}
              >
                <span className="text-xs font-black">
                  {backImage ? "✓ पीछे का भाग (Back)" : "📷 पीछे का भाग (Back)"}
                </span>
                <span className="text-[10px] font-bold text-blue-600">
                  {backImage ? "बदलने के लिए टच करें" : "+ फोटो चुनें"}
                </span>
              </button>
            </div>

            {/* कागज़ का साइज़ */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">कागज़ का साइज़</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="py-2 px-3 text-xs font-black rounded-xl bg-slate-900 text-white text-center shadow-xs">
                  A4 बड़ा पेपर (पोर्ट्रेट)
                </div>
                <div className="py-2 px-3 text-xs font-semibold rounded-xl bg-slate-50 text-slate-400 border border-dashed border-slate-300 text-center">
                  (खाली स्लॉट)
                </div>
              </div>
            </div>

            {/* कार्ड लेआउट */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">कार्ड लेआउट</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLayoutMode("horizontal")}
                  className={`py-2 px-3 text-xs font-bold rounded-xl transition border ${
                    layoutMode === "horizontal"
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  अगल - बगल (मानक)
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode("vertical")}
                  className={`py-2 px-3 text-xs font-bold rounded-xl transition border ${
                    layoutMode === "vertical"
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  ऊपर - नीचे
                </button>
              </div>
            </div>

            {/* टारगेट KB */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">टारगेट साइज़ (KB)</label>
              <div className="grid grid-cols-3 gap-2">
                {[100, 150, 200].map((kb) => (
                  <button
                    key={kb}
                    type="button"
                    onClick={() => setTargetKb(kb)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                      targetKb === kb
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    ~{kb} KB
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ==================== स्क्रीन 2: स्मार्ट स्कैनर का मुख्य इनपुट पेज (कैमरा / गैलरी सेलेक्टर) ==================== */}
      {currentView === "picker" && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex flex-col justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-800">
                {activeSide === "front" ? "आगे का भाग (Front) चुनें" : "पीछे का भाग (Back) चुनें"}
              </h3>
              <button
                onClick={() => setCurrentView("main")}
                className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold"
              >
                ✕ वापस
              </button>
            </div>

            <p className="text-xs text-slate-500">
              कार्ड की साफ़ फ़ोटो खींचें या अपनी गैलरी से अपलोड करें:
            </p>

            <div className="grid grid-cols-1 gap-3 pt-1">
              {/* कैमरा विकल्प */}
              <button
                type="button"
                onClick={handleOpenLiveCamera}
                className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
              >
                <span className="text-base">📷</span>
                <span>कैमरा खोलें (लाइव फ़ोटो लें)</span>
              </button>

              {/* गैलरी विकल्प */}
              <label className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-300 cursor-pointer shadow-xs transition active:scale-98 text-center">
                <span className="text-base">📁</span>
                <span>गैलरी से फ़ोटो चुनें</span>
                <input type="file" accept="image/*" onChange={handleFilePicked} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ==================== स्क्रीन 3: लाइव कैमरा ==================== */}
      {currentView === "camera" && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between p-4">
          <div className="w-full flex justify-between items-center text-white pt-2">
            <span className="text-sm font-bold">
              {activeSide === "front" ? "आगे का भाग (Front)" : "पीछे का भाग (Back)"} फ़ोटो लें
            </span>
            <button
              onClick={handleCloseCamera}
              className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg border border-slate-700"
            >
              ✕ बंद करें
            </button>
          </div>

          <div className="relative w-full max-w-md aspect-[3/4] bg-neutral-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
            <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-8 border border-white/40 border-dashed rounded-xl pointer-events-none flex items-center justify-center">
              <span className="text-[11px] text-white/60 bg-black/50 px-2 py-0.5 rounded">कार्ड बीच में रखें</span>
            </div>
          </div>

          <div className="pb-6">
            <button
              type="button"
              onClick={handleCapturePhoto}
              className="w-16 h-16 rounded-full border-4 border-white bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* ==================== स्क्रीन 4: स्मार्ट क्रॉपर मोडल ==================== */}
      {rawImageForCrop && (
        <ScannerCropModal
          imageSrc={rawImageForCrop}
          title={activeSide === "front" ? "आगे का भाग (Front) क्रॉप करें" : "पीछे का भाग (Back) क्रॉप करें"}
          onCancel={() => setRawImageForCrop(null)}
          onApplyCrop={handleCropDone}
        />
      )}

    </div>
  );
}
''')

print("EXACT_SCANNER_FLOW_DEPLOYED")
