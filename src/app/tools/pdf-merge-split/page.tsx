"use client";

import Link from "next/link";

export default function PdfMergeSplitHubPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* हेडर */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
            📑 ऑल-इन-वन PDF मैनेजमेंट
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            PDF मर्ज व स्प्लिट मास्टर
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            अपनी ज़रूरत के अनुसार विकल्प चुनें: कई PDF फाइलों को एक साथ जोड़ें या किसी बड़ी PDF से चुनिंदा पेज अलग निकालें।
          </p>
        </div>

        {/* 2 मुख्य कार्ड्स */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* कार्ड 1: PDF मर्ज करें (Merge) */}
          <Link
            href="/tools/pdf-merge"
            className="group relative bg-white border-2 border-indigo-200 hover:border-indigo-500 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform duration-300" />
            
            <div className="relative z-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                📑
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                  PDF मर्ज करें (Merge PDF)
                </h2>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mt-1">
                  Combine Multiple PDFs
                </span>
                <p className="text-xs sm:text-sm text-slate-500 mt-2.5 leading-relaxed">
                  2 या उससे अधिक PDF फाइलों को अपनी पसंद के क्रम में एक साथ जोड़कर एक सिंगल PDF फाइल तैयार करें।
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
                फाइलें जोड़ें
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-black text-indigo-600 group-hover:translate-x-1 transition-transform">
                मर्ज करें &rarr;
              </span>
            </div>
          </Link>

          {/* कार्ड 2: PDF स्प्लिट करें (Split) */}
          <Link
            href="/tools/pdf-split"
            className="group relative bg-white border-2 border-amber-200 hover:border-amber-500 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform duration-300" />
            
            <div className="relative z-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-3xl shadow-lg shadow-amber-200 group-hover:scale-110 transition-transform">
                ✂️
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 group-hover:text-amber-600 transition-colors">
                  PDF स्प्लिट करें (Split PDF)
                </h2>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mt-1">
                  Extract & Separate Pages
                </span>
                <p className="text-xs sm:text-sm text-slate-500 mt-2.5 leading-relaxed">
                  बड़ी PDF फाइल में से मनपसंद पेज नंबर या पेज रेंज (उदा. 1-3, 5) अलग करके नई PDF बनाएं।
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 group-hover:text-amber-600 transition-colors">
                पेज अलग करें
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-black text-amber-600 group-hover:translate-x-1 transition-transform">
                स्प्लिट करें &rarr;
              </span>
            </div>
          </Link>

        </div>

      </div>
    </div>
  );
}
