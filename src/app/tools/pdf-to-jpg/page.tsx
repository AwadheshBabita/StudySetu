"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import JSZip from "jszip";

interface PdfPageItem {
  id: string;
  sourceFileName: string;
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
  selected: boolean;
  rotation: number;
}

export default function PdfToJpgPage() {
  const [pages, setPages] = useState<PdfPageItem[]>([]);
  const [scaleDpi, setScaleDpi] = useState<number>(4.167); // 4.167 = True 300 DPI Ultra HD, 2.083 = 150 DPI Normal
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>("");
  const [pdfJsReady, setPdfJsReady] = useState<boolean>(false);

  const uploadedFilesRef = useRef<{ name: string; buffer: ArrayBuffer }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PDF.js लोड करना
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ((window as any).pdfjsLib) {
        setPdfJsReady(true);
      } else {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = () => {
          const pdfjsLib = (window as any).pdfjsLib;
          if (pdfjsLib) {
            pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            setPdfJsReady(true);
          }
        };
        document.body.appendChild(script);
      }
    }
  }, []);

  // PDF रेंडरिंग पाइपलाइन (हाई रेज़ोल्यूशन 300 DPI)
  const renderPdfFiles = async (
    files: { name: string; buffer: ArrayBuffer }[],
    scale: number
  ) => {
    const pdfjsLib = (window as any).pdfjsLib;
    if (!pdfjsLib) return;

    setIsProcessing(true);
    const newPages: PdfPageItem[] = [];

    try {
      let totalPages = 0;
      for (const f of files) {
        const loadingTask = pdfjsLib.getDocument({ data: f.buffer.slice(0) });
        const doc = await loadingTask.promise;
        totalPages += doc.numPages;
      }

      let processedCount = 0;

      for (const f of files) {
        const loadingTask = pdfjsLib.getDocument({ data: f.buffer.slice(0) });
        const pdfDoc = await loadingTask.promise;

        for (let pNum = 1; pNum <= pdfDoc.numPages; pNum++) {
          processedCount++;
          setProgressText(
            `पेज प्रोसेस हो रहा है: ${processedCount}/${totalPages} (${scale > 3.0 ? "300 DPI अल्ट्रा HD" : "150 DPI"})`
          );

          const page = await pdfDoc.getPage(pNum);
          const viewport = page.getViewport({ scale: scale });

          const canvas = document.createElement("canvas");
          canvas.width = Math.round(viewport.width);
          canvas.height = Math.round(viewport.height);

          const ctx = canvas.getContext("2d", { alpha: false });
          if (!ctx) continue;

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          await page.render({
            canvasContext: ctx,
            viewport: viewport,
          }).promise;

          const quality = scale > 3.0 ? 0.98 : 0.92;
          const dataUrl = canvas.toDataURL("image/jpeg", quality);

          newPages.push({
            id: `${f.name}_page_${pNum}_${Date.now()}_${Math.random()}`,
            sourceFileName: f.name.replace(/\.[^/.]+$/, ""),
            pageNumber: pNum,
            dataUrl: dataUrl,
            width: viewport.width,
            height: viewport.height,
            selected: true,
            rotation: 0,
          });
        }
      }

      setPages(newPages);
    } catch (err) {
      console.error(err);
      alert("PDF प्रोसेस करने में त्रुटि आई। कृपया फ़ाइल जांचें।");
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const filesArray: { name: string; buffer: ArrayBuffer }[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        const buffer = await file.arrayBuffer();
        filesArray.push({ name: file.name, buffer });
      }
    }

    if (filesArray.length === 0) {
      alert("कृपया केवल वैध PDF फ़ाइलें ही चुनें!");
      return;
    }

    uploadedFilesRef.current = filesArray;
    await renderPdfFiles(filesArray, scaleDpi);
  };

  const changeDpi = async (newScale: number) => {
    if (newScale === scaleDpi) return;
    setScaleDpi(newScale);
    if (uploadedFilesRef.current.length > 0) {
      await renderPdfFiles(uploadedFilesRef.current, newScale);
    }
  };

  // सिंगल JPG डाउनलोड
  const downloadSingleJpg = (item: PdfPageItem) => {
    const link = document.createElement("a");
    const dpiLabel = scaleDpi > 3.0 ? "300dpi" : "150dpi";
    link.download = `ExamSewa_${item.sourceFileName}_Page_${item.pageNumber}_${dpiLabel}.jpg`;
    link.href = item.dataUrl;
    link.click();
  };

  // सिंगल शेयर (Web Share API)
  const shareSinglePage = async (item: PdfPageItem) => {
    try {
      const dpiLabel = scaleDpi > 3.0 ? "300dpi" : "150dpi";
      const fileName = `ExamSewa_${item.sourceFileName}_Page_${item.pageNumber}_${dpiLabel}.jpg`;

      const res = await fetch(item.dataUrl);
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: "image/jpeg" });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "ExamSewa PDF to JPG",
          text: `ExamSewa टूल से तैयार JPG: ${item.sourceFileName} (पेज ${item.pageNumber})`,
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: "ExamSewa PDF to JPG",
          text: `ExamSewa टूल से तैयार JPG इमेज`,
          url: window.location.href,
        });
      } else {
        downloadSingleJpg(item);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        downloadSingleJpg(item);
      }
    }
  };

  // 💥 टूलबार से सभी JPG एक-एक करके डायरेक्ट डाउनलोड
  const downloadAllAsJpgFiles = async () => {
    const selectedList = pages.filter((p) => p.selected);
    if (selectedList.length === 0) {
      alert("कृपया कम से कम एक पेज चुनें!");
      return;
    }

    const dpiLabel = scaleDpi > 3.0 ? "300dpi" : "150dpi";
    selectedList.forEach((item, index) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.download = `ExamSewa_${item.sourceFileName}_Page_${item.pageNumber}_${dpiLabel}.jpg`;
        link.href = item.dataUrl;
        link.click();
      }, index * 200); // ब्राउज़र डाउनलोड ब्लॉक न करे इसलिए 200ms का सुरक्षित अंतराल
    });
  };

  // 💥 टूलबार से बैच शेयर (सभी चुनिंदा फाइल्स को एक साथ शेयर करना)
  const shareSelectedBatch = async () => {
    const selectedList = pages.filter((p) => p.selected);
    if (selectedList.length === 0) {
      alert("कृपया कम से कम एक पेज चुनें!");
      return;
    }

    try {
      const dpiLabel = scaleDpi > 3.0 ? "300dpi" : "150dpi";
      const files: File[] = [];

      for (const item of selectedList) {
        const res = await fetch(item.dataUrl);
        const blob = await res.blob();
        files.push(
          new File(
            [blob],
            `ExamSewa_${item.sourceFileName}_Page_${item.pageNumber}_${dpiLabel}.jpg`,
            { type: "image/jpeg" }
          )
        );
      }

      if (navigator.share && navigator.canShare && navigator.canShare({ files })) {
        await navigator.share({
          title: "ExamSewa PDF to JPG",
          text: `ExamSewa से तैयार ${selectedList.length} JPG दस्तावेज़`,
          files,
        });
      } else if (navigator.share) {
        await navigator.share({
          title: "ExamSewa PDF to JPG",
          text: `ExamSewa PDF to JPG कन्वर्टर`,
          url: window.location.href,
        });
      } else {
        downloadAllAsJpgFiles();
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        downloadAllAsJpgFiles();
      }
    }
  };

  // 1-क्लिक बल्क ZIP डाउनलोड
  const downloadAllAsZip = async () => {
    const selectedList = pages.filter((p) => p.selected);
    if (selectedList.length === 0) {
      alert("कृपया कम से कम एक पेज चुनें!");
      return;
    }

    try {
      setIsZipping(true);
      const zip = new JSZip();
      const dpiLabel = scaleDpi > 3.0 ? "300dpi" : "150dpi";

      for (const item of selectedList) {
        const base64 = item.dataUrl.split(",")[1];
        zip.file(
          `ExamSewa_${item.sourceFileName}_Page_${item.pageNumber}_${dpiLabel}.jpg`,
          base64,
          { base64: true }
        );
      }

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `ExamSewa_PDF_to_JPG_${dpiLabel}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error(err);
      alert("ZIP फ़ाइल बनाने में त्रुटि आई!");
    } finally {
      setIsZipping(false);
    }
  };

  // पेज रोटेशन
  const rotatePage = (id: string) => {
    setPages((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newRot = (item.rotation + 90) % 360;

        const img = new Image();
        img.src = item.dataUrl;
        img.onload = () => {
          const c = document.createElement("canvas");
          const ctx = c.getContext("2d", { alpha: false });
          if (!ctx) return;
          c.width = img.height;
          c.height = img.width;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, c.width, c.height);
          ctx.translate(c.width / 2, c.height / 2);
          ctx.rotate((90 * Math.PI) / 180);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);

          const newUrl = c.toDataURL("image/jpeg", scaleDpi > 3.0 ? 0.98 : 0.92);
          setPages((latest) =>
            latest.map((p) => (p.id === id ? { ...p, dataUrl: newUrl, rotation: newRot } : p))
          );
        };
        return { ...item, rotation: newRot };
      })
    );
  };

  const toggleSelect = (id: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const selectAll = (status: boolean) => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: status })));
  };

  return (
    <main className="min-h-screen bg-slate-50 py-3 sm:py-6 px-2 sm:px-4 text-slate-800 select-none">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* हेडर बार */}
        <header className="bg-white rounded-2xl border-2 border-slate-900 p-3 sm:p-4 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-300 transition-all"
            >
              ← होम
            </Link>
            <div className="flex flex-col">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>ExamSewa</span>
                <span className="text-blue-600 font-bold">PDF to JPG</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200 font-bold">
                  अल्ट्रा HD
                </span>
              </h1>
            </div>
          </div>

          {pages.length > 0 && (
            <button
              onClick={() => {
                setPages([]);
                uploadedFilesRef.current = [];
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition-all cursor-pointer"
            >
              ✕ रीसेट
            </button>
          )}
        </header>

        {/* मुख्य 12-कॉलम ग्रिड लेआउट (JPG to PDF के समान) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* बायाँ मुख्य प्रीव्यू पैनल (कॉलम 1 से 8) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* अपलोड बॉक्स */}
            {pages.length === 0 && (
              <div className="bg-white border-2 border-dashed border-blue-400 hover:border-blue-600 rounded-3xl p-6 sm:p-12 text-center shadow-sm transition-all flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-4xl mb-4 shadow-inner">
                  📄
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                  PDF से ओरिजिनल HD JPG बनाएं
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold mb-6 max-w-md">
                  एक या एक साथ कई PDF फाइलें चुनें। 300 DPI अल्ट्रा क्लैरिटी के साथ सिंगल JPG या पूरा ZIP डाउनलोड करें।
                </p>

                <label className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-200 cursor-pointer transition-all flex items-center justify-center gap-2">
                  <span>📁 PDF फाइलें चुनें (मल्टीपल)</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={handleFileUpload}
                    disabled={!pdfJsReady || isProcessing}
                    className="hidden"
                  />
                </label>

                {!pdfJsReady && (
                  <p className="text-[11px] text-amber-600 font-bold mt-3 animate-pulse">
                    इंजन लोड हो रहा है, कृपया 2 सेकंड प्रतीक्षा करें...
                  </p>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-8 pt-6 border-t border-slate-100 text-left text-[11px] font-bold text-slate-600 w-full">
                  <div>✓ 300 DPI अल्ट्रा क्रिस्प</div>
                  <div>✓ मल्टीपल PDF सपोर्ट</div>
                  <div>✓ 1-क्लिक ZIP एक्सपोर्ट</div>
                  <div>✓ डायरेक्ट सिंगल JPG</div>
                  <div>✓ नेटिव शेयर (WhatsApp/Mail)</div>
                  <div>✓ 100% सेफ व प्राइवेट</div>
                </div>
              </div>
            )}

            {/* प्रगति पट्टी (Processing) */}
            {isProcessing && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center shadow-sm">
                <div className="inline-block animate-spin text-2xl mb-1">⚙️</div>
                <p className="text-xs sm:text-sm font-black text-blue-900">{progressText}</p>
              </div>
            )}

            {/* पेजों का मुख्य ग्रिड प्रीव्यू (grid-cols-2 sm:grid-cols-3) */}
            {pages.length > 0 && (
              <div className="bg-slate-200/90 rounded-2xl border-2 border-slate-300 shadow-inner p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3 px-1 text-xs font-black text-slate-700">
                  <span>कुल पृष्ठ: {pages.length}</span>
                  <span>क्वालिटी: {scaleDpi > 3.0 ? "✨ 300 DPI (अल्ट्रा HD)" : "150 DPI"}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {pages.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-xl border-2 transition-all p-2 sm:p-2.5 flex flex-col justify-between shadow-xs hover:shadow-md ${
                        item.selected ? "border-slate-900" : "border-slate-200 opacity-60"
                      }`}
                    >
                      {/* कार्ड का ऊपरी बार */}
                      <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-100">
                        <label className="flex items-center gap-1.5 cursor-pointer overflow-hidden">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggleSelect(item.id)}
                            className="w-3.5 h-3.5 rounded text-blue-600 accent-blue-600 cursor-pointer"
                          />
                          <span className="text-[11px] font-black text-slate-800 truncate max-w-[90px] sm:max-w-[120px]">
                            {item.sourceFileName}
                          </span>
                        </label>

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            P{item.pageNumber}
                          </span>
                          <button
                            onClick={() => rotatePage(item.id)}
                            title="90° घुमाएँ"
                            className="p-1 hover:bg-slate-100 rounded text-slate-600 text-[10px] cursor-pointer"
                          >
                            🔄
                          </button>
                        </div>
                      </div>

                      {/* इमेज थंबनेल */}
                      <div className="w-full bg-slate-50 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center p-1 mb-2 h-44 sm:h-52">
                        <img
                          src={item.dataUrl}
                          alt={`Page ${item.pageNumber}`}
                          className="max-h-full max-w-full object-contain rounded shadow-2xs bg-white"
                        />
                      </div>

                      {/* सिंगल डाउनलोड व शेयर बटन्स */}
                      <div className="grid grid-cols-2 gap-1.5 mt-auto">
                        <button
                          onClick={() => downloadSingleJpg(item)}
                          className="py-1.5 px-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-[10px] sm:text-xs rounded-lg shadow-2xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                        >
                          <span>📥</span>
                          <span>JPG</span>
                        </button>

                        <button
                          onClick={() => shareSinglePage(item)}
                          className="py-1.5 px-1 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold text-[10px] sm:text-xs rounded-lg shadow-2xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                        >
                          <span>🔗</span>
                          <span>शेयर</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* दायाँ साइडबार / टूल्स पैनल (कॉलम 9 से 12) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border-2 border-slate-900 shadow-md p-3 sm:p-4 space-y-4 lg:sticky lg:top-4">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 pb-2 border-b border-slate-200 flex items-center justify-between">
              <span>⚙️ कन्वर्जन सेटिंग्स</span>
              {pages.length > 0 && (
                <span className="text-[11px] font-bold text-blue-600">
                  {pages.filter((p) => p.selected).length}/{pages.length} चयनित
                </span>
              )}
            </h3>

            {/* DPI चयन */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">क्वालिटी (DPI)</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => changeDpi(2.083)}
                  disabled={isProcessing}
                  className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    scaleDpi < 3.0
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                  }`}
                >
                  नॉर्मल (150 DPI)
                </button>
                <button
                  onClick={() => changeDpi(4.167)}
                  disabled={isProcessing}
                  className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    scaleDpi > 3.0
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                  }`}
                >
                  ✨ अल्ट्रा HD (300 DPI)
                </button>
              </div>
            </div>

            {/* पेज सेलेक्शन कंट्रोल्स */}
            {pages.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>पेज चयन:</span>
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => selectAll(true)}
                      className="text-blue-600 hover:underline font-black cursor-pointer"
                    >
                      सभी चुनें
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => selectAll(false)}
                      className="text-slate-500 hover:underline font-black cursor-pointer"
                    >
                      हटाएं
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                  आप किसी भी पेज को अनचेक करके केवल ज़रूरी पेज डाउनलोड कर सकते हैं।
                </p>
              </div>
            )}

            {/* मुख्य एक्शन बटन्स: ZIP, JPG और शेयर */}
            {pages.length > 0 && (
              <div className="pt-2 space-y-2">
                {/* 1. ZIP डाउनलोड बटन */}
                <button
                  onClick={downloadAllAsZip}
                  disabled={isZipping || isProcessing || pages.filter((p) => p.selected).length === 0}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-base">📦</span>
                  <span>{isZipping ? "ZIP तैयार हो रही है..." : "सभी डाउनलोड (.ZIP)"}</span>
                </button>

                {/* 2. सभी JPG और शेयर बटन (दो कॉलम ग्रिड) */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={downloadAllAsJpgFiles}
                    disabled={isProcessing || pages.filter((p) => p.selected).length === 0}
                    className="py-2.5 px-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>📥</span>
                    <span>सभी JPG</span>
                  </button>

                  <button
                    onClick={shareSelectedBatch}
                    disabled={isProcessing || pages.filter((p) => p.selected).length === 0}
                    className="py-2.5 px-2 bg-slate-800 hover:bg-slate-900 active:scale-98 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>🔗</span>
                    <span>शेयर करें</span>
                  </button>
                </div>
              </div>
            )}

            {/* और फाइलें जोड़ें बटन */}
            {pages.length > 0 && (
              <div>
                <label className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                  <span>➕ और PDF फाइलें जोड़ें</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* फीचर्स सूची */}
            <div className="pt-2 border-t border-slate-100 text-[11px] font-bold text-slate-500 space-y-1">
              <div>✓ 100% ब्राउज़र-साइड प्रोसेस (प्राइवेट)</div>
              <div>✓ सिंगल JPG और बल्क ZIP डाउनलोड</div>
              <div>✓ WhatsApp व ईमेल पर सीधा शेयर</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
