import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Document Scanner Online - मोबाइल फोटो को साफ़ स्कैनर बनाएं | ExamSewa",
  description: "मोबाइल से खींची कागज़ात की फोटो साफ़ करें। 4-कॉर्नर पर्सपेक्टिव क्रॉप, शैडो रिमूवल और मैजिक कलर व्हाइट बैलेंस से साधारण फोटो को बनाएं क्रिस्प HD PDF या JPG डॉक्यूमेंट।",
  keywords: [
    "document scanner online",
    "mobile photo to scan copy",
    "magic color scanner",
    "4 corner perspective crop online",
    "remove shadow from paper photo",
    "marksheet clear scanner",
    "online document enhancer tool",
    "clean yellow paper to white document",
    "mobile photo ko scan copy banaye",
    "kagaz ki photo saaf kaise kare",
    "shadow remove from document photo",
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/document-scanner",
  },
  openGraph: {
    title: "Smart Document Scanner Online - मोबाइल फोटो को साफ़ स्कैनर बनाएं | ExamSewa",
    description: "मोबाइल से खींची कागज़ात की फोटो साफ़ करें। 4-कॉर्नर पर्सपेक्टिव क्रॉप और मैजिक कलर से साधारण फोटो को बनाएं क्रिस्प HD डॉक्यूमेंट।",
    url: "https://examsewa.online/tools/document-scanner",
    type: "website",
  },
};

export default function DocumentScannerLayout({
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
            Smart Document Scanner: मोबाइल से खींची गई फोटो को ओरिजिनल स्कैनर जैसा साफ़ कैसे बनाएं?
          </h1>
          <p className="text-slate-600">
            जब हम स्मार्टफोन के कैमरे से मार्कशीट, जाति/आय प्रमाण पत्र, बैंक पासबुक या किसी कागज़ात की तस्वीर खींचते हैं, तो उसमें अक्सर हाथ या मोबाइल की परछाई (Shadow), कमरे की लाइट का पीलापन, और तिरछापन (Perspective Distortion) आ जाता है। ऐसे दस्तावेज़ जब किसी सरकारी परीक्षा फॉर्म या जॉब पोर्टल पर अपलोड किए जाते हैं, तो आयोग उन्हें 'धुंधला या अपठनीय' कहकर निरस्त कर देता है। ExamSewa का <strong>Smart Document Scanner</strong> बिना किसी हार्डवेयर स्कैनर मशीन के आपकी मोबाइल फोटो को फ्लैटबेड स्कैनर जैसा बिल्कुल सीधा, क्रिस्प और दूध जैसा साफ़ सफेद बना देता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख तकनीकी विशेषताएँ:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>4-कॉर्नर पर्सपेक्टिव क्रॉप (Perspective Correction):</strong> यदि आपने बिस्तर या मेज पर रखकर दस्तावेज़ की तिरछी तस्वीर ली है, तो चारों कोनों पर दिए गए बिंदुओं को खींचकर आप पूरे कागज़ को सामने से देखा गया एकदम सीधा और समतल बना सकते हैं।</li>
            <li><strong>मैजिक कलर व्हाइट बैलेंस (Magic Color Filter):</strong> कागज़ पर जमी धूल, असमान रोशनी और पीलेपन को हटाकर बैकग्राउंड को पूरी तरह क्लीन व्हाइट करता है ताकि प्रिंटिंग में स्याही की बर्बादी न हो।</li>
            <li><strong>इंक कंट्रास्ट और शार्पनेस बूस्ट:</strong> हल्के नीले या काले पेन से लिखे अक्षरों, रबर स्टाम्प की मुहर और अधिकारियों के हस्ताक्षरों को गहरा और स्पष्ट रूप से पढ़ने योग्य बनाता है।</li>
            <li><strong>मल्टीपल आउटपुट मोड्स:</strong> आवश्यकतानुसार ओरिजिनल, मैजिक कलर (Color Enhanced), ग्रेस्केल (Black & White), या हाई-कंट्रास्ट मोड में दस्तावेज़ को प्रोसेस करें।</li>
            <li><strong>HD PDF व JPG एक्सपोर्ट:</strong> साफ़ किए गए दस्तावेज़ को बिना किसी वॉटरमार्क के सीधे हाई-रेजोल्यूशन PDF या JPG फॉर्मेट में डाउनलोड करें।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            स्टेप-बाय-स्टेप उपयोग का तरीका (How to Use):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>ऊपर दिए गए बॉक्स में अपने मोबाइल से ली गई डॉक्यूमेंट या मार्कशीट की फोटो अपलोड करें।</li>
            <li>स्क्रीन पर दिखने वाले 4 नीले कोनों (Corner Points) को पकड़कर अपने कागज़ के चारों किनारों पर ठीक से सेट करें।</li>
            <li>'Perspective Crop' पर क्लिक करें—कागज़ अपने आप घूमकर एकदम सीधा और चौकोर हो जाएगा।</li>
            <li>नीचे दिए गए फिल्टर विकल्पों में से 'Magic Color' या 'B&W' चुनें जिससे बैकग्राउंड साफ़ और लिखावट गहरी हो जाए।</li>
            <li>दस्तावेज़ की स्पष्टता जाँचने के बाद 'Download PDF' या 'Download JPG' बटन पर क्लिक करके फाइल सेव करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या इसके लिए मोबाइल में कोई भारी ऐप डाउनलोड करना होगा?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                नहीं, यह टूल सीधे आपके मोबाइल या कंप्यूटर के ब्राउज़र (Chrome, Safari आदि) में चलता है। किसी ऐप या सॉफ्टवेयर इंस्टॉलेशन की कोई आवश्यकता नहीं है।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या स्कैन किए गए दस्तावेज़ से संवेदनशील सरकारी डेटा लीक होने का खतरा है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                बिल्कुल नहीं। यह टूल पूरी तरह 'क्लाइंट-साइड' (Client-side Canvas) तकनीक पर कार्य करता है। आपकी मार्कशीट या पहचान पत्र की फोटो आपके फोन/कंप्यूटर से बाहर किसी सर्वर पर कभी नहीं जाती।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या स्कैन करने के बाद बारकोड और क्यूआर कोड (QR Code) काम करेंगे?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, मैजिक कलर फिल्टर बारकोड और क्यूआर कोड के कंट्रास्ट को और स्पष्ट कर देता है जिससे सरकारी स्कैनर उन्हें तुरंत पढ़ लेते हैं।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
