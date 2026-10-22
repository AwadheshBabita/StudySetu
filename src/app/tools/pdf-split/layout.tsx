import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split PDF Online - PDF के पन्ने अलग करें | ExamSewa",
  description: "किसी बड़ी PDF फाइल में से विशिष्ट पन्ने (जैसे केवल 10वीं की मार्कशीट या जाति प्रमाण पत्र) अलग करें। रेंज या सिंगल पेज स्प्लिटिंग। सरकारी भर्ती फॉर्म्स हेतु 100% सुरक्षित और मुफ़्त।",
  keywords: [
    "split pdf online free",
    "separate pages from pdf",
    "extract specific page from pdf marksheet",
    "split multi page pdf into single pages",
    "pdf se page alag kaise kare",
    "cut pdf pages online",
    "extract pages from pdf free",
    "fast pdf cutter tool",
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/pdf-split",
  },
  openGraph: {
    title: "Split PDF Online - PDF के पन्ने अलग करें | ExamSewa",
    description: "किसी बड़ी PDF फाइल में से विशिष्ट पन्ने अलग करें। रेंज या सिंगल पेज स्प्लिटिंग।",
    url: "https://examsewa.online/tools/pdf-split",
    type: "website",
  },
};

export default function PdfSplitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      {/* SEO Guide Article Container */}
      <section className="w-full max-w-4xl mx-auto px-4 py-10 space-y-8 text-slate-800 border-t border-slate-200 mt-8 bg-white/70 rounded-3xl mb-12 shadow-xs">
        <article className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-5">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 border-b pb-2">
            Split PDF Online: किसी PDF फाइल से आवश्यक पन्ने अलग या एक्सट्रैक्ट कैसे करें?
          </h1>
          <p className="text-slate-600">
            सरकारी नौकरियों (SSC, UPSC, Railway, State PSC) और शैक्षणिक प्रवेश प्रक्रियाओं में अक्सर यह देखने को मिलता है कि छात्र अपने सभी प्रमाण पत्रों (10वीं, 12वीं, ग्रेजुएशन, जाति व निवास प्रमाण पत्र) को एक ही लंबी PDF फाइल में सहेज कर रखते हैं। लेकिन जब वे किसी विशेष पोर्टल पर आवेदन करते हैं, तो वहाँ केवल <em>'कक्षा 10वीं की मार्कशीट'</em> या केवल <em>'निवास प्रमाण पत्र'</em> का एक अलग पेज अपलोड करने की मांग की जाती है। पूरी 10-पेज की फाइल को अलग-अलग टुकड़ों में बांटने के लिए भारी सॉफ्टवेयर खोजना काफी परेशानी भरा होता है। ExamSewa का <strong>Online PDF Split Tool</strong> आपको पूरी फाइल में से अपनी पसंद का कोई एक पेज, पन्नों की एक विशेष रेंज (जैसे पेज 2 से 5), या सभी पन्नों को अलग-अलग स्वतंत्र PDF में पलक झपकते ही विभाजित करने की सुविधा देता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख तकनीकी विशेषताएँ:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>कस्टम पेज रेंज एक्सट्रैक्शन (Page Range Selection):</strong> आप सीधे पेज नंबर (जैसे 1, 3, 5-7) लिखकर केवल अपनी ज़रूरत के पन्नों की एक नई स्वच्छ PDF तैयार कर सकते हैं।</li>
            <li><strong>विज़ुअल पेज सिलेक्टर (Visual Thumbnail Click):</strong> यदि आपको पेज नंबर याद नहीं हैं, तो स्क्रीन पर दिख रहे पन्नों के थंबनेल्स पर क्लिक करके सीधे उन पन्नों को चुन सकते हैं जिन्हें अलग करना है।</li>
            <li><strong>सिंगल-पेज बल्क स्प्लिट (Split All Pages):</strong> एक क्लिक में 10 पेजों की फाइल को 10 अलग-अलग 1-पेज की स्वतंत्र PDF फाइलों में बदलने की सुविधा।</li>
            <li><strong>ओरिजिनल फॉन्ट और क्लैरिटी सुरक्षा:</strong> पन्नों को अलग करते समय मूल दस्तावेज के डिजिटल हस्ताक्षर, बारकोड, मुहर और टेक्स्ट की स्पष्टता पर कोई प्रभाव नहीं पड़ता।</li>
            <li><strong>100% डेटा प्राइवेसी:</strong> यह टूल पूरी तरह ब्राउज़र आधारित तकनीक पर चलता है; आपका कोई भी संवेदनशील व्यक्तिगत या सरकारी दस्तावेज़ किसी बाहरी सर्वर पर अपलोड नहीं होता।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            स्टेप-बाय-स्टेप उपयोग का तरीका (How to Use):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>ऊपर दिए गए बॉक्स में अपनी बहु-पृष्ठीय (Multi-page) PDF फाइल अपलोड करें।</li>
            <li>स्प्लिट मोड चुनें—'Extract Specific Pages' (विशिष्ट पन्ने निकालना) या 'Split into Single Pages' (सभी पेज अलग करना)।</li>
            <li>अपनी आवश्यकतानुसार पेज नंबर टाइप करें या थंबनेल्स पर क्लिक करके उन्हें हाइलाइट करें।</li>
            <li>'Split PDF' बटन पर क्लिक करें—विभाजन तुरंत पूरा हो जाएगा।</li>
            <li>'Download Extracted PDF' पर क्लिक करके तैयार फाइल को डाउनलोड करें और अपने फॉर्म में अपलोड करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या पन्ना अलग करने के बाद फाइल का साइज कम हो जाता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, जब 10 पेजों की भारी फाइल में से केवल 1 पेज निकाला जाता है, तो बाकी 9 पेजों का डेटा हट जाता है और नई फाइल का साइज आमतौर पर बहुत छोटा (100 KB से 200 KB) हो जाता है।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या मैं एक साथ कई असंलग्न (Non-consecutive) पन्ने निकाल सकता हूँ?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, आप कॉमा लगाकर अलग-अलग पन्ने (जैसे 1, 4, 8) लिख सकते हैं और टूल केवल उन्हीं पन्नों को जोड़कर एक नई PDF बना देगा।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या अलग किए गए पन्नों पर कोई वॉटरमार्क आता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                बिल्कुल नहीं। यह टूल 100% मुफ़्त है और बिना किसी वॉटरमार्क के पूर्णतः मूल गुणवत्ता की PDF फाइल प्रदान करता है।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
