import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rotate & Delete PDF Pages Online - पीडीएफ पेज घुमाएं व हटाएं | ExamSewa",
  description: "अपनी PDF फाइल के उल्टे या आड़े पेजों को 90°, 180° या 270° सीधा घुमाएं और गैर-ज़रूरी या खाली पन्नों को एक क्लिक में हटाएं। सरकारी फॉर्म्स व मार्कशीट अपलोड हेतु 100% सुरक्षित टूल।",
  keywords: [
    "rotate pdf pages online",
    "delete pages from pdf online",
    "remove blank pages from pdf free",
    "pdf sidha kaise kare",
    "pdf ke page kaise hataye",
    "rotate pdf clockwise counterclockwise",
    "delete unwanted pages from marksheet pdf",
    "free pdf page organizer tool",
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/pdf-rotate-delete",
  },
  openGraph: {
    title: "Rotate & Delete PDF Pages Online - पीडीएफ पेज घुमाएं व हटाएं | ExamSewa",
    description: "PDF के उल्टे पेजों को सीधा घुमाएं और गैर-ज़रूरी पन्नों को एक क्लिक में हटाएं। 100% सुरक्षित।",
    url: "https://examsewa.online/tools/pdf-rotate-delete",
    type: "website",
  },
};

export default function PdfRotateDeleteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      <section className="w-full max-w-4xl mx-auto px-4 py-10 space-y-8 text-slate-800 border-t border-slate-200 mt-8 bg-white/70 rounded-3xl mb-12 shadow-xs">
        <article className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-5">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 border-b pb-2">
            Rotate & Delete PDF Pages: उल्टे पेजों को सीधा कैसे करें और गैर-ज़रूरी पन्ने कैसे हटाएं?
          </h1>
          <p className="text-slate-600">
            सरकारी भर्ती परीक्षाओं (SSC, UPSC, State PSC, Railway, Banking) या कॉलेज दाखिलों के समय अक्सर मार्कशीट, डिग्री प्रमाण पत्र, जाति प्रमाण पत्र और पहचान पत्रों को मोबाइल से स्कैन करके बहु-पृष्ठीय (Multi-page) PDF बनाई जाती है। मोबाइल के ऑटो-रोटेट सेंसर की वजह से कई बार कुछ पन्ने उल्टे या 90 डिग्री आड़े (Landscape) सेव हो जाते हैं। इसके अलावा कई बार स्कैनिंग के दौरान गलती से खाली (Blank) पन्ना या कोई धुंधला पेज भी बीच में शामिल हो जाता है। जब ऐसी फाइल सरकारी पोर्टल पर अपलोड की जाती है, तो जांच अधिकारी या डॉक्यूमेंट वेरिफिकेशन सॉफ्टवेयर उसे <em>'Document Not Legible'</em> बताकर अस्वीकार कर देते हैं। ExamSewa का <strong>Rotate & Delete PDF Tool</strong> आपको पूरी फाइल को दोबारा स्कैन किए बिना व्यक्तिगत पन्नों को सीधा घुमाने और फालतू पेजों को हटाने की त्वरित व सटीक सुविधा देता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख तकनीकी विशेषताएं:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>व्यक्तिगत व सामूहिक रोटेशन (Page-by-Page & All Rotate):</strong> आप चाहें तो पूरी PDF को एक साथ 90°, 180° या 270° घुमा सकते हैं, या फिर केवल उसी विशिष्ट पेज को सीधा कर सकते हैं जो उल्टा है।</li>
            <li><strong>सिंगल-क्लिक पेज डिलीशन:</strong> किसी भी बेकार, खाली या धुंधले पेज पर बने ट्रैश (डिलीट) आइकन पर क्लिक करके उसे तुरंत फाइल से बाहर निकालें।</li>
            <li><strong>इंटरएक्टिव विजुअल ग्रिड प्रीव्यू:</strong> अपलोड होते ही सभी पेजों के थंबनेल साफ दिखाई देते हैं, जिससे गलत पन्ने को पहचानना और सुधारना बेहद आसान हो जाता है।</li>
            <li><strong>ओरिजिनल रेजोल्यूशन और डिजिटल सिग्नेचर सुरक्षा:</strong> पेजों को घुमाने या हटाने से शेष पन्नों के टेक्स्ट, फॉन्ट, बारकोड और आधिकारिक मुहर की स्पष्टता पर कोई बुरा असर नहीं पड़ता।</li>
            <li><strong>100% क्लाइंट-साइड सुरक्षा:</strong> पूरी प्रक्रिया आपके अपने कंप्यूटर या मोबाइल के ब्राउज़र में संपन्न होती है; कोई भी गोपनीय दस्तावेज़ किसी बाहरी सर्वर पर अपलोड नहीं होता।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            स्टेप-बाय-स्टेप उपयोग का तरीका (How to Use):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>ऊपर दिए गए बॉक्स में 'Select PDF File' पर क्लिक करके अपनी फाइल अपलोड करें।</li>
            <li>स्क्रीन पर दिखने वाले सभी पेजों के थंबनेल में से उल्टे पेज पर बने 'Rotate' बटन पर क्लिक करके उसे सीधा करें।</li>
            <li>यदि कोई पेज हटाना है, तो उस पेज के ऊपर बने 'Delete' (कचरा पात्र) आइकन पर क्लिक करें।</li>
            <li>सभी पेजों का सही क्रम और सीधा रुख सुनिश्चित करने के बाद 'Apply Changes' पर क्लिक करें।</li>
            <li>'Download Modified PDF' बटन दबाकर संशोधित व परिपूर्ण फाइल तुरंत डाउनलोड करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या पेज घुमाने से PDF में मौजूद टेक्स्ट का साइज छोटा हो जाता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                नहीं, केवल पेज का ओरिएंटेशन एंगल बदला जाता है; टेक्स्ट, फॉन्ट और इमेजेस का मूल अनुपात और स्पष्टता 100% बरकरार रहती है।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                अगर गलती से कोई जरूरी पेज डिलीट हो जाए तो क्या करें?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                जब तक आप 'Apply Changes' करके नई फाइल डाउनलोड नहीं करते, आपकी मूल फाइल सुरक्षित रहती है। आप 'Reset' बटन दबाकर या पेज को दोबारा लोड करके आसानी से सुधार सकते हैं।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या इस टूल की कोई फाइल साइज या पेज लिमिट है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                नहीं, यह टूल आपके डिवाइस की रैम का उपयोग करता है, इसलिए आप 50 से अधिक पेजों वाली बड़ी फाइलों को भी आसानी से प्रोसेस कर सकते हैं।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
