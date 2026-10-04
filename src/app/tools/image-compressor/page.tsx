"use client";

import React, { useState, ChangeEvent } from "react";
import Link from "next/link";

interface ImageItem {
  id: string;
  file: File;
  name: string;
  originalKb: number;
  compressedKb: number | null;
  downloadUrl: string | null;
  status: "idle" | "processing" | "done" | "error";
  width?: number;
  height?: number;
  previewUrl: string;
}

export default function ImageCompressorPage() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalProgress, setGlobalProgress] = useState("");

  // सेटिंग्स: डिफ़ॉल्ट यूनिट हमेशा KB, स्टैंडर्ड डिफ़ॉल्ट 50 KB (पासपोर्ट फोटो मानक)
  const [targetKb, setTargetKb] = useState<number>(50);
  const [unit, setUnit] = useState<"KB" | "MB">("KB");
  const [customInputValue, setCustomInputValue] = useState<string>("50");

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const newItems: ImageItem[] = [];

    Array.from(fileList).forEach((f) => {
      if (f.type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(f.name)) {
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file: f,
          name: f.name,
          originalKb: Math.round(f.size / 1024),
          compressedKb: null,
          downloadUrl: null,
          status: "idle",
          previewUrl: URL.createObjectURL(f),
        });
      }
    });

    if (newItems.length === 0) {
      alert("कृपया केवल मान्य इमेज फ़ाइलें (JPG, PNG, WebP) चुनें।");
      return;
    }

    setItems((prev) => [...prev, ...newItems]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUnitChange = (newUnit: "KB" | "MB") => {
    setUnit(newUnit);
    if (newUnit === "MB") {
      const inMb = (targetKb / 1024).toFixed(1).replace(/\.0$/, "");
      setCustomInputValue(inMb);
    } else {
      setCustomInputValue(String(targetKb));
    }
  };

  const handleCustomInputChange = (val: string) => {
    setCustomInputValue(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      if (unit === "MB") {
        setTargetKb(Math.round(num * 1024));
      } else {
        setTargetKb(Math.round(num));
      }
    }
  };

  const setPreset = (kbValue: number) => {
    setTargetKb(kbValue);
    if (kbValue >= 1024) {
      setUnit("MB");
      setCustomInputValue((kbValue / 1024).toString());
    } else {
      setUnit("KB");
      setCustomInputValue(kbValue.toString());
    }
  };

  // स्मार्ट इमेज कंप्रेसर इंजन (दस्तावेज़/सिग्नेचर की मात्राएँ व शार्पनेस सुरक्षित)
  const compressSingleImage = async (
    item: ImageItem,
    desiredKb: number
  ): Promise<{ compressedKb: number; url: string; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = item.previewUrl;
      img.onload = async () => {
        try {
          const targetBytes = desiredKb * 1024;
          const origW = img.naturalWidth;
          const origH = img.naturalHeight;

          // 1. स्मार्ट क्लासिफायर (Document / Signature vs Normal Photo)
          const sampleC = document.createElement("canvas");
          const sW = Math.min(200, origW);
          const sH = Math.min(200, origH);
          sampleC.width = sW;
          sampleC.height = sH;
          const sCtx = sampleC.getContext("2d", { willReadFrequently: true });
          let isDoc = false;

          if (sCtx) {
            sCtx.drawImage(img, 0, 0, sW, sH);
            const data = sCtx.getImageData(0, 0, sW, sH).data;
            let extremeLight = 0;
            let extremeDark = 0;
            for (let i = 0; i < data.length; i += 4) {
              const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
              if (lum > 225) extremeLight++;
              else if (lum < 60) extremeDark++;
            }
            // यदि बैकग्राउंड सफ़ेद और स्याही काली/गहरी है तो यह डॉक्यूमेंट/सिग्नेचर है
            if (extremeLight / (sW * sH) > 0.45 && extremeDark / (sW * sH) > 0.03) {
              isDoc = true;
            }
          }

          // 2. स्मार्ट स्केलिंग (दस्तावेज़ों में अक्षरों और मात्राओं को कटने से बचाना)
          let scale = 1.0;
          if (isDoc) {
            // डॉक्यूमेंट व सिग्नेचर का रिज़ॉल्यूशन ज़्यादा नहीं गिराया जाएगा ताकि टेक्स्ट क्रिस्प रहे
            if (desiredKb <= 20) scale = Math.min(1.0, 950 / Math.max(origW, origH));
            else if (desiredKb <= 50) scale = Math.min(1.0, 1400 / Math.max(origW, origH));
            else if (desiredKb <= 100) scale = Math.min(1.0, 1800 / Math.max(origW, origH));
          } else {
            // सामान्य फोटोग्राफ़ के लिए
            if (desiredKb <= 25) scale = Math.min(1.0, 750 / Math.max(origW, origH));
            else if (desiredKb <= 60) scale = Math.min(1.0, 1150 / Math.max(origW, origH));
            else if (desiredKb <= 150) scale = Math.min(1.0, 1600 / Math.max(origW, origH));
          }

          const targetW = Math.max(80, Math.round(origW * scale));
          const targetH = Math.max(80, Math.round(origH * scale));

          const canvas = document.createElement("canvas");
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext("2d", { alpha: false });
          if (!ctx) throw new Error("Canvas context failed");

          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, targetW, targetH);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, targetW, targetH);

          // 3. 10-स्टेप बाइनरी सर्च क्वालिटी सेलेक्टर (दिए गए KB में उच्चतम क्वालिटी)
          let qLow = 0.05;
          let qHigh = 0.98;
          let bestBlob: Blob | null = null;

          for (let i = 0; i < 10; i++) {
            const qMid = (qLow + qHigh) / 2;
            const b: Blob = await new Promise((res) =>
              canvas.toBlob((bl) => res(bl!), "image/jpeg", qMid)
            );
            if (b.size <= targetBytes) {
              bestBlob = b;
              qLow = qMid;
            } else {
              qHigh = qMid;
            }
          }

          const finalBlob =
            bestBlob ||
            (await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.1)));

          const resKb = Math.round(finalBlob.size / 1024);
          const finalUrl = URL.createObjectURL(finalBlob);

          resolve({
            compressedKb: resKb,
            url: finalUrl,
            width: targetW,
            height: targetH,
          });
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error("इमेज लोड नहीं हो सकी"));
    });
  };

  const processBatchCompression = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);

    for (let i = 0; i < items.length; i++) {
      const current = items[i];
      if (current.status === "done") continue;

      setGlobalProgress(`इमेज ${i + 1} / ${items.length} कंप्रेस हो रही है...`);
      setItems((prev) =>
        prev.map((it) => (it.id === current.id ? { ...it, status: "processing" } : it))
      );

      try {
        const res = await compressSingleImage(current, targetKb);
        setItems((prev) =>
          prev.map((it) =>
            it.id === current.id
              ? {
                  ...it,
                  status: "done",
                  compressedKb: res.compressedKb,
                  downloadUrl: res.url,
                  width: res.width,
                  height: res.height,
                }
              : it
          )
        );
      } catch (err: any) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === current.id
              ? { ...it, status: "error" }
              : it
          )
        );
      }
    }

    setIsProcessing(false);
    setGlobalProgress("सभी इमेज सफलतापूर्वक कंप्रेस हो गईं!");
  };

  const downloadAll = () => {
    items.forEach((item) => {
      if (item.downloadUrl) {
        const link = document.createElement("a");
        link.href = item.downloadUrl;
        link.download = `compressed_${item.name.replace(/\.[^/.]+$/, "")}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-4">

        {/* शीर्ष नेविगेशन */}
        <div className="flex items-center justify-between">
          <Link href="/tools" className="text-xs font-bold text-slate-500 hover:text-slate-800">
            ← सभी टूल्स
          </Link>
          <span className="text-[11px] bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
            ExamSewa
          </span>
        </div>

        {/* मुख्य शीर्षक कार्ड */}
        <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-sm text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            JPG इमेज कंप्रेसर — ExamSewa
          </h1>
          <p className="text-xs text-slate-500">
            सरकारी फॉर्म (फोटो व साइन) के लिए बिना ब्लर हुए सटीक KB में कंप्रेस करें
          </p>
        </div>

        {/* मुख्य अपलोड बॉक्स */}
        <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <label className="cursor-pointer border-2 border-dashed border-blue-400 hover:border-blue-600 bg-blue-50/60 hover:bg-blue-50 transition rounded-xl p-5 sm:p-6 flex flex-col items-center justify-center text-center space-y-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <span className="text-4xl">🖼️</span>
            <div>
              <span className="font-bold text-sm text-blue-800 block">
                इमेज चुनें या ड्रैग करें (Select Images)
              </span>
              <span className="text-[11px] text-slate-500">
                पासपोर्ट फोटो, सिग्नेचर व डॉक्यूमेंट्स (एक साथ कई चुनें)
              </span>
            </div>
          </label>

          {/* कॉम्पैक्ट हॉरिजॉन्टल स्लाइडर / चिप स्ट्रिप */}
          {items.length > 0 && (
            <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-slate-700">
                  📁 कुल इमेज ({items.length})
                </span>
                <label className="text-[11px] text-blue-600 font-bold cursor-pointer hover:underline">
                  + और जोड़ें
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    title={item.name}
                    className="shrink-0 flex items-center space-x-2 bg-white border border-slate-300 rounded-lg p-1.5 shadow-2xs text-xs"
                  >
                    <img
                      src={item.previewUrl}
                      alt="thumb"
                      className="w-8 h-8 rounded object-cover border border-slate-200"
                    />
                    <div className="flex flex-col">
                      <span className="font-black text-blue-700 text-[11px]">#{idx + 1}</span>
                      <span className="text-slate-500 text-[10px]">{item.originalKb}KB</span>
                    </div>

                    {item.status === "processing" && (
                      <span className="flex items-center text-[11px] text-blue-600 font-bold">
                        <svg className="animate-spin h-3.5 w-3.5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                      </span>
                    )}

                    {item.status === "done" && item.downloadUrl && (
                      <a
                        href={item.downloadUrl}
                        download={`compressed_${item.name.replace(/\.[^/.]+$/, "")}.jpg`}
                        className="bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded text-[10px] hover:bg-emerald-700"
                        title="डाउनलोड"
                      >
                        ✓ {item.compressedKb}KB 📥
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-red-600 font-bold text-xs pl-0.5"
                      title="हटाएँ"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* सेटिंग्स शेल्फ़ */}
          <div className="pt-1 border-t space-y-3">
            {/* सरकारी क्विक प्रीसेट्स */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-600">लोकप्रिय सरकारी प्रीसेट्स:</span>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {[
                  { label: "20 KB (साइन)", val: 20 },
                  { label: "50 KB (फोटो)", val: 50 },
                  { label: "100 KB", val: 100 },
                  { label: "150 KB", val: 150 },
                  { label: "200 KB", val: 200 },
                  { label: "300 KB", val: 300 },
                  { label: "500 KB", val: 500 },
                  { label: "1 MB", val: 1024 },
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setPreset(p.val)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition active:scale-95 ${
                      targetKb === p.val
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* कस्टम साइज़ व यूनिट स्विच (डिफ़ॉल्ट KB) */}
            <div className="p-2.5 bg-slate-50 border rounded-xl flex items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-800 block">कस्टम साइज़ दर्ज करें:</span>
                <span className="text-[10px] text-slate-500">
                  वर्तमान लॉक: <b className="text-blue-700">{targetKb} KB</b>
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="5"
                  value={customInputValue}
                  onChange={(e) => handleCustomInputChange(e.target.value)}
                  className="w-20 px-2.5 py-1 border border-slate-300 rounded-lg text-xs font-bold bg-white text-slate-900 focus:outline-blue-600"
                />

                <div className="flex border border-slate-300 rounded-lg overflow-hidden bg-white text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => handleUnitChange("KB")}
                    className={`px-2.5 py-1 transition ${
                      unit === "KB" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    KB
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnitChange("MB")}
                    className={`px-2.5 py-1 transition ${
                      unit === "MB" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    MB
                  </button>
                </div>
              </div>
            </div>

            {/* मुख्य एक्शन बटन */}
            <button
              type="button"
              onClick={processBatchCompression}
              disabled={isProcessing || items.length === 0}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <span>{globalProgress || "इमेज कंप्रेस हो रही है..."}</span>
                </span>
              ) : items.length === 0
                ? "कृपया पहले इमेज फ़ाइलें चुनें"
                : `⚡ सभी ${items.length} इमेज कंप्रेस करें`}
            </button>

            {/* सभी तैयार इमेज डाउनलोड करें */}
            {items.some((i) => i.status === "done") && (
              <button
                type="button"
                onClick={downloadAll}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-95 flex items-center justify-center space-x-1"
              >
                <span>📥</span>
                <span>सभी कंप्रेस्ड इमेज एक साथ डाउनलोड करें</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
