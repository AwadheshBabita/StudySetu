'use client';

import React from 'react';
import Link from 'next/link';

export default function CompressorHubPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* बैक लिंक */}
        <div>
          <Link href="/" className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5">
            ← मुख्य टूल्स पर वापस जाएँ
          </Link>
        </div>

        {/* हेडर */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            ⚡ All-in-One Compressor
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            PDF एवं Image कंप्रेसर
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            सरकारी परीक्षा व ऑनलाइन फॉर्म हेतु अपनी आवश्यकता के अनुसार विकल्प चुनें:
          </p>
        </div>

        {/* दोनों मुख्य सॉलिड बटन / कार्ड्स */}
        <div className="space-y-4 pt-2">
          
          {/* बटन 1: PDF कंप्रेसर */}
          <Link
            href="/tools/pdf-compressor"
            className="group block p-5 sm:p-6 rounded-3xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-emerald-900 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <span className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl border border-white/20 shadow-xs">
                  📄
                </span>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white group-hover:text-emerald-100 transition-colors">
                    PDF कंप्रेसर
                  </h2>
                  <span className="inline-block text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md mt-0.5">
                    100 KB • 200 KB • 300 KB
                  </span>
                </div>
              </div>
              <span className="text-xl text-white group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed border-t border-emerald-600/60 pt-3">
              बड़ी पीडीएफ फाइलों को सरकारी पोर्टल नियमों के अनुसार सीधे 100 KB, 200 KB या 300 KB के सुरक्षित दायरे में कंप्रेस करें।
            </p>
          </Link>

          {/* बटन 2: Image कंप्रेसर */}
          <Link
            href="/tools/image-compressor"
            className="group block p-5 sm:p-6 rounded-3xl bg-blue-700 hover:bg-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-blue-900 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <span className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl border border-white/20 shadow-xs">
                  🖼️
                </span>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white group-hover:text-blue-100 transition-colors">
                    Image कंप्रेसर
                  </h2>
                  <span className="inline-block text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md mt-0.5">
                    MozJPEG • 300 DPI • विजुअल लॉसलेस
                  </span>
                </div>
              </div>
              <span className="text-xl text-white group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-blue-100/90 font-medium leading-relaxed border-t border-blue-600/60 pt-3">
              दस्तावेज़, मार्कशीट या फ़ोटो (JPG/PNG) को बिना लिखावट धुंधली किए कस्टम KB स्लाइडर या 3 स्मार्ट ऑटो मोड्स में कंप्रेस करें।
            </p>
          </Link>

        </div>

        {/* प्राइवेसी व सुरक्षा नोट */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-400">
            🔒 100% सुरक्षित एवं प्राइवेट — प्रोसेसिंग सीधे आपके ब्राउज़र में होती है।
          </p>
        </div>

      </div>
    </main>
  );
}
