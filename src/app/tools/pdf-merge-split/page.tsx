"use client";

import { useState, ChangeEvent } from "react";
import { PDFDocument } from "pdf-lib";

interface PdfFileItem {
  id: string;
  name: string;
  bytes: Uint8Array;
  pageCount: number;
}

export default function PdfMergeSplitPage() {
  const [activeTab, setActiveTab] = useState<"merge" | "split">("merge");

  // Merge State
  const [mergeFiles, setMergeFiles] = useState<PdfFileItem[]>([]);
  const [mergeBusy, setMergeBusy] = useState(false);
  const [mergeDownloadUrl, setMergeDownloadUrl] = useState<string | null>(null);

  // Split State
  const [splitFile, setSplitFile] = useState<PdfFileItem | null>(null);
  const [splitRange, setSplitRange] = useState<string>("");
  const [splitBusy, setSplitBusy] = useState(false);
  const [splitDownloadUrl, setSplitDownloadUrl] = useState<string | null>(null);
  const [splitError, setSplitError] = useState<string>("");

  // Handle Multi-file Upload for Merge
  const handleMergeUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (mergeDownloadUrl) URL.revokeObjectURL(mergeDownloadUrl);
    setMergeDownloadUrl(null);

    const loaded: PdfFileItem[] = [];
    for (const f of Array.from(files)) {
      try {
        const arr = new Uint8Array(await f.arrayBuffer());
        const pdf = await PDFDocument.load(arr);
        loaded.push({
          id: Math.random().toString(36).substring(2, 9),
          name: f.name,
          bytes: arr,
          pageCount: pdf.getPageCount(),
        });
      } catch {
        alert(`${f.name} लोड करने में समस्या आई।`);
      }
    }
    setMergeFiles((prev) => [...prev, ...loaded]);
  };

  const removeMergeFile = (id: string) => {
    setMergeFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const moveMergeFile = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= mergeFiles.length) return;
    const updated = [...mergeFiles];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setMergeFiles(updated);
  };

  const runMerge = async () => {
    if (mergeFiles.length < 2) {
      alert("कम से कम 2 PDF जोड़ना आवश्यक है।");
      return;
    }
    setMergeBusy(true);

    try {
      const mergedPdf = await PDFDocument.create();
      for (const item of mergeFiles) {
        const doc = await PDFDocument.load(item.bytes);
        const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
        copiedPages.forEach((p) => mergedPdf.addPage(p));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (mergeDownloadUrl) URL.revokeObjectURL(mergeDownloadUrl);
      setMergeDownloadUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      alert("PDF Merge करने में त्रुटि आई।");
    } finally {
      setMergeBusy(false);
    }
  };

  // Handle Single File Upload for Split
  const handleSplitUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (splitDownloadUrl) URL.revokeObjectURL(splitDownloadUrl);
    setSplitDownloadUrl(null);
    setSplitError("");

    try {
      const arr = new Uint8Array(await f.arrayBuffer());
      const pdf = await PDFDocument.load(arr);
      setSplitFile({
        id: "split-target",
        name: f.name,
        bytes: arr,
        pageCount: pdf.getPageCount(),
      });
      setSplitRange(`1-${Math.min(pdf.getPageCount(), 2)}`);
    } catch {
      alert("PDF फाइल पढ़ने में त्रुटि आई।");
    }
  };

  const runSplit = async () => {
    if (!splitFile) return;
    setSplitBusy(true);
    setSplitError("");

    try {
      const doc = await PDFDocument.load(splitFile.bytes);
      const total = doc.getPageCount();

      // Parse range string (e.g., "1-3, 5")
      const pagesToExtract = new Set<number>();
      const parts = splitRange.split(",").map((s) => s.trim());

      for (const part of parts) {
        if (part.includes("-")) {
          const [startStr, endStr] = part.split("-").map((s) => s.trim());
          const start = parseInt(startStr, 10);
          const end = parseInt(endStr, 10);
          if (isNaN(start) || isNaN(end) || start > end || start < 1 || end > total) {
            throw new Error(`अमान्य पेज रेंज: "${part}" (कुल पेज: ${total})`);
          }
          for (let i = start; i <= end; i++) pagesToExtract.add(i - 1);
        } else {
          const pageNum = parseInt(part, 10);
          if (isNaN(pageNum) || pageNum < 1 || pageNum > total) {
            throw new Error(`अमान्य पेज नंबर: "${part}" (कुल पेज: ${total})`);
          }
          pagesToExtract.add(pageNum - 1);
        }
      }

      const indices = Array.from(pagesToExtract).sort((a, b) => a - b);
      if (indices.length === 0) throw new Error("कोई मान्य पेज नहीं चुना गया।");

      const splitPdf = await PDFDocument.create();
      const copied = await splitPdf.copyPages(doc, indices);
      copied.forEach((p) => splitPdf.addPage(p));

      const splitBytes = await splitPdf.save();
      const blob = new Blob([splitBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (splitDownloadUrl) URL.revokeObjectURL(splitDownloadUrl);
      setSplitDownloadUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setSplitError(err.message || "Split प्रक्रिया में त्रुटि आई।");
    } finally {
      setSplitBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 text-slate-800">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center">
          PDF Merge & Split
        </h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          PDF फाइलों को जोड़ें या पसंदीदा पेजों को अलग निकालें
        </p>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 mt-6 mb-6">
          <button
            onClick={() => setActiveTab("merge")}
            className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition ${
              activeTab === "merge"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            📑 PDF Merge (फाइलें जोड़ें)
          </button>
          <button
            onClick={() => setActiveTab("split")}
            className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition ${
              activeTab === "split"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            ✂️ PDF Split (पेज अलग करें)
          </button>
        </div>

        {/* MERGE TAB CONTENT */}
        {activeTab === "merge" && (
          <div>
            <div className="border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-xl p-6 text-center">
              <input
                type="file"
                accept=".pdf,application/pdf"
                multiple
                id="mergeInput"
                onChange={handleMergeUpload}
                className="hidden"
              />
              <label
                htmlFor="mergeInput"
                className="cursor-pointer inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                ➕ PDF फाइलें चुनें (एक साथ कई)
              </label>
            </div>

            {mergeFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-xs font-bold text-slate-600 uppercase">
                  जोड़ने के लिए फाइलें ({mergeFiles.length})
                </p>
                {mergeFiles.map((file, idx) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold truncate max-w-xs sm:max-w-md">{file.name}</p>
                      <p className="text-xs text-slate-500">{file.pageCount} पेज</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => moveMergeFile(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 text-slate-500 hover:text-blue-600 disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveMergeFile(idx, "down")}
                        disabled={idx === mergeFiles.length - 1}
                        className="p-1 text-slate-500 hover:text-blue-600 disabled:opacity-30"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => removeMergeFile(file.id)}
                        className="p-1 text-red-500 hover:text-red-700 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={runMerge}
                  disabled={mergeBusy || mergeFiles.length < 2}
                  className="w-full mt-4 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {mergeBusy ? "PDF जोड़ी जा रही है..." : "सभी PDF जोड़ें (Merge PDF)"}
                </button>
              </div>
            )}

            {mergeDownloadUrl && (
              <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-center">
                <p className="text-sm font-bold text-green-800">PDF सफलतापूर्वक जुड़ गई!</p>
                <a
                  href={mergeDownloadUrl}
                  download="studysetu-merged.pdf"
                  className="inline-block mt-3 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition"
                >
                  📥 डाउनलोड Merged PDF
                </a>
              </div>
            )}
          </div>
        )}

        {/* SPLIT TAB CONTENT */}
        {activeTab === "split" && (
          <div>
            <div className="border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-xl p-6 text-center">
              <input
                type="file"
                accept=".pdf,application/pdf"
                id="splitInput"
                onChange={handleSplitUpload}
                className="hidden"
              />
              <label
                htmlFor="splitInput"
                className="cursor-pointer inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                📄 PDF फाइल चुनें
              </label>
            </div>

            {splitFile && (
              <div className="mt-6 space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-sm font-bold text-slate-800 truncate">{splitFile.name}</p>
                  <p className="text-xs text-slate-500">कुल पेज: <strong>{splitFile.pageCount}</strong></p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    कौन से पेज अलग करने हैं? (पेज रेंज दर्ज करें)
                  </label>
                  <input
                    type="text"
                    value={splitRange}
                    onChange={(e) => setSplitRange(e.target.value)}
                    placeholder="उदा. 1-3, 5, 8"
                    className="w-full border border-slate-300 p-2.5 rounded-lg text-sm"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    उदाहरण: <strong>1-3</strong> (पेज 1 से 3) या <strong>1, 4, 7</strong>
                  </p>
                </div>

                {splitError && (
                  <p className="text-xs text-red-600 font-semibold">{splitError}</p>
                )}

                <button
                  onClick={runSplit}
                  disabled={splitBusy}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {splitBusy ? "पेज अलग हो रहे हैं..." : "पेज अलग करें (Split PDF)"}
                </button>
              </div>
            )}

            {splitDownloadUrl && (
              <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-center">
                <p className="text-sm font-bold text-green-800">पेज सफलतापूर्वक अलग कर दिए गए!</p>
                <a
                  href={splitDownloadUrl}
                  download="studysetu-split.pdf"
                  className="inline-block mt-3 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition"
                >
                  📥 डाउनलोड Split PDF
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
