import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "स्मार्ट डॉक्यूमेंट स्कैनर (A4 PDF & Image Scanner) - ExamSewa",
  description: "मोबाइल या कैमरे से खींचे गए कागज़, मार्कशीट, फॉर्म और आधार/पैन कार्ड को सीधा करें, 4-कॉर्नर पर्सपेक्टिव क्रॉप करें, टेक्स्ट साफ करें और 1-क्लिक में A4 PDF व JPG डाउनलोड करें। 100% फ्री और सुरक्षित।",
  keywords: [
    "online document scanner",
    "smart document scanner online",
    "perspective crop document online",
    "photo to pdf scanner a4",
    "mobile scan to clean pdf",
    "camscanner alternative online free",
    "document background clean",
    "examsewa document scanner"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/document-scanner",
  },
  openGraph: {
    title: "स्मार्ट डॉक्यूमेंट स्कैनर - 4-कॉर्नर क्रॉप व A4 PDF मेकर | ExamSewa",
    description: "तिरछे कागज़ को सीधा करें, टेक्स्ट उभारें, बैकग्राउंड साफ करें और हाई-क्वालिटी A4 PDF या JPG डाउनलोड करें।",
    url: "https://examsewa.online/tools/document-scanner",
    siteName: "ExamSewa",
    type: "website",
    locale: "hi_IN",
  },
};

export default function DocumentScannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* मुख्य वर्किंग टूल (page.tsx सुरक्षित रहेगा) */}
      <div className="flex-1">{children}</div>

      {/* गूगल सर्च रैंकिंग के लिए SEO व गाइड सेक्शन */}
      <section className="bg-white border-t border-slate-200 mt-12 py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-10 text-slate-700">
          
          {/* मुख्य हेडिंग */}
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              स्मार्ट ऑनलाइन डॉक्यूमेंट स्कैनर और A4 PDF कनवर्टर
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              ExamSewa का स्मार्ट डॉक्यूमेंट स्कैनर मोबाइल या कैमरे से खींचे गए किसी भी तिरछे कागज़, मार्कशीट, 
              प्रमाणपत्र, आधार कार्ड या फॉर्म को ऑटो-डिटेक्ट करके सीधा करता है और क्रिस्टल क्लियर A4 PDF या JPG में बदलता है।
            </p>
          </div>

          {/* मुख्य फीचर्स ग्रिड */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-2xl mb-2">📐</div>
              <h3 className="font-bold text-slate-900 text-base mb-1">4-कॉर्नर पर्सपेक्टिव क्रॉप</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                कागज़ चाहे किसी भी कोण से खींचा गया हो, चारों कोनों को आसानी से ड्रैग करके पेज को बिल्कुल सीधा और समतल बनाया जा सकता है।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-bold text-slate-900 text-base mb-1">मैजिक टेक्स्ट एन्हांसमेंट</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                कागज़ की परछाइयों (Shadows) को हटाकर अक्षरों को गहरा और बैकग्राउंड को साफ़ सफ़ेद करता है, जिससे प्रिंटिंग साफ़ निकलती है।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-2xl mb-2">🔒</div>
              <h3 className="font-bold text-slate-900 text-base mb-1">100% प्राइवेट और सुरक्षित</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                आपकी फ़ाइलें किसी भी सर्वर पर अपलोड नहीं होती हैं। सारा काम आपके फ़ोन या कंप्यूटर के ब्राउज़र में ही प्रोसेस होता है।
              </p>
            </div>
          </div>

          {/* उपयोग करने का तरीका */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              स्मार्ट स्कैनर का उपयोग कैसे करें? (Step-by-Step Guide)
            </h3>
            <ol className="list-decimal list-inside space-y-2.5 text-xs sm:text-sm text-slate-600">
              <li><strong className="text-slate-800">फ़ाइल चुनें:</strong> अपने मोबाइल या कंप्यूटर से किसी भी दस्तावेज़, फॉर्म या मार्कशीट की फ़ोटो अपलोड करें।</li>
              <li><strong className="text-slate-800">कोने सेट करें:</strong> स्क्रीन पर दिखने वाले 4 गोलों (Corner Points) को खींचकर कागज़ के चारों कोनों पर सेट करें।</li>
              <li><strong className="text-slate-800">क्रॉप और सीधा करें:</strong> '📐 काग़ज़ क्रॉप करें' बटन पर क्लिक करें। आपका दस्तावेज़ सीधा हो जाएगा।</li>
              <li><strong className="text-slate-800">फ़िल्टर व साइज़:</strong> अपनी ज़रूरत के अनुसार B&W या मैजिक कलर चुनें और A4 PDF या HD JPG में डाउनलोड करें।</li>
            </ol>
          </div>

          {/* FAQ (गूगल रिच स्निपेट्स के लिए) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">अक्सर पूछे जाने वाले सवाल (FAQ)</h3>
            <div className="space-y-3">
              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <h4 className="font-bold text-sm text-slate-800 mb-1">क्या यह टूल पूरी तरह से मुफ़्त है?</h4>
                <p className="text-xs text-slate-600">हाँ, ExamSewa का यह डॉक्यूमेंट स्कैनर सभी छात्रों और यूज़र्स के लिए बिना किसी वाटरमार्क के 100% मुफ़्त है।</p>
              </div>
              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <h4 className="font-bold text-sm text-slate-800 mb-1">क्या मैं सीधे A4 साइज़ में PDF निकाल सकता हूँ?</h4>
                <p className="text-xs text-slate-600">हाँ, यह टूल आपके दस्तावेज़ को स्टैंडर्ड A4 माप (Portrait या Landscape) में सटीक मार्जिन के साथ PDF बनाकर देता है।</p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
