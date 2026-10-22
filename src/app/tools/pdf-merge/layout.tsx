import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merge PDF Online - कई PDF फाइलों को एक साथ जोड़ें | ExamSewa",
  description: "अलग-अलग मार्कशीट, जाति, निवास व पहचान पत्रों की PDF फाइलों को क्रमबद्ध तरीके से एक सिंगल PDF में जोड़ें (Combine PDF)। सरकारी परीक्षा फॉर्म्स व स्कॉलरशिप हेतु 100% सुरक्षित और मुफ़्त।",
  keywords: [
    "merge pdf files online",
    "combine multiple pdf into one",
    "pdf jodne wala tool",
    "merge marksheet certificate pdf",
    "join pdf pages online free",
    "combine scanned documents for govt exam",
    "reorder and merge pdf online",
    "fast pdf combiner tool",
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/pdf-merge",
  },
  openGraph: {
    title: "Merge PDF Online - कई PDF फाइलों को एक साथ जोड़ें | ExamSewa",
    description: "अलग-अलग मार्कशीट और प्रमाणपत्रों की PDF फाइलों को क्रमबद्ध तरीके से एक सिंगल PDF में जोड़ें।",
    url: "https://examsewa.online/tools/pdf-merge",
    type: "website",
  },
};

export default function PdfMergeLayout({
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
            Merge PDF Online: अलग-अलग PDF फाइलों और मार्कशीट्स को एक साथ कैसे जोड़ें?
          </h1>
          <p className="text-slate-600">
            विभिन्न प्रतियोगी परीक्षाओं (जैसे UPSC, SSC, State PSC, Teaching Exams) और यूनिवर्सिटी एडमिशन पोर्टलों पर अक्सर यह नियम होता है कि सभी सेमेस्टर की मार्कशीट, डिग्री सर्टिफिकेट, या आरक्षण प्रमाणपत्र (जाति, निवास, आय) अलग-अलग अपलोड करने के बजाय <strong>'एक ही सिंगल कंबाइंड PDF'</strong> में अपलोड किए जाएँ। कई छात्र मोबाइल से अलग-अलग पन्नों को अलग फाइलों में सेव कर लेते हैं और बाद में उन्हें एक सही क्रम में जोड़ने में परेशानी का सामना करते हैं। ExamSewa का <strong>Online PDF Merge Tool</strong> आपको बिना किसी सॉफ्टवेयर इंस्टॉलेशन के कई अलग-अलग फाइलों को अपनी इच्छानुसार क्रमबद्ध (Re-order) करके एक सिंगल व्यवस्थित PDF फाइल बनाने की सुविधा देता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख तकनीकी विशेषताएँ:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>ड्रैग एंड ड्रॉप री-ऑर्डरिंग (Page Ordering):</strong> फाइलों को अपलोड करने के बाद उनके थंबनेल को खींचकर अपनी पसंद के अनुसार (जैसे 10वीं, फिर 12वीं, फिर ग्रेजुएशन) सही क्रम में लगाएं।</li>
            <li><strong>असीमित फाइलें जोड़ने की क्षमता:</strong> आप एक साथ 2, 5, 10 या उससे अधिक फाइलों को जोड़कर एक संपूर्ण डॉक्यूमेंट डॉसियर तैयार कर सकते हैं।</li>
            <li><strong>ओरिजिनल रेजोल्यूशन सुरक्षा:</strong> फाइलों को मर्ज करते समय अक्षरों, डिजिटल हस्ताक्षर और मोहर की गुणवत्ता में कोई गिरावट नहीं आती।</li>
            <li><strong>फास्ट क्लाइंट-साइड इंजन:</strong> फाइलें सीधे आपके ब्राउज़र में मर्ज होती हैं, जिससे भारी फाइलें अपलोड करने में लगने वाला इंटरनेट समय बचता है।</li>
            <li><strong>100% डेटा सुरक्षा व प्राइवेसी:</strong> आपकी व्यक्तिगत मार्कशीट या संवेदनशील प्रमाणपत्र किसी बाहरी सर्वर पर अपलोड नहीं होते; पूरा प्रोसेस पूरी तरह निजी रहता है।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            स्टेप-बाय-स्टेप उपयोग का तरीका (How to Use):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>ऊपर दिए गए बॉक्स में 'Select PDF Files' पर क्लिक करके उन सभी फाइलों को चुनें जिन्हें आप जोड़ना चाहते हैं।</li>
            <li>स्क्रीन पर दिखने वाले फाइलों के कार्ड्स को आगे-पीछे ड्रैग करके सही क्रम में व्यवस्थित करें।</li>
            <li>यदि कोई गलत फाइल जुड़ गई हो, तो 'Delete' आइकन से उसे तुरंत सूची से हटा दें।</li>
            <li>'Merge PDF' बटन पर क्लिक करें—प्रक्रिया पलक झपकते ही पूरी हो जाएगी।</li>
            <li>'Download Merged PDF' पर क्लिक करके अपनी तैयार सिंगल फाइल सुरक्षित करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                मर्ज करने के बाद यदि फाइल का साइज बहुत बड़ा हो जाए तो क्या करें?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                कई फाइलों को जोड़ने पर साइज बढ़ना स्वाभाविक है। मर्ज करने के बाद आप हमारे 'PDF Compressor' टूल का उपयोग करके इसे तुरंत 200 KB या 500 KB के आधिकारिक दायरे में कंप्रेस कर सकते हैं।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या इस टूल में इमेज (JPG) फाइलों को भी PDF के साथ जोड़ा जा सकता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                यदि आपके पास JPG फोटो हैं, तो आप हमारे 'JPG to PDF' टूल से पहले उन्हें PDF में बदल लें, या फिर सीधे यहाँ पीडीएफ फाइलों को एक साथ जोड़ें।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या मर्ज की गई PDF पर कोई वॉटरमार्क लगाया जाता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                बिल्कुल नहीं। यह टूल 100% मुफ़्त और बिना किसी वॉटरमार्क के पूर्णतः आधिकारिक और स्वच्छ आउटपुट देता है।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
