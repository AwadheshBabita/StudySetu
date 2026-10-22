"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";

export default function WordConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<"pdf" | "jpg">("pdf");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const ext = selectedFile.name.split(".").pop()?.toLowerCase();
      if (ext !== "docx" && ext !== "doc") {
        setError("केवल Word दस्तावेज़ (.docx या .doc) फ़ाइल ही अपलोड करें।");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError("कृपया पहले एक Word फ़ाइल चुनें।");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("format", outputFormat);

      const response = await fetch("/api/convert-word", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "कन्वर्जन में त्रुटि हुई।");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || "document";
      a.download = `${baseName}.${outputFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "फ़ाइल बदलने में कोई तकनीकी समस्या आई।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* शीर्ष ब्रेडक्रम्ब */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
            ← होमपेज पर लौटें
          </Link>
          <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
            100% Free & Secure
          </span>
        </div>

        {/* मुख्य टूल कार्ड */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2 border-b border-slate-100 pb-5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Word to PDF & JPG Converter
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Microsoft Word (.docx, .doc) फ़ाइलों को मूल लेआउट, फ़ॉन्ट, टेबल और लेटरपैड डिज़ाइन के साथ HD PDF अथवा 300 DPI JPG इमेज में बदलें।
            </p>
          </div>

          {/* फ़ाइल अपलोड बॉक्स */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/70 transition rounded-xl p-8 text-center cursor-pointer space-y-3"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".docx,.doc"
              className="hidden"
            />
            <div className="text-4xl">📄</div>
            {file ? (
              <div>
                <p className="font-bold text-sm text-blue-900">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-sm text-slate-800">अपनी Word फ़ाइल यहाँ चुनें या ड्रैग करें</p>
                <p className="text-xs text-slate-500 mt-1">समर्थित फ़ॉर्मेट: .DOCX एवं .DOC</p>
              </div>
            )}
          </div>

          {/* आउटपुट चयन */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">आउटपुट फ़ॉर्मेट चुनें:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOutputFormat("pdf")}
                className={`p-4 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                  outputFormat === "pdf"
                    ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-slate-900">Word to PDF</div>
                  <div className="text-[11px] text-slate-500">प्रिंट-रेडी A4 डॉक्यूमेंट (.pdf)</div>
                </div>
                <span className="text-2xl">📕</span>
              </button>

              <button
                type="button"
                onClick={() => setOutputFormat("jpg")}
                className={`p-4 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                  outputFormat === "jpg"
                    ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-slate-900">Word to JPG</div>
                  <div className="text-[11px] text-slate-500">300 DPI अल्ट्रा HD फोटो (.jpg)</div>
                </div>
                <span className="text-2xl">🖼️</span>
              </button>
            </div>
          </div>

          {/* अलर्ट */}
          {error && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 font-medium">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-lg border border-emerald-200 font-medium">
              ✅ फ़ाइल सफलतापूर्वक कन्वर्ट होकर डाउनलोड हो चुकी है!
            </div>
          )}

          {/* सबमिट बटन */}
          <button
            onClick={handleConvert}
            disabled={!file || loading}
            className={`w-full py-4 rounded-xl font-bold text-sm text-white shadow-xs transition flex items-center justify-center gap-2 cursor-pointer ${
              !file || loading
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <>
                <span className="animate-spin text-base">⏳</span> प्रोसेसिंग जारी है...
              </>
            ) : (
              <>
                <span>🚀</span> कन्वर्ट और डाउनलोड करें ({outputFormat.toUpperCase()})
              </>
            )}
          </button>
        </div>

        {/* SEO और यूज़र गाइड आर्टिकल सेक्शन */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-8 text-slate-700 text-sm leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              ExamSewa Word to PDF & JPG Converter क्यों चुनें?
            </h2>
            <p>
              सरकारी नौकरी के आवेदन, सीएससी (CSC) सेंटर, कॉलेज असाइनमेंट या ऑफिस के काम में अक्सर Word (.docx) दस्तावेज़ों को PDF या JPG फॉर्मेट में अपलोड करना पड़ता है। बाज़ार में उपलब्ध कई ऑनलाइन टूल्स हिंदी, मराठी, गुजराती या दक्षिण भारतीय भाषाओं के फ़ॉन्ट्स को बिगाड़ देते हैं। 
            </p>
            <p>
              <strong>ExamSewa Word Converter</strong> को विशेष रूप से भारतीय क्षेत्रीय भाषाओं, जटिल लेटरहेड्स, टेबल संरचना और आधिकारिक प्रारूपों को 100% सुरक्षित रखने के लिए तैयार किया गया है।
            </p>
          </section>

          {/* कैसे उपयोग करें */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Word फ़ाइल को PDF या JPG में कैसे बदलें? (3 आसान चरण)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-blue-600 font-extrabold text-lg block mb-1">01.</span>
                <strong className="block text-slate-900 mb-1">फ़ाइल चुनें</strong>
                अपने कंप्यूटर या मोबाइल से कोई भी .docx या .doc दस्तावेज़ अपलोड करें।
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-blue-600 font-extrabold text-lg block mb-1">02.</span>
                <strong className="block text-slate-900 mb-1">फ़ॉर्मेट चुनें</strong>
                आवश्यकतानुसार <strong>Word to PDF</strong> या <strong>Word to JPG</strong> का चयन करें।
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-blue-600 font-extrabold text-lg block mb-1">03.</span>
                <strong className="block text-slate-900 mb-1">तुरंत डाउनलोड</strong>
                कन्वर्ट बटन पर क्लिक करें। फ़ाइल बिना किसी वाटरमार्क के तुरंत डाउनलोड हो जाएगी।
              </div>
            </div>
          </section>

          {/* मुख्य विशेषताएँ */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              प्रमुख तकनीकी विशेषताएँ
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>300 DPI अल्ट्रा HD JPG:</strong> फॉर्म अपलोड करने के लिए शार्प व स्पष्ट इमेज।</li>
              <li><strong>अखिल भारतीय भाषा सपोर्ट:</strong> हिंदी, गुजराती, मराठी, तमिल, तेलुगु, बंगाली आदि का सही टेक्स्ट रेंडरिंग।</li>
              <li><strong>लेआउट संरक्षण:</strong> टेबल, मार्जिन, बॉर्डर, आकृतियाँ (Shapes) और लोगो अपनी जगह पर रहते हैं।</li>
              <li><strong>पूर्ण डेटा सुरक्षा:</strong> प्रोसेस पूरा होते ही फ़ाइलें सर्वर से स्वतः नष्ट कर दी जाती हैं।</li>
            </ul>
          </section>

          {/* FAQ सेक्शन */}
          <section className="space-y-4 border-t border-slate-100 pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              अक्सर पूछे जाने वाले प्रश्न (FAQ)
            </h2>
            <div className="space-y-3">
              <div className="bg-slate-50 p-4 rounded-xl">
                <h3 className="font-bold text-slate-900 text-sm">प्र. क्या यह टूल उपयोग के लिए पूरी तरह मुफ़्त है?</h3>
                <p className="text-xs text-slate-600 mt-1">हाँ, ExamSewa का यह टूल सभी यूज़र्स, विद्यार्थियों और सीएससी संचालकों के लिए 100% मुफ़्त है।</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <h3 className="font-bold text-slate-900 text-sm">प्र. क्या इमेज डाउनलोड करने पर वाटरमार्क लगेगा?</h3>
                <p className="text-xs text-slate-600 mt-1">बिल्कुल नहीं। आपको साफ़ और मूल दस्तावेज़ के अनुसार ही PDF और JPG फ़ाइल मिलती है।</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <h3 className="font-bold text-slate-900 text-sm">प्र. क्या यह मोबाइल ब्राउज़र पर भी काम करता है?</h3>
                <p className="text-xs text-slate-600 mt-1">हाँ, यह टूल Android और iOS दोनों मोबाइल ब्राउज़र पर आसानी से काम करता है।</p>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
