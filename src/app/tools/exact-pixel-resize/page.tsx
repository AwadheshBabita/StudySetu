"use client";
import { exportSmartJpg } from "@/lib/image-engine";
import { useState, useRef, ChangeEvent } from "react";
import Link from "next/link";

export default function ExactPixelResizePage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalDim, setOriginalDim] = useState<{ width: number; height: number } | null>(null);
  const [width, setWidth] = useState<number>(350);
  const [height, setHeight] = useState<number>(450);

  // अनुपात डिफ़ॉल्ट रूप से हमेशा लॉक (true) रहेगा
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(350 / 450);

  const [unit, setUnit] = useState<"px" | "cm" | "mm">("px");
  const [dpi, setDpi] = useState<number>(200);

  const [processing, setProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultInfo, setResultInfo] = useState<{ width: number; height: number; sizeKB: number } | null>(null);
  const [targetKb, setTargetKb] = useState<number>(50);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // फोटो अपलोड होते ही ओरिजिनल साइज और अनुपात सेट करना
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setResultInfo(null);

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setOriginalDim({ width: img.naturalWidth, height: img.naturalHeight });
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);

        // फोटो का ओरिजिनल अनुपात याद रखना (Width / Height)
        if (img.naturalHeight > 0) {
          setAspectRatio(img.naturalWidth / img.naturalHeight);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // जब लॉक चेकबॉक्स बदला जाए
  const handleToggleLock = (checked: boolean) => {
    setLockAspect(checked);
    if (checked && height > 0) {
      setAspectRatio(width / height);
    }
  };

  // चौड़ाई (Width) बदलने पर ऊँचाई (Height) अपने-आप बदले
  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && aspectRatio > 0) {
      const newH = Math.round(val / aspectRatio);
      setHeight(newH);
    }
  };

  // ऊँचाई (Height) बदलने पर चौड़ाई (Width) अपने-आप बदले
  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && aspectRatio > 0) {
      const newW = Math.round(val * aspectRatio);
      setWidth(newW);
    }
  };

  const toPixels = (value: number): number => {
    const effectiveDpi = dpi > 0 ? dpi : 200;
    if (unit === "cm") return Math.round((value / 2.54) * effectiveDpi);
    if (unit === "mm") return Math.round((value / 25.4) * effectiveDpi);
    return Math.round(value);
  };

  const processResize = async () => {
    if (!imageSrc) return;
    setProcessing(true);

    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((res) => { img.onload = res; });

      const finalW = Math.max(1, toPixels(width));
      const finalH = Math.max(1, toPixels(height));

      const canvas = document.createElement("canvas");
      canvas.width = finalW;
      canvas.height = finalH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unsupported");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, finalW, finalH);
      ctx.drawImage(img, 0, 0, finalW, finalH);

      const smartRes = await exportSmartJpg(canvas, {
        targetKb: targetKb > 0 ? targetKb : 50,
        isDocument: false,
        minQuality: 0.15,
        maxQuality: 0.98,
      });

      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(smartRes.dataUrl);
      setResultInfo({
        width: finalW,
        height: finalH,
        sizeKB: smartRes.actualKb,
      });
    } catch (err) {
      console.error(err);
      alert("रिसाइज करने में त्रुटि आई।");
    } finally {
      setProcessing(false);
    }
  };

  const calculatedW = toPixels(width);
  const calculatedH = toPixels(height);

  return (
    <main className="min-h-screen bg-slate-200/90 py-4 px-2 sm:px-4 text-slate-800">
      {/* मोबाइल पर सामान्य चौड़ाई, डेस्कटॉप पर सुंदर 4xl चौड़ाई */}
      <div className="max-w-md md:max-w-4xl mx-auto bg-slate-100 rounded-xl border border-slate-300 shadow-md overflow-hidden flex flex-col">

        {/* टॉप हेडर */}
        <div className="bg-[#101b33] text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
            <span>📷</span>
            <span>ExamSewa - सटीक पिक्सेल रिसाइज़र</span>
          </div>
          <Link
            href="/"
            className="text-xs bg-slate-700/80 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded transition font-medium"
          >
            ← होम
          </Link>
        </div>

        <div className="p-3 sm:p-5">
          {/* मुख्य ग्रिड: मोबाइल पर 1 कॉलम, कंप्यूटर पर 2 कॉलम (बाएँ प्रीव्यू, दाएँ टूल्स) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

            {/* ================= बायाँ कॉलम (Left): प्रीव्यू व अपलोड ================= */}
            <div className="space-y-3">
              <div className="bg-white rounded-lg border border-slate-300 p-2.5 shadow-2xs">
                <div className="w-full h-52 sm:h-72 bg-slate-50 rounded flex items-center justify-center overflow-hidden border border-slate-200">
                  {downloadUrl ? (
                    <img
                      src={downloadUrl}
                      alt="Result"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : imageSrc ? (
                    <img
                      src={imageSrc}
                      alt="Original"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400 p-4">
                      <div className="text-3xl mb-1.5 opacity-70">🖼️</div>
                      <p className="text-xs font-semibold text-slate-500">कोई फोटो लोड नहीं है</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">नीचे दिए गए बटन से फोटो चुनें</p>
                    </div>
                  )}
                </div>

                <div className="mt-2 text-center text-[11px] text-slate-600 font-bold">
                  {resultInfo ? (
                    <span className="text-emerald-700">✓ आउटपुट: {resultInfo.width} × {resultInfo.height} px ({resultInfo.sizeKB} KB)</span>
                  ) : originalDim ? (
                    <span>मूल: {originalDim.width} × {originalDim.height} px (अनुपात सुरक्षित)</span>
                  ) : (
                    <span>फोटो लोड करके डायमेंशन सेट करें</span>
                  )}
                </div>
              </div>

              {/* फोटो चयन बटन */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-blue-50 border border-dashed border-blue-400 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                📂 {imageSrc ? "अन्य फोटो बदलें" : "फोटो लोड करें"}
              </button>
            </div>

            {/* ================= दायाँ कॉलम (Right): सेटिंग्स, टूल्स व एक्शन ================= */}
            <div className="space-y-3">
              {/* 1. साइज़ व डायमेंशन ग्रुप-बॉक्स */}
              <fieldset className="border border-slate-300 rounded-lg p-3 bg-white shadow-2xs">
                <legend className="text-xs font-bold text-slate-700 px-1.5">
                  Dimensions (साइज़ सेटिंग)
                </legend>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] text-slate-600 font-bold mb-1">इकाई</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as any)}
                      className="w-full border border-slate-300 rounded p-1.5 text-xs bg-slate-50 font-bold focus:outline-none focus:border-blue-500"
                    >
                      <option value="px">px</option>
                      <option value="cm">cm</option>
                      <option value="mm">mm</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 font-bold mb-1">चौड़ाई ({unit})</label>
                    <input
                      type="number"
                      step={unit === "px" ? "1" : "0.1"}
                      value={width}
                      onChange={(e) => handleWidthChange(parseFloat(e.target.value) || 0)}
                      className="w-full border border-slate-300 rounded p-1.5 text-xs font-bold bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 font-bold mb-1">ऊँचाई ({unit})</label>
                    <input
                      type="number"
                      step={unit === "px" ? "1" : "0.1"}
                      value={height}
                      onChange={(e) => handleHeightChange(parseFloat(e.target.value) || 0)}
                      className="w-full border border-slate-300 rounded p-1.5 text-xs font-bold bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lockAspect}
                      onChange={(e) => handleToggleLock(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5"
                    />
                    <span className="text-[11px] text-blue-800 font-bold">
                      🔗 अनुपात लॉक (ऑटो-कैलकुलेट)
                    </span>
                  </label>

                  {unit !== "px" && (
                    <span className="text-[10.5px] text-blue-700 font-bold">
                      → {calculatedW} × {calculatedH} px
                    </span>
                  )}
                </div>
              </fieldset>

              {/* 2. DPI और Target KB */}
              <div className="grid grid-cols-2 gap-2">
                <fieldset className="border border-slate-300 rounded-lg p-2.5 bg-white shadow-2xs">
                  <legend className="text-[10px] font-bold text-slate-700 px-1">
                    Resolution (DPI)
                  </legend>
                  <div className="flex items-center justify-between gap-1 pt-0.5">
                    <input
                      type="number"
                      value={dpi}
                      onChange={(e) => setDpi(Number(e.target.value))}
                      className="w-12 border border-slate-300 rounded p-1 text-xs text-center font-bold bg-slate-50 focus:outline-none"
                    />
                    <div className="flex gap-0.5">
                      {[150, 200, 300].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDpi(d)}
                          className={`text-[9px] px-1 py-0.5 rounded font-bold border transition ${
                            dpi === d ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border border-slate-300 rounded-lg p-2.5 bg-white shadow-2xs">
                  <legend className="text-[10px] font-bold text-slate-700 px-1">
                    Target File (KB)
                  </legend>
                  <div className="flex items-center justify-between gap-1 pt-0.5">
                    <input
                      type="number"
                      min="5"
                      max="1000"
                      value={targetKb}
                      onChange={(e) => setTargetKb(Number(e.target.value))}
                      className="w-12 border border-slate-300 rounded p-1 text-xs text-center font-bold bg-slate-50 focus:outline-none"
                    />
                    <div className="flex gap-0.5">
                      {[20, 50, 100].map((kb) => (
                        <button
                          key={kb}
                          type="button"
                          onClick={() => setTargetKb(kb)}
                          className={`text-[9px] px-1 py-0.5 rounded font-bold border transition ${
                            targetKb === kb ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-emerald-800 border-slate-300 hover:bg-emerald-50"
                          }`}
                        >
                          {kb}K
                        </button>
                      ))}
                    </div>
                  </div>
                </fieldset>
              </div>

              {/* 3. OK व Download बटन */}
              <div className="pt-1 space-y-2">
                <button
                  onClick={processResize}
                  disabled={processing || !imageSrc}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold py-2.5 rounded-lg transition disabled:opacity-50 shadow-2xs cursor-pointer"
                >
                  {processing ? "प्रोसेसिंग..." : "OK (सटीक पिक्सेल लागू करें)"}
                </button>

                {resultInfo && downloadUrl && (
                  <a
                    href={downloadUrl}
                    download="examsewa-resized.jpg"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    📥 डाउनलोड करें ({resultInfo.sizeKB} KB)
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
