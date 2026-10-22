import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OCR Scanner Online - फोटो से लिखावट (Text) निकालें | ExamSewa",
  description: "किसी भी फोटो, कागज़ात, रसीद, किताब के पन्ने या स्क्रीनशॉट में लिखी लिखावट (हिंदी व अंग्रेजी) को तुरंत पहचानें और कॉपी करने योग्य टेक्स्ट में बदलें। 100% मुफ़्त और सुरक्षित OCR टूल।",
  keywords: [
    "ocr scanner online",
    "image to text converter",
    "photo se text copy kare",
    "extract text from image online",
    "hindi english ocr tool",
    "free optical character recognition online",
    "receipt screenshot text extractor",
    "convert scanned document to editable text",
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/ocr-scanner",
  },
  openGraph: {
    title: "OCR Scanner Online - फोटो से लिखावट (Text) निकालें | ExamSewa",
    description: "किसी भी फोटो, रसीद या स्क्रीनशॉट में लिखी लिखावट को तुरंत पहचानें और कॉपी करने योग्य टेक्स्ट में बदलें।",
    url: "https://examsewa.online/tools/ocr-scanner",
    type: "website",
  },
};

export default function OcrScannerLayout({
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
            OCR Scanner Online: फोटो, रसीद या स्क्रीनशॉट से लिखावट (Text) कैसे निकालें?
          </h1>
          <p className="text-slate-600">
            अक्सर प्रतियोगी परीक्षाओं के नोट्स, सरकारी गजट, बैंक चालान, बिल रसीद, या मार्कशीट में से महत्वपूर्ण जानकारियों (जैसे रोल नंबर, सीरियल कोड या लंबे पैराग्राफ) को दोबारा टाइप करने में बहुत अधिक समय और ऊर्जा नष्ट होती है। मैन्युअल टाइपिंग में स्पेलिंग और अंकों की गलती होने की संभावना भी हमेशा बनी रहती है। ExamSewa का <strong>Online OCR Scanner</strong> उन्नत ऑप्टिकल कैरेक्टर रिकॉग्निशन (OCR) इंजन का उपयोग करके आपकी अपलोड की गई किसी भी तस्वीर या स्क्रीनशॉट के अक्षरों को पहचानता है और उन्हें सेकंडों में संपादन व कॉपी करने योग्य डिजिटल टेक्स्ट (Editable Digital Text) में बदल देता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख तकनीकी विशेषताएँ:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>द्विभाषी टेक्स्ट पहचान (Hindi & English Support):</strong> मुद्रित (Printed) देवनागरी हिंदी और अंग्रेजी दोनों भाषाओं के अक्षरों, मात्राओं और विराम चिह्नों को अत्यधिक सटीकता से पहचानता है।</li>
            <li><strong>वन-क्लिक क्लिपबोर्ड कॉपी:</strong> निकाले गए टेक्स्ट को एक क्लिक में कॉपी करें और सीधे वर्ड, नोटपैड, व्हाट्सएप या अपने ऑनलाइन फॉर्म में पेस्ट करें।</li>
            <li><strong>स्मार्ट प्री-प्रोसेसिंग फिल्टर:</strong> धुंधली या कम रोशनी वाली तस्वीरों का कंट्रास्ट अपने आप बढ़ाकर अक्षरों की पहचान दर (Accuracy Rate) को 98% से अधिक करता है।</li>
            <li><strong>मल्टीपल इमेज फॉर्मेट्स:</strong> JPG, PNG, WEBP, और स्क्रीनशॉट फाइलों को बिना किसी रुकावट के सपोर्ट करता है।</li>
            <li><strong>100% डेटा प्राइवेसी:</strong> आपकी व्यक्तिगत रसीदें, नोट्स या प्रमाण पत्र केवल आपके ब्राउज़र इंजन में प्रोसेस होते हैं; कोई भी संवेदनशील टेक्स्ट हमारे सर्वर पर लॉग नहीं होता।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            स्टेप-बाय-स्टेप उपयोग का तरीका (How to Use):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>ऊपर दिए गए बॉक्स में अपनी किताब के पन्ने, बिल, स्क्रीनशॉट या दस्तावेज की फोटो अपलोड करें।</li>
            <li>यदि फोटो में केवल एक हिस्से का टेक्स्ट चाहिए, तो क्रॉप टूल से उस हिस्से को चुन लें।</li>
            <li>'Extract Text (OCR)' बटन पर क्लिक करें।</li>
            <li>कुछ ही सेकंड्स में नीचे दिए गए टेक्स्ट बॉक्स में निकाला गया टेक्स्ट दिखाई देगा।</li>
            <li>'Copy Text' बटन दबाकर टेक्स्ट को कॉपी करें या 'Download .TXT' फाइल के रूप में सेव करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या यह हाथ से लिखी लिखावट (Handwritten Notes) को भी पहचान सकता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                यह टूल मुद्रित (Printed) किताबों, अखबारों और स्क्रीनशॉट्स पर सबसे सटीक कार्य करता है। यदि हाथ की लिखावट बहुत साफ और अलग-अलग अक्षरों में लिखी गई है, तो उसे भी पहचान लेता है।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                अगर तस्वीर थोड़ी धुंधली या तिरछी हो तो क्या टेक्स्ट निकलेगा?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                बेहतर परिणाम के लिए फोटो को पर्याप्त रोशनी में खींचें। यदि फोटो बहुत ज्यादा तिरछी है, तो पहले हमारे 'Document Scanner' से सीधा कर लेने पर 100% सटीक परिणाम मिलते हैं।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या निकाले गए टेक्स्ट की कोई शब्द सीमा (Word Limit) है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                नहीं, आप पूरा एक पेज या भारी दस्तावेज़ भी एक बार में प्रोसेस कर सकते हैं। यह टूल पूरी तरह असीमित और मुफ़्त है।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
