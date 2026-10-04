"use client";

import { useState, ChangeEvent } from "react";
import { PDFDocument } from "pdf-lib";

export default function PdfPasswordPage() {
  const [activeTab, setActiveTab] = useState<"unlock" | "lock">("unlock");

  // Unlock State
  const [unlockFile, setUnlockFile] = useState<File | null>(null);
  const [unlockPassword, setUnlockPassword] = useState<string>("");
  const [unlockBusy, setUnlockBusy] = useState(false);
  const [unlockDownloadUrl, setUnlockDownloadUrl] = useState<string | null>(null);
  const [unlockError, setUnlockError] = useState<string>("");

  // Lock State Info
  const [lockFile, setLockFile] = useState<File | null>(null);

  const handleUnlockFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (unlockDownloadUrl) URL.revokeObjectURL(unlockDownloadUrl);
    setUnlockDownloadUrl(null);
    setUnlockError("");
    setUnlockFile(f);
  };

  const runUnlock = async () => {
    if (!unlockFile || !unlockPassword) {
      alert("कृपया PDF फ़ाइल और उसका वर्तमान पासवर्ड दर्ज करें!");
      return;
    }
    setUnlockBusy(true);
    setUnlockError("");

    try {
      const bytes = new Uint8Array(await unlockFile.arrayBuffer());
      const pdfjs = (await import("pdfjs-dist/legacy/build/pdf.mjs")) as any;

      const loadingTask = pdfjs.getDocument({
        data: bytes,
        password: unlockPassword,
        disableWorker: true,
      });

      const sourceDoc = await loadingTask.promise;
      const totalPages = sourceDoc.numPages;

      const unlockedPdf = await PDFDocument.create();

      for (let i = 1; i <= totalPages; i++) {
        const page = await sourceDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context failed");

        await page.render({ canvasContext: ctx, viewport }).promise;

        const jpgBlob = await new Promise<Blob>((res, rej) => {
          canvas.toBlob((b) => (b ? res(b) : rej(new Error("Render failed"))), "image/jpeg", 0.92);
        });

        const jpgBytes = new Uint8Array(await jpgBlob.arrayBuffer());
        const embeddedImg = await unlockedPdf.embedJpg(jpgBytes);

        const outPage = unlockedPdf.addPage([viewport.width, viewport.height]);
        outPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });
      }

      const cleanBytes = await unlockedPdf.save();
      const blob = new Blob([cleanBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (unlockDownloadUrl) URL.revokeObjectURL(unlockDownloadUrl);
      setUnlockDownloadUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      console.error(err);
      setUnlockError("पासवर्ड गलत है या PDF अनलॉक नहीं हो सकी। कृपया पासवर्ड जाँचें।");
    } finally {
      setUnlockBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 text-slate-800">
      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center">
          PDF Password Remover & Security
        </h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          पासवर्ड डालकर PDF से लॉक हमेशा के लिए हटाएँ (100% सुरक्षित और इन-डिवाइस)
        </p>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 mt-6 mb-6">
          <button
            onClick={() => setActiveTab("unlock")}
            className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition ${
              activeTab === "unlock"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            🔓 PDF अनलॉक करें (Remove Password)
          </button>
          <button
            onClick={() => setActiveTab("lock")}
            className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition ${
              activeTab === "lock"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            🔒 सुरक्षा गाइड व लॉक
          </button>
        </div>

        {/* UNLOCK TAB */}
        {activeTab === "unlock" && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-xl p-6 text-center">
              <input
                type="file"
                accept=".pdf,application/pdf"
                id="unlockPdfInput"
                onChange={handleUnlockFile}
                className="hidden"
              />
              <label
                htmlFor="unlockPdfInput"
                className="cursor-pointer inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                📄 पासवर्ड वाली PDF चुनें
              </label>
              {unlockFile && (
                <p className="text-xs font-semibold text-slate-600 mt-2 truncate">
                  चयनित: {unlockFile.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                वर्तमान पासवर्ड दर्ज करें
              </label>
              <input
                type="password"
                placeholder="उदा. आपका जन्म वर्ष या नाम पासवर्ड"
                value={unlockPassword}
                onChange={(e) => setUnlockPassword(e.target.value)}
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-white"
              />
              <p className="text-xs text-slate-400 mt-1">
                नोट: यह पासवर्ड सिर्फ आपके डिवाइस में फाइल खोलने के लिए उपयोग होता है, कहीं भेजा नहीं जाता।
              </p>
            </div>

            {unlockError && (
              <p className="text-xs text-red-600 font-semibold">{unlockError}</p>
            )}

            <button
              onClick={runUnlock}
              disabled={unlockBusy || !unlockFile || !unlockPassword}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {unlockBusy ? "PDF अनलॉक हो रही है..." : "पासवर्ड हटाएँ (Unlock PDF)"}
            </button>

            {unlockDownloadUrl && (
              <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-center">
                <p className="text-sm font-bold text-green-800">पासवर्ड सफलतापूर्वक हटा दिया गया है!</p>
                <p className="text-xs text-green-700 mt-1">अब इस फ़ाइल को खोलने के लिए पासवर्ड की ज़रूरत नहीं पड़ेगी।</p>
                <a
                  href={unlockDownloadUrl}
                  download={`unlocked-${unlockFile?.name || "document.pdf"}`}
                  className="inline-block mt-3 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition"
                >
                  📥 अनलॉक PDF डाउनलोड करें
                </a>
              </div>
            )}
          </div>
        )}

        {/* LOCK INFO TAB */}
        {activeTab === "lock" && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-600 space-y-3">
            <h3 className="font-bold text-slate-800 text-base">PDF सुरक्षा संबंधी जानकारी</h3>
            <p>
              ब्राउज़र-आधारित शुद्ध प्राइवेसी बनाए रखने के लिए, यदि आप किसी संवेदनशील दस्तावेज़ को सुरक्षित करना चाहते हैं, तो हमेशा प्रिंट-टू-प्रोटेक्टेड PDF या सिस्टम सिक्योरिटी का उपयोग करें।
            </p>
            <p className="text-xs text-slate-500">
              यह मॉड्यूल जल्द ही स्टैंडअलोन क्लाइंट-साइड 128-bit AES एन्क्रिप्शन अपग्रेड के साथ सक्रिय किया जाएगा।
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
