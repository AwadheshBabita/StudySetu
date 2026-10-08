"use client";
import Link from "next/link";

export default function PdfPasswordHubPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-3 sm:py-10 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-3.5 sm:space-y-8">
        {/* हेडर */}
        <div className="text-center space-y-1 sm:space-y-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
            🔐 ऑल-इन-वन PDF सुरक्षा केंद्र
          </span>
          <h1 className="text-xl sm:text-4xl font-black text-slate-900 tracking-tight">
            PDF पासवर्ड लॉक व अनलॉक मास्टर
          </h1>
          <p className="text-xs sm:text-base text-slate-600 max-w-xl mx-auto line-clamp-2 sm:line-clamp-none">
            अपनी आवश्यकतानुसार विकल्प चुनें: सुरक्षित फ़ाइल का पासवर्ड हटाएँ या साधारण PDF पर नया पासवर्ड लगाएँ।
          </p>
        </div>

        {/* 2 अलग-अलग मुख्य कार्ड्स */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 pt-1 sm:pt-4">

          {/* कार्ड 1: PDF से पासवर्ड हटाएँ (Unlock) */}
          <Link
            href="/tools/pdf-unlock"
            className="group relative bg-white border-2 border-emerald-200 hover:border-emerald-500 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-emerald-50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform duration-300" />

            <div className="relative z-10 space-y-2.5 sm:space-y-4">
              <div className="flex items-center gap-3 sm:block">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md sm:shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform shrink-0">
                  🔓
                </div>
                <div>
                  <h2 className="text-base sm:text-2xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors leading-tight">
                    PDF से पासवर्ड हटाएँ
                  </h2>
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-wider block mt-0.5 sm:mt-1">
                    Unlock PDF
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 leading-snug sm:leading-relaxed">
                पासवर्ड से सुरक्षित PDF का पासवर्ड एक बार दर्ज करके उसे हमेशा के लिए हटाएँ और बिना रोक-टोक प्रिंट या शेयर करें।
              </p>
            </div>

            <div className="relative z-10 pt-3 sm:pt-6 mt-3 sm:mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
                पासवर्ड रिमूवल
              </span>
              <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-black text-emerald-600 group-hover:translate-x-1 transition-transform">
                पासवर्ड हटाएँ &rarr;
              </span>
            </div>
          </Link>

          {/* कार्ड 2: PDF पर पासवर्ड लगाएँ (Lock / Protect) */}
          <Link
            href="/tools/pdf-protect"
            className="group relative bg-white border-2 border-red-200 hover:border-red-500 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-red-50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform duration-300" />

            <div className="relative z-10 space-y-2.5 sm:space-y-4">
              <div className="flex items-center gap-3 sm:block">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-red-600 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md sm:shadow-lg shadow-red-200 group-hover:scale-110 transition-transform shrink-0">
                  🔒
                </div>
                <div>
                  <h2 className="text-base sm:text-2xl font-black text-slate-800 group-hover:text-red-600 transition-colors leading-tight">
                    PDF पर पासवर्ड लगाएँ
                  </h2>
                  <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-wider block mt-0.5 sm:mt-1">
                    Protect & Lock PDF
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 leading-snug sm:leading-relaxed">
                अपनी निजी व गोपनीय PDF फ़ाइल में मज़बूत पासवर्ड एनक्रिप्शन जोड़ें ताकि कोई अनाधिकृत व्यक्ति इसे न देख सके।
              </p>
            </div>

            <div className="relative z-10 pt-3 sm:pt-6 mt-3 sm:mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-slate-400 group-hover:text-red-600 transition-colors">
                सुरक्षा एनक्रिप्शन
              </span>
              <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-black text-red-600 group-hover:translate-x-1 transition-transform">
                पासवर्ड लगाएँ &rarr;
              </span>
            </div>
          </Link>

        </div>
      
        {/* SEO रिच गाइड और FAQ सेक्शन */}
        <div className="pt-8 border-t border-slate-200 space-y-6 text-slate-700">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-1.5">
                ⚡ सुपरफास्ट व आसान
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ब्राउज़र-आधारित प्रोसेसिंग की मदद से बिना इंतज़ार किए कुछ ही सेकंड में पासवर्ड हटाएँ या नया पासवर्ड सेट करें।
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-1.5">
                🛡️ 100% डेटा प्राइवेसी
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                आपकी फाइलें और पासवर्ड क्लाउड पर स्थायी रूप से स्टोर नहीं होते। सुरक्षा और गोपनीयता की पूर्ण गारंटी।
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-1.5">
                📱 सभी डिवाइस पर अनुकूल
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                मोबाइल फोन, टैबलेट, लैपटॉप या डेस्कटॉप पर बिना किसी अतिरिक्त सॉफ्टवेयर इंस्टॉलेशन के स्मूद काम करता है।
              </p>
            </div>
          </div>

          {/* अक्सर पूछे जाने वाले सवाल (FAQ) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              अक्सर पूछे जाने वाले सवाल (FAQ)
            </h2>
            
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="border-b border-slate-100 pb-2.5">
                <h4 className="font-bold text-slate-800 mb-1">
                  1. क्या PDF से पासवर्ड हटाने के लिए पुराना पासवर्ड होना ज़रूरी है?
                </h4>
                <p className="text-slate-600">
                  हाँ, अधिकृत सुरक्षा नियमों के अनुसार सुरक्षित PDF को अनलॉक करने के लिए उसका मूल पासवर्ड एक बार दर्ज करना होता है। इसके बाद हमेशा के लिए पासवर्ड हट जाता है।
                </p>
              </div>

              <div className="border-b border-slate-100 pb-2.5">
                <h4 className="font-bold text-slate-800 mb-1">
                  2. क्या PDF पर पासवर्ड लगाने के बाद फाइल की क्वालिटी कम होती है?
                </h4>
                <p className="text-slate-600">
                  बिल्कुल नहीं। हमारे सुरक्षा एनक्रिप्शन से आपकी PDF फाइल के टेक्स्ट, इमेज और ओरिजिनल रेजोल्यूशन में कोई बदलाव नहीं आता।
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">
                  3. क्या यह सेवा पूरी तरह मुफ्त है?
                </h4>
                <p className="text-slate-600">
                  हाँ, ExamSewa पोर्टल पर PDF पासवर्ड अनलॉक और प्रोटेक्ट टूल पूरी तरह निःशुल्क और असीमित उपयोग के लिए उपलब्ध है।
                </p>
              </div>
            </div>
          </div>

        </div>

</div>
    </div>
  );
}
