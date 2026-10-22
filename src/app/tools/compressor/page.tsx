"use client";

import Link from "next/link";

export default function CompressorHubPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* हेडर */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
            📉 ऑल-इन-वन कंप्रेसर हब
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            PDF एवं इमेज कंप्रेसर
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            अपनी ज़रूरत के अनुसार विकल्प चुनें: दस्तावेज़ की PDF फ़ाइल का साइज़ घटाएँ या फ़ोटो/इमेज को मनचाहे KB में फ़िक्स करें।
          </p>
        </div>

        {/* 2 मुख्य कार्ड्स */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">

          {/* कार्ड 1: PDF कंप्रेसर (Compress PDF) */}
          <Link
            href="/tools/pdf-compressor"
            className="group relative bg-white border-2 border-emerald-200 hover:border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform duration-300" />

            <div className="relative z-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-3xl shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                📄
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors">
                  PDF कंप्रेस करें (Compress PDF)
                </h2>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mt-1">
                  Reduce PDF File Size
                </span>
                <p className="text-xs sm:text-sm text-slate-500 mt-2.5 leading-relaxed">
                  दस्तावेज़, मार्कशीट या सरकारी फॉर्म हेतु PDF फ़ाइल का साइज़ 100KB, 200KB या 500KB में बिना धुंधला किए तुरंत घटाएँ।
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
                PDF फ़ाइल चुनें
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-black text-emerald-600 group-hover:translate-x-1 transition-transform">
                कंप्रेस करें &rarr;
              </span>
            </div>
          </Link>

          {/* कार्ड 2: इमेज / फोटो कंप्रेसर (Compress Image) */}
          <Link
            href="/tools/image-compressor"
            className="group relative bg-white border-2 border-blue-200 hover:border-blue-500 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform duration-300" />

            <div className="relative z-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-3xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                🖼️
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">
                  इमेज कंप्रेस करें (Compress Image)
                </h2>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mt-1">
                  Resize & Compress JPG/PNG
                </span>
                <p className="text-xs sm:text-sm text-slate-500 mt-2.5 leading-relaxed">
                  पासपोर्ट फ़ोटो, हस्ताक्षर या गैलरी की भारी फ़ोटो का साइज़ 20KB, 50KB या 100KB में सही क्लैरिटी के साथ तुरंत सेट करें।
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                फोटो / इमेज चुनें
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-black text-blue-600 group-hover:translate-x-1 transition-transform">
                कंप्रेस करें &rarr;
              </span>
            </div>
          </Link>

        </div>

      </div>
    </div>
  );
}
