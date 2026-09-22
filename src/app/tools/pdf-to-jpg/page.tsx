'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

interface ConvertedPage {
  pageNumber: number;
  dataUrl: string;
}

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState('');
  const [pages, setPages] = useState<ConvertedPage[]>([]);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPages([]);
      setProgress('');
    }
  };

  // Robust Dynamic PDF.js Loader
  const loadPdfJsScript = async (): Promise<any> => {
    if ((window as any).pdfjsLib) {
      return (window as any).pdfjsLib;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        const lib = (window as any).pdfjsLib;
        if (lib) {
          lib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          resolve(lib);
        } else {
          reject(new Error('PDF.js इंजन लोड नहीं हो सका'));
        }
      };
      script.onerror = () => reject(new Error('PDF.js स्क्रिप्ट लोड विफल'));
      document.head.appendChild(script);
    });
  };

  const convertPdfToJpg = async () => {
    if (!file) return;
    setIsProcessing(true);
    setPages([]);
    setProgress('PDF इंजन तैयार हो रहा है...');

    try {
      const pdfjsLib = await loadPdfJsScript();
      setProgress('PDF पढ़ी जा रही है...');

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;

      const converted: ConvertedPage[] = [];

      for (let i = 1; i <= totalPages; i++) {
        setProgress(`पेज ${i} / ${totalPages} हाई-रिज़ॉल्यूशन में तैयार हो रहा है...`);
        const page = await pdf.getPage(i);
        
        // 2.5x Scale: Ultra HD Studio Print Quality (Like iLovePDF)
        const viewport = page.getViewport({ scale: 2.5 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (context) {
          context.fillStyle = '#FFFFFF';
          context.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          converted.push({
            pageNumber: i,
            dataUrl: canvas.toDataURL('image/jpeg', 0.96),
          });
        }
      }

      setPages(converted);
      setProgress(`✅ कुल ${totalPages} पेज सफलतापूर्वक JPG में बदल गए!`);
    } catch (err: any) {
      console.error(err);
      setProgress('त्रुटि: PDF पढ़ने में समस्या आई। कृपया मान्य PDF चुनें।');
    } finally {
      setIsProcessing(false);
    }
  };

  // Direct Serial Download of all JPGs one-by-one (NO ZIP)
  const downloadAllJpgsDirectly = async () => {
    if (pages.length === 0 || isDownloadingAll) return;
    setIsDownloadingAll(true);

    const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'document';

    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const link = document.createElement('a');
      link.href = p.dataUrl;
      link.download = `${baseName}-page-${p.pageNumber}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 350ms delay between files to allow browser download queue to process cleanly
      if (i < pages.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    }

    setIsDownloadingAll(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-3 sm:px-6">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 text-center border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <Link href="/" className="text-xs font-bold text-slate-500 hover:text-slate-800">
              ← Back
            </Link>
            <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200/60">
              100% Free
            </span>
            <Link href="/" className="text-xs font-bold text-slate-500 hover:text-slate-800">
              🏠 Home
            </Link>
          </div>
          <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[11px] font-bold border border-amber-200">
            iLovePDF स्टाइल • बिना ZIP के सीधा JPG
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 leading-tight">
            PDF to JPG कनवर्टर (Ultra HD)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            हर पेज को अलग-अलग हाई-क्वालिटी JPG में बदलें और सीधे गैलरी/डाउनलोड में पाएँ
          </p>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          
          {/* File Upload Box */}
          <div className="border-2 border-dashed border-emerald-200 rounded-2xl p-5 text-center bg-emerald-50/30">
            <input
              type="file"
              accept="application/pdf"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition active:scale-95 flex items-center justify-center gap-2 mx-auto"
              >
                📄 PDF फ़ाइल चुनें
              </button>
              {file && (
                <p className="text-xs font-bold text-slate-700">
                  चयनित: <span className="text-emerald-700">{file.name}</span> ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>

          {/* Convert Action Button */}
          {file && (
            <button
              type="button"
              onClick={convertPdfToJpg}
              disabled={isProcessing}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-black shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? progress : '⚡ PDF के सभी पन्नों को JPG में बदलें'}
            </button>
          )}

          {/* Progress / Status Message */}
          {progress && !isProcessing && (
            <p className="text-xs text-center font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              {progress}
            </p>
          )}

          {/* Download & Results Section */}
          {pages.length > 0 && (
            <div className="space-y-4 pt-3 border-t border-slate-200">
              
              {/* Universal Master Download Button (Downloads each JPG directly, NO ZIP) */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 text-center shadow-lg">
                <p className="text-xs font-bold text-slate-300">
                  कुल {pages.length} पेज तैयार हैं — बिना किसी ZIP झंझट के
                </p>
                <button
                  type="button"
                  onClick={downloadAllJpgsDirectly}
                  disabled={isDownloadingAll}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm rounded-xl shadow transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDownloadingAll
                    ? '⏳ JPG फ़ाइलें डाउनलोड हो रही हैं...'
                    : `📥 सभी ${pages.length} पन्ने JPG डाउनलोड करें (1-क्लिक में)`}
                </button>
                <p className="text-[10px] text-slate-400">
                  सारे पेज एक-एक करके आपकी गैलरी/डाउनलोड्स में सीधे सेव होंगे
                </p>
              </div>

              {/* Individual Page Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {pages.map((p) => (
                  <div key={p.pageNumber} className="border border-slate-200 rounded-2xl p-3 bg-slate-50 space-y-2 shadow-sm">
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-inner">
                      <img
                        src={p.dataUrl}
                        alt={`Page ${p.pageNumber}`}
                        className="w-full h-auto object-contain max-h-56"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-black text-slate-700">
                        📄 पेज {p.pageNumber}
                      </span>
                      <a
                        href={p.dataUrl}
                        download={`${file?.name.replace(/\.[^/.]+$/, '') || 'page'}-${p.pageNumber}.jpg`}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow transition active:scale-95 flex items-center gap-1"
                      >
                        ⬇️ JPG डाउनलोड
                      </a>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
