"use client";

import Link from "next/link";

export default function PdfPasswordHubPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* हेडर */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
            🔐 ऑल-इन-वन PDF सुरक्षा केंद्र
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            PDF पासवर्ड लॉक व अनलॉक मास्टर
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            अपनी आवश्यकतानुसार विकल्प चुनें: सुरक्षित फ़ाइल का पासवर्ड हटाएँ या साधारण PDF पर नया पासवर्ड लगाएँ।
          </p>
        </div>

        {/* 2 अलग-अलग मुख्य कार्ड्स */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* कार्ड 1: PDF से पासवर्ड हटाएँ (Unlock) */}
          <Link
            href="/tools/pdf-unlock"
            className="group relative bg-white border-2 border-emerald-200 hover:border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform duration-300" />
            
            <div className="relative z-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-3xl shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                🔓
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors">
                  PDF से पासवर्ड हटाएँ
                </h2>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mt-1">
                  Unlock PDF
                </span>
                <p className="text-xs sm:text-sm text-slate-500 mt-2.5 leading-relaxed">
                  पासवर्ड से सुरक्षित PDF का पासवर्ड एक बार दर्ज करके उसे हमेशा के लिए हटाएँ और बिना रोक-टोक प्रिंट या शेयर करें।
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
                पासवर्ड रिमूवल
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-black text-emerald-600 group-hover:translate-x-1 transition-transform">
                पासवर्ड हटाएँ &rarr;
              </span>
            </div>
          </Link>

          {/* कार्ड 2: PDF पर पासवर्ड लगाएँ (Lock / Protect) */}
          <Link
            href="/tools/pdf-protect"
            className="group relative bg-white border-2 border-red-200 hover:border-red-500 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform duration-300" />
            
            <div className="relative z-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center text-3xl shadow-lg shadow-red-200 group-hover:scale-110 transition-transform">
                🔒
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 group-hover:text-red-600 transition-colors">
                  PDF पर पासवर्ड लगाएँ
                </h2>
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mt-1">
                  Protect & Lock PDF
                </span>
                <p className="text-xs sm:text-sm text-slate-500 mt-2.5 leading-relaxed">
                  अपनी निजी व गोपनीय PDF फ़ाइल में मज़बूत पासवर्ड एनक्रिप्शन जोड़ें ताकि कोई अनाधिकृत व्यक्ति इसे न देख सके।
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 group-hover:text-red-600 transition-colors">
                सुरक्षा एनक्रिप्शन
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-black text-red-600 group-hover:translate-x-1 transition-transform">
                पासवर्ड लगाएँ &rarr;
              </span>
            </div>
          </Link>

        </div>

      </div>
    </div>
  );
}
