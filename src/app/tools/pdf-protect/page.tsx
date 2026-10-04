"use client";

import { useState, ChangeEvent } from "react";
import Link from "next/link";

export default function PdfProtectPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setError("");
    setFile(f);
    setDownloadName(`protected_${f.name}`);
  };

  const handleProtect = async () => {
    if (!file) {
      alert("कृपया एक PDF फ़ाइल चुनें!");
      return;
    }
    if (!password.trim()) {
      alert("कृपया एक पासवर्ड दर्ज करें!");
      return;
    }
    if (password !== confirmPassword) {
      setError("दोनों पासवर्ड मेल नहीं खा रहे हैं। कृपया दोबारा जाँचें।");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password);

      const res = await fetch("/api/pdf-protect", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "PDF लॉक करने में विफल रही।");
      }

      const blob = await res.blob();
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(err.message || "त्रुटि आई। कृपया दोबारा प्रयास करें।");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* नेविगेशन / ब्रेडक्रम्ब */}
        <div className="flex items-center justify-between">
          <Link
            href="/tools/pdf-password"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-red-600 transition-colors"
          >
            &larr; PDF पासवर्ड हब पर लौटें
          </Link>
          <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full border border-red-200">
            हाई-सिक्योरिटी एनक्रिप्शन
          </span>
        </div>

        {/* मुख्य कार्ड */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center justify-center sm:justify-start gap-2">
              <span className="p-2 rounded-xl bg-red-100 text-red-700 text-lg">🔒</span>
              PDF में पासवर्ड लगाएँ (Protect PDF)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              अपनी साधारण PDF फ़ाइल में पासवर्ड जोड़ें ताकि केवल सही पासवर्ड डालने पर ही फ़ाइल खुले।
            </p>
          </div>

          {/* फ़ाइल चयन */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              साधारण PDF फ़ाइल चुनें
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 file:cursor-pointer border border-slate-200 rounded-xl p-1.5 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {file && (
              <p className="text-[11px] text-slate-500 font-medium">
                चयनित फ़ाइल: <span className="font-bold text-slate-700">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* पासवर्ड फ़ील्ड्स */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                नया पासवर्ड बनाएँ
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="नया पासवर्ड दर्ज करें"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                पासवर्ड कन्फ़र्म करें
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="पासवर्ड दोबारा दर्ज करें"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 select-none">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              पासवर्ड देखें
            </label>
            <span className="text-slate-400 font-medium">Poppler एनक्रिप्शन</span>
          </div>

          {/* एरर संदेश */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
              ⚠️️ {error}
            </div>
          )}

          {/* एक्शन बटन */}
          <div>
            <button
              onClick={handleProtect}
              disabled={busy || !file}
              className="w-full py-3 px-5 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  PDF में पासवर्ड लगाया जा रहा है...
                </>
              ) : (
                "🔒 पासवर्ड लगाएँ और सुरक्षित PDF डाउनलोड करें"
              )}
            </button>
          </div>

          {/* डाउनलोड बॉक्स */}
          {downloadUrl && (
            <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-center space-y-3 animate-fade-in">
              <span className="text-2xl block">🛡️️</span>
              <div>
                <p className="text-xs sm:text-sm font-black text-red-900">
                  सफ़ल! आपकी PDF फ़ाइल पासवर्ड से सुरक्षित हो गई है।
                </p>
                <p className="text-[11px] text-red-700 mt-0.5">
                  अब इस फ़ाइल को खोलने के लिए पासवर्ड डालना अनिवार्य होगा।
                </p>
              </div>
              <a
                href={downloadUrl}
                download={downloadName}
                className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md transition-all"
              >
                ⬇️ लॉक की गई PDF डाउनलोड करें
              </a>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
