import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "4x6, 5x7 व A4 पासपोर्ट फोटो शीट मेकर - Mr. Photo ऑनलाइन प्रिंट लेआउट | ExamSewa",
  description: "Epson व Canon प्रिंटर हेतु 4x6, 5x7 और A4 पेपर पर 8, 9, 12 या 36 पासपोर्ट फोटो शीट बनाएँ। Mr. Photo जैसा कस्टम कैटलॉग ग्रिड बिल्डर, 100% सटीक कटिंग मार्जिन और 300 DPI HD प्रिंट।",
  keywords: [
    "4x6 passport photo sheet maker online",
    "mr photo online software free",
    "5x7 photo print sheet generator",
    "a4 passport photo grid maker 36 photos",
    "custom passport catalog maker",
    "epson l805 canon pixma passport layout",
    "passport size photo print 4x6 paper",
    "पासपोर्ट फोटो प्रिंट 4x6 शीट",
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/passport-photo-4x6-maker",
  },
  openGraph: {
    title: "Mr. Photo ऑनलाइन - 4x6, 5x7 व A4 पासपोर्ट फोटो शीट स्टूडियो | ExamSewa",
    description: "4x6, 5x7 और A4 पेपर पर 1-क्लिक में पासपोर्ट फोटो सेट करें या मनपसंद कस्टम ग्रिड बनाएं। डायरेक्ट वाई-फाई प्रिंट व शेयर सपोर्ट।",
    url: "https://examsewa.online/tools/passport-photo-4x6-maker",
    siteName: "ExamSewa",
    locale: "hi_IN",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ExamSewa Mr. Photo Sheet Maker",
    "operatingSystem": "All",
    "applicationCategory": "DesignApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "description": "ऑनलाइन 4x6, 5x7 और A4 फोटो पेपर पर पासपोर्ट साइज फोटो शीट प्रिंट करने का टूल।"
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "4x6 फोटो पेपर पर कितनी पासपोर्ट साइज फोटो प्रिंट होती हैं?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "मानक 3.5×4.5 सेमी अनुपात में 8 फोटो और 3.0×4.0 सेमी साइज में 9 या 12 मिनी पासपोर्ट फोटो 4x6 इंच पेपर पर प्रिंट की जा सकती हैं।"
        }
      },
      {
        "@type": "Question",
        "name": "क्या इस टूल से मोबाइल से सीधे वाई-फाई प्रिंटर पर प्रिंट निकाल सकते हैं?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "हाँ, शेयर (Share) बटन दबाकर आप सीधे Epson iPrint, Canon PRINT या HP Smart ऐप में शीट भेजकर बिना कंप्यूटर के डायरेक्ट प्रिंट निकाल सकते हैं।"
        }
      },
      {
        "@type": "Question",
        "name": "कस्टम कैटलॉग (मनपसंद साइज) कैसे बनाएं?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "'मनपसंद साइज़ बनाएं' बटन पर क्लिक करके आप अपनी इच्छानुसार रो, कॉलम, मार्जिन और कटिंग गैप सेट करके हमेशा के लिए सेव कर सकते हैं।"
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {children}

      {/* गूगल सर्च ऑप्टिमाइज्ड और साफ़ पठनीय कंटेंट */}
      <footer className="w-full bg-slate-900 border-t border-slate-800 text-slate-200 mt-12 py-10 px-4 sm:px-6">
        <article className="max-w-4xl mx-auto space-y-8 text-sm leading-relaxed">
          
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-3">
              Mr. Photo ऑनलाइन पासपोर्ट फोटो शीट मेकर (4×6, 5×7 व A4 प्रिंट स्टूडियो)
            </h1>
            <p className="text-slate-300">
              फोटो स्टूडियो संचालकों, सीएससी (CSC - डिजिटल सेवा केंद्र) और साइबर कैफ़े के लिए पासपोर्ट फोटो प्रिंटिंग की प्रक्रिया को आधुनिक बनाने हेतु यह टूल डिज़ाइन किया गया है। अब आपको फ़ोटो प्रिंट करने के लिए भारी डेस्कटॉप सॉफ्टवेयर जैसे Photoshop या Presto! Mr. Photo की आवश्यकता नहीं है। अपने मोबाइल या लैपटॉप से 1-क्लिक में 100% सटीक 300 DPI प्रिंट शीट तैयार करें।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60">
            <div>
              <h2 className="text-base font-bold text-emerald-400 mb-2">मुख्य सुविधाएँ (Key Features)</h2>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong>मल्टीपल पेपर सपोर्ट:</strong> 4×6 इंच (10×15 cm), 5×7 इंच और मानक A4 पेपर।</li>
                <li><strong>कस्टम कैटलॉग बिल्डर:</strong> अपनी मनपसंद रो (Rows), कॉलम (Columns), मार्जिन व गैप सेट करें।</li>
                <li><strong>सटीक 1:1 हार्डवेयर स्केल:</strong> स्क्रीन पर मिलीमीटर के अनुपात में लाइव प्रीव्यू।</li>
                <li><strong>कटिंग बॉर्डर व डेट स्टैम्प:</strong> नाम, तारीख और 1px सॉलिड कटिंग बॉर्डर सुविधा।</li>
              </ul>
            </div>
            <div>
              <h2 className="text-base font-bold text-blue-400 mb-2">प्रिंटर अनुकूलता (Printer Support)</h2>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>Epson EcoTank (L805, L8050, L850, L3110, L3250)</li>
                <li>Canon Pixma (G3010, G2020, G670 Photo Series)</li>
                <li>HP Smart Tank और Brother ऑल-इन-वन फोटो प्रिंटर</li>
                <li>ग्लोसी, मैट व सेमी-ग्लोसी फोटो पेपर सपोर्ट</li>
              </ul>
            </div>
          </div>

          {/* एफएक्यू (अक्सर पूछे जाने वाले सवाल) - गूगल सर्च स्निपेट्स के लिए */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">अक्सर पूछे जाने वाले सवाल (FAQs)</h2>
            <div className="space-y-4">
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40">
                <h3 className="font-semibold text-emerald-300 mb-1">
                  Q1: क्या यह शीट फोटो स्टूडियो और कलर लैब प्रिंटिंग के लिए सही है?
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm">
                  हाँ, यह शीट 300 DPI अल्ट्रा HD रिज़ॉल्यूशन पर तैयार होती है। आप इसे सीधे किसी भी फोटो लैब या इंकजेट प्रिंटर से निकाल सकते हैं।
                </p>
              </div>

              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40">
                <h3 className="font-semibold text-emerald-300 mb-1">
                  Q2: 4×6 इंच पेपर पर पासपोर्ट फोटो प्रिंट करने की सही सेटिंग क्या है?
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm">
                  प्रिंटर डायलॉग में Paper Size '4x6 in' चुनें, Quality को 'High/Photo' पर रखें और Scaling को '100% (Actual Size)' सेट करें ताकि फोटो का आकार न बिगड़े।
                </p>
              </div>

              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40">
                <h3 className="font-semibold text-emerald-300 mb-1">
                  Q3: मोबाइल से सीधे फोटो कैसे प्रिंट करें?
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm">
                  शीट तैयार करने के बाद ऊपर दिए गए 'शेयर (Share)' बटन पर टैप करें और अपने प्रिंटर ऐप (जैसे Epson iPrint) में शेयर करके तुरंत प्रिंट कमांड दें।
                </p>
              </div>
            </div>
          </div>

        </article>
      </footer>
    </>
  );
}
