"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";

interface PageItem {
  id: string;
  dataUrl: string;
  name: string;
  width: number;
  height: number;
}

type PresetMode = "50" | "100" | "200" | "300" | "custom" | "original";

export default function JpgToPdfPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [margin, setMargin] = useState<number>(5); // 0, 5, 10 mm
  
  // साइज़ सेटिंग्स
  const [sizeMode, setSizeMode] = useState<PresetMode>("200");
  const [customKb, setCustomKb] = useState<number>(200);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>("");
  const [lastGeneratedPdfBlob, setLastGeneratedPdfBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const addMoreInputRef = useRef<HTMLInputElement | null>(null);

  // प्रभावी टारगेट KB
  const effectiveTargetKb = (): number => {
    if (sizeMode === "50") return 50;
    if (sizeMode === "100") return 100;
    if (sizeMode === "200") return 200;
    if (sizeMode === "300") return 300;
    if (sizeMode === "original") return 9999;
    return customKb;
  };

  const currentDisplayKb = lastGeneratedPdfBlob 
    ? `${Math.round(lastGeneratedPdfBlob.size / 1024)} KB` 
    : (sizeMode === "original" ? "मूल/HD" : `~${effectiveTargetKb()} KB`);

  // फ़ाइलें लोड करना
  const handleFiles = (files: FileList | null, isAppend = false) => {
    if (!files || files.length === 0) return;

    const fileArr = Array.from(files);
    const newItems: PageItem[] = [];
    let loadedCount = 0;

    fileArr.forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          newItems.push({
            id: Math.random().toString(36).substring(2, 9),
            dataUrl,
            name: file.name,
            width: img.width,
            height: img.height,
          });
          loadedCount++;
          if (loadedCount === fileArr.length) {
            setPages((prev) => (isAppend ? [...prev, ...newItems] : newItems));
            setLastGeneratedPdfBlob(null);
          }
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  // पन्नों का क्रम बदलना
  const movePage = (index: number, direction: "left" | "right") => {
    const targetIdx = direction === "left" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= pages.length) return;

    const updated = [...pages];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setPages(updated);
    setLastGeneratedPdfBlob(null);
  };

  // पन्ना हटाना
  const removePage = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
    setLastGeneratedPdfBlob(null);
  };

  // jsPDF लोड करना
  const loadJsPdf = async (): Promise<any> => {
    if ((window as any).jspdf) return (window as any).jspdf.jsPDF;
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = () => resolve((window as any).jspdf.jsPDF);
      script.onerror = () => reject(new Error("PDF इंजन लोड नहीं हो सका"));
      document.body.appendChild(script);
    });
  };

  // हाई-क्वालिटी टेक्स्ट शार्पनिंग व व्हाइटनिंग
  const optimizePage = (dataUrl: string, qualityFactor: number, maxDim: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        
        let w = img.width;
        let h = img.height;

        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        if (sizeMode !== "original") {
          const imgData = ctx.getImageData(0, 0, w, h);
          const d = imgData.data;
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];
            
            // पीलापन/धुंधलापन हटाकर साफ़ सफ़ेद
            if (r > 190 && g > 190 && b > 180) {
              d[i] = 255;
              d[i + 1] = 255;
              d[i + 2] = 255;
            } else if (r < 110 && g < 110 && b < 110) {
              // अक्षरों की स्याही को गहरा करना
              d[i] = Math.max(0, r - 20);
              d[i + 1] = Math.max(0, g - 20);
              d[i + 2] = Math.max(0, b - 20);
            }
          }
          ctx.putImageData(imgData, 0, 0);
        }

        resolve(canvas.toDataURL("image/jpeg", qualityFactor));
      };
      img.src = dataUrl;
    });
  };

  // संयुक्त PDF बनाना
  const buildPdfDocument = async (quality: number, maxDim: number) => {
    const JsPDF = await loadJsPdf();
    const isPortrait = orientation === "portrait";
    const doc = new JsPDF({
      orientation: isPortrait ? "p" : "l",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = isPortrait ? 210 : 297;
    const pageHeight = isPortrait ? 297 : 210;
    const availWidth = pageWidth - margin * 2;
    const availHeight = pageHeight - margin * 2;

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) doc.addPage("a4", isPortrait ? "p" : "l");
      const page = pages[i];
      const optData = await optimizePage(page.dataUrl, quality, maxDim);

      const imgRatio = page.width / page.height;
      const boxRatio = availWidth / availHeight;
      let drawW = availWidth;
      let drawH = availHeight;

      if (imgRatio > boxRatio) {
        drawW = availWidth;
        drawH = availWidth / imgRatio;
      } else {
        drawH = availHeight;
        drawW = availHeight * imgRatio;
      }

      const posX = margin + (availWidth - drawW) / 2;
      const posY = margin + (availHeight - drawH) / 2;

      doc.addImage(optData, "JPEG", posX, posY, drawW, drawH, undefined, "FAST");
    }

    const pdfBlob = doc.output("blob") as Blob;
    return { doc, pdfBlob };
  };

  // पक्का साइज़ कंट्रोल और जनरेट करना
  const handleProcessPdf = async (autoDownload = true): Promise<Blob | null> => {
    if (pages.length === 0) return null;
    setIsProcessing(true);
    setProgressMsg("प्रोसेसिंग...");

    const maxLimit = effectiveTargetKb();

    try {
      let maxDim = 1250;
      let quality = sizeMode === "original" ? 0.95 : 0.65;

      if (sizeMode !== "original") {
        const perPageKb = maxLimit / pages.length;
        if (perPageKb < 15) {
          maxDim = 850;
          quality = 0.32;
        } else if (perPageKb < 30) {
          maxDim = 1000;
          quality = 0.42;
        } else if (perPageKb < 60) {
          maxDim = 1150;
          quality = 0.58;
        }
      }

      let result = await buildPdfDocument(quality, maxDim);
      let sizeKb = Math.round(result.pdfBlob.size / 1024);

      if (sizeMode !== "original" && sizeKb > maxLimit) {
        setProgressMsg(`साइज़ सेट हो रहा है...`);
        let attempts = 0;
        while (sizeKb > maxLimit && attempts < 3) {
          attempts++;
          quality = Math.max(0.18, quality * (maxLimit / sizeKb) * 0.92);
          if (attempts > 1) maxDim = Math.max(750, Math.round(maxDim * 0.85));
          result = await buildPdfDocument(quality, maxDim);
          sizeKb = Math.round(result.pdfBlob.size / 1024);
        }
      }

      const blobUrl = URL.createObjectURL(result.pdfBlob);
      setLastGeneratedPdfBlob(result.pdfBlob);

      if (autoDownload) {
        const a = document.createElement("a");
        a.href = blobUrl;
        const downloadName = `ExamSewa-${pages.length}pages-${Math.round(result.pdfBlob.size / 1024)}kb.pdf`;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      return result.pdfBlob;

    } catch (err) {
      console.error(err);
      alert("PDF बनाने में त्रुटि हुई। कृपया पुनः प्रयास करें।");
      return null;
    } finally {
      setIsProcessing(false);
      setProgressMsg("");
    }
  };

  // वेब शेयर फ़ंक्शन
  const handleSharePdf = async () => {
    let blobToShare = lastGeneratedPdfBlob;
    if (!blobToShare) {
      blobToShare = await handleProcessPdf(false);
    }
    if (!blobToShare) return;

    const file = new File(
      [blobToShare],
      `ExamSewa-Document-${pages.length}-pages.pdf`,
      { type: "application/pdf" }
    );

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "ExamSewa A4 PDF",
          text: `ExamSewa से तैयार A4 PDF (${pages.length} पेज, ${Math.round(blobToShare.size / 1024)} KB)`,
        });
      } catch (e) {
        console.log("शेयर रद्द");
      }
    } else {
      alert("आपके डिवाइस में डायरेक्ट शेयरिंग समर्थित नहीं है। कृपया डाउनलोड बटन का उपयोग करें।");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-3 sm:py-6 px-2 sm:px-4 text-slate-800 select-none">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* हेडर */}
        <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs">
          <Link href="/" className="text-xs sm:text-sm font-semibold text-blue-600 hover:underline">
            ← होमपेज
          </Link>
          <div className="text-center">
            <h1 className="text-base sm:text-lg font-black text-slate-900">
              JPG to PDF Converter
            </h1>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              तस्वीरों को क्रमबद्ध करके मानक A4 PDF में बदलें
            </p>
          </div>
          <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
            A4 सरकारी PDF
          </span>
        </div>

        {/* खाली अपलोड कार्ड */}
        {pages.length === 0 && (
          <div className="bg-white border-2 border-dashed border-blue-400 rounded-3xl p-8 sm:p-14 text-center max-w-2xl mx-auto shadow-xs space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-inner">
              📄
            </div>
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                तस्वीरें चुनें या यहाँ खींच कर छोड़ें
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                मार्कशीट, आधार कार्ड, दस्तावेज़ या कई फ़ोटो एक साथ जोड़ें (JPG, JPEG, PNG)
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFiles(e.target.files, false)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition transform active:scale-95 cursor-pointer inline-flex items-center gap-2"
              >
                <span>📁</span> फ़ोटो चुनें (Select Images)
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              ⚡ 100% प्राइवेट: आपकी फ़ाइलें आपके डिवाइस में ही सुरक्षित रहती हैं
            </p>
          </div>
        )}

        {/* फ़ाइलें लोड होने पर लेआउट */}
        {pages.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* बायाँ हिस्सा: ग्रिड */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  कुल <span className="text-blue-600 font-black">{pages.length}</span> पेज जुड़े
                </span>

                <div className="flex items-center gap-2">
                  <input
                    ref={addMoreInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFiles(e.target.files, true)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => addMoreInputRef.current?.click()}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-xs border border-blue-200 flex items-center gap-1 cursor-pointer"
                  >
                    <span>➕</span> और जोड़ें
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPages([]); setLastGeneratedPdfBlob(null); }}
                    className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold text-xs border border-rose-200 cursor-pointer"
                  >
                    सब हटाएँ
                  </button>
                </div>
              </div>

              {/* ग्रिड कार्ड्स */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {pages.map((page, idx) => (
                  <div
                    key={page.id}
                    className="bg-slate-50 border border-slate-300 rounded-xl p-2 relative flex flex-col justify-between shadow-xs hover:border-blue-400 transition"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-md">
                        पेज {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePage(page.id)}
                        className="w-5 h-5 flex items-center justify-center bg-rose-100 text-rose-700 rounded-full hover:bg-rose-200 font-black text-xs cursor-pointer"
                        title="हटाएँ"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="h-36 sm:h-44 w-full bg-white rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center p-1 my-1">
                      <img
                        src={page.dataUrl}
                        alt={`पेज ${idx + 1}`}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1 gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => movePage(idx, "left")}
                        className={`flex-1 py-1 rounded text-xs font-bold border flex items-center justify-center ${
                          idx === 0
                            ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer"
                        }`}
                        title="आगे खिसकाएँ"
                      >
                        ← आगे
                      </button>
                      <button
                        type="button"
                        disabled={idx === pages.length - 1}
                        onClick={() => movePage(idx, "right")}
                        className={`flex-1 py-1 rounded text-xs font-bold border flex items-center justify-center ${
                          idx === pages.length - 1
                            ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer"
                        }`}
                        title="पीछे खिसकाएँ"
                      >
                        पीछे →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* दायाँ हिस्सा: सेटिंग्स शेल्फ़ */}
            <div className="lg:col-span-4 bg-white border-2 border-slate-900 rounded-2xl p-3.5 sm:p-4 shadow-md space-y-4">
              
              <div className="border-b pb-1.5 flex justify-between items-center">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  PDF सेटिंग्स (Controls)
                </span>
                <span className="text-[11px] font-bold text-slate-500">A4 मानक</span>
              </div>

              {/* 1. ओरिएंटेशन */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  पेज लेआउट (Orientation):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setOrientation("portrait"); setLastGeneratedPdfBlob(null); }}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      orientation === "portrait"
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>📄</span> Portrait (खड़ा)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOrientation("landscape"); setLastGeneratedPdfBlob(null); }}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      orientation === "landscape"
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>📃</span> Landscape (आड़ा)
                  </button>
                </div>
              </div>

              {/* 2. मार्जिन */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  पेज मार्जिन:
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  {[
                    { label: "0mm (पूर्ण)", val: 0 },
                    { label: "5mm (छोटा)", val: 5 },
                    { label: "10mm (बड़ा)", val: 10 },
                  ].map((m) => (
                    <button
                      key={m.val}
                      type="button"
                      onClick={() => { setMargin(m.val); setLastGeneratedPdfBlob(null); }}
                      className={`py-1.5 font-bold rounded-lg border text-center transition cursor-pointer ${
                        margin === m.val
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. पक्का साइज़ नियम */}
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 space-y-2.5">
                <div className="flex justify-between items-center text-xs font-bold text-blue-950">
                  <span>टारगेट साइज़ नियम:</span>
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[11px] font-black">
                    {sizeMode === "original"
                      ? "मूल / HD"
                      : sizeMode === "custom"
                      ? `कस्टम: ${customKb} KB`
                      : `${sizeMode} KB के अंदर`}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  {[
                    { id: "50", label: "अंडर 50 KB" },
                    { id: "100", label: "अंडर 100 KB" },
                    { id: "200", label: "अंडर 200 KB" },
                    { id: "300", label: "अंडर 300 KB" },
                    { id: "original", label: "मूल / HD" },
                    { id: "custom", label: "✏️ कस्टम KB" },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => {
                        setSizeMode(btn.id as PresetMode);
                        setLastGeneratedPdfBlob(null);
                      }}
                      className={`py-2 px-1 font-bold rounded-lg border text-center transition cursor-pointer ${
                        sizeMode === btn.id
                          ? "bg-blue-700 text-white border-blue-700 shadow-xs"
                          : "bg-white text-blue-950 border-blue-200 hover:bg-blue-100"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {sizeMode === "custom" ? (
                  <div className="pt-2 border-t border-blue-200 space-y-1">
                    <div className="flex justify-between text-xs font-bold text-blue-900">
                      <span>कस्टम साइज़ चुनें:</span>
                      <span>{customKb} KB</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="1000"
                      step="10"
                      value={customKb}
                      onChange={(e) => {
                        setCustomKb(Number(e.target.value));
                        setLastGeneratedPdfBlob(null);
                      }}
                      className="w-full accent-blue-700 cursor-pointer"
                    />
                  </div>
                ) : (
                  <p className="text-[10px] text-blue-800 font-medium">
                    🔒 {sizeMode === "original" ? "मूल हाई-क्वालिटी सुरक्षित है।" : `PDF का कुल साइज़ ${sizeMode} KB के भीतर ही रहेगा।`}
                  </p>
                )}
              </div>

              {/* 4. एक ही लाइन में दोनों बटन (डाउनलोड और शेयर) */}
              <div className="pt-2 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  
                  {/* डाउनलोड बटन */}
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleProcessPdf(true)}
                    className={`sm:col-span-7 py-3 px-2 rounded-xl font-black text-xs sm:text-sm text-white shadow-md flex items-center justify-center gap-1.5 transition transform active:scale-95 cursor-pointer ${
                      isProcessing
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {isProcessing ? (
                      <span>⏳ {progressMsg}</span>
                    ) : (
                      <>
                        <span>📥</span>
                        <span>डाउनलोड PDF</span>
                        <span className="bg-emerald-800 text-emerald-100 text-[10px] px-1.5 py-0.5 rounded font-bold ml-0.5">
                          {currentDisplayKb}
                        </span>
                      </>
                    )}
                  </button>

                  {/* शेयर बटन */}
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleSharePdf}
                    className="sm:col-span-5 py-3 px-2 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <span>🔗</span>
                    <span>शेयर करें</span>
                  </button>

                </div>

                {lastGeneratedPdfBlob && (
                  <p className="text-center text-[11px] font-bold text-emerald-700 bg-emerald-50 py-1 rounded-lg border border-emerald-200">
                    ✓ फ़ाइल साइज़: {Math.round(lastGeneratedPdfBlob.size / 1024)} KB (डाउनलोड संपन्न)
                  </p>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}
