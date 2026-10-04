"use client";

import { useState, ChangeEvent } from "react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";

interface PdfFileItem {
  id: string;
  name: string;
  bytes: Uint8Array;
  pageCount: number;
}

export default function PdfMergePage() {
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);

    const loaded: PdfFileItem[] = [];
    for (const f of Array.from(uploadedFiles)) {
      try {
        const arr = new Uint8Array(await f.arrayBuffer());
        const pdf = await PDFDocument.load(arr);
        loaded.push({
          id: Math.random().toString(36).substring(2, 9),
          name: f.name,
          bytes: arr,
          pageCount: pdf.getPageCount(),
        });
      } catch (err) {
        alert(`फ़ाइल "${f.name}" पढ़ने में असमर्थ। सुनिश्चित करें कि यह पासवर्ड से सुरक्षित न हो।`);
      }
    }
    setFiles((prev) => [...prev, ...loaded]);
  };

  const removeFile = (id: string) => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === files.length - 1)
    )
      return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...files];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFiles(updated);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      alert("कृपया जोड़ने के लिए कम से कम 2 PDF फ़ाइलें चुनें!");
      return;
    }

    setBusy(true);
    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of files) {
        const doc = await PDFDocument.load(item.bytes);
        const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: "application/pdf" });

      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err) {
      alert("PDF मर्ज करने में त्रुटि आई। कृपया फ़ाइलें जाँचें।");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* नेविगेशन */}
        <div className="flex items-center justify-between">
          <Link
            href="/tools/pdf-merge-split"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            &larr; PDF हब पर लौटें
          </Link>
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-200">
            मर्ज टूल
          </span>
        </div>

        {/* मुख्य कार्ड */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center justify-center sm:justify-start gap-2">
              <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700 text-lg">📑</span>
              PDF मर्ज करें (Merge PDF)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              कई PDF फ़ाइलों को एक साथ जोड़ें। आप ऊपर-नीचे करके क्रम भी बदल सकते हैं।
            </p>
          </div>

          {/* अपलोड फ़ील्ड */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              PDF फ़ाइलें चुनें (एक साथ कई चुन सकते हैं)
            </label>
            <input
              type="file"
              multiple
              accept="application/pdf"
              onChange={handleUpload}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:cursor-pointer border border-slate-200 rounded-xl p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* फ़ाइलों की सूची */}
          {files.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-slate-700">
                जोड़ी जाने वाली फ़ाइलें ({files.length}):
              </p>
              <div className="space-y-2">
                {files.map((f, idx) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2 overflow-hidden pr-2">
                      <span className="font-bold text-slate-400 w-5">{idx + 1}.</span>
                      <span className="font-semibold text-slate-800 truncate">{f.name}</span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">({f.pageCount} पेज)</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => moveFile(idx, "up")}
                        disabled={idx === 0}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-30 hover:bg-slate-100 font-bold"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveFile(idx, "down")}
                        disabled={idx === files.length - 1}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-30 hover:bg-slate-100 font-bold"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeFile(f.id)}
                        className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* एक्शन बटन */}
          <div>
            <button
              onClick={handleMerge}
              disabled={busy || files.length < 2}
              className="w-full py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  PDF फाइलें जोड़ी जा रही हैं...
                </>
              ) : (
                "📑 PDF फाइलें मर्ज करें"
              )}
            </button>
          </div>

          {/* डाउनलोड बॉक्स */}
          {downloadUrl && (
            <div className="p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-300 text-center space-y-3 animate-fade-in">
              <span className="text-2xl block">🎉</span>
              <div>
                <p className="text-xs sm:text-sm font-black text-indigo-900">
                  सफ़ल! आपकी सभी PDF फाइलें सफलतापूर्वक जोड़ दी गई हैं।
                </p>
              </div>
              <a
                href={downloadUrl}
                download="merged_document.pdf"
                className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md transition-all"
              >
                ⬇️ मर्ज की गई PDF डाउनलोड करें
              </a>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
