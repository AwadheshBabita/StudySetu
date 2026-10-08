import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Govt Exam Photo & Signature Guidelines - नियम व साइज चार्ट | ExamSewa",
  description: "सभी प्रमुख प्रतियोगी परीक्षाओं (SSC, UPSC, Railway, Police, State PSC) के फोटो, सिग्नेचर और डॉक्यूमेंट अपलोड के नवीनतम नियम, पिक्सल डायमेंशन और फाइल साइज चार्ट।",
  keywords: [
    "exam photo requirements",
    "govt exam photo guidelines",
    "photo signature size list 2026",
    "sarkari exam photo rules",
    "ssc photo size requirements",
    "railway photo signature rules",
    "online form document specifications",
    "passport photo background rules govt exams"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/exam-requirements",
  },
  openGraph: {
    title: "Govt Exam Photo & Signature Guidelines - नियम व साइज चार्ट | ExamSewa",
    description: "सभी प्रमुख प्रतियोगी परीक्षाओं के फोटो, सिग्नेचर और डॉक्यूमेंट अपलोड के नवीनतम नियम और साइज चार्ट।",
    url: "https://examsewa.online/tools/exam-requirements",
    type: "website",
  },
};

export default function ExamRequirementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      {/* SEO Guide Article Container (आईडी कार्ड जॉइनर जैसा फुल रिच कंटेंट) */}
      <section className="w-full max-w-4xl mx-auto px-4 py-10 space-y-8 text-slate-800 border-t border-slate-200 mt-8 bg-white/70 rounded-3xl mb-12 shadow-xs">
        <article className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-5">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 border-b pb-2">
            Govt Exam Photo & Signature Guidelines: परीक्षा फॉर्म दिशा-निर्देश व साइज चार्ट
          </h1>
          <p className="text-slate-600">
            सरकारी भर्तियों और प्रतियोगी परीक्षाओं में भाग लेने वाले अभ्यर्थियों के लिए सबसे पहला और महत्वपूर्ण चरण ऑनलाइन आवेदन पत्र का सही तरीके से भरा जाना होता है। विभिन्न आयोगों (जैसे SSC, UPSC, Railway Recruitment Board, State Police Bharti, Banking IBPS/SBI, NTA) की वेबसाइटों पर फोटो, हस्ताक्षर और डाक्यूमेंट्स अपलोड करने के लिए बेहद कड़े तकनीकी नियम लागू होते हैं। बैकग्राउंड का गलत रंग, चेहरे पर छाया, या फाइल का अनुचित अनुपात फॉर्म के स्वतः निरस्तीकरण (Auto-Rejection) का कारण बन सकता है। ExamSewa का यह विस्तृत <strong>Exam Requirements Guide</strong> आपको सभी सरकारी परीक्षाओं के आधिकारिक दिशा-निर्देश और सटीक साइज चार्ट एक ही स्थान पर उपलब्ध कराता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            प्रमुख भर्ती बोर्डों के सामान्य तकनीकी मानक:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>कर्मचारी चयन आयोग (SSC):</strong> पासपोर्ट फोटो 20 KB से 50 KB (चौड़ाई 3.5 सेमी × ऊँचाई 4.5 सेमी), सादा सफेद बैकग्राउंड, दोनों कान और आंखें पूरी तरह दिखाई देने योग्य। हस्ताक्षर 10 KB से 20 KB (चौड़ाई 4.0 सेमी × ऊँचाई 2.0 सेमी) काले या नीले पेन से।</li>
            <li><strong>संघ लोक सेवा आयोग (UPSC):</strong> फोटो और हस्ताक्षर सामान्यतः 20 KB से 300 KB की सीमा में। फोटो में चेहरे का भाग कम से कम 75% स्थान घेरना चाहिए और फोटो के नीचे उम्मीदवार का नाम व तारीख अंकित होनी चाहिए।</li>
            <li><strong>रेलवे भर्ती बोर्ड (RRB ALP/Tech/NTPC):</strong> पासपोर्ट फोटो का दायरा 30 KB से 70 KB, रंगीन फोटो बिना चश्मे और बिना टोपी के, सफेद बैकग्राउंड अनिवार्य। हस्ताक्षर 30 KB से 70 KB रनिंग हैंडराइटिंग में।</li>
            <li><strong>राज्य पुलिस भर्ती (UP/Bihar Police):</strong> फोटो 20 KB से 50 KB, बैकग्राउंड सफेद या हल्का ग्रे। हस्ताक्षर 5 KB से 20 KB के बीच स्पष्ट स्याही में।</li>
            <li><strong>शैक्षिक व आरक्षण प्रमाण पत्र (PDF):</strong> जाति, निवास, ईडब्ल्यूएस, हाईस्कूल/इंटर मार्कशीट हमेशा 100 KB से 200 KB या अधिकतम 300 KB के बीच स्पष्ट रूप से पढ़ने योग्य PDF फॉर्मेट में।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            आवेदन करने से पूर्व ध्यान रखने योग्य मुख्य बातें:
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>फोटो हमेशा हाल ही की (अधिसूचना जारी होने की तारीख से 3 माह के भीतर) खिंचवाई गई होनी चाहिए।</li>
            <li>चेहरे पर किसी भी प्रकार का मास्क, धूप का चश्मा (Dark Goggles) या टोपी नहीं होनी चाहिए; साधारण नज़र का चश्मा भी उतारकर फोटो खिंचवाना सबसे सुरक्षित होता है।</li>
            <li>हस्ताक्षर कभी भी कैपिटल (ब्लॉक) अक्षरों में न करें; हमेशा सामान्य प्रवाहमयी लिखावट में करें।</li>
            <li>मोबाइल से खींची गई फोटो को अपलोड करने से पहले हमारे 'Smart Document Scanner' या 'Exact KB Compressor' से सही साइज में कन्वर्ट करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या फोटो में नीले या लाल बैकग्राउंड वाली तस्वीर मान्य होती है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                अधिकांश केंद्र व राज्य भर्ती आयोग अब केवल सादा सफेद (White) या हल्का ग्रे (Light Grey) बैकग्राउंड ही स्वीकार करते हैं। गहरा नीला या लाल बैकग्राउंड होने पर फॉर्म रिजेक्ट होने का जोखिम रहता है।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                अगर पोर्टल पर फोटो का साइज 50.2 KB हो जाए तो क्या वह अपलोड होगी?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                नहीं, सरकारी पोर्टल बाइट्स के आधार पर गणना करते हैं। 50 KB की सीमा होने पर फाइल का साइज 49.9 KB या उससे कम होना अनिवार्य है।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या आधार कार्ड की फोटो को फॉर्म में क्रॉप करके लगाया जा सकता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                बिल्कुल नहीं। आधार कार्ड पर छपी फोटो का रेजोल्यूशन बहुत कम होता है और वह पुरानी होती है। हमेशा ताज़ा खींची गई स्टूडियो पासपोर्ट फोटो ही अपलोड करें।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
