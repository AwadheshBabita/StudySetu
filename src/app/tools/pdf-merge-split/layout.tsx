import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Merge & Split Online - पीडीएफ जोड़ें और अलग करें | ExamSewa",
  description: "कई PDF फाइलों को एक साथ जोड़ें (Merge) या किसी बड़ी PDF फाइल में से मनचाहे पन्ने अलग (Split) करें। सरकारी परीक्षा फॉर्म्स व मार्कशीट अपलोड हेतु 100% सुरक्षित और निःशुल्क टूल।",
  keywords: [
    "pdf merge and split online",
    "merge pdf files free",
    "split pdf pages online",
    "combine marksheet pdf online",
    "extract pages from pdf",
    "pdf jodne aur alag karne ka tool",
    "free pdf combiner and cutter",
    "sarkari form pdf tools online"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/pdf-merge-split",
  },
  openGraph: {
    title: "PDF Merge & Split Online - पीडीएफ जोड़ें और अलग करें | ExamSewa",
    description: "कई PDF फाइलों को एक साथ जोड़ें या किसी बड़ी PDF में से मनचाहे पन्ने अलग करें।",
    url: "https://examsewa.online/tools/pdf-merge-split",
    type: "website",
  },
};

export default function PdfMergeSplitLayout({
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
            PDF Merge & Split: पीडीएफ फाइलों को एक साथ कैसे जोड़ें और अलग-अलग पन्नों में कैसे बांटें?
          </h1>
          <p className="text-slate-600">
            सरकारी प्रतियोगी परीक्षाओं (SSC, UPSC, State PSC, Railway, Banking) और विश्वविद्यालय प्रवेश फॉर्म्स को भरते समय उम्मीदवारों को दस्तावेजों से जुड़ी दो सबसे आम समस्याओं का सामना करना पड़ता है। पहली—जब पोर्टल पर केवल एक ही फाइल अपलोड करने का विकल्प होता है, लेकिन उम्मीदवार के पास 10वीं, 12वीं और ग्रेजुएशन की मार्कशीट अलग-अलग फाइलों में होती हैं (जिन्हें आपस में जोड़ना या Merge करना पड़ता है)। दूसरी—जब उम्मीदवार के पास 10 पेजों की एक पूरी फाइल होती है, लेकिन पोर्टल पर केवल जाति या निवास प्रमाण पत्र का एकलौता पन्ना मांगा जाता है (जिसे अलग या Split करना पड़ता है)। अलग-अलग वेबसाइट्स पर भटकने के बजाय ExamSewa का <strong>PDF Merge & Split Tool</strong> आपको एक ही स्थान पर फाइलों को जोड़ने और पन्नों को अलग करने की निर्बाध सुविधा प्रदान करता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख तकनीकी विशेषताएं:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>ड्यूल-मोड कार्यप्रणाली (Merge & Split in One):</strong> सिंगल क्लिक में फाइलों को जोड़ने (Merge) या पेजों को अलग करने (Split) के बीच स्विच करें।</li>
            <li><strong>ड्रैग एंड ड्रॉप री-ऑर्डरिंग:</strong> फाइलों को जोड़ने से पहले अपनी इच्छानुसार क्रमबद्ध करें (जैसे पहले 10वीं, फिर 12वीं, फिर डिग्री सर्टिफिकेट)।</li>
            <li><strong>कस्टम पेज रेंज स्प्लिटिंग:</strong> सीधे पेज नंबर (जैसे 1, 3, 5-7) चुनकर केवल आवश्यक पन्नों की एक साफ नई फाइल तैयार करें।</li>
            <li><strong>ओरिजिनल फॉन्ट व सिग्नेचर सुरक्षा:</strong> पन्नों को जोड़ते या काटते समय डिजिटल हस्ताक्षर, बारकोड, मुहर और टेक्स्ट की स्पष्टता पर कोई प्रभाव नहीं पड़ता।</li>
            <li><strong>100% क्लाइंट-साइड गोपनीयता:</strong> पूरी फाइल प्रोसेसिंग सीधे आपके डिवाइस के वेब ब्राउज़र में संपन्न होती है; कोई भी दस्तावेज सर्वर पर अपलोड नहीं होता।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            स्टेप-बाय-स्टेप उपयोग का तरीका (How to Use):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>अपनी आवश्यकतानुसार 'Merge PDF' या 'Split PDF' टैब का चयन करें।</li>
            <li>'Select Files' पर क्लिक करके अपनी एक या एक से अधिक PDF फाइलें अपलोड करें।</li>
            <li>मर्ज करते समय फाइलों का क्रम जांचें; स्प्लिट करते समय वे पेज नंबर चुनें जिन्हें अलग करना है।</li>
            <li>'Process PDF' बटन पर क्लिक करें—प्रक्रिया एक सेकंड से भी कम समय में पूरी हो जाएगी।</li>
            <li>'Download PDF' पर क्लिक करके तैयार फाइल तुरंत अपने मोबाइल या कंप्यूटर में सेव करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या कई फाइलों को जोड़ने पर अंतिम फाइल का साइज बहुत बड़ा हो जाता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                टूल फाइलों को जोड़ते समय उनके गैर-ज़रूरी डुप्लिकेट मेटाडेटा को हटा देता है, जिससे फाइल का आकार संतुलित रहता है। आवश्यकता पड़ने पर आप हमारे PDF कंप्रेसर से इसका साइज और कम कर सकते हैं।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या मैं किसी फाइल में से सिर्फ एक ही पेज अलग कर सकता हूँ?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, स्प्लिट मोड में आप केवल उस विशिष्ट पेज का नंबर (जैसे '2') दर्ज करें, और टूल केवल उसी एक पेज की अलग PDF फाइल बना देगा।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या इस टूल का उपयोग करने पर कोई वॉटरमार्क आता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                बिल्कुल नहीं। यह टूल 100% मुफ़्त है और आपकी मूल गुणवत्ता के साथ बिना किसी वॉटरमार्क के स्वच्छ फाइल प्रदान करता है।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
